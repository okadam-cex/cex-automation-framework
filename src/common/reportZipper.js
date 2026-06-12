import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

/**
 * Reusable utility to compress an entire directory into a single zip archive.
 * @param {string} sourceDir - The path to the folder to compress (e.g., 'allure-report')
 * @param {string} outZipPath - The targeted filename path (e.g., 'output/AllureReport.zip')
 */
export function zipDirectory(sourceDir, outZipPath) {
  return new Promise((resolve, reject) => {
    // Ensure targeted destination directory exists
    const outDir = path.dirname(outZipPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const output = fs.createWriteStream(outZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } }); // Maximum compression level

    output.on('close', () => {
      console.log(`[SUCCESS] Archive completed! Total bytes: ${archive.pointer()}`);
      console.log(`[INFO] Zip file location: ${outZipPath}`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    
    // Append entire directory contents cleanly
    archive.directory(sourceDir, false);
    
    archive.finalize();
  });
}