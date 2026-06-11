import * as allure from "allure-js-commons";

/**
 * Maps horizontal spreadsheet property matrix cells directly inside Allure 3 runtime context
 * @param {Object} properties - Horizontal data row parameters
 */
export async function writeAllureEnvironmentProperties(properties) {
  for (const [key, value] of Object.entries(properties)) {
    // Uses native Allure 3 runtime parameters to safely append without clearing the results index
    await allure.parameter(key, value.toString());
  }
  console.log('ALLURE 3 MATRIX: Horizontal parameters row mapped natively.');
}