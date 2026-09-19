import React, { useEffect } from 'react';
import {
  FolderOpen,
  Save,
  Printer,
  RotateCcw,
  RotateCw,
  Search,
  Filter,
  Sliders,
  BarChart2,
  Sigma,
  GitCompare,
  TrendingUp,
  LineChart,
  Layers,
  Grid,
  Calculator,
  Hash,
  Tag,
  Sparkles,
  Activity
} from 'lucide-react';
import { SHOW_AI_REPORT } from './TopNav';

interface ToolbarProps {
  onOpenClick: () => void;
  onSaveClick: () => void;
  onPrintClick: () => void;
  openDialog: (name: string) => void;
  valueLabelsActive: boolean;
  setValueLabelsActive: (v: boolean) => void;
  onGoToCase: () => void;
  onGoToVar: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpenClick,
  onSaveClick,
  onPrintClick,
  openDialog,
  valueLabelsActive,
  setValueLabelsActive,
  onGoToCase,
  onGoToVar,
}) => {

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.ctrlKey || e.metaKey) {
        if (e.code === 'KeyS' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          e.stopPropagation();
          onSaveClick();
        } else if (e.code === 'KeyO' || e.key.toLowerCase() === 'o') {
          e.preventDefault();
          e.stopPropagation();
          onOpenClick();
        } else if (e.code === 'KeyP' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          e.stopPropagation();
          onPrintClick();
        }
      }
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [onOpenClick, onSaveClick, onPrintClick]);

  return (
    <div className="action-toolbar" role="toolbar" aria-label="Main toolbar">

      {/* ── File Group ─────────────────────── */}
      <div className="tool-group">
        <button
          id="toolbar-open"
          className="tool-btn"
          title="Open Dataset — Excel, CSV, JSON (Ctrl+O)"
          onClick={onOpenClick}
        >
          <FolderOpen size={14} />
        </button>
        <button
          id="toolbar-save"
          className="tool-btn"
          title="Save Project & Data (Ctrl+S)"
          onClick={onSaveClick}
        >
          <Save size={14} />
        </button>
        <button
          id="toolbar-print"
          className="tool-btn"
          title="Print / Export APA Report (Ctrl+P)"
          onClick={onPrintClick}
        >
          <Printer size={14} />
        </button>
      </div>

      <div className="tool-divider" />

      {/* ── History ────────────────────────── */}
      <div className="tool-group">
        <button
          id="toolbar-undo"
          className="tool-btn"
          title="Undo (Ctrl+Z)"
          onClick={() => document.execCommand('undo')}
        >
          <RotateCcw size={14} />
        </button>
        <button
          id="toolbar-redo"
          className="tool-btn"
          title="Redo (Ctrl+Y)"
          onClick={() => document.execCommand('redo')}
        >
          <RotateCw size={14} />
        </button>
      </div>

      <div className="tool-divider" />

      {/* ── Navigation & Labels ─────────────── */}
      <div className="tool-group">
        <button
          id="toolbar-goto-case"
          className="tool-btn"
          title="Go to Case Number…"
          onClick={onGoToCase}
        >
          <Hash size={13} />
          <span>Case</span>
        </button>
        <button
          id="toolbar-goto-var"
          className="tool-btn"
          title="Find / Go to Variable…"
          onClick={onGoToVar}
        >
          <Search size={13} />
          <span>Var</span>
        </button>
        <button
          id="toolbar-value-labels"
          className={`tool-btn${valueLabelsActive ? ' active' : ''}`}
          title={valueLabelsActive ? 'Value Labels: ON (showing labels) — click to show codes' : 'Value Labels: OFF — click to show labels'}
          onClick={() => setValueLabelsActive(!valueLabelsActive)}
          aria-pressed={valueLabelsActive}
        >
          <Tag size={13} />
          <span>{valueLabelsActive ? 'Labels' : 'Codes'}</span>
        </button>
      </div>

      <div className="tool-divider" />

      {/* ── Statistical Procedures ─────────── */}
      <div className="tool-group">
        <button
          id="toolbar-frequencies"
          className="tool-btn"
          title="Frequencies Analysis"
          onClick={() => openDialog('frequencies')}
        >
          <BarChart2 size={14} style={{ color: 'var(--primary)' }} />
          <span>Freq</span>
        </button>
        <button
          id="toolbar-descriptives"
          className="tool-btn"
          title="Descriptive Statistics (Mean, SD, Skewness)"
          onClick={() => openDialog('descriptives')}
        >
          <Sigma size={14} style={{ color: '#10b981' }} />
          <span>Desc</span>
        </button>
        <button
          id="toolbar-ttest"
          className="tool-btn"
          title="Independent-Samples T-Test (with Assumption Co-Pilot)"
          onClick={() => openDialog('ttest_indep')}
        >
          <GitCompare size={14} style={{ color: '#6366f1' }} />
          <span>T-Test</span>
        </button>
        <button
          id="toolbar-anova"
          className="tool-btn"
          title="One-Way ANOVA (with Assumption Co-Pilot)"
          onClick={() => openDialog('oneway_anova')}
        >
          <TrendingUp size={14} style={{ color: '#ec4899' }} />
          <span>ANOVA</span>
        </button>
        <button
          id="toolbar-correlation"
          className="tool-btn"
          title="Bivariate Correlations (Pearson & Spearman)"
          onClick={() => openDialog('correlation')}
        >
          <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#f59e0b', lineHeight: 1 }}>r</span>
          <span>Corr</span>
        </button>
        <button
          id="toolbar-regression"
          className="tool-btn"
          title="Multiple Linear Regression"
          onClick={() => openDialog('regression')}
        >
          <LineChart size={14} style={{ color: '#8b5cf6' }} />
          <span>Regress</span>
        </button>
        <button
          id="toolbar-factor"
          className="tool-btn"
          title="Factor Analysis & PCA"
          onClick={() => openDialog('factor')}
        >
          <Layers size={14} style={{ color: '#06b6d4' }} />
          <span>PCA</span>
        </button>
        <button
          id="toolbar-crosstabs"
          className="tool-btn"
          title="Crosstabs & Chi-Square Test"
          onClick={() => openDialog('crosstabs')}
        >
          <Grid size={14} style={{ color: '#f97316' }} />
          <span>χ² Tabs</span>
        </button>
      </div>

      <div className="tool-divider" />

      {/* ── Tools & Data Intelligence ───────────────────── */}
      <div className="tool-group">
        {SHOW_AI_REPORT && (
          <button
            id="toolbar-ai-report"
            className="tool-btn"
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#6366f1',
              fontWeight: 700
            }}
            title="AI Research Report Studio — Generate Complete APA 7th Manuscript with Visuals"
            onClick={() => openDialog('ai_report')}
          >
            <Sparkles size={14} style={{ color: '#6366f1' }} />
            <span>AI Report</span>
          </button>
        )}
        <button
          id="toolbar-health-scan"
          className="tool-btn"
          title="Smart Data Health & Outlier Scan"
          onClick={() => openDialog('health')}
        >
          <Activity size={13} style={{ color: '#10b981' }} />
          <span>Health</span>
        </button>
        <button
          id="toolbar-compute"
          className="tool-btn tool-btn-accent"
          title="Smart Compute Variable with Live Preview…"
          onClick={() => openDialog('compute')}
        >
          <Calculator size={13} style={{ color: 'var(--primary)' }} />
          <span>Compute</span>
        </button>
        <button
          id="toolbar-filter"
          className="tool-btn"
          title="Select Cases (Filter)…"
          onClick={() => {}}
        >
          <Filter size={13} />
        </button>
        <button
          id="toolbar-weight"
          className="tool-btn"
          title="Weight Cases…"
          onClick={() => {}}
        >
          <Sliders size={13} />
        </button>
      </div>
    </div>
  );
};
