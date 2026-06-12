const fs = require('fs');
const path = require('path');
const archiverLib = require('archiver');

// 1. Define the targets. The zip names are STATIC so they overwrite previous runs!
const REPORTS_TO_BACKUP = [
  { name: 'playwright', dir: path.join(__dirname, 'playwright-report'), zipName: 'playwright_latest.zip' },
  { name: 'allure-results', dir: path.join(__dirname, 'allure-results'), zipName: 'allure-results_latest.zip' },
  { name: 'allure-report', dir: path.join(__dirname, 'allure-report'), zipName: 'allure-report_latest.zip' }
];

const archiveParentDir = path.join(__dirname, 'archives');

// Ensure the main archives directory exists
if (!fs.existsSync(archiveParentDir)) {
  fs.mkdirSync(archiveParentDir);
}

// Helper function to zip a folder safely using the explicit class constructor instantiation handler
function zipFolder(sourceDir, outZipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outZipPath);
    
    // THE FIX: Safely handles initialization whether archiver is a factory function or an explicit class constructor wrapper
    let archive;
    try {
      if (typeof archiverLib === 'function') {
        archive = archiverLib('zip', { zlib: { level: 9 } });
      } else if (archiverLib.create) {
        archive = archiverLib.create('zip', { zlib: { level: 9 } });
      } else {
        const ArchiverClass = archiverLib.Archiver || archiverLib;
        archive = new ArchiverClass('zip', { zlib: { level: 9 } });
      }
    } catch (err) {
      // Direct ultimate backup factory strategy fallback instantiation
      archive = archiverLib.create ? archiverLib.create('zip', { zlib: { level: 9 } }) : new archiverLib('zip', { zlib: { level: 9 } });
    }

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

async function runArchiver() {
  console.log(`\n Processing report archiving (Overwriting old archives)...`);

  for (const report of REPORTS_TO_BACKUP) {
    if (fs.existsSync(report.dir)) {
      const zipPath = path.join(archiveParentDir, report.zipName);

      try {
        // Step A: Create a zip directly from the live test output directory
        await zipFolder(report.dir, zipPath);
        console.log(` Updated zip (Overwrote old file): archives/${report.zipName}`);

        // Step B: Clean up the raw unzipped working folder to save space
        fs.rmSync(report.dir, { recursive: true, force: true });
        console.log(` Removed raw folder from workspace: ${report.name}`);
        
      } catch (error) {
        console.error(`❌ Failed to archive ${report.name}:`, error.message);
      }
    } else {
      console.log(` Folder not found, skipping: ${report.name}`);
    }
  }
  console.log(' Archiving and cleanup completed successfully.\n');
}

runArchiver();