import { Dataset, Variable } from '../types';

export interface OutlierDetail {
  caseIdx: number;
  value: number;
  zScore: number;
  reason: string;
}

export interface CategoryBreakdown {
  value: string;
  label: string;
  count: number;
  pct: number;
}

export interface ColumnHealthReport {
  name: string;
  label: string;
  type: string;
  measure: string;
  totalCount: number;
  validCount: number;
  missingCount: number;
  missingPct: number;
  distinctCount: number;
  // Numeric metrics
  mean?: number;
  median?: number;
  stdDev?: number;
  variance?: number;
  se?: number;
  min?: number;
  max?: number;
  skewness?: number;
  kurtosis?: number;
  q1?: number;
  q3?: number;
  iqr?: number;
  lowerFence?: number;
  upperFence?: number;
  outlierCount?: number;
  outlierIndices?: number[];
  outlierDetails?: OutlierDetail[];
  normalityStatus?: 'Normal' | 'Moderate Skew' | 'Severe Skew' | 'Non-Numeric';
  categoryBreakdown?: CategoryBreakdown[];
  recommendations: string[];
}

export interface DatasetHealthSummary {
  totalRows: number;
  totalCols: number;
  overallCompletenessPct: number;
  totalOutliers: number;
  columnsWithMissing: number;
  overallScore: number;
  healthGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  cleanColumnsCount: number;
  skewedColumnsCount: number;
  outlierColumnsCount: number;
  reports: ColumnHealthReport[];
}

export function analyzeDatasetHealth(dataset: Dataset): DatasetHealthSummary {
  const totalRows = dataset.data.length;
  const totalCols = dataset.variables.length;
  let totalMissingCells = 0;
  let totalOutlierPoints = 0;
  let columnsWithMissing = 0;
  let skewedColumnsCount = 0;
  let outlierColumnsCount = 0;
  let cleanColumnsCount = 0;

  const reports: ColumnHealthReport[] = dataset.variables.map(v => {
    const rawValues = dataset.data.map(r => r[v.name]);
    const validRaw = rawValues.filter(val => val !== null && val !== undefined && val !== '' && !Number.isNaN(val));
    const validCount = validRaw.length;
    const missingCount = totalRows - validCount;
    const missingPct = totalRows > 0 ? (missingCount / totalRows) * 100 : 0;
    const distinctCount = new Set(validRaw).size;

    if (missingCount > 0) columnsWithMissing++;
    totalMissingCells += missingCount;

    const recommendations: string[] = [];

    if (missingPct > 20) {
      recommendations.push(`High missing data rate (${missingPct.toFixed(1)}%). Consider mean/median imputation or listwise deletion before parametric modeling.`);
    } else if (missingPct > 0) {
      recommendations.push(`${missingCount} missing value(s) detected (${missingPct.toFixed(1)}%). Review listwise exclusion.`);
    }

    if (distinctCount === 1 && totalRows > 1) {
      recommendations.push('Zero variance: all observations share the exact same value. Ineffective for statistical modeling or correlation.');
    }

    // Category breakdown calculation for non-numeric or categorical variables
    const isCategorical = v.type !== 'Numeric' || v.measure === 'Nominal' || v.measure === 'Ordinal' || (distinctCount < 10 && totalRows > 20);
    let categoryBreakdown: CategoryBreakdown[] | undefined;

    if (isCategorical) {
      const counts: Record<string, number> = {};
      validRaw.forEach(val => {
        const key = String(val);
        counts[key] = (counts[key] || 0) + 1;
      });

      const labelMap: Record<string, string> = {};
      if (v.values) {
        v.values.forEach(vl => {
          labelMap[String(vl.value)] = vl.label;
        });
      }

      categoryBreakdown = Object.entries(counts)
        .map(([val, cnt]) => ({
          value: val,
          label: labelMap[val] || val,
          count: cnt,
          pct: validCount > 0 ? Number(((cnt / validCount) * 100).toFixed(1)) : 0
        }))
        .sort((a, b) => b.count - a.count);
    }

    if (v.type !== 'Numeric') {
      const hasIssues = missingCount > 0 || distinctCount <= 1;
      if (!hasIssues) cleanColumnsCount++;

      return {
        name: v.name,
        label: v.label || v.name,
        type: v.type,
        measure: v.measure,
        totalCount: totalRows,
        validCount,
        missingCount,
        missingPct,
        distinctCount,
        normalityStatus: 'Non-Numeric',
        categoryBreakdown,
        recommendations
      };
    }

    // Numeric calculations
    const numValues = validRaw.map(Number).filter(n => !isNaN(n));
    if (numValues.length === 0) {
      return {
        name: v.name,
        label: v.label || v.name,
        type: v.type,
        measure: v.measure,
        totalCount: totalRows,
        validCount: 0,
        missingCount: totalRows,
        missingPct: 100,
        distinctCount: 0,
        normalityStatus: 'Non-Numeric',
        recommendations: ['Column contains no valid numeric observations.']
      };
    }

    const n = numValues.length;
    const sum = numValues.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    // Variance, StdDev, SE
    const sqDiffs = numValues.map(val => Math.pow(val - mean, 2));
    const variance = n > 1 ? sqDiffs.reduce((acc, val) => acc + val, 0) / (n - 1) : 0;
    const stdDev = Math.sqrt(variance);
    const se = stdDev / Math.sqrt(n);

    // Sorted for Median, Q1, Q3, Outliers
    const sorted = [...numValues].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Skewness and Kurtosis
    let skewness = 0;
    let kurtosis = 0;
    if (n >= 3 && stdDev > 0) {
      const m3 = numValues.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0) / n;
      skewness = m3 / Math.pow(stdDev, 3);
    }
    if (n >= 4 && stdDev > 0) {
      const m4 = numValues.reduce((acc, val) => acc + Math.pow(val - mean, 4), 0) / n;
      kurtosis = (m4 / Math.pow(stdDev, 4)) - 3; // Excess kurtosis
    }

    // Outlier detection via IQR (1.5x fence) and Z-score (>3)
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outlierIndices: number[] = [];
    const outlierDetails: OutlierDetail[] = [];

    dataset.data.forEach((row, idx) => {
      const raw = row[v.name];
      if (raw !== null && raw !== undefined && raw !== '' && !isNaN(Number(raw))) {
        const val = Number(raw);
        const isIqrOutlier = val < lowerFence || val > upperFence;
        const z = stdDev > 0 ? (val - mean) / stdDev : 0;
        const isZOutlier = Math.abs(z) > 3;

        if (isIqrOutlier || isZOutlier) {
          outlierIndices.push(idx);
          let reason = '';
          if (val > upperFence) reason = `Exceeds Upper Fence (${upperFence.toFixed(2)})`;
          else if (val < lowerFence) reason = `Below Lower Fence (${lowerFence.toFixed(2)})`;
          if (isZOutlier) reason += (reason ? ' & ' : '') + `|Z| = ${Math.abs(z).toFixed(2)}σ`;

          outlierDetails.push({
            caseIdx: idx,
            value: val,
            zScore: Number(z.toFixed(2)),
            reason
          });
        }
      }
    });

    const outlierCount = outlierIndices.length;
    totalOutlierPoints += outlierCount;
    if (outlierCount > 0) {
      outlierColumnsCount++;
      recommendations.push(`${outlierCount} statistical outlier(s) detected using 1.5× IQR fences and |Z| > 3.0.`);
    }

    // Normality status
    let normalityStatus: 'Normal' | 'Moderate Skew' | 'Severe Skew' = 'Normal';
    if (Math.abs(skewness) > 1.5) {
      normalityStatus = 'Severe Skew';
      skewedColumnsCount++;
      recommendations.push(`Severe distributional skewness (γ₁ = ${skewness.toFixed(2)}). Consider logarithmic LG10(x) or square-root transformation for parametric ANOVA/Regression.`);
    } else if (Math.abs(skewness) > 0.8) {
      normalityStatus = 'Moderate Skew';
      recommendations.push(`Moderate skewness (γ₁ = ${skewness.toFixed(2)}). Parametric assumptions are acceptable under the Central Limit Theorem.`);
    }

    const hasIssues = missingCount > 0 || outlierCount > 0 || normalityStatus === 'Severe Skew' || distinctCount <= 1;
    if (!hasIssues) cleanColumnsCount++;

    return {
      name: v.name,
      label: v.label || v.name,
      type: v.type,
      measure: v.measure,
      totalCount: totalRows,
      validCount,
      missingCount,
      missingPct,
      distinctCount,
      mean: Number(mean.toFixed(3)),
      median: Number(median.toFixed(3)),
      stdDev: Number(stdDev.toFixed(3)),
      variance: Number(variance.toFixed(3)),
      se: Number(se.toFixed(4)),
      min,
      max,
      skewness: Number(skewness.toFixed(3)),
      kurtosis: Number(kurtosis.toFixed(3)),
      q1: Number(q1.toFixed(3)),
      q3: Number(q3.toFixed(3)),
      iqr: Number(iqr.toFixed(3)),
      lowerFence: Number(lowerFence.toFixed(3)),
      upperFence: Number(upperFence.toFixed(3)),
      outlierCount,
      outlierIndices,
      outlierDetails,
      normalityStatus,
      categoryBreakdown,
      recommendations
    };
  });

  const totalCells = totalRows * totalCols;
  const overallCompletenessPct = totalCells > 0 ? ((totalCells - totalMissingCells) / totalCells) * 100 : 100;

  // Calculate composite dataset health score (0-100)
  const completenessPenalty = Math.min(30, (100 - overallCompletenessPct) * 1.5);
  const outlierPenalty = totalRows > 0 ? Math.min(25, (totalOutlierPoints / totalRows) * 50) : 0;
  const skewnessPenalty = totalCols > 0 ? Math.min(20, (skewedColumnsCount / totalCols) * 25) : 0;

  const rawScore = 100 - completenessPenalty - outlierPenalty - skewnessPenalty;
  const overallScore = Math.max(10, Math.min(100, Math.round(rawScore)));

  let healthGrade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'A+';
  if (overallScore >= 95) healthGrade = 'A+';
  else if (overallScore >= 90) healthGrade = 'A';
  else if (overallScore >= 80) healthGrade = 'B';
  else if (overallScore >= 70) healthGrade = 'C';
  else healthGrade = 'D';

  return {
    totalRows,
    totalCols,
    overallCompletenessPct,
    totalOutliers: totalOutlierPoints,
    columnsWithMissing,
    overallScore,
    healthGrade,
    cleanColumnsCount,
    skewedColumnsCount,
    outlierColumnsCount,
    reports
  };
}
