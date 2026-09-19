import React, { useState, useMemo } from 'react';
import { SpssDialogModal, TargetGroup } from './SpssDialogModal';
import { AssumptionCopilot } from '../AssumptionCopilot';
import { checkTTestAssumptions, checkAnovaAssumptions, checkCorrelationAssumptions, checkRegressionAssumptions } from '../../engine/assumptionChecker';
import { Dataset, OutputItem } from '../../types';
import {
  runFrequencies,
  runDescriptives,
  runCrosstabs,
  runIndependentTTest,
  runOneWayAnova,
  runCorrelations,
  runLinearRegression,
  runFactorAnalysis,
  runReliability,
  runKMeansCluster
} from '../../engine/statisticalEngine';
import {
  X,
  BarChart3,
  Sigma,
  Grid,
  GitCompare,
  TrendingUp,
  Activity,
  LineChart,
  Layers,
  CheckCircle2,
  Boxes,
  Calculator,
  Info,
  Sparkles,
  Cpu,
  Keyboard,
  ShieldCheck,
  Check,
  History,
  FileText
} from 'lucide-react';

interface DialogProps {
  dataset: Dataset;
  onAddOutput: (item: OutputItem) => void;
  onPasteSyntax: (syntax: string) => void;
  onClose: () => void;
  onViewOutputs: () => void;
}

// 1. FREQUENCIES DIALOG
export const FrequenciesDialog: React.FC<DialogProps> = ({ dataset, onAddOutput, onPasteSyntax, onClose, onViewOutputs }) => {
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    { id: 'vars', title: 'Variable(s)', isMulti: true, selectedVarNames: [] }
  ]);

  const vars = targetGroups[0].selectedVarNames;
  const syntax = `FREQUENCIES VARIABLES=${vars.join(' ')}\n  /STATISTICS=STDDEV MEAN MINIMUM MAXIMUM\n  /BARCHART.`;

  const handleOk = () => {
    if (vars.length === 0) return;
    const out = runFrequencies(dataset, vars);
    onAddOutput(out);
    onClose();
    onViewOutputs();
  };

  const handlePaste = () => {
    onPasteSyntax(syntax);
    onClose();
  };

  return (
    <SpssDialogModal
      title="Frequencies"
      subtitle="Univariate distributions, percentages, summary statistics & bar charts"
      icon={<BarChart3 size={16} />}
      dataset={dataset}
      targetGroups={targetGroups}
      onTargetGroupsChange={setTargetGroups}
      onOk={handleOk}
      onPaste={handlePaste}
      onClose={onClose}
      helpContent={
        <div>
          <p><b>Frequencies</b> computes counts, percentages, valid percentages, and cumulative percentages for selected variables.</p>
          <p>Best for nominal, ordinal, and discrete variables. Also outputs frequency bar charts.</p>
        </div>
      }
    />
  );
};

// 2. DESCRIPTIVES DIALOG
export const DescriptivesDialog: React.FC<DialogProps> = ({ dataset, onAddOutput, onPasteSyntax, onClose, onViewOutputs }) => {
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    { id: 'vars', title: 'Variable(s)', isMulti: true, selectedVarNames: [] }
  ]);

  const vars = targetGroups[0].selectedVarNames;
  const syntax = `DESCRIPTIVES VARIABLES=${vars.join(' ')}\n  /STATISTICS=MEAN STDDEV VARIANCE MIN MAX SEMEAN.`;

  const handleOk = () => {
    if (vars.length === 0) return;
    const out = runDescriptives(dataset, vars);
    onAddOutput(out);
    onClose();
    onViewOutputs();
  };

  const handlePaste = () => {
    onPasteSyntax(syntax);
    onClose();
  };

  return (
    <SpssDialogModal
      title="Descriptive Statistics"
      subtitle="Measures of central tendency, dispersion, and standard error of mean"
      icon={<Sigma size={16} />}
      dataset={dataset}
      targetGroups={targetGroups}
      onTargetGroupsChange={setTargetGroups}
      onOk={handleOk}
      onPaste={handlePaste}
      onClose={onClose}
      helpContent={
        <div>
          <p><b>Descriptives</b> computes standard summary measures of central tendency and dispersion (Mean, Standard Error, Standard Deviation, Variance, Min, Max).</p>
        </div>
      }
    />
  );
};

// 3. CROSSTABS DIALOG
export const CrosstabsDialog: React.FC<DialogProps> = ({ dataset, onAddOutput, onPasteSyntax, onClose, onViewOutputs }) => {
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    { id: 'row', title: 'Row Variable', isMulti: false, selectedVarNames: [] },
    { id: 'col', title: 'Column Variable', isMulti: false, selectedVarNames: [] }
  ]);

  const rowVar = targetGroups[0].selectedVarNames[0];
  const colVar = targetGroups[1].selectedVarNames[0];
  const syntax = `CROSSTABS\n  /TABLES=${rowVar || 'ROW'} BY ${colVar || 'COL'}\n  /STATISTICS=CHISQ\n  /CELLS=COUNT ROW TOTAL.`;

  const handleOk = () => {
    if (!rowVar || !colVar) return;
    const out = runCrosstabs(dataset, rowVar, colVar);
    onAddOutput(out);
    onClose();
    onViewOutputs();
  };

  const handlePaste = () => {
    onPasteSyntax(syntax);
    onClose();
  };

  return (
    <SpssDialogModal
      title="Crosstabs & Chi-Square"
      subtitle="Two-way contingency tables and Pearson Chi-Square test of independence"
      icon={<Grid size={16} />}
      dataset={dataset}
      targetGroups={targetGroups}
      onTargetGroupsChange={setTargetGroups}
      onOk={handleOk}
      onPaste={handlePaste}
      onClose={onClose}
      helpContent={
        <div>
          <p><b>Crosstabs</b> creates two-way contingency tables and computes the Pearson Chi-Square test of independence between categorical variables.</p>
        </div>
      }
    />
  );
};

// 4. INDEPENDENT T-TEST DIALOG
export const TTestIndependentDialog: React.FC<DialogProps> = ({ dataset, onAddOutput, onPasteSyntax, onClose, onViewOutputs }) => {
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    { id: 'test', title: 'Test Variable(s)', isMulti: true, selectedVarNames: [] },
    { id: 'group', title: 'Grouping Variable', isMulti: false, selectedVarNames: [] }
  ]);
  const [groupVal1, setGroupVal1] = useState<string>('0');
  const [groupVal2, setGroupVal2] = useState<string>('1');

  const testVars = targetGroups[0].selectedVarNames;
  const groupVar = targetGroups[1].selectedVarNames[0];
  const syntax = `T-TEST GROUPS=${groupVar || 'group'}(${groupVal1} ${groupVal2})\n  /VARIABLES=${testVars.join(' ')}\n  /CRITERIA=CI(.95).`;

  const handleOk = () => {
    if (testVars.length === 0 || !groupVar) return;
    const out = runIndependentTTest(dataset, testVars, groupVar, groupVal1, groupVal2);
    onAddOutput(out);
    onClose();
    onViewOutputs();
  };

  const handlePaste = () => {
    onPasteSyntax(syntax);
    onClose();
  };

  const ttestReport = useMemo(() => {
    if (testVars.length > 0 && groupVar) {
      return checkTTestAssumptions(dataset, testVars[0], groupVar);
    }
    return null;
  }, [dataset, testVars, groupVar]);

  return (
    <SpssDialogModal
      title="Independent-Samples T-Test"
      subtitle="Compare means between two independent groups with Levene's equality test"
      icon={<GitCompare size={16} />}
      dataset={dataset}
      targetGroups={targetGroups}
      onTargetGroupsChange={setTargetGroups}
      onOk={handleOk}
      onPaste={handlePaste}
      onClose={onClose}
      optionsContent={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
            <span><b>Define Groups:</b></span>
            <label>Group 1:</label>
            <input
              type="text"
              className="val-label-input"
              value={groupVal1}
              onChange={e => setGroupVal1(e.target.value)}
              style={{ width: '50px', textAlign: 'center' }}
            />
            <label>Group 2:</label>
            <input
              type="text"
              className="val-label-input"
              value={groupVal2}
              onChange={e => setGroupVal2(e.target.value)}
              style={{ width: '50px', textAlign: 'center' }}
            />
          </div>
          {ttestReport && <AssumptionCopilot report={ttestReport} />}
        </div>
      }
      helpContent={
        <div>
          <p><b>Independent-Samples T-Test</b> compares the means of two independent groups (e.g. Female vs Male) on continuous test variables.</p>
          <p>Includes Levene's Test for Equality of Variances and Welch-Satterthwaite test.</p>
        </div>
      }
    />
  );
};

// 5. ONE-WAY ANOVA DIALOG
export const OneWayAnovaDialog: React.FC<DialogProps> = ({ dataset, onAddOutput, onPasteSyntax, onClose, onViewOutputs }) => {
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    { id: 'dep', title: 'Dependent Variable', isMulti: false, selectedVarNames: [] },
    { id: 'fact', title: 'Factor Variable', isMulti: false, selectedVarNames: [] }
  ]);

  const depVar = targetGroups[0].selectedVarNames[0];
  const factVar = targetGroups[1].selectedVarNames[0];
  const syntax = `ONEWAY ${depVar || 'dep'} BY ${factVar || 'factor'}\n  /STATISTICS DESCRIPTIVES\n  /PLOT MEANS.`;

  const handleOk = () => {
    if (!depVar || !factVar) return;
    const out = runOneWayAnova(dataset, depVar, factVar);
    onAddOutput(out);
    onClose();
    onViewOutputs();
  };

  const handlePaste = () => {
    onPasteSyntax(syntax);
    onClose();
  };

  const anovaReport = useMemo(() => {
    if (depVar && factVar) return checkAnovaAssumptions(dataset, depVar, factVar);
    return null;
  }, [dataset, depVar, factVar]);

  return (
    <SpssDialogModal
      title="One-Way ANOVA"
      subtitle="Analyze variance across 3+ categorical factor levels with means plot"
      icon={<TrendingUp size={16} />}
      dataset={dataset}
      targetGroups={targetGroups}
      onTargetGroupsChange={setTargetGroups}
      onOk={handleOk}
      onPaste={handlePaste}
      onClose={onClose}
      optionsContent={anovaReport ? <AssumptionCopilot report={anovaReport} /> : undefined}
      helpContent={
        <div>
          <p><b>One-Way ANOVA</b> tests whether there are statistically significant differences between the means of three or more independent groups.</p>
        </div>
      }
    />
  );
};

// 6. CORRELATIONS DIALOG
export const CorrelationsDialog: React.FC<DialogProps> = ({ dataset, onAddOutput, onPasteSyntax, onClose, onViewOutputs }) => {
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    { id: 'vars', title: 'Variables', isMulti: true, selectedVarNames: [] }
  ]);
  const [method, setMethod] = useState<'pearson' | 'spearman'>('pearson');

  const vars = targetGroups[0].selectedVarNames;
  const syntax = `CORRELATIONS\n  /VARIABLES=${vars.join(' ')}\n  /PRINT=TWOTAIL NOSIG.`;

  const handleOk = () => {
    if (vars.length < 2) return;
    const out = runCorrelations(dataset, vars, method);
    onAddOutput(out);
    onClose();
    onViewOutputs();
  };

  const handlePaste = () => {
    onPasteSyntax(syntax);
    onClose();
  };

  const corrReport = useMemo(() => {
    if (vars.length >= 2) return checkCorrelationAssumptions(dataset, vars);
    return null;
  }, [dataset, vars]);

  return (
    <SpssDialogModal
      title="Bivariate Correlations"
      subtitle="Symmetric correlation coefficients matrix with two-tailed significance flags"
      icon={<Activity size={16} />}
      dataset={dataset}
      targetGroups={targetGroups}
      onTargetGroupsChange={setTargetGroups}
      onOk={handleOk}
      onPaste={handlePaste}
      onClose={onClose}
      optionsContent={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="radio" checked={method === 'pearson'} onChange={() => setMethod('pearson')} />
              <span>Pearson (Parametric Linear)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="radio" checked={method === 'spearman'} onChange={() => setMethod('spearman')} />
              <span>Spearman (Non-Parametric Rank)</span>
            </label>
          </div>
          {corrReport && <AssumptionCopilot report={corrReport} />}
        </div>
      }
      helpContent={
        <div>
          <p><b>Bivariate Correlations</b> computes pairwise Pearson or Spearman correlation coefficients with two-tailed significance levels and asterisk flags (* p &lt; .05, ** p &lt; .01).</p>
        </div>
      }
    />
  );
};

// 7. LINEAR REGRESSION DIALOG
export const LinearRegressionDialog: React.FC<DialogProps> = ({ dataset, onAddOutput, onPasteSyntax, onClose, onViewOutputs }) => {
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    { id: 'dep', title: 'Dependent', isMulti: false, selectedVarNames: [] },
    { id: 'indep', title: 'Independent(s)', isMulti: true, selectedVarNames: [] }
  ]);

  const depVar = targetGroups[0].selectedVarNames[0];
  const indepVars = targetGroups[1].selectedVarNames;
  const syntax = `REGRESSION\n  /DEPENDENT ${depVar || 'dep'}\n  /METHOD=ENTER ${indepVars.join(' ')}.`;

  const handleOk = () => {
    if (!depVar || indepVars.length === 0) return;
    const out = runLinearRegression(dataset, depVar, indepVars);
    onAddOutput(out);
    onClose();
    onViewOutputs();
  };

  const handlePaste = () => {
    onPasteSyntax(syntax);
    onClose();
  };

  const regrReport = useMemo(() => {
    if (depVar && indepVars.length > 0) return checkRegressionAssumptions(dataset, depVar, indepVars);
    return null;
  }, [dataset, depVar, indepVars]);

  return (
    <SpssDialogModal
      title="Multiple Linear Regression"
      subtitle="Fit predictive linear model (R², ANOVA F-test, Beta coefficients & 95% CIs)"
      icon={<LineChart size={16} />}
      dataset={dataset}
      targetGroups={targetGroups}
      onTargetGroupsChange={setTargetGroups}
      onOk={handleOk}
      onPaste={handlePaste}
      onClose={onClose}
      optionsContent={regrReport ? <AssumptionCopilot report={regrReport} /> : undefined}
      helpContent={
        <div>
          <p><b>Linear Regression</b> estimates the coefficients of a linear equation involving one or more independent variables that best predict the value of the dependent variable.</p>
          <p>Outputs Model Summary (R, R², Adjusted R²), ANOVA table, and Coefficients table with standard errors and 95% Confidence Intervals.</p>
        </div>
      }
    />
  );
};

// 8. FACTOR ANALYSIS DIALOG
export const FactorAnalysisDialog: React.FC<DialogProps> = ({ dataset, onAddOutput, onPasteSyntax, onClose, onViewOutputs }) => {
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    { id: 'vars', title: 'Variables', isMulti: true, selectedVarNames: [] }
  ]);

  const vars = targetGroups[0].selectedVarNames;
  const syntax = `FACTOR\n  /VARIABLES ${vars.join(' ')}\n  /EXTRACTION PC\n  /PRINT INITIAL EXTRACTION\n  /PLOT EIGEN.`;

  const handleOk = () => {
    if (vars.length < 2) return;
    const out = runFactorAnalysis(dataset, vars);
    onAddOutput(out);
    onClose();
    onViewOutputs();
  };

  const handlePaste = () => {
    onPasteSyntax(syntax);
    onClose();
  };

  return (
    <SpssDialogModal
      title="Factor Analysis (PCA)"
      subtitle="Dimensionality reduction, KMO / Bartlett test, Eigenvalues & Scree Plot"
      icon={<Layers size={16} />}
      dataset={dataset}
      targetGroups={targetGroups}
      onTargetGroupsChange={setTargetGroups}
      onOk={handleOk}
      onPaste={handlePaste}
      onClose={onClose}
      helpContent={
        <div>
          <p><b>Factor Analysis (PCA)</b> reduces data dimensionality by finding linear combinations of variables that account for maximum variance. Includes Total Variance Explained and Scree Plot.</p>
        </div>
      }
    />
  );
};

// 9. RELIABILITY DIALOG
export const ReliabilityDialog: React.FC<DialogProps> = ({ dataset, onAddOutput, onPasteSyntax, onClose, onViewOutputs }) => {
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    { id: 'vars', title: 'Items', isMulti: true, selectedVarNames: [] }
  ]);

  const vars = targetGroups[0].selectedVarNames;
  const syntax = `RELIABILITY\n  /VARIABLES=${vars.join(' ')}\n  /SCALE('ALL VARIABLES') ALL\n  /MODEL=ALPHA\n  /SUMMARY=TOTAL.`;

  const handleOk = () => {
    if (vars.length < 2) return;
    const out = runReliability(dataset, vars);
    onAddOutput(out);
    onClose();
    onViewOutputs();
  };

  const handlePaste = () => {
    onPasteSyntax(syntax);
    onClose();
  };

  return (
    <SpssDialogModal
      title="Reliability Analysis"
      subtitle="Scale internal consistency metrics and Cronbach's Alpha α calculation"
      icon={<CheckCircle2 size={16} />}
      dataset={dataset}
      targetGroups={targetGroups}
      onTargetGroupsChange={setTargetGroups}
      onOk={handleOk}
      onPaste={handlePaste}
      onClose={onClose}
      helpContent={
        <div>
          <p><b>Reliability Analysis</b> calculates Cronbach's Alpha α and Item-Total statistics to evaluate questionnaire and survey scale internal consistency.</p>
        </div>
      }
    />
  );
};

// 10. K-MEANS CLUSTER DIALOG
export const KMeansClusterDialog: React.FC<DialogProps> = ({ dataset, onAddOutput, onPasteSyntax, onClose, onViewOutputs }) => {
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([
    { id: 'vars', title: 'Variables', isMulti: true, selectedVarNames: [] }
  ]);
  const [kClusters, setKClusters] = useState<number>(3);

  const vars = targetGroups[0].selectedVarNames;
  const syntax = `QUICK CLUSTER ${vars.join(' ')}\n  /CRITERIA=CLUSTERS(${kClusters})\n  /PRINT=INITIAL FINAL.`;

  const handleOk = () => {
    if (vars.length === 0) return;
    const out = runKMeansCluster(dataset, vars, kClusters);
    onAddOutput(out);
    onClose();
    onViewOutputs();
  };

  const handlePaste = () => {
    onPasteSyntax(syntax);
    onClose();
  };

  return (
    <SpssDialogModal
      title="K-Means Cluster"
      subtitle="Partition observations into k clusters based on Euclidean centroid distances"
      icon={<Boxes size={16} />}
      dataset={dataset}
      targetGroups={targetGroups}
      onTargetGroupsChange={setTargetGroups}
      onOk={handleOk}
      onPaste={handlePaste}
      onClose={onClose}
      optionsContent={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
          <label><b>Number of Clusters (k):</b></label>
          <input
            type="number"
            className="val-label-input"
            min={2}
            max={10}
            value={kClusters}
            onChange={e => setKClusters(Math.max(2, Number(e.target.value)))}
            style={{ width: '60px', textAlign: 'center' }}
          />
        </div>
      }
      helpContent={
        <div>
          <p><b>K-Means Cluster</b> partitions cases into K non-overlapping clusters based on Euclidean distance across chosen variables.</p>
        </div>
      }
    />
  );
};

// 11. COMPUTE VARIABLE DIALOG — with Live Formula Preview
export const ComputeVariableDialog: React.FC<{
  dataset: Dataset;
  onCompute: (targetVar: string, expression: string) => void;
  onClose: () => void;
}> = ({ dataset, onCompute, onClose }) => {
  const [targetVar, setTargetVar] = useState<string>('');
  const [expression, setExpression] = useState<string>('');
  const [previewError, setPreviewError] = useState<string | null>(null);

  const FUNCTIONS = [
    { label: 'LN(x)', insert: 'LN(', help: 'Natural logarithm' },
    { label: 'LOG10(x)', insert: 'LOG10(', help: 'Base-10 logarithm' },
    { label: 'EXP(x)', insert: 'EXP(', help: 'e raised to x' },
    { label: 'SQRT(x)', insert: 'SQRT(', help: 'Square root' },
    { label: 'ABS(x)', insert: 'ABS(', help: 'Absolute value' },
    { label: 'ROUND(x)', insert: 'ROUND(', help: 'Round to integer' },
    { label: 'TRUNC(x)', insert: 'TRUNC(', help: 'Truncate decimals' },
    { label: 'ZSCORE(x)', insert: 'ZSCORE(', help: 'Standardize to Z-score' },
    { label: 'MEAN(x,y)', insert: 'MEAN(', help: 'Row mean across columns' },
    { label: 'SUM(x,y)', insert: 'SUM(', help: 'Row sum across columns' },
    { label: 'MAX(x,y)', insert: 'MAX(', help: 'Maximum of values' },
    { label: 'MIN(x,y)', insert: 'MIN(', help: 'Minimum of values' },
  ];

  const handleInsertVar = (varName: string) => {
    setExpression(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + varName + ' ');
  };

  const handleInsertFn = (fn: string) => {
    setExpression(prev => prev + fn);
  };

  // ── Live Formula Preview ──────────────────────────────────────────────────
  const previewRows = useMemo(() => {
    if (!expression.trim() || dataset.data.length === 0) return [];
    const varNames = dataset.variables.map(v => v.name);
    const previewData = dataset.data.slice(0, 5);

    // Pre-compute global stats for ZSCORE function
    const colStats: Record<string, { mean: number; std: number }> = {};
    varNames.forEach(name => {
      const nums = dataset.data.map(r => r[name]).filter(v => v !== null && !isNaN(Number(v))).map(Number);
      if (nums.length > 0) {
        const m = nums.reduce((a, b) => a + b, 0) / nums.length;
        const s = Math.sqrt(nums.reduce((a, b) => a + Math.pow(b - m, 2), 0) / Math.max(1, nums.length - 1));
        colStats[name] = { mean: m, std: s };
      }
    });

    try {
      return previewData.map((row, i) => {
        // Build a safe eval scope
        let expr = expression
          .replace(/\bLN\s*\(/g, 'Math.log(')
          .replace(/\bLOG10\s*\(/g, 'Math.log10(')
          .replace(/\bEXP\s*\(/g, 'Math.exp(')
          .replace(/\bSQRT\s*\(/g, 'Math.sqrt(')
          .replace(/\bABS\s*\(/g, 'Math.abs(')
          .replace(/\bROUND\s*\(/g, 'Math.round(')
          .replace(/\bTRUNC\s*\(/g, 'Math.trunc(')
          .replace(/\bMAX\s*\(/g, 'Math.max(')
          .replace(/\bMIN\s*\(/g, 'Math.min(');

        // ZSCORE(varName) replacement
        expr = expr.replace(/ZSCORE\s*\(([^)]+)\)/g, (_match, vn) => {
          const v = vn.trim();
          const stats = colStats[v];
          if (!stats || stats.std === 0) return '0';
          return `((${row[v] ?? 0} - ${stats.mean}) / ${stats.std})`;
        });

        // MEAN and SUM
        expr = expr.replace(/\bMEAN\s*\(/g, '((...args) => args.filter(x=>x!=null).reduce((a,b)=>a+b,0)/Math.max(args.filter(x=>x!=null).length,1))(');
        expr = expr.replace(/\bSUM\s*\(/g, '((...args) => args.filter(x=>x!=null).reduce((a,b)=>a+b,0))(');

        // Replace variable names with their row values
        varNames.forEach(name => {
          expr = expr.replace(new RegExp(`\\b${name}\\b`, 'g'), String(row[name] ?? 0));
        });

        // eslint-disable-next-line no-new-func
        const result = new Function(`return (${expr})`)();
        setPreviewError(null);
        return { row: i + 1, result: typeof result === 'number' ? (isFinite(result) ? Number(result.toFixed(4)) : 'Infinity') : result };
      });
    } catch (e: any) {
      setPreviewError(`Expression error: ${e.message}`);
      return [];
    }
  }, [expression, dataset]);

  const handleExecute = () => {
    if (!targetVar.trim() || !expression.trim() || previewError) return;
    onCompute(targetVar.trim(), expression.trim());
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="spss-dialog modern-modal" style={{ width: '680px' }}>
        
        {/* Header */}
        <div className="dialog-header modern-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-icon-badge">
              <Calculator size={15} />
            </div>
            <div>
              <div className="dialog-title">Smart Compute Variable</div>
              <div className="dialog-subtitle">Formula bar with live row-by-row preview before applying to dataset</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close (Esc)"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="dialog-body modern-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Target Var */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="val-label-field-title" style={{ margin: 0, flexShrink: 0 }}>Target Variable:</label>
            <input
              type="text"
              className="val-label-input"
              placeholder="new_var_name"
              value={targetVar}
              onChange={e => setTargetVar(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>= </span>
            <input
              type="text"
              className="val-label-input"
              placeholder="e.g. salary - salbegin"
              value={expression}
              onChange={e => setExpression(e.target.value)}
              style={{ flex: 2, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', borderColor: previewError ? '#ef4444' : undefined }}
            />
          </div>

          {/* Error Banner */}
          {previewError && (
            <div style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', fontSize: '0.74rem', color: '#ef4444' }}>
              ⚠ {previewError}
            </div>
          )}

          {/* Live Preview */}
          {previewRows.length > 0 && !previewError && (
            <div style={{ background: 'var(--bg-surface-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ padding: '5px 10px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.70rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={11} /> Live Preview (first {previewRows.length} cases)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '4px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>Case #</th>
                    <th style={{ padding: '4px 10px', textAlign: 'right', color: 'var(--primary)', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>{targetVar || 'result'}</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map(p => (
                    <tr key={p.row} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '3px 10px', color: 'var(--text-muted)' }}>#{p.row}</td>
                      <td style={{ padding: '3px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>{String(p.result)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Variables + Functions Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="val-labels-box" style={{ height: '160px' }}>
              <div className="val-labels-box-header"><span>Variables — click to insert</span></div>
              <div className="val-labels-items">
                {dataset.variables.map(v => (
                  <div key={v.id} onClick={() => handleInsertVar(v.name)} className="var-item-card" style={{ padding: '4px 8px', fontSize: '0.76rem' }}>
                    <span style={{ fontWeight: 600 }}>{v.name}</span>
                    {v.label && <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginLeft: '4px' }}>[{v.label}]</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="val-labels-box" style={{ height: '160px' }}>
              <div className="val-labels-box-header"><span>Functions — click to insert</span></div>
              <div className="val-labels-items">
                {FUNCTIONS.map(fn => (
                  <div key={fn.label} onClick={() => handleInsertFn(fn.insert)} className="var-item-card" style={{ padding: '4px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--primary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{fn.label}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem', fontFamily: 'var(--font-sans)' }}>{fn.help}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="dialog-footer modern-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary modal-primary-cta"
            disabled={!targetVar.trim() || !expression.trim() || !!previewError}
            onClick={handleExecute}
          >
            <Calculator size={13} /> Apply to Dataset ({dataset.data.length} cases)
          </button>
        </div>

      </div>
    </div>
  );
};

// 12. ABOUT MODAL
export const AboutModal: React.FC<{
  onClose: () => void;
  onOpenFeatures?: () => void;
  onOpenChangelog?: () => void;
  onOpenTerms?: (tab?: 'terms' | 'privacy' | 'license' | 'ethics') => void;
}> = ({ onClose, onOpenFeatures, onOpenChangelog, onOpenTerms }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'legal' | 'specs'>('about');

  return (
    <div className="dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="spss-dialog modern-modal" style={{ width: '620px', maxWidth: '95vw' }}>
        
        {/* Header */}
        <div className="dialog-header modern-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: '26px', height: '26px', objectFit: 'contain' }}
            />
            <div>
              <div className="dialog-title">About Open SPSS Web</div>
              <div className="dialog-subtitle">Hobby project by JaNuK • For educational purposes</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close (Esc)"><X size={16} /></button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', padding: '0 18px', borderBottom: '1px solid var(--border-color)', gap: '8px', background: 'var(--bg-surface)' }}>
          <button
            onClick={() => setActiveTab('about')}
            style={{
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'about' ? 700 : 500,
              color: activeTab === 'about' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'about' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            Overview & Features
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            style={{
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'legal' ? 700 : 500,
              color: activeTab === 'legal' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'legal' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <ShieldCheck size={13} style={{ color: '#10b981' }} />
            Legal & Trademark Disclaimer
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            style={{
              padding: '8px 14px',
              fontSize: '0.78rem',
              fontWeight: activeTab === 'specs' ? 700 : 500,
              color: activeTab === 'specs' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'specs' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            System Specs & Engine
          </button>
        </div>

        {/* Body */}
        <div className="dialog-body modern-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
          
          {activeTab === 'about' && (
            <>
              {/* Main Hero Card with Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--bg-surface)', padding: '6px', border: '1.5px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                  <img
                    src="/logo.png"
                    alt="Open SPSS Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Open SPSS Web</span>
                    <span style={{ fontSize: '0.70rem', padding: '2px 8px', borderRadius: '10px', background: 'var(--primary)', color: 'white', fontWeight: 700 }}>v1.0 Clean-Room</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    An independent, high-performance browser statistical suite and exploratory data platform.
                  </div>
                </div>
              </div>

              {/* Educational Purpose & Developer Credit Card */}
              <div style={{ padding: '12px 16px', background: 'var(--primary-light)', borderRadius: '10px', border: '1px solid var(--primary-glow)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    🎓 Hobby project by <span style={{ color: 'var(--primary)' }}>JaNuK</span>
                  </div>
                  <span style={{ fontSize: '0.70rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                    For Educational Purposes
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Created as a personal educational hobby project to demonstrate full-scale statistical computing, matrix decomposition, and data visualization entirely within modern web browsers without server installation or software licensing barriers.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Developed by:</span>
                  <a
                    href="https://github.com/lordskidgod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.74rem', gap: '5px', textDecoration: 'none' }}
                  >
                    <span>⭐ GitHub: <b>@lordskidgod</b></span>
                  </a>
                </div>
              </div>

              {/* What makes it superior to traditional legacy tools */}
              <div style={{ padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🚀 Why Open SPSS Web is Better
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  <div>⚡ <b>Instant Zero-Install:</b> Loads in &lt;100ms on any device without JVM or licensing overhead.</div>
                  <div>🔒 <b>100% In-Memory Privacy:</b> Data never leaves your browser; zero tracking, zero cloud telemetry.</div>
                  <div>🐍 <b>Tri-Lingual Code:</b> Auto-generates SPSS Syntax, Python (pandas/scipy), and R code simultaneously.</div>
                  <div>📊 <b>APA 7th Precision:</b> Publication-grade tables ready for 1-click Word, Excel, and HTML export.</div>
                </div>
              </div>

              {/* Quick Links to Features & Changelog */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => { onClose(); onOpenFeatures?.(); }}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                  <span>View All Features Matrix</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => { onClose(); onOpenChangelog?.(); }}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <History size={14} style={{ color: 'var(--primary)' }} />
                  <span>Release Changelog</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'legal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <ShieldCheck size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <b>Independent Clean-Room Implementation & Trademark Notice</b>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                    This software is an original, independent educational creation by JaNuK (@lordskidgod). It is not affiliated with, authorized by, sponsored by, or connected with IBM Corporation.
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0 }}>
                  <b>1. Trademark Disclaimer:</b> IBM® and SPSS® are registered trademarks of International Business Machines Corporation (IBM). Reference to these names or statistical syntax conventions is made solely under <i>Nominative Fair Use</i> for educational description, academic learning, and script interoperability.
                </p>
                <p style={{ margin: 0 }}>
                  <b>2. Clean-Room Mathematics:</b> All numerical routines (Student's t-test, Levene's test, Pearson Chi-Square, OLS Multiple Regression, Varimax Factor Rotation, Cronbach's Alpha, K-Means clustering) were independently derived from publicly available academic literature and standard mathematical algorithms (IEEE 754 standard).
                </p>
                <p style={{ margin: 0 }}>
                  <b>3. Non-Commercial Educational License:</b> Open SPSS Web is distributed purely as a personal educational project for students, educators, and researchers worldwide. No proprietary binary code, assets, or software libraries from IBM or SPSS Inc. are utilized.
                </p>
              </div>

              <div style={{ marginTop: '6px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => { onClose(); onOpenTerms?.('terms'); }}
                  style={{ width: '100%', padding: '8px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px' }}
                >
                  <FileText size={14} />
                  <span>View Full Terms of Service, Privacy Policy & Data License</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="about-stat-card">
                  <div className="about-stat-label">STATISTICAL ENGINE</div>
                  <div className="about-stat-val">Client-Side WASM / JS</div>
                </div>
                <div className="about-stat-card">
                  <div className="about-stat-label">NUMERICAL ACCURACY</div>
                  <div className="about-stat-val">64-bit IEEE 754</div>
                </div>
                <div className="about-stat-card">
                  <div className="about-stat-label">APA COMPLIANCE</div>
                  <div className="about-stat-val">7th Edition Tables</div>
                </div>
                <div className="about-stat-card">
                  <div className="about-stat-label">STORAGE & PRIVACY</div>
                  <div className="about-stat-val">100% Local / In-Memory</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Quick Keyboard Shortcuts
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div><kbd className="syntax-kbd">Ctrl+O</kbd> Open / Import CSV</div>
                  <div><kbd className="syntax-kbd">Ctrl+S</kbd> Save Project Bundle</div>
                  <div><kbd className="syntax-kbd">Ctrl+Enter</kbd> Run Syntax / OK</div>
                  <div><kbd className="syntax-kbd">Esc</kbd> Close Active Dialog</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="dialog-footer modern-modal-footer" style={{ justifyContent: 'space-between' }}>
          <a
            href="https://github.com/lordskidgod"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            github.com/lordskidgod
          </a>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

