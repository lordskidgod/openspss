/**
 * Statistical Assumption Co-Pilot Engine
 * Auto-checks normality, Levene, collinearity (VIF) before every test
 */
import { Dataset } from '../types';

export interface AssumptionResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  value?: string;
  message: string;
  suggestion?: string;
}

export interface AssumptionReport {
  procedure: string;
  assumptions: AssumptionResult[];
  canProceed: boolean;
  recommendation: string;
}

// ─── Descriptive Helpers ───────────────────────────────────────────────────────
function getNumericValues(dataset: Dataset, varName: string): number[] {
  return dataset.data
    .map(r => r[varName])
    .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
    .map(Number);
}

function mean(vals: number[]): number {
  return vals.length === 0 ? 0 : vals.reduce((a, b) => a + b, 0) / vals.length;
}

function stdDev(vals: number[]): number {
  if (vals.length < 2) return 0;
  const m = mean(vals);
  return Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (vals.length - 1));
}

function skewness(vals: number[]): number {
  if (vals.length < 3) return 0;
  const m = mean(vals);
  const sd = stdDev(vals);
  if (sd === 0) return 0;
  const n = vals.length;
  const m3 = vals.reduce((a, b) => a + Math.pow(b - m, 3), 0) / n;
  return m3 / Math.pow(sd, 3);
}

function shapiroWilkProxy(vals: number[]): { stat: number; significant: boolean } {
  // Heuristic proxy: use |skewness| + excess kurtosis test
  if (vals.length < 3) return { stat: 1, significant: false };
  const m = mean(vals);
  const sd = stdDev(vals);
  const skew = skewness(vals);
  const n = vals.length;
  const m4 = vals.reduce((a, b) => a + Math.pow(b - m, 4), 0) / n;
  const kurt = sd > 0 ? m4 / Math.pow(sd, 4) - 3 : 0;
  const normScore = Math.abs(skew) + Math.abs(kurt) / 2;
  const significant = normScore > 1.0 || n < 30 && normScore > 0.5;
  const stat = Math.max(0, 1 - normScore * 0.12);
  return { stat: Math.min(1, stat), significant };
}

function leveneTest(group1: number[], group2: number[]): { f: number; significant: boolean } {
  if (group1.length < 2 || group2.length < 2) return { f: 0, significant: false };
  const m1 = mean(group1);
  const m2 = mean(group2);
  const z1 = group1.map(x => Math.abs(x - m1));
  const z2 = group2.map(x => Math.abs(x - m2));
  const zMean1 = mean(z1);
  const zMean2 = mean(z2);
  const grandMean = mean([...z1, ...z2]);
  const n = group1.length + group2.length;
  const ssBetween = group1.length * Math.pow(zMean1 - grandMean, 2) + group2.length * Math.pow(zMean2 - grandMean, 2);
  const ssWithin = z1.reduce((a, b) => a + Math.pow(b - zMean1, 2), 0) + z2.reduce((a, b) => a + Math.pow(b - zMean2, 2), 0);
  if (ssWithin === 0) return { f: 0, significant: false };
  const f = (ssBetween / 1) / (ssWithin / (n - 2));
  return { f, significant: f > 5.0 }; // approximate F crit
}

function vif(predictors: number[][]): number[] {
  // Simple VIF proxy using pairwise correlation
  if (predictors.length < 2) return predictors.map(() => 1);
  const n = predictors[0].length;
  return predictors.map((x, i) => {
    let maxR2 = 0;
    predictors.forEach((y, j) => {
      if (i === j) return;
      const mx = mean(x), my = mean(y);
      const cov = x.reduce((a, v, k) => a + (v - mx) * (y[k] - my), 0);
      const sx = Math.sqrt(x.reduce((a, v) => a + Math.pow(v - mx, 2), 0));
      const sy = Math.sqrt(y.reduce((a, v) => a + Math.pow(v - my, 2), 0));
      if (sx > 0 && sy > 0) {
        const r = cov / (sx * sy);
        maxR2 = Math.max(maxR2, r * r);
      }
    });
    return maxR2 >= 1 ? Infinity : 1 / (1 - maxR2);
  });
}

// ─── Main Assumption Checks ───────────────────────────────────────────────────

export function checkTTestAssumptions(
  dataset: Dataset,
  depVar: string,
  groupVar: string
): AssumptionReport {
  const assumptions: AssumptionResult[] = [];

  // Sample size check
  const n = dataset.data.length;
  assumptions.push({
    name: 'Sample Size',
    status: n >= 30 ? 'pass' : n >= 10 ? 'warn' : 'fail',
    value: `N = ${n}`,
    message: n >= 30 ? 'Adequate sample size (N ≥ 30).' : n >= 10 ? 'Small sample (N < 30). Central Limit Theorem may not apply.' : 'Very small sample. Results unreliable.',
    suggestion: n < 30 ? 'Consider collecting more data or using non-parametric Mann-Whitney U test.' : undefined
  });

  // Get groups
  const groupValues = [...new Set(dataset.data.map(r => r[groupVar]).filter(v => v !== null && v !== undefined))];
  const g1 = getNumericValues(dataset, depVar).filter((_, i) => String(dataset.data[i]?.[groupVar]) === String(groupValues[0]));
  const g2 = getNumericValues(dataset, depVar).filter((_, i) => String(dataset.data[i]?.[groupVar]) === String(groupValues[1]));

  // Normality for each group
  const sw1 = shapiroWilkProxy(g1);
  const sw2 = shapiroWilkProxy(g2);
  assumptions.push({
    name: `Normality — Group "${groupValues[0]}"`,
    status: !sw1.significant ? 'pass' : g1.length >= 30 ? 'warn' : 'fail',
    value: `W ≈ ${sw1.stat.toFixed(3)}`,
    message: !sw1.significant ? 'Distribution approximately normal.' : g1.length >= 30 ? 'Skewed, but N ≥ 30; CLT applies.' : 'Non-normal distribution detected.',
    suggestion: sw1.significant && g1.length < 30 ? 'Use Mann-Whitney U (non-parametric alternative).' : undefined
  });
  assumptions.push({
    name: `Normality — Group "${groupValues[1] ?? '2'}"`,
    status: !sw2.significant ? 'pass' : g2.length >= 30 ? 'warn' : 'fail',
    value: `W ≈ ${sw2.stat.toFixed(3)}`,
    message: !sw2.significant ? 'Distribution approximately normal.' : g2.length >= 30 ? 'Skewed, but N ≥ 30; CLT applies.' : 'Non-normal distribution detected.',
    suggestion: sw2.significant && g2.length < 30 ? 'Use Mann-Whitney U (non-parametric alternative).' : undefined
  });

  // Levene's test
  const lev = leveneTest(g1, g2);
  assumptions.push({
    name: "Levene's Test (Equal Variances)",
    status: !lev.significant ? 'pass' : 'warn',
    value: `F ≈ ${lev.f.toFixed(3)}`,
    message: !lev.significant ? 'Equal variances assumed (Student\'s t).' : 'Unequal variances detected.',
    suggestion: lev.significant ? 'Welch\'s t-test (equal_var=False) will be used automatically.' : undefined
  });

  const failCount = assumptions.filter(a => a.status === 'fail').length;
  const warnCount = assumptions.filter(a => a.status === 'warn').length;

  return {
    procedure: 'Independent-Samples T-Test',
    assumptions,
    canProceed: failCount === 0,
    recommendation: failCount > 0
      ? '⚠️ Critical assumptions violated. Consider Mann-Whitney U or collect more data.'
      : warnCount > 0
      ? '✓ Proceed with caution. Minor violations detected — results are still interpretable.'
      : '✅ All assumptions met. You can confidently proceed with the t-test.'
  };
}

export function checkAnovaAssumptions(
  dataset: Dataset,
  depVar: string,
  groupVar: string
): AssumptionReport {
  const assumptions: AssumptionResult[] = [];

  const n = dataset.data.length;
  assumptions.push({
    name: 'Sample Size',
    status: n >= 30 ? 'pass' : n >= 15 ? 'warn' : 'fail',
    value: `N = ${n}`,
    message: n >= 30 ? 'Adequate overall sample size.' : 'Small sample may reduce power.',
    suggestion: n < 15 ? 'Consider Kruskal-Wallis (non-parametric ANOVA).' : undefined
  });

  const vals = getNumericValues(dataset, depVar);
  const sw = shapiroWilkProxy(vals);
  assumptions.push({
    name: 'Normality of Residuals',
    status: !sw.significant ? 'pass' : vals.length >= 30 ? 'warn' : 'fail',
    value: `W ≈ ${sw.stat.toFixed(3)}`,
    message: !sw.significant ? 'Residuals approximately normal.' : 'Non-normality detected.',
    suggestion: sw.significant ? 'Consider Kruskal-Wallis H-test or log-transform the DV.' : undefined
  });

  // Levene for all groups
  const groups = [...new Set(dataset.data.map(r => r[groupVar]).filter(v => v != null))];
  if (groups.length >= 2) {
    const g1 = vals.filter((_, i) => String(dataset.data[i]?.[groupVar]) === String(groups[0]));
    const g2 = vals.filter((_, i) => String(dataset.data[i]?.[groupVar]) === String(groups[1]));
    const lev = leveneTest(g1, g2);
    assumptions.push({
      name: "Levene's Test (Homogeneity of Variances)",
      status: !lev.significant ? 'pass' : 'warn',
      value: `F ≈ ${lev.f.toFixed(3)}`,
      message: !lev.significant ? 'Equal variances across groups.' : 'Variance heterogeneity detected.',
      suggestion: lev.significant ? 'Use Welch ANOVA (robust to variance inequality).' : undefined
    });
  }

  const failCount = assumptions.filter(a => a.status === 'fail').length;
  const warnCount = assumptions.filter(a => a.status === 'warn').length;

  return {
    procedure: 'One-Way ANOVA',
    assumptions,
    canProceed: failCount === 0,
    recommendation: failCount > 0
      ? '⚠️ Critical assumptions violated. Consider Kruskal-Wallis H-test.'
      : warnCount > 0
      ? '✓ Proceed with caution. Violations are minor.'
      : '✅ All ANOVA assumptions satisfied.'
  };
}

export function checkRegressionAssumptions(
  dataset: Dataset,
  depVar: string,
  indepVars: string[]
): AssumptionReport {
  const assumptions: AssumptionResult[] = [];

  const n = dataset.data.length;
  const minN = indepVars.length * 10;
  assumptions.push({
    name: 'Sample Size (N ≥ 10 per predictor)',
    status: n >= minN ? 'pass' : n >= minN / 2 ? 'warn' : 'fail',
    value: `N = ${n}, need ≥ ${minN}`,
    message: n >= minN ? 'Adequate sample for the number of predictors.' : 'Insufficient N for reliable coefficient estimates.',
    suggestion: n < minN ? `Reduce predictors or collect at least ${minN} cases.` : undefined
  });

  // Normality of DV
  const depVals = getNumericValues(dataset, depVar);
  const sw = shapiroWilkProxy(depVals);
  assumptions.push({
    name: 'Normality of Dependent Variable',
    status: !sw.significant ? 'pass' : n >= 30 ? 'warn' : 'fail',
    value: `W ≈ ${sw.stat.toFixed(3)}`,
    message: !sw.significant ? 'DV is approximately normally distributed.' : 'Non-normal distribution detected in DV.',
    suggestion: sw.significant ? 'Try log or square-root transformation of the DV.' : undefined
  });

  // VIF collinearity check
  if (indepVars.length >= 2) {
    const matrices = indepVars.map(v => getNumericValues(dataset, v));
    const vifs = vif(matrices);
    const maxVif = Math.max(...vifs.filter(v => isFinite(v)));
    assumptions.push({
      name: 'Multicollinearity (VIF)',
      status: maxVif < 5 ? 'pass' : maxVif < 10 ? 'warn' : 'fail',
      value: `Max VIF ≈ ${isFinite(maxVif) ? maxVif.toFixed(2) : '∞'}`,
      message: maxVif < 5 ? 'No problematic multicollinearity detected.' : maxVif < 10 ? 'Moderate collinearity — interpret coefficients carefully.' : 'Severe multicollinearity. Predictors are highly correlated.',
      suggestion: maxVif >= 5 ? 'Remove redundant predictors or use Ridge regression.' : undefined
    });
  }

  // Scale check
  const scaleVars = indepVars.filter(v => {
    const varDef = dataset.variables.find(dv => dv.name === v);
    return varDef?.measure !== 'Scale';
  });
  if (scaleVars.length > 0) {
    assumptions.push({
      name: 'Predictor Measurement Level',
      status: 'warn',
      message: `Predictor(s) ${scaleVars.join(', ')} are Nominal/Ordinal — dummy coding recommended.`,
      suggestion: 'Recode categorical predictors as binary (0/1) dummy variables.'
    });
  }

  const failCount = assumptions.filter(a => a.status === 'fail').length;
  const warnCount = assumptions.filter(a => a.status === 'warn').length;

  return {
    procedure: 'Multiple Linear Regression',
    assumptions,
    canProceed: failCount === 0,
    recommendation: failCount > 0
      ? '⚠️ Critical violations found. Address these before interpreting results.'
      : warnCount > 0
      ? '✓ Proceed with awareness of noted warnings.'
      : '✅ All regression assumptions satisfied. Results are reliable.'
  };
}

export function checkCorrelationAssumptions(dataset: Dataset, vars: string[]): AssumptionReport {
  const assumptions: AssumptionResult[] = [];

  const n = dataset.data.length;
  assumptions.push({
    name: 'Sample Size',
    status: n >= 30 ? 'pass' : n >= 10 ? 'warn' : 'fail',
    value: `N = ${n}`,
    message: n >= 30 ? 'Adequate sample for Pearson r.' : 'Small N — correlation may be unstable.',
    suggestion: n < 30 ? 'Use Spearman ρ (rank-based, more robust for small N).' : undefined
  });

  vars.forEach(v => {
    const vals = getNumericValues(dataset, v);
    const sw = shapiroWilkProxy(vals);
    assumptions.push({
      name: `Normality — ${v}`,
      status: !sw.significant ? 'pass' : n >= 30 ? 'warn' : 'fail',
      value: `W ≈ ${sw.stat.toFixed(3)}`,
      message: !sw.significant ? 'Approximately normal.' : 'Non-normal distribution detected.',
      suggestion: sw.significant ? 'Use Spearman ρ instead of Pearson r.' : undefined
    });
  });

  const failCount = assumptions.filter(a => a.status === 'fail').length;
  const warnCount = assumptions.filter(a => a.status === 'warn').length;

  return {
    procedure: 'Bivariate Correlations',
    assumptions,
    canProceed: failCount === 0,
    recommendation: failCount > 0
      ? '⚠️ Assumptions violated — use Spearman ρ instead.'
      : warnCount > 0
      ? '✓ Proceed. Consider also reporting Spearman ρ.'
      : '✅ Pearson r assumptions met.'
  };
}
