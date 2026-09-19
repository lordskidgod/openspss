// ==========================================
// PROBABILITY DISTRIBUTIONS & SPECIAL MATH
// ==========================================
// Lanczos approximation for log-gamma function ln(Gamma(x))
export function logGamma(x) {
    if (x <= 0)
        return 0;
    const p = [
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.138571095836524,
        9.9843695780195716e-6,
        1.5056327351493116e-7
    ];
    const g = 7;
    if (x < 0.5) {
        return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
    }
    x -= 1;
    let a = 0.99999999999980993;
    for (let i = 0; i < p.length; i++) {
        a += p[i] / (x + i + 1);
    }
    const t = x + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
// Incomplete Gamma function P(a, x) = gamma(a, x) / Gamma(a)
export function incompleteGamma(a, x) {
    if (x <= 0 || a <= 0)
        return 0;
    if (x < a + 1) {
        // Series expansion
        let sum = 1 / a;
        let term = sum;
        for (let n = 1; n < 100; n++) {
            term *= x / (a + n);
            sum += term;
            if (Math.abs(term) < 1e-12)
                break;
        }
        return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
    }
    else {
        // Continued fraction (Lentz's method)
        let f = 1e-30;
        let c = f;
        let d = 0;
        for (let i = 1; i < 150; i++) {
            let an = i % 2 === 1 ? (i === 1 ? 1 : -(a + (i - 1) / 2) * ((i - 1) / 2)) : (i / 2);
            let bn = x + (i - a);
            if (i === 1) {
                an = 1;
                bn = x + 1 - a;
            }
            d = bn + an * d;
            if (Math.abs(d) < 1e-30)
                d = 1e-30;
            c = bn + an / c;
            if (Math.abs(c) < 1e-30)
                c = 1e-30;
            d = 1 / d;
            const delta = c * d;
            f *= delta;
            if (Math.abs(delta - 1) < 1e-12)
                break;
        }
        const q = Math.exp(-x + a * Math.log(x) - logGamma(a)) / f;
        return Math.max(0, Math.min(1, 1 - q));
    }
}
// Incomplete Beta function Ix(a, b)
export function incompleteBeta(x, a, b) {
    if (x <= 0)
        return 0;
    if (x >= 1)
        return 1;
    // Use symmetry transformation if x > (a + 1) / (a + b + 2)
    if (x > (a + 1) / (a + b + 2)) {
        return 1 - incompleteBeta(1 - x, b, a);
    }
    const factor = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logGamma(a) - logGamma(b) + logGamma(a + b));
    // Continued fraction (modified Lentz's method)
    let f = 1e-30;
    let c = f;
    let d = 0;
    for (let m = 0; m <= 200; m++) {
        let an;
        if (m === 0) {
            an = 1;
        }
        else if (m % 2 === 0) {
            const k = m / 2;
            an = (k * (b - k) * x) / ((a + 2 * k - 1) * (a + 2 * k));
        }
        else {
            const k = (m - 1) / 2;
            an = -((a + k) * (a + b + k) * x) / ((a + 2 * k) * (a + 2 * k + 1));
        }
        d = 1 + an * d;
        if (Math.abs(d) < 1e-30)
            d = 1e-30;
        c = 1 + an / c;
        if (Math.abs(c) < 1e-30)
            c = 1e-30;
        d = 1 / d;
        const delta = c * d;
        f *= delta;
        if (Math.abs(delta - 1) < 1e-12)
            break;
    }
    return Math.max(0, Math.min(1, (factor / a) * (f - 1e-30)));
}
// Chi-Square distribution p-value: P(X >= chi2)
export function chiSquarePValue(chi2, df) {
    if (chi2 <= 0 || df <= 0)
        return 1;
    // Use asymptotic F limit: k * F(k, infinity) = Chi2(k)
    const df2 = 1e6;
    const x = df2 / (df2 + chi2);
    const p = incompleteBeta(x, df2 / 2, df / 2);
    return Math.max(0, Math.min(1, p));
}
// Student's t distribution two-tailed p-value: P(|T| >= |t|)
export function tDistributionTwoTailedP(t, df) {
    if (df <= 0)
        return 1;
    const absT = Math.abs(t);
    const x = df / (df + absT * absT);
    const p = incompleteBeta(x, df / 2, 0.5);
    return Math.max(0, Math.min(1, p));
}
// Fisher-Snedecor F-distribution p-value: P(F_stat >= F)
export function fDistributionPValue(f, df1, df2) {
    if (f <= 0 || df1 <= 0 || df2 <= 0)
        return 1;
    const x = df2 / (df2 + df1 * f);
    const p = incompleteBeta(x, df2 / 2, df1 / 2);
    return Math.max(0, Math.min(1, p));
}
// Standard Normal CDF
export function standardNormalCDF(z) {
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    const p = 0.2316419;
    const c = 0.39894228;
    if (z >= 0) {
        const t = 1.0 / (1.0 + p * z);
        return 1.0 - c * Math.exp(-z * z / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
    }
    else {
        const t = 1.0 / (1.0 - p * z);
        return c * Math.exp(-z * z / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
    }
}
// Helper: Format numbers cleanly for SPSS tables
export function formatStat(num, decimals = 3) {
    if (num === null || num === undefined || isNaN(num))
        return '.';
    return num.toFixed(decimals);
}
export function formatPValue(p) {
    if (isNaN(p))
        return '.';
    if (p < 0.001)
        return '< .001';
    return p.toFixed(3).replace(/^0\./, '.');
}
// Extract numeric array from dataset, skipping nulls and invalid
export function getNumericValues(dataset, varName) {
    const vals = [];
    for (const row of dataset.data) {
        const v = row[varName];
        if (v !== null && v !== undefined && v !== '' && !isNaN(Number(v))) {
            vals.push(Number(v));
        }
    }
    return vals;
}
// Helper: Descriptive metrics
export function calcDescriptives(vals) {
    const n = vals.length;
    if (n === 0)
        return { n: 0, mean: 0, sd: 0, se: 0, variance: 0, min: 0, max: 0, sum: 0, median: 0 };
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    let ss = 0;
    for (const v of vals)
        ss += (v - mean) * (v - mean);
    const variance = n > 1 ? ss / (n - 1) : 0;
    const sd = Math.sqrt(variance);
    const se = sd / Math.sqrt(n);
    const sorted = [...vals].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];
    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    return { n, mean, sd, se, variance, min, max, sum, median };
}
// ==========================================
// 1. FREQUENCIES
// ==========================================
export function runFrequencies(dataset, varNames) {
    const tables = [];
    const charts = [];
    const id = 'out_' + Date.now();
    // 1. Statistics Summary Table
    const statRows = [
        ['N', 'Valid', ...varNames.map(v => getNumericValues(dataset, v).length)],
        ['', 'Missing', ...varNames.map(v => dataset.data.length - getNumericValues(dataset, v).length)],
        ['Mean', '', ...varNames.map(v => formatStat(calcDescriptives(getNumericValues(dataset, v)).mean, 2))],
        ['Std. Deviation', '', ...varNames.map(v => formatStat(calcDescriptives(getNumericValues(dataset, v)).sd, 3))],
        ['Minimum', '', ...varNames.map(v => formatStat(calcDescriptives(getNumericValues(dataset, v)).min, 2))],
        ['Maximum', '', ...varNames.map(v => formatStat(calcDescriptives(getNumericValues(dataset, v)).max, 2))]
    ];
    tables.push({
        title: 'Statistics',
        headers: [['', '', ...varNames]],
        rows: statRows
    });
    // 2. Frequency Tables for each variable
    for (const varName of varNames) {
        const varDef = dataset.variables.find(v => v.name === varName);
        const labelMap = {};
        if (varDef && varDef.values) {
            for (const vl of varDef.values) {
                labelMap[String(vl.value)] = vl.label;
            }
        }
        const counts = {};
        let validCount = 0;
        let missingCount = 0;
        for (const row of dataset.data) {
            const v = row[varName];
            if (v === null || v === undefined || v === '') {
                missingCount++;
            }
            else {
                const strVal = String(v);
                counts[strVal] = (counts[strVal] || 0) + 1;
                validCount++;
            }
        }
        const totalCount = validCount + missingCount;
        const sortedKeys = Object.keys(counts).sort((a, b) => {
            const numA = Number(a);
            const numB = Number(b);
            if (!isNaN(numA) && !isNaN(numB))
                return numA - numB;
            return a.localeCompare(b);
        });
        const rows = [];
        let cumPercent = 0;
        const chartLabels = [];
        const chartValues = [];
        for (const k of sortedKeys) {
            const count = counts[k];
            const percent = (count / totalCount) * 100;
            const validPercent = validCount > 0 ? (count / validCount) * 100 : 0;
            cumPercent += validPercent;
            const displayLabel = labelMap[k] ? `${k} (${labelMap[k]})` : k;
            chartLabels.push(labelMap[k] || k);
            chartValues.push(count);
            rows.push([
                displayLabel,
                count,
                percent.toFixed(1),
                validPercent.toFixed(1),
                cumPercent.toFixed(1)
            ]);
        }
        rows.push(['Total', validCount, ((validCount / totalCount) * 100).toFixed(1), '100.0', '']);
        if (missingCount > 0) {
            rows.push(['System Missing', missingCount, ((missingCount / totalCount) * 100).toFixed(1), '', '']);
        }
        tables.push({
            title: varDef?.label ? `${varDef.name} (${varDef.label})` : varDef?.name || varName,
            headers: [['Value', 'Frequency', 'Percent', 'Valid Percent', 'Cumulative Percent']],
            rows
        });
        // Chart Output
        charts.push({
            type: 'bar',
            title: `${varDef?.label || varName} Frequency Distribution`,
            labels: chartLabels,
            values: chartValues,
            xLabel: varDef?.label || varName,
            yLabel: 'Frequency'
        });
    }
    return {
        id,
        procedure: 'Frequencies',
        title: 'Frequencies',
        timestamp: new Date().toLocaleTimeString(),
        syntax: `FREQUENCIES VARIABLES=${varNames.join(' ')}\n  /STATISTICS=STDDEV MEAN MINIMUM MAXIMUM\n  /BARCHART.`,
        tables,
        charts
    };
}
// ==========================================
// 2. DESCRIPTIVES
// ==========================================
export function runDescriptives(dataset, varNames) {
    const id = 'out_' + Date.now();
    const rows = [];
    for (const varName of varNames) {
        const vals = getNumericValues(dataset, varName);
        const desc = calcDescriptives(vals);
        const varDef = dataset.variables.find(v => v.name === varName);
        const title = varDef?.label ? `${varDef.label} [${varName}]` : varName;
        rows.push([
            title,
            desc.n,
            formatStat(desc.min, 2),
            formatStat(desc.max, 2),
            formatStat(desc.mean, 2),
            formatStat(desc.se, 4),
            formatStat(desc.sd, 3),
            formatStat(desc.variance, 3)
        ]);
    }
    const table = {
        title: 'Descriptive Statistics',
        headers: [['Variable', 'N', 'Minimum', 'Maximum', 'Mean', 'Std. Error', 'Std. Deviation', 'Variance']],
        rows
    };
    return {
        id,
        procedure: 'Descriptives',
        title: 'Descriptives',
        timestamp: new Date().toLocaleTimeString(),
        syntax: `DESCRIPTIVES VARIABLES=${varNames.join(' ')}\n  /STATISTICS=MEAN STDDEV VARIANCE MIN MAX SEMEAN.`,
        tables: [table],
        charts: []
    };
}
// ==========================================
// 3. CROSSTABS & CHI-SQUARE
// ==========================================
export function runCrosstabs(dataset, rowVarName, colVarName) {
    const id = 'out_' + Date.now();
    const rowDef = dataset.variables.find(v => v.name === rowVarName);
    const colDef = dataset.variables.find(v => v.name === colVarName);
    const rowLabelMap = {};
    if (rowDef?.values)
        for (const vl of rowDef.values)
            rowLabelMap[String(vl.value)] = vl.label;
    const colLabelMap = {};
    if (colDef?.values)
        for (const vl of colDef.values)
            colLabelMap[String(vl.value)] = vl.label;
    const validPairs = [];
    for (const row of dataset.data) {
        const r = row[rowVarName];
        const c = row[colVarName];
        if (r !== null && r !== undefined && r !== '' && c !== null && c !== undefined && c !== '') {
            validPairs.push({ r: String(r), c: String(c) });
        }
    }
    const rowCategories = Array.from(new Set(validPairs.map(p => p.r))).sort();
    const colCategories = Array.from(new Set(validPairs.map(p => p.c))).sort();
    // Contingency matrix
    const matrix = rowCategories.map(() => colCategories.map(() => 0));
    for (const pair of validPairs) {
        const rIdx = rowCategories.indexOf(pair.r);
        const cIdx = colCategories.indexOf(pair.c);
        matrix[rIdx][cIdx]++;
    }
    const rowTotals = matrix.map(r => r.reduce((a, b) => a + b, 0));
    const colTotals = colCategories.map((_, cIdx) => matrix.reduce((sum, r) => sum + r[cIdx], 0));
    const totalN = validPairs.length;
    // Crosstabulation Table
    const tableRows = [];
    const colHeaderNames = colCategories.map(c => colLabelMap[c] || c);
    for (let r = 0; r < rowCategories.length; r++) {
        const rName = rowLabelMap[rowCategories[r]] || rowCategories[r];
        const countRow = [rName, 'Count', ...matrix[r], rowTotals[r]];
        const pctRow = [
            '',
            '% within ' + (rowDef?.name || rowVarName),
            ...matrix[r].map(cnt => rowTotals[r] > 0 ? ((cnt / rowTotals[r]) * 100).toFixed(1) + '%' : '0%'),
            '100.0%'
        ];
        tableRows.push(countRow);
        tableRows.push(pctRow);
    }
    // Total summary row
    tableRows.push(['Total', 'Count', ...colTotals, totalN]);
    tableRows.push([
        '',
        '% of Total',
        ...colTotals.map(cnt => totalN > 0 ? ((cnt / totalN) * 100).toFixed(1) + '%' : '0%'),
        '100.0%'
    ]);
    const crosstabTable = {
        title: `${rowDef?.name || rowVarName} * ${colDef?.name || colVarName} Crosstabulation`,
        headers: [['', '', ...colHeaderNames, 'Total']],
        rows: tableRows
    };
    // Chi-Square Calculation
    let chiSquare = 0;
    let expectedLess5 = 0;
    for (let r = 0; r < rowCategories.length; r++) {
        for (let c = 0; c < colCategories.length; c++) {
            const exp = (rowTotals[r] * colTotals[c]) / totalN;
            if (exp < 5)
                expectedLess5++;
            if (exp > 0) {
                chiSquare += Math.pow(matrix[r][c] - exp, 2) / exp;
            }
        }
    }
    const df = (rowCategories.length - 1) * (colCategories.length - 1);
    const pVal = chiSquarePValue(chiSquare, df);
    const chiTable = {
        title: 'Chi-Square Tests',
        headers: [['Test', 'Value', 'df', 'Asymptotic Significance (2-sided)']],
        rows: [
            ['Pearson Chi-Square', formatStat(chiSquare, 3), df, formatPValue(pVal)],
            ['N of Valid Cases', totalN, '', '']
        ],
        footnotes: [
            `${expectedLess5} cells (${((expectedLess5 / (rowCategories.length * colCategories.length)) * 100).toFixed(1)}%) have expected count less than 5.`
        ]
    };
    // Chart
    const series = colCategories.map((cVal, cIdx) => ({
        name: colLabelMap[cVal] || cVal,
        values: rowCategories.map((_, rIdx) => matrix[rIdx][cIdx])
    }));
    const chart = {
        type: 'bar',
        title: `Crosstab: ${rowVarName} by ${colVarName}`,
        labels: rowCategories.map(r => rowLabelMap[r] || r),
        series,
        xLabel: rowDef?.label || rowVarName,
        yLabel: 'Count'
    };
    return {
        id,
        procedure: 'Crosstabs',
        title: 'Crosstabs',
        timestamp: new Date().toLocaleTimeString(),
        syntax: `CROSSTABS\n  /TABLES=${rowVarName} BY ${colVarName}\n  /STATISTICS=CHISQ\n  /CELLS=COUNT ROW TOTAL.`,
        tables: [crosstabTable, chiTable],
        charts: [chart]
    };
}
// ==========================================
// 4. INDEPENDENT-SAMPLES T-TEST
// ==========================================
export function runIndependentTTest(dataset, testVars, groupVar, val1 = 0, val2 = 1) {
    const id = 'out_' + Date.now();
    const groupDef = dataset.variables.find(v => v.name === groupVar);
    const labelMap = {};
    if (groupDef?.values) {
        for (const vl of groupDef.values)
            labelMap[String(vl.value)] = vl.label;
    }
    const group1Label = labelMap[String(val1)] || String(val1);
    const group2Label = labelMap[String(val2)] || String(val2);
    const groupStatsRows = [];
    const testRows = [];
    for (const varName of testVars) {
        const varDef = dataset.variables.find(v => v.name === varName);
        const varTitle = varDef?.label || varName;
        const g1Vals = [];
        const g2Vals = [];
        for (const row of dataset.data) {
            const g = row[groupVar];
            const y = row[varName];
            if (y !== null && y !== undefined && y !== '' && !isNaN(Number(y))) {
                if (String(g) === String(val1))
                    g1Vals.push(Number(y));
                else if (String(g) === String(val2))
                    g2Vals.push(Number(y));
            }
        }
        const d1 = calcDescriptives(g1Vals);
        const d2 = calcDescriptives(g2Vals);
        groupStatsRows.push([varTitle, group1Label, d1.n, formatStat(d1.mean, 2), formatStat(d1.sd, 3), formatStat(d1.se, 4)]);
        groupStatsRows.push(['', group2Label, d2.n, formatStat(d2.mean, 2), formatStat(d2.sd, 3), formatStat(d2.se, 4)]);
        if (d1.n < 2 || d2.n < 2)
            continue;
        // Equal variances assumed (Pooled)
        const meanDiff = d1.mean - d2.mean;
        const pooledVariance = ((d1.n - 1) * d1.variance + (d2.n - 1) * d2.variance) / (d1.n + d2.n - 2);
        const seDiff = Math.sqrt(pooledVariance * (1 / d1.n + 1 / d2.n));
        const dfPooled = d1.n + d2.n - 2;
        const tPooled = seDiff > 0 ? meanDiff / seDiff : 0;
        const pPooled = tDistributionTwoTailedP(tPooled, dfPooled);
        // 95% Confidence Interval
        const tCritApprox = 1.96; // asymptotic approximation
        const ciLowerPooled = meanDiff - tCritApprox * seDiff;
        const ciUpperPooled = meanDiff + tCritApprox * seDiff;
        // Equal variances not assumed (Welch-Satterthwaite)
        const seDiffWelch = Math.sqrt(d1.variance / d1.n + d2.variance / d2.n);
        const tWelch = seDiffWelch > 0 ? meanDiff / seDiffWelch : 0;
        const v1 = d1.variance / d1.n;
        const v2 = d2.variance / d2.n;
        const dfWelch = seDiffWelch > 0 ? Math.pow(v1 + v2, 2) / ((v1 * v1) / (d1.n - 1) + (v2 * v2) / (d2.n - 1)) : 1;
        const pWelch = tDistributionTwoTailedP(tWelch, dfWelch);
        const ciLowerWelch = meanDiff - tCritApprox * seDiffWelch;
        const ciUpperWelch = meanDiff + tCritApprox * seDiffWelch;
        // Levene's Test (ANOVA of absolute deviations from group mean)
        const z1 = g1Vals.map(v => Math.abs(v - d1.mean));
        const z2 = g2Vals.map(v => Math.abs(v - d2.mean));
        const dz1 = calcDescriptives(z1);
        const dz2 = calcDescriptives(z2);
        const grandMeanZ = (dz1.sum + dz2.sum) / (d1.n + d2.n);
        const ssBetween = d1.n * Math.pow(dz1.mean - grandMeanZ, 2) + d2.n * Math.pow(dz2.mean - grandMeanZ, 2);
        let ssWithin = 0;
        for (const v of z1)
            ssWithin += Math.pow(v - dz1.mean, 2);
        for (const v of z2)
            ssWithin += Math.pow(v - dz2.mean, 2);
        const dfWithin = d1.n + d2.n - 2;
        const fLevene = dfWithin > 0 && ssWithin > 0 ? (ssBetween / 1) / (ssWithin / dfWithin) : 0;
        const pLevene = fDistributionPValue(fLevene, 1, dfWithin);
        testRows.push([
            varTitle,
            'Equal variances assumed',
            formatStat(fLevene, 3),
            formatPValue(pLevene),
            formatStat(tPooled, 3),
            dfPooled,
            formatPValue(pPooled),
            formatStat(meanDiff, 3),
            formatStat(seDiff, 4),
            formatStat(ciLowerPooled, 3),
            formatStat(ciUpperPooled, 3)
        ]);
        testRows.push([
            '',
            'Equal variances not assumed',
            '',
            '',
            formatStat(tWelch, 3),
            formatStat(dfWelch, 2),
            formatPValue(pWelch),
            formatStat(meanDiff, 3),
            formatStat(seDiffWelch, 4),
            formatStat(ciLowerWelch, 3),
            formatStat(ciUpperWelch, 3)
        ]);
    }
    const groupStatsTable = {
        title: 'Group Statistics',
        headers: [['Variable', groupVar, 'N', 'Mean', 'Std. Deviation', 'Std. Error Mean']],
        rows: groupStatsRows
    };
    const testTable = {
        title: 'Independent Samples Test',
        headers: [
            ['Variable', '', "Levene's Test F", 'Levene Sig.', 't', 'df', 'Sig. (2-tailed)', 'Mean Difference', 'Std. Error Difference', '95% CI Lower', '95% CI Upper']
        ],
        rows: testRows
    };
    return {
        id,
        procedure: 'T-Test',
        title: 'Independent-Samples T-Test',
        timestamp: new Date().toLocaleTimeString(),
        syntax: `T-TEST GROUPS=${groupVar}(${val1} ${val2})\n  /VARIABLES=${testVars.join(' ')}\n  /CRITERIA=CI(.95).`,
        tables: [groupStatsTable, testTable],
        charts: []
    };
}
// ==========================================
// 5. ONE-WAY ANOVA
// ==========================================
export function runOneWayAnova(dataset, depVar, factorVar) {
    const id = 'out_' + Date.now();
    const depDef = dataset.variables.find(v => v.name === depVar);
    const factDef = dataset.variables.find(v => v.name === factorVar);
    const groupMap = {};
    const labelMap = {};
    if (factDef?.values) {
        for (const vl of factDef.values)
            labelMap[String(vl.value)] = vl.label;
    }
    for (const row of dataset.data) {
        const f = row[factorVar];
        const y = row[depVar];
        if (f !== null && f !== undefined && f !== '' && y !== null && y !== undefined && y !== '' && !isNaN(Number(y))) {
            const key = String(f);
            if (!groupMap[key])
                groupMap[key] = [];
            groupMap[key].push(Number(y));
        }
    }
    const groups = Object.keys(groupMap).sort();
    const k = groups.length;
    const descRows = [];
    let grandSum = 0;
    let grandN = 0;
    const chartLabels = [];
    const chartMeans = [];
    for (const g of groups) {
        const vals = groupMap[g];
        const d = calcDescriptives(vals);
        grandSum += d.sum;
        grandN += d.n;
        const gName = labelMap[g] ? `${g} (${labelMap[g]})` : g;
        chartLabels.push(labelMap[g] || g);
        chartMeans.push(d.mean);
        const ci95Lower = d.mean - 1.96 * d.se;
        const ci95Upper = d.mean + 1.96 * d.se;
        descRows.push([
            gName,
            d.n,
            formatStat(d.mean, 2),
            formatStat(d.sd, 3),
            formatStat(d.se, 4),
            formatStat(ci95Lower, 2),
            formatStat(ci95Upper, 2),
            formatStat(d.min, 2),
            formatStat(d.max, 2)
        ]);
    }
    const grandMean = grandN > 0 ? grandSum / grandN : 0;
    // Between and Within Sum of Squares
    let ssBetween = 0;
    let ssWithin = 0;
    for (const g of groups) {
        const vals = groupMap[g];
        const d = calcDescriptives(vals);
        ssBetween += d.n * Math.pow(d.mean - grandMean, 2);
        for (const v of vals) {
            ssWithin += Math.pow(v - d.mean, 2);
        }
    }
    const ssTotal = ssBetween + ssWithin;
    const dfBetween = k - 1;
    const dfWithin = grandN - k;
    const dfTotal = grandN - 1;
    const msBetween = dfBetween > 0 ? ssBetween / dfBetween : 0;
    const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 0;
    const fStat = msWithin > 0 ? msBetween / msWithin : 0;
    const pVal = fDistributionPValue(fStat, dfBetween, dfWithin);
    const descTable = {
        title: `Descriptives: ${depDef?.label || depVar}`,
        headers: [['Group', 'N', 'Mean', 'Std. Deviation', 'Std. Error', '95% CI Lower', '95% CI Upper', 'Min', 'Max']],
        rows: descRows
    };
    const anovaTable = {
        title: `ANOVA: ${depDef?.label || depVar}`,
        headers: [['Source', 'Sum of Squares', 'df', 'Mean Square', 'F', 'Sig.']],
        rows: [
            ['Between Groups', formatStat(ssBetween, 3), dfBetween, formatStat(msBetween, 3), formatStat(fStat, 3), formatPValue(pVal)],
            ['Within Groups', formatStat(ssWithin, 3), dfWithin, formatStat(msWithin, 3), '', ''],
            ['Total', formatStat(ssTotal, 3), dfTotal, '', '', '']
        ]
    };
    const chart = {
        type: 'bar',
        title: `Means Plot: ${depVar} by ${factorVar}`,
        labels: chartLabels,
        values: chartMeans,
        xLabel: factDef?.label || factorVar,
        yLabel: `Mean ${depVar}`
    };
    return {
        id,
        procedure: 'Oneway ANOVA',
        title: 'One-Way ANOVA',
        timestamp: new Date().toLocaleTimeString(),
        syntax: `ONEWAY ${depVar} BY ${factorVar}\n  /STATISTICS DESCRIPTIVES\n  /PLOT MEANS.`,
        tables: [descTable, anovaTable],
        charts: [chart]
    };
}
// ==========================================
// 6. BIVARIATE CORRELATIONS
// ==========================================
export function runCorrelations(dataset, varNames, method = 'pearson') {
    const id = 'out_' + Date.now();
    const nVars = varNames.length;
    const rows = [];
    for (let i = 0; i < nVars; i++) {
        const v1 = varNames[i];
        const v1Def = dataset.variables.find(v => v.name === v1);
        const label = v1Def?.label ? `${v1Def.label} [${v1}]` : v1;
        const rRow = [label, `${method === 'pearson' ? 'Pearson' : 'Spearman'} Correlation`];
        const sigRow = ['', 'Sig. (2-tailed)'];
        const nRow = ['', 'N'];
        for (let j = 0; j < nVars; j++) {
            const v2 = varNames[j];
            const pairs = [];
            for (const row of dataset.data) {
                const x = row[v1];
                const y = row[v2];
                if (x !== null && x !== undefined && !isNaN(Number(x)) && y !== null && y !== undefined && !isNaN(Number(y))) {
                    pairs.push({ x: Number(x), y: Number(y) });
                }
            }
            const n = pairs.length;
            if (i === j) {
                rRow.push('1');
                sigRow.push('.');
                nRow.push(n);
            }
            else if (n < 3) {
                rRow.push('.');
                sigRow.push('.');
                nRow.push(n);
            }
            else {
                let r = 0;
                if (method === 'pearson') {
                    const meanX = pairs.reduce((s, p) => s + p.x, 0) / n;
                    const meanY = pairs.reduce((s, p) => s + p.y, 0) / n;
                    let num = 0;
                    let denX = 0;
                    let denY = 0;
                    for (const p of pairs) {
                        const dx = p.x - meanX;
                        const dy = p.y - meanY;
                        num += dx * dy;
                        denX += dx * dx;
                        denY += dy * dy;
                    }
                    r = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;
                }
                else {
                    // Spearman rank correlation
                    const sortedX = [...pairs].map((p, idx) => ({ val: p.x, idx })).sort((a, b) => a.val - b.val);
                    const rankX = new Array(n);
                    for (let k = 0; k < n; k++)
                        rankX[sortedX[k].idx] = k + 1;
                    const sortedY = [...pairs].map((p, idx) => ({ val: p.y, idx })).sort((a, b) => a.val - b.val);
                    const rankY = new Array(n);
                    for (let k = 0; k < n; k++)
                        rankY[sortedY[k].idx] = k + 1;
                    let sumD2 = 0;
                    for (let k = 0; k < n; k++)
                        sumD2 += Math.pow(rankX[k] - rankY[k], 2);
                    r = 1 - (6 * sumD2) / (n * (n * n - 1));
                }
                const tStat = Math.abs(r) < 1 ? (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r) : 999;
                const pVal = tDistributionTwoTailedP(tStat, n - 2);
                let flag = '';
                if (pVal < 0.01)
                    flag = '**';
                else if (pVal < 0.05)
                    flag = '*';
                rRow.push(formatStat(r, 3) + flag);
                sigRow.push(formatPValue(pVal));
                nRow.push(n);
            }
        }
        rows.push(rRow);
        rows.push(sigRow);
        rows.push(nRow);
    }
    const table = {
        title: 'Correlations',
        headers: [['Variable', '', ...varNames]],
        rows,
        footnotes: [
            '** Correlation is significant at the 0.01 level (2-tailed).',
            '* Correlation is significant at the 0.05 level (2-tailed).'
        ]
    };
    return {
        id,
        procedure: 'Correlations',
        title: 'Bivariate Correlations',
        timestamp: new Date().toLocaleTimeString(),
        syntax: `CORRELATIONS\n  /VARIABLES=${varNames.join(' ')}\n  /PRINT=TWOTAIL NOSIG.`,
        tables: [table],
        charts: []
    };
}
// ==========================================
// 7. LINEAR REGRESSION
// ==========================================
export function runLinearRegression(dataset, depVar, indepVars) {
    const id = 'out_' + Date.now();
    const depDef = dataset.variables.find(v => v.name === depVar);
    // Extract complete cases
    const validData = [];
    for (const row of dataset.data) {
        const yVal = row[depVar];
        if (yVal === null || yVal === undefined || isNaN(Number(yVal)))
            continue;
        let ok = true;
        const xRow = [];
        for (const iv of indepVars) {
            const xv = row[iv];
            if (xv === null || xv === undefined || isNaN(Number(xv))) {
                ok = false;
                break;
            }
            xRow.push(Number(xv));
        }
        if (ok) {
            validData.push({ y: Number(yVal), x: xRow });
        }
    }
    const n = validData.length;
    const p = indepVars.length; // number of predictors
    if (n <= p + 1) {
        return {
            id,
            procedure: 'Regression',
            title: 'Linear Regression',
            timestamp: new Date().toLocaleTimeString(),
            tables: [{
                    title: 'Error',
                    headers: [['Message']],
                    rows: [['Insufficient valid cases for regression']]
                }],
            charts: []
        };
    }
    // Construct design matrix X with intercept column
    const X = validData.map(d => [1, ...d.x]);
    const Y = validData.map(d => d.y);
    // Normal equations: (X'X) * beta = X'Y
    const numCols = p + 1;
    const XtX = Array.from({ length: numCols }, () => new Array(numCols).fill(0));
    const XtY = new Array(numCols).fill(0);
    for (let i = 0; i < n; i++) {
        const xi = X[i];
        const yi = Y[i];
        for (let r = 0; r < numCols; r++) {
            XtY[r] += xi[r] * yi;
            for (let c = 0; c < numCols; c++) {
                XtX[r][c] += xi[r] * xi[c];
            }
        }
    }
    // Invert XtX using Gauss-Jordan elimination
    const invXtX = XtX.map((row, rIdx) => {
        const eye = new Array(numCols).fill(0);
        eye[rIdx] = 1;
        return [...row, ...eye];
    });
    for (let col = 0; col < numCols; col++) {
        let pivotRow = col;
        for (let r = col + 1; r < numCols; r++) {
            if (Math.abs(invXtX[r][col]) > Math.abs(invXtX[pivotRow][col])) {
                pivotRow = r;
            }
        }
        const temp = invXtX[col];
        invXtX[col] = invXtX[pivotRow];
        invXtX[pivotRow] = temp;
        const pivotVal = invXtX[col][col];
        if (Math.abs(pivotVal) < 1e-12)
            continue;
        for (let c = 0; c < numCols * 2; c++)
            invXtX[col][c] /= pivotVal;
        for (let r = 0; r < numCols; r++) {
            if (r !== col) {
                const factor = invXtX[r][col];
                for (let c = 0; c < numCols * 2; c++) {
                    invXtX[r][c] -= factor * invXtX[col][c];
                }
            }
        }
    }
    const beta = new Array(numCols).fill(0);
    for (let r = 0; r < numCols; r++) {
        for (let c = 0; c < numCols; c++) {
            beta[r] += invXtX[r][c + numCols] * XtY[c];
        }
    }
    // Residuals, SS Total, SS Residual
    const yMean = Y.reduce((a, b) => a + b, 0) / n;
    let ssTotal = 0;
    let ssRes = 0;
    const yPred = [];
    for (let i = 0; i < n; i++) {
        let pred = 0;
        for (let c = 0; c < numCols; c++)
            pred += X[i][c] * beta[c];
        yPred.push(pred);
        ssTotal += Math.pow(Y[i] - yMean, 2);
        ssRes += Math.pow(Y[i] - pred, 2);
    }
    const ssReg = ssTotal - ssRes;
    const r2 = ssTotal > 0 ? Math.max(0, ssReg / ssTotal) : 0;
    const r = Math.sqrt(r2);
    const dfReg = p;
    const dfRes = n - p - 1;
    const dfTot = n - 1;
    const adjR2 = dfTot > 0 && dfRes > 0 ? 1 - ((1 - r2) * dfTot) / dfRes : 0;
    const msReg = dfReg > 0 ? ssReg / dfReg : 0;
    const msRes = dfRes > 0 ? ssRes / dfRes : 0;
    const seEstimate = Math.sqrt(msRes);
    const fStat = msRes > 0 ? msReg / msRes : 0;
    const pAnova = fDistributionPValue(fStat, dfReg, dfRes);
    // Model Summary Table
    const modelSummaryTable = {
        title: 'Model Summary',
        headers: [['Model', 'R', 'R Square', 'Adjusted R Square', 'Std. Error of the Estimate']],
        rows: [['1', formatStat(r, 3), formatStat(r2, 3), formatStat(adjR2, 3), formatStat(seEstimate, 3)]]
    };
    // ANOVA Table
    const anovaTable = {
        title: 'ANOVA',
        headers: [['Model', 'Source', 'Sum of Squares', 'df', 'Mean Square', 'F', 'Sig.']],
        rows: [
            ['1', 'Regression', formatStat(ssReg, 3), dfReg, formatStat(msReg, 3), formatStat(fStat, 3), formatPValue(pAnova)],
            ['', 'Residual', formatStat(ssRes, 3), dfRes, formatStat(msRes, 3), '', ''],
            ['', 'Total', formatStat(ssTotal, 3), dfTot, '', '', '']
        ]
    };
    // Coefficients Table
    const coefRows = [];
    const predictorNames = ['(Constant)', ...indepVars];
    for (let c = 0; c < numCols; c++) {
        const b = beta[c];
        const seB = Math.sqrt(Math.max(0, msRes * invXtX[c][c + numCols]));
        const t = seB > 0 ? b / seB : 0;
        const pVal = tDistributionTwoTailedP(t, dfRes);
        const ciLower = b - 1.96 * seB;
        const ciUpper = b + 1.96 * seB;
        coefRows.push([
            c === 0 ? '1' : '',
            predictorNames[c],
            formatStat(b, 3),
            formatStat(seB, 4),
            formatStat(t, 3),
            formatPValue(pVal),
            formatStat(ciLower, 3),
            formatStat(ciUpper, 3)
        ]);
    }
    const coefTable = {
        title: 'Coefficients',
        headers: [['Model', 'Predictor', 'B', 'Std. Error', 't', 'Sig.', '95% CI Lower', '95% CI Upper']],
        rows: coefRows
    };
    // Scatter plot of Predicted vs Observed
    const scatterPoints = validData.map((d, i) => ({
        x: yPred[i],
        y: d.y
    }));
    const chart = {
        type: 'scatter',
        title: 'Predicted vs Observed Plot',
        dataPoints: scatterPoints,
        xLabel: 'Predicted Value',
        yLabel: depDef?.label || depVar
    };
    return {
        id,
        procedure: 'Regression',
        title: 'Linear Regression',
        timestamp: new Date().toLocaleTimeString(),
        syntax: `REGRESSION\n  /DEPENDENT ${depVar}\n  /METHOD=ENTER ${indepVars.join(' ')}.`,
        tables: [modelSummaryTable, anovaTable, coefTable],
        charts: [chart]
    };
}
// ==========================================
// 8. SCALE RELIABILITY (Cronbach's Alpha)
// ==========================================
export function runReliability(dataset, varNames) {
    const id = 'out_' + Date.now();
    const k = varNames.length;
    const validData = [];
    for (const row of dataset.data) {
        let ok = true;
        const itemRow = [];
        for (const v of varNames) {
            const val = row[v];
            if (val === null || val === undefined || isNaN(Number(val))) {
                ok = false;
                break;
            }
            itemRow.push(Number(val));
        }
        if (ok)
            validData.push(itemRow);
    }
    const n = validData.length;
    if (n < 2 || k < 2) {
        return {
            id,
            procedure: 'Reliability',
            title: 'Reliability Analysis',
            timestamp: new Date().toLocaleTimeString(),
            tables: [{
                    title: 'Error',
                    headers: [['Message']],
                    rows: [['At least 2 variables and 2 complete cases are required for reliability analysis.']]
                }],
            charts: []
        };
    }
    // Item variances
    const itemVariances = [];
    for (let j = 0; j < k; j++) {
        const colVals = validData.map(r => r[j]);
        itemVariances.push(calcDescriptives(colVals).variance);
    }
    const sumItemVar = itemVariances.reduce((a, b) => a + b, 0);
    // Total scale score for each person
    const totalScores = validData.map(r => r.reduce((a, b) => a + b, 0));
    const scaleVar = calcDescriptives(totalScores).variance;
    // Overall Cronbach's Alpha
    const alpha = scaleVar > 0 ? (k / (k - 1)) * (1 - sumItemVar / scaleVar) : 0;
    // Case Processing Summary
    const caseTable = {
        title: 'Case Processing Summary',
        headers: [['Cases', 'N', '%']],
        rows: [
            ['Valid', n, '100.0%'],
            ['Excluded', dataset.data.length - n, (((dataset.data.length - n) / dataset.data.length) * 100).toFixed(1) + '%'],
            ['Total', dataset.data.length, '100.0%']
        ]
    };
    // Reliability Statistics
    const relTable = {
        title: 'Reliability Statistics',
        headers: [["Cronbach's Alpha", 'N of Items']],
        rows: [[formatStat(alpha, 3), k]]
    };
    // Item-Total Statistics table
    const itemTotalRows = [];
    for (let j = 0; j < k; j++) {
        const varName = varNames[j];
        const subScores = validData.map(r => r.reduce((sum, val, idx) => idx !== j ? sum + val : sum, 0));
        const subDesc = calcDescriptives(subScores);
        const subItemVar = sumItemVar - itemVariances[j];
        const alphaIfDeleted = subDesc.variance > 0 ? ((k - 1) / (k - 2)) * (1 - subItemVar / subDesc.variance) : 0;
        // Corrected item-total correlation
        const itemVals = validData.map(r => r[j]);
        const itemDesc = calcDescriptives(itemVals);
        let cov = 0;
        for (let i = 0; i < n; i++) {
            cov += (itemVals[i] - itemDesc.mean) * (subScores[i] - subDesc.mean);
        }
        const rItemTotal = itemDesc.sd > 0 && subDesc.sd > 0 ? cov / ((n - 1) * itemDesc.sd * subDesc.sd) : 0;
        itemTotalRows.push([
            varName,
            formatStat(subDesc.mean, 2),
            formatStat(subDesc.variance, 3),
            formatStat(rItemTotal, 3),
            formatStat(alphaIfDeleted, 3)
        ]);
    }
    const itemTotalTable = {
        title: 'Item-Total Statistics',
        headers: [['Item', 'Scale Mean if Item Deleted', 'Scale Variance if Item Deleted', 'Corrected Item-Total Correlation', "Cronbach's Alpha if Item Deleted"]],
        rows: itemTotalRows
    };
    return {
        id,
        procedure: 'Reliability',
        title: 'Reliability Analysis',
        timestamp: new Date().toLocaleTimeString(),
        syntax: `RELIABILITY\n  /VARIABLES=${varNames.join(' ')}\n  /SCALE('ALL VARIABLES') ALL\n  /MODEL=ALPHA\n  /SUMMARY=TOTAL.`,
        tables: [caseTable, relTable, itemTotalTable],
        charts: []
    };
}
// ==========================================
// 9. FACTOR ANALYSIS (PCA)
// ==========================================
export function runFactorAnalysis(dataset, varNames) {
    const id = 'out_' + Date.now();
    const k = varNames.length;
    const validData = [];
    for (const row of dataset.data) {
        let ok = true;
        const itemRow = [];
        for (const v of varNames) {
            const val = row[v];
            if (val === null || val === undefined || isNaN(Number(val))) {
                ok = false;
                break;
            }
            itemRow.push(Number(val));
        }
        if (ok)
            validData.push(itemRow);
    }
    const n = validData.length;
    // Compute correlation matrix
    const R = Array.from({ length: k }, () => new Array(k).fill(0));
    const means = [];
    const sds = [];
    for (let j = 0; j < k; j++) {
        const col = validData.map(r => r[j]);
        const d = calcDescriptives(col);
        means.push(d.mean);
        sds.push(d.sd);
    }
    for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
            if (i === j) {
                R[i][j] = 1;
            }
            else {
                let cov = 0;
                for (let rowIdx = 0; rowIdx < n; rowIdx++) {
                    cov += (validData[rowIdx][i] - means[i]) * (validData[rowIdx][j] - means[j]);
                }
                R[i][j] = sds[i] > 0 && sds[j] > 0 ? cov / ((n - 1) * sds[i] * sds[j]) : 0;
            }
        }
    }
    // Approximate eigenvalues via Power Iteration / Gershgorin approximation
    // For standard factor analysis, we estimate eigenvalues
    const eigenvalues = [];
    const workingR = R.map(row => [...row]);
    for (let comp = 0; comp < k; comp++) {
        let vec = new Array(k).fill(1 / Math.sqrt(k));
        let lambda = 1.0;
        for (let iter = 0; iter < 40; iter++) {
            const nextVec = new Array(k).fill(0);
            for (let r = 0; r < k; r++) {
                for (let c = 0; c < k; c++) {
                    nextVec[r] += workingR[r][c] * vec[c];
                }
            }
            const norm = Math.sqrt(nextVec.reduce((sum, v) => sum + v * v, 0));
            if (norm > 0) {
                lambda = norm;
                vec = nextVec.map(v => v / norm);
            }
        }
        eigenvalues.push(Math.max(0.01, lambda));
        // Deflate matrix
        for (let r = 0; r < k; r++) {
            for (let c = 0; c < k; c++) {
                workingR[r][c] -= lambda * vec[r] * vec[c];
            }
        }
    }
    eigenvalues.sort((a, b) => b - a);
    const totalVariance = eigenvalues.reduce((a, b) => a + b, 0);
    const varianceRows = [];
    let cumPct = 0;
    for (let i = 0; i < k; i++) {
        const ev = eigenvalues[i];
        const pct = (ev / totalVariance) * 100;
        cumPct += pct;
        varianceRows.push([
            i + 1,
            formatStat(ev, 3),
            pct.toFixed(2),
            cumPct.toFixed(2)
        ]);
    }
    const varianceTable = {
        title: 'Total Variance Explained',
        headers: [['Component', 'Total Initial Eigenvalues', '% of Variance', 'Cumulative %']],
        rows: varianceRows
    };
    const chart = {
        type: 'line',
        title: 'Scree Plot',
        labels: eigenvalues.map((_, idx) => String(idx + 1)),
        values: eigenvalues,
        xLabel: 'Component Number',
        yLabel: 'Eigenvalue'
    };
    return {
        id,
        procedure: 'Factor',
        title: 'Factor Analysis (PCA)',
        timestamp: new Date().toLocaleTimeString(),
        syntax: `FACTOR\n  /VARIABLES ${varNames.join(' ')}\n  /EXTRACTION PC\n  /PRINT INITIAL EXTRACTION\n  /PLOT EIGEN.`,
        tables: [varianceTable],
        charts: [chart]
    };
}
// ==========================================
// 10. K-MEANS CLUSTER
// ==========================================
export function runKMeansCluster(dataset, varNames, k = 3) {
    const id = 'out_' + Date.now();
    const validData = [];
    for (const row of dataset.data) {
        let ok = true;
        const itemRow = [];
        for (const v of varNames) {
            const val = row[v];
            if (val === null || val === undefined || isNaN(Number(val))) {
                ok = false;
                break;
            }
            itemRow.push(Number(val));
        }
        if (ok)
            validData.push(itemRow);
    }
    const n = validData.length;
    const numVars = varNames.length;
    k = Math.min(k, n);
    // Initialize centers using diverse points
    const centers = [];
    const step = Math.floor(n / k);
    for (let c = 0; c < k; c++) {
        centers.push([...validData[c * step]]);
    }
    // Iterate assignments
    const assignments = new Array(n).fill(0);
    for (let iter = 0; iter < 15; iter++) {
        for (let i = 0; i < n; i++) {
            let bestDist = Infinity;
            let bestCluster = 0;
            for (let c = 0; c < k; c++) {
                let dist = 0;
                for (let v = 0; v < numVars; v++) {
                    dist += Math.pow(validData[i][v] - centers[c][v], 2);
                }
                if (dist < bestDist) {
                    bestDist = dist;
                    bestCluster = c;
                }
            }
            assignments[i] = bestCluster;
        }
        // Update centers
        const counts = new Array(k).fill(0);
        const newCenters = Array.from({ length: k }, () => new Array(numVars).fill(0));
        for (let i = 0; i < n; i++) {
            const cl = assignments[i];
            counts[cl]++;
            for (let v = 0; v < numVars; v++) {
                newCenters[cl][v] += validData[i][v];
            }
        }
        for (let c = 0; c < k; c++) {
            if (counts[c] > 0) {
                for (let v = 0; v < numVars; v++) {
                    centers[c][v] = newCenters[c][v] / counts[c];
                }
            }
        }
    }
    // Final Cluster Centers Table
    const finalCenterRows = [];
    for (let v = 0; v < numVars; v++) {
        finalCenterRows.push([
            varNames[v],
            ...centers.map(c => formatStat(c[v], 2))
        ]);
    }
    const clusterCounts = new Array(k).fill(0);
    for (const a of assignments)
        clusterCounts[a]++;
    const centerTable = {
        title: 'Final Cluster Centers',
        headers: [['Variable', ...centers.map((_, idx) => `Cluster ${idx + 1}`)]],
        rows: finalCenterRows
    };
    const countTable = {
        title: 'Number of Cases in each Cluster',
        headers: [['Cluster', 'Cases', '% of Total']],
        rows: [
            ...clusterCounts.map((cnt, idx) => [
                String(idx + 1),
                cnt,
                ((cnt / n) * 100).toFixed(1) + '%'
            ]),
            ['Valid', n, '100.0%']
        ]
    };
    const chart = {
        type: 'bar',
        title: 'Cases per Cluster Distribution',
        labels: centers.map((_, idx) => `Cluster ${idx + 1}`),
        values: clusterCounts,
        xLabel: 'Cluster',
        yLabel: 'Number of Cases'
    };
    return {
        id,
        procedure: 'Quick Cluster',
        title: 'K-Means Cluster Analysis',
        timestamp: new Date().toLocaleTimeString(),
        syntax: `QUICK CLUSTER ${varNames.join(' ')}\n  /CRITERIA=CLUSTERS(${k})\n  /PRINT=INITIAL FINAL.`,
        tables: [centerTable, countTable],
        charts: [chart]
    };
}
