import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  Code2,
  Terminal,
  Sparkles,
  BookOpen,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Layers,
  FileCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Dataset, OutputItem } from '../types';
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
} from '../engine/statisticalEngine';

interface SyntaxEditorProps {
  syntaxCode: string;
  setSyntaxCode: (code: string) => void;
  dataset: Dataset;
  onAddOutput: (item: OutputItem) => void;
  onViewOutputs: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  detail?: string;
}

// ─── Syntax Templates ─────────────────────────────────────────────────────────

interface SyntaxSnippet {
  id: string;
  name: string;
  category: string;
  code: string;
  description: string;
}

const SNIPPETS: SyntaxSnippet[] = [
  {
    id: 'freq',
    name: 'Frequencies & Bar Chart',
    category: 'Descriptives',
    code: `* Frequencies Procedure.
FREQUENCIES VARIABLES=educ jobcat
  /STATISTICS=STDDEV MEAN MINIMUM MAXIMUM
  /BARCHART.`,
    description: 'Calculate frequency distributions, percentages, and generate bar charts for categorical/ordinal variables.'
  },
  {
    id: 'desc',
    name: 'Descriptive Statistics',
    category: 'Descriptives',
    code: `* Descriptive Statistics.
DESCRIPTIVES VARIABLES=salary salbegin jobtime
  /STATISTICS=MEAN STDDEV VARIANCE MIN MAX SEMEAN.`,
    description: 'Compute central tendency, dispersion, and standard error of mean for scale variables.'
  },
  {
    id: 'crosstabs',
    name: 'Crosstabs & Chi-Square',
    category: 'Descriptives',
    code: `* Contingency Table & Chi-Square.
CROSSTABS
  /TABLES=jobcat BY gender
  /STATISTICS=CHISQ.`,
    description: 'Examine bivariate relationship and calculate Chi-Square independence test.'
  },
  {
    id: 'ttest',
    name: 'Independent-Samples T-Test',
    category: 'Compare Means',
    code: `* Independent-Samples T-Test.
T-TEST GROUPS=gender(0 1)
  /VARIABLES=salary
  /CRITERIA=CI(.95).`,
    description: 'Compare means between two independent groups (e.g. Male vs Female) with Levene’s test.'
  },
  {
    id: 'oneway',
    name: 'One-Way ANOVA',
    category: 'Compare Means',
    code: `* One-Way Analysis of Variance.
ONEWAY salary BY jobcat
  /STATISTICS DESCRIPTIVES
  /PLOT MEANS.`,
    description: 'Compare means across 3+ categorical factor levels with F-statistic and means plot.'
  },
  {
    id: 'corr',
    name: 'Bivariate Correlations',
    category: 'Correlation',
    code: `* Pearson Bivariate Correlation Matrix.
CORRELATIONS
  /VARIABLES=salary salbegin educ jobtime
  /PRINT=TWOTAIL.`,
    description: 'Produce symmetric correlation matrix with 2-tailed significance flags.'
  },
  {
    id: 'regr',
    name: 'Multiple Linear Regression',
    category: 'Regression',
    code: `* Multiple Linear Regression.
REGRESSION
  /DEPENDENT salary
  /METHOD=ENTER salbegin educ jobtime.`,
    description: 'Fit linear model with R², ANOVA F-test, and standardized beta coefficients.'
  },
  {
    id: 'factor',
    name: 'Factor Analysis (PCA)',
    category: 'Advanced',
    code: `* Principal Component Analysis (PCA).
FACTOR
  /VARIABLES educ salbegin salary jobtime
  /EXTRACTION PC
  /ROTATION VARIMAX
  /PLOT EIGEN.`,
    description: 'Extract principal components, calculate KMO/Bartlett test, and produce scree plot.'
  },
  {
    id: 'rel',
    name: "Reliability Analysis (Cronbach's α)",
    category: 'Advanced',
    code: `* Scale Reliability Analysis.
RELIABILITY
  /VARIABLES=salary salbegin jobtime
  /SCALE('ALL VARIABLES') ALL
  /MODEL=ALPHA.`,
    description: 'Assess internal consistency of scale items via Cronbach’s alpha and item-total metrics.'
  },
  {
    id: 'cluster',
    name: 'K-Means Cluster',
    category: 'Advanced',
    code: `* K-Means Quick Cluster Analysis.
QUICK CLUSTER salary salbegin educ
  /CRITERIA=CLUSTERS(3)
  /PRINT=INITIAL FINAL.`,
    description: 'Classify observations into k clusters based on Euclidean distance centroids.'
  }
];

// ─── Syntax Highlighter Tokenizer ─────────────────────────────────────────────

function highlightSPSSCode(code: string): string {
  if (!code) return '';

  const lines = code.split('\n');
  const highlightedLines = lines.map(line => {
    // Comment line starting with *
    if (/^\s*\*/.test(line)) {
      return `<span class="spss-tok-comment">${escapeHtml(line)}</span>`;
    }

    let processed = escapeHtml(line);

    // SPSS main commands
    processed = processed.replace(
      /\b(FREQUENCIES|DESCRIPTIVES|CROSSTABS|T-TEST|ONEWAY|REGRESSION|CORRELATIONS|FACTOR|RELIABILITY|QUICK CLUSTER|COMPUTE|RECODE|FILTER|SORT CASES|SPLIT FILE|WEIGHT)\b/gi,
      '<span class="spss-tok-command">$1</span>'
    );

    // Subcommands starting with /
    processed = processed.replace(
      /(\/[A-Za-z0-9_]+)/g,
      '<span class="spss-tok-subcommand">$1</span>'
    );

    // Keywords and clauses
    processed = processed.replace(
      /\b(VARIABLES|STATISTICS|BARCHART|HISTOGRAM|GROUPS|CRITERIA|DEPENDENT|METHOD|ENTER|BY|WITH|TO|ALL|SCALE|MODEL|ALPHA|PC|VARIMAX|CHISQ|STDDEV|MEAN|MINIMUM|MAXIMUM|SEMEAN|VARIANCE|MIN|MAX|CI|INITIAL|FINAL|PRINT|PLOT|EIGEN|TABLES|CELLS)\b/g,
      '<span class="spss-tok-keyword">$1</span>'
    );

    // String literals
    processed = processed.replace(
      /(['"][^'"]*['"])/g,
      '<span class="spss-tok-string">$1</span>'
    );

    // Numbers
    processed = processed.replace(
      /\b(\d+(\.\d+)?)\b/g,
      '<span class="spss-tok-number">$1</span>'
    );

    // Terminating period
    processed = processed.replace(
      /(\.)(?=(\s*$))/g,
      '<span class="spss-tok-dot">$1</span>'
    );

    return processed;
  });

  return highlightedLines.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SyntaxEditor: React.FC<SyntaxEditorProps> = ({
  syntaxCode,
  setSyntaxCode,
  dataset,
  onAddOutput,
  onViewOutputs
}) => {
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'SPSS Batch Syntax Processor ready.',
      detail: `Connected to dataset: ${dataset.name} (${dataset.data.length} cases, ${dataset.variables.length} variables)`
    }
  ]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Sync scroll between textarea, highlighter pre, and line numbers gutter
  const handleScroll = () => {
    if (!textareaRef.current) return;
    const top = textareaRef.current.scrollTop;
    const left = textareaRef.current.scrollLeft;

    if (highlightRef.current) {
      highlightRef.current.scrollTop = top;
      highlightRef.current.scrollLeft = left;
    }
    if (lineGutterRef.current) {
      lineGutterRef.current.scrollTop = top;
    }
  };

  const linesCount = Math.max(1, syntaxCode.split('\n').length);

  // Handle Tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;

      const nextVal = val.substring(0, start) + '  ' + val.substring(end);
      setSyntaxCode(nextVal);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunSyntax();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(syntaxCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([syntaxCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name.replace(/\s+/g, '_')}_Syntax.sps`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFormat = () => {
    // Beautify syntax: upper case keywords, normalize indenting for subcommands
    const lines = syntaxCode.split('\n');
    const formatted = lines.map(line => {
      let l = line.trimEnd();
      if (/^\s*\*/.test(l)) return l; // preserve comments

      // If line starts with subcommand / indent by 2 spaces
      if (/^\s*\//.test(l)) {
        l = '  ' + l.trimStart();
      }

      // Uppercase SPSS commands
      l = l.replace(
        /\b(frequencies|descriptives|crosstabs|t-test|oneway|regression|correlations|factor|reliability|quick cluster|compute|variables|statistics|barchart|histogram|groups|criteria|dependent|method|enter|by|with|to|all|scale|model|alpha|pc|varimax|chisq|stddev|mean|minimum|maximum|semean|variance|min|max|ci|initial|final|print|plot|eigen|tables|cells)\b/gi,
        match => match.toUpperCase()
      );
      return l;
    });

    setSyntaxCode(formatted.join('\n'));
    addLog('info', 'Formatted and standardized SPSS syntax script.');
  };

  const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string, detail?: string) => {
    const entry: LogEntry = {
      id: 'log_' + Date.now() + '_' + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      detail
    };
    setLogs(prev => [...prev, entry]);
    setTimeout(() => consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const insertSnippet = (snippet: SyntaxSnippet) => {
    const ta = textareaRef.current;
    if (!ta) {
      setSyntaxCode(syntaxCode ? syntaxCode + '\n\n' + snippet.code : snippet.code);
      addLog('info', `Inserted template: ${snippet.name}`);
      return;
    }

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = syntaxCode.substring(0, start);
    const after = syntaxCode.substring(end);
    const separator = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';

    const newCode = before + separator + snippet.code + (after ? '\n\n' + after : '');
    setSyntaxCode(newCode);
    addLog('info', `Inserted template: ${snippet.name}`);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  // ─── Syntax Execution Engine ───────────────────────────────────────────────

  const handleRunSyntax = () => {
    if (!syntaxCode.trim()) {
      addLog('warning', 'Syntax editor is empty. Enter SPSS commands or insert a template to run.');
      return;
    }

    setIsRunning(true);
    addLog('info', `Running batch syntax against '${dataset.name}' (${dataset.data.length} cases)...`);

    // Split into SPSS command blocks terminated with a period (.)
    const rawCommands = syntaxCode
      .split(/\.\s*(\r?\n|$)/)
      .map(c => c.trim())
      .filter(c => c.length > 0 && !c.startsWith('*'));

    if (rawCommands.length === 0) {
      addLog('warning', 'No executable commands found. SPSS commands must terminate with a period (.).');
      setIsRunning(false);
      return;
    }

    let executedCount = 0;

    try {
      for (const cmd of rawCommands) {
        const upper = cmd.toUpperCase();

        if (upper.startsWith('FREQUENCIES')) {
          const match = cmd.match(/VARIABLES=([a-zA-Z0-9_\s]+)/i);
          if (match) {
            const vars = match[1].trim().split(/\s+/).filter(v => dataset.variables.some(dv => dv.name.toLowerCase() === v.toLowerCase()));
            if (vars.length > 0) {
              const out = runFrequencies(dataset, vars);
              onAddOutput(out);
              executedCount++;
              addLog('success', `FREQUENCIES: Generated tables for ${vars.join(', ')}.`);
            } else {
              addLog('warning', `FREQUENCIES: None of the specified variables exist in dataset.`);
            }
          }
        } else if (upper.startsWith('DESCRIPTIVES')) {
          const match = cmd.match(/VARIABLES=([a-zA-Z0-9_\s]+)/i);
          if (match) {
            const vars = match[1].trim().split(/\s+/).filter(v => dataset.variables.some(dv => dv.name.toLowerCase() === v.toLowerCase()));
            if (vars.length > 0) {
              const out = runDescriptives(dataset, vars);
              onAddOutput(out);
              executedCount++;
              addLog('success', `DESCRIPTIVES: Generated summary for ${vars.join(', ')}.`);
            } else {
              addLog('warning', `DESCRIPTIVES: None of the specified variables exist in dataset.`);
            }
          }
        } else if (upper.startsWith('CROSSTABS')) {
          const match = cmd.match(/TABLES=([a-zA-Z0-9_]+)\s+BY\s+([a-zA-Z0-9_]+)/i);
          if (match) {
            const rowVar = match[1];
            const colVar = match[2];
            const rExists = dataset.variables.some(v => v.name.toLowerCase() === rowVar.toLowerCase());
            const cExists = dataset.variables.some(v => v.name.toLowerCase() === colVar.toLowerCase());
            if (rExists && cExists) {
              const out = runCrosstabs(dataset, rowVar, colVar);
              onAddOutput(out);
              executedCount++;
              addLog('success', `CROSSTABS: Generated crosstabulation ${rowVar} × ${colVar}.`);
            } else {
              addLog('warning', `CROSSTABS: Variables '${rowVar}' or '${colVar}' not found in dataset.`);
            }
          }
        } else if (upper.startsWith('T-TEST')) {
          const groupMatch = cmd.match(/GROUPS=([a-zA-Z0-9_]+)\(([^)]+)\)/i);
          const varMatch = cmd.match(/VARIABLES=([a-zA-Z0-9_\s]+)/i);
          if (groupMatch && varMatch) {
            const groupVar = groupMatch[1];
            const [val1, val2] = groupMatch[2].trim().split(/\s+/);
            const vars = varMatch[1].trim().split(/\s+/).filter(v => dataset.variables.some(dv => dv.name.toLowerCase() === v.toLowerCase()));
            if (vars.length > 0) {
              const out = runIndependentTTest(dataset, vars, groupVar, val1, val2);
              onAddOutput(out);
              executedCount++;
              addLog('success', `T-TEST: Independent-samples test for ${vars.join(', ')} grouped by ${groupVar}.`);
            }
          }
        } else if (upper.startsWith('ONEWAY')) {
          const match = cmd.match(/ONEWAY\s+([a-zA-Z0-9_]+)\s+BY\s+([a-zA-Z0-9_]+)/i);
          if (match) {
            const dep = match[1];
            const fact = match[2];
            const out = runOneWayAnova(dataset, dep, fact);
            onAddOutput(out);
            executedCount++;
            addLog('success', `ONEWAY ANOVA: Analyzed '${dep}' across factor '${fact}'.`);
          }
        } else if (upper.startsWith('CORRELATIONS')) {
          const match = cmd.match(/VARIABLES=([a-zA-Z0-9_\s]+)/i);
          if (match) {
            const vars = match[1].trim().split(/\s+/).filter(v => dataset.variables.some(dv => dv.name.toLowerCase() === v.toLowerCase()));
            if (vars.length > 0) {
              const out = runCorrelations(dataset, vars);
              onAddOutput(out);
              executedCount++;
              addLog('success', `CORRELATIONS: Computed Pearson correlation matrix (${vars.length} variables).`);
            }
          }
        } else if (upper.startsWith('REGRESSION')) {
          const depMatch = cmd.match(/DEPENDENT\s+([a-zA-Z0-9_]+)/i);
          const indepMatch = cmd.match(/METHOD=ENTER\s+([a-zA-Z0-9_\s]+)/i);
          if (depMatch && indepMatch) {
            const dep = depMatch[1];
            const indeps = indepMatch[1].trim().split(/\s+/).filter(v => dataset.variables.some(dv => dv.name.toLowerCase() === v.toLowerCase()));
            if (indeps.length > 0) {
              const out = runLinearRegression(dataset, dep, indeps);
              onAddOutput(out);
              executedCount++;
              addLog('success', `REGRESSION: Linear regression model with dependent '${dep}' and ${indeps.length} predictors.`);
            }
          }
        } else if (upper.startsWith('FACTOR')) {
          const match = cmd.match(/VARIABLES\s+([a-zA-Z0-9_\s]+)/i);
          if (match) {
            const vars = match[1].trim().split(/\s+/).filter(v => dataset.variables.some(dv => dv.name.toLowerCase() === v.toLowerCase()));
            if (vars.length > 0) {
              const out = runFactorAnalysis(dataset, vars);
              onAddOutput(out);
              executedCount++;
              addLog('success', `FACTOR: Principal component analysis on ${vars.length} variables.`);
            }
          }
        } else if (upper.startsWith('RELIABILITY')) {
          const match = cmd.match(/VARIABLES=([a-zA-Z0-9_\s]+)/i);
          if (match) {
            const vars = match[1].trim().split(/\s+/).filter(v => dataset.variables.some(dv => dv.name.toLowerCase() === v.toLowerCase()));
            if (vars.length > 0) {
              const out = runReliability(dataset, vars);
              onAddOutput(out);
              executedCount++;
              addLog('success', `RELIABILITY: Cronbach's alpha calculated for ${vars.length} scale items.`);
            }
          }
        } else if (upper.startsWith('QUICK CLUSTER')) {
          const match = cmd.match(/QUICK CLUSTER\s+([a-zA-Z0-9_\s]+)/i);
          if (match) {
            const vars = match[1].trim().split(/\s+/).filter(v => dataset.variables.some(dv => dv.name.toLowerCase() === v.toLowerCase()));
            if (vars.length > 0) {
              const out = runKMeansCluster(dataset, vars, 3);
              onAddOutput(out);
              executedCount++;
              addLog('success', `QUICK CLUSTER: K-Means clustering completed (k=3).`);
            }
          }
        }
      }

      if (executedCount > 0) {
        addLog('success', `Batch complete: Successfully executed ${executedCount} procedure(s). New results appended to Output Viewer.`);
      } else {
        addLog('warning', 'No valid commands could be parsed. Ensure variables match dataset definitions.');
      }
    } catch (err: any) {
      addLog('error', `Execution error: ${err?.message || 'Unknown error occurred.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="syntax-ide-container">

      {/* ── IDE Top Header Bar ── */}
      <div className="syntax-ide-header">
        <div className="syntax-tab-row">
          <div className="syntax-editor-tab active">
            <FileCode size={14} className="syntax-tab-icon" />
            <span className="syntax-tab-title">Syntax1.sps</span>
            <span className="syntax-tab-dot" title="Modified / Active" />
          </div>
          <div className="syntax-editor-tab muted" onClick={() => setSyntaxCode('')} title="Open empty syntax buffer">
            <span>+ New</span>
          </div>
        </div>

        {/* Header Breadcrumbs / Dataset Context */}
        <div className="syntax-header-context">
          <span className="syntax-chip">
            <Layers size={11} /> Dataset: <b>{dataset.name}</b>
          </span>
          <span className="syntax-chip-meta">
            {dataset.data.length} cases • {dataset.variables.length} vars
          </span>
        </div>
      </div>

      {/* ── IDE Action Toolbar ── */}
      <div className="syntax-ide-toolbar">
        <div className="syntax-toolbar-group">
          <button
            id="btn-syntax-run-all"
            className="syntax-btn syntax-btn-primary"
            onClick={handleRunSyntax}
            disabled={isRunning}
            title="Execute entire syntax script (Ctrl+Enter)"
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunning ? 'Running…' : 'Run All'}</span>
            <kbd className="syntax-kbd">Ctrl+↵</kbd>
          </button>

          <button
            className="syntax-btn"
            onClick={handleFormat}
            title="Format / Beautify syntax commands"
          >
            <Sparkles size={13} style={{ color: 'var(--primary)' }} />
            <span>Format</span>
          </button>
        </div>

        <div className="syntax-toolbar-divider" />

        {/* Snippets Dropdown */}
        <div className="syntax-toolbar-group">
          <select
            className="syntax-select"
            onChange={e => {
              const snippet = SNIPPETS.find(s => s.id === e.target.value);
              if (snippet) insertSnippet(snippet);
              e.target.value = '';
            }}
            defaultValue=""
          >
            <option value="" disabled>➕ Insert Template…</option>
            <optgroup label="Descriptive Statistics">
              <option value="freq">Frequencies & Bar Chart</option>
              <option value="desc">Descriptive Statistics</option>
              <option value="crosstabs">Crosstabs & Chi-Square</option>
            </optgroup>
            <optgroup label="Compare Means">
              <option value="ttest">Independent-Samples T-Test</option>
              <option value="oneway">One-Way ANOVA</option>
            </optgroup>
            <optgroup label="Correlation & Regression">
              <option value="corr">Bivariate Correlations</option>
              <option value="regr">Multiple Linear Regression</option>
            </optgroup>
            <optgroup label="Advanced Procedures">
              <option value="factor">Factor Analysis (PCA)</option>
              <option value="rel">Reliability Analysis (Alpha)</option>
              <option value="cluster">K-Means Cluster</option>
            </optgroup>
          </select>
        </div>

        <div className="syntax-toolbar-divider" />

        <div className="syntax-toolbar-group">
          <button
            className="syntax-btn"
            onClick={handleCopy}
            title="Copy syntax to clipboard"
          >
            {copied ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            className="syntax-btn"
            onClick={handleDownload}
            title="Save script as .sps file"
          >
            <Download size={13} />
            <span>Save .sps</span>
          </button>

          <button
            className="syntax-btn"
            onClick={() => setSyntaxCode('')}
            title="Clear all syntax content"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Right tools: Snippets drawer & View Outputs button */}
        <div className="syntax-toolbar-group">
          <button
            className="syntax-btn syntax-btn-view-outputs"
            onClick={onViewOutputs}
            title="Switch to Output Viewer tab"
          >
            <ExternalLink size={12} />
            <span>View Outputs</span>
          </button>

          <button
            className={`syntax-btn${isSidebarOpen ? ' active' : ''}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Toggle SPSS Syntax Reference & Cheat-sheet"
          >
            <BookOpen size={13} />
            <span>Reference</span>
          </button>
        </div>
      </div>

      {/* ── Main Editor Work Area ── */}
      <div className="syntax-work-area">

        {/* Left / Center: Code Frame */}
        <div className="syntax-editor-canvas">
          
          {/* Line Numbers Gutter */}
          <div ref={lineGutterRef} className="syntax-gutter">
            {Array.from({ length: linesCount }, (_, i) => (
              <div key={i + 1} className="syntax-line-num">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Syntax Code Editor Layer Stack */}
          <div className="syntax-code-stack">
            {/* Background Syntax Highlight Overlay */}
            <pre
              ref={highlightRef}
              className="syntax-highlight-layer"
              aria-hidden="true"
              dangerouslySetInnerHTML={{
                __html: highlightSPSSCode(syntaxCode) + '\n'
              }}
            />

            {/* Foreground Interactive Textarea */}
            <textarea
              ref={textareaRef}
              className="syntax-textarea-layer"
              value={syntaxCode}
              onChange={e => setSyntaxCode(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              placeholder={`* Open SPSS Syntax Editor
* Type SPSS batch commands terminated with a period (.), or insert a template above.

FREQUENCIES VARIABLES=educ jobcat
  /STATISTICS=STDDEV MEAN MINIMUM MAXIMUM
  /BARCHART.`}
            />
          </div>
        </div>

        {/* Right Reference / Snippets Sidebar */}
        {isSidebarOpen && (
          <div className="syntax-reference-sidebar">
            <div className="syntax-ref-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code2 size={15} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>SPSS Syntax Library</span>
              </div>
              <button
                className="syntax-ref-close"
                onClick={() => setIsSidebarOpen(false)}
                title="Close sidebar"
              >
                ✕
              </button>
            </div>

            <div className="syntax-ref-body">
              <p className="syntax-ref-intro">
                Click any snippet to insert its standard SPSS batch commands directly into the active editor.
              </p>

              {SNIPPETS.map(snippet => (
                <div key={snippet.id} className="syntax-snippet-card">
                  <div className="syntax-snippet-top">
                    <span className="syntax-snippet-badge">{snippet.category}</span>
                    <button
                      className="syntax-snippet-insert-btn"
                      onClick={() => insertSnippet(snippet)}
                      title="Insert into editor"
                    >
                      + Insert
                    </button>
                  </div>
                  <div className="syntax-snippet-name">{snippet.name}</div>
                  <div className="syntax-snippet-desc">{snippet.description}</div>
                  <pre className="syntax-snippet-preview">{snippet.code}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Console / Execution Terminal ── */}
      <div className={`syntax-console-drawer${isConsoleOpen ? ' open' : ' collapsed'}`}>
        <div
          className="syntax-console-header"
          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={13} style={{ color: 'var(--primary)' }} />
            <span className="syntax-console-title">SPSS Execution Console</span>
            <span className="syntax-console-badge">
              {logs.length} message{logs.length === 1 ? '' : 's'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="syntax-console-clear-btn"
              onClick={e => {
                e.stopPropagation();
                setLogs([]);
              }}
              title="Clear console output"
            >
              Clear Log
            </button>
            <div className="syntax-console-toggle">
              {isConsoleOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          </div>
        </div>

        {isConsoleOpen && (
          <div className="syntax-console-body">
            {logs.length === 0 ? (
              <div className="syntax-console-empty">Console is empty. Run a syntax command to see logs.</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`syntax-log-item log-${log.type}`}>
                  <span className="syntax-log-time">[{log.timestamp}]</span>
                  {log.type === 'success' && <CheckCircle2 size={12} className="syntax-log-icon success" />}
                  {log.type === 'error' && <AlertCircle size={12} className="syntax-log-icon error" />}
                  {log.type === 'warning' && <AlertCircle size={12} className="syntax-log-icon warning" />}
                  <span className="syntax-log-msg">{log.message}</span>
                  {log.detail && <span className="syntax-log-detail">{log.detail}</span>}
                </div>
              ))
            )}
            <div ref={consoleBottomRef} />
          </div>
        )}
      </div>

      {/* ── Status Bar Footer for Code Editor ── */}
      <div className="syntax-ide-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="syntax-status-item">
            Lines: <b>{linesCount}</b>
          </span>
          <span className="syntax-status-item">
            Chars: <b>{syntaxCode.length}</b>
          </span>
          <span className="syntax-status-item">
            Encoding: <b>UTF-8</b>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="syntax-status-item">
            Language: <b style={{ color: 'var(--primary)' }}>SPSS Batch (.sps)</b>
          </span>
          <span className="syntax-status-item">
            Spaces: <b>2</b>
          </span>
        </div>
      </div>

    </div>
  );
};
