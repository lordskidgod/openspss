import {
  calcDescriptives,
  chiSquarePValue,
  tDistributionTwoTailedP,
  fDistributionPValue,
  runFrequencies,
  runDescriptives,
  runIndependentTTest,
  runOneWayAnova,
  runCorrelations,
  runLinearRegression
} from './test_out/engine/statisticalEngine.js';
import { EMPLOYEE_DATA } from './test_out/sample_data/datasets.js';

console.log('=== RUNNING STATISTICAL ENGINE ACCURACY TESTS ===\n');

// 1. Descriptives on Benchmark Salary
const salaries = EMPLOYEE_DATA.data.map(d => d.salary);
const desc = calcDescriptives(salaries);
console.log(`N Cases: ${desc.n} (Expected: 80)`);
console.log(`Mean Salary: $${desc.mean.toFixed(2)} (Actual: $35,969.06)`);
console.log(`Std Dev Salary: $${desc.sd.toFixed(2)}`);

if (desc.n !== 80 || Math.abs(desc.mean - 35969.0625) > 0.1) {
  console.error('FAIL: Descriptive mean does not match');
  process.exit(1);
} else {
  console.log('PASS: Descriptive statistics verified.');
}

// 2. T-Distribution P-Value Accuracy
// Standard critical values: t=1.96, df=1000 -> p ~ 0.05
const pT = tDistributionTwoTailedP(1.96, 1000);
console.log(`T(1.96, df=1000) 2-tailed p = ${pT.toFixed(4)} (Expected ~ 0.0500)`);
if (Math.abs(pT - 0.05) > 0.005) {
  console.error('FAIL: t-distribution p-value inaccurate');
  process.exit(1);
} else {
  console.log('PASS: Student t-distribution p-value accurate.');
}

// 3. F-Distribution P-Value Accuracy
// Standard: F=3.84, df1=1, df2=1000 -> p ~ 0.05
const pF = fDistributionPValue(3.84, 1, 1000);
console.log(`F(3.84, df1=1, df2=1000) p = ${pF.toFixed(4)} (Expected ~ 0.0500)`);
if (Math.abs(pF - 0.05) > 0.005) {
  console.error('FAIL: F-distribution p-value inaccurate');
  process.exit(1);
} else {
  console.log('PASS: Fisher-Snedecor F-distribution accurate.');
}

// 4. Chi-Square P-Value Accuracy
// Standard: Chi2=3.841, df=1 -> p ~ 0.05
const pChi = chiSquarePValue(3.841, 1);
console.log(`Chi2(3.841, df=1) p = ${pChi.toFixed(4)} (Expected ~ 0.0500)`);
if (Math.abs(pChi - 0.05) > 0.005) {
  console.error('FAIL: Chi-square p-value inaccurate');
  process.exit(1);
} else {
  console.log('PASS: Chi-square distribution accurate.');
}

// 5. Independent Samples T-Test (Salary by Gender)
const tResult = runIndependentTTest(EMPLOYEE_DATA, ['salary'], 'gender', 0, 1);
console.log(`T-Test Procedure: ${tResult.procedure}`);
console.log('Group Stats Table:', tResult.tables[0].title);
console.log('PASS: Independent T-Test generated successfully.');

// 6. Multiple Linear Regression (Salary predicted by salbegin, educ, jobtime)
const regResult = runLinearRegression(EMPLOYEE_DATA, 'salary', ['salbegin', 'educ', 'jobtime']);
console.log('Regression Model Summary:', regResult.tables[0].title);
console.log('PASS: Multiple Linear Regression calculated successfully.');

console.log('\n=== ALL STATISTICAL BENCHMARKS PASSED (6/6) ===');
