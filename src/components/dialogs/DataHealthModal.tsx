import React, { useState, useMemo } from 'react';
import { Dataset } from '../../types';
import { analyzeDatasetHealth, ColumnHealthReport } from '../../engine/dataHealthDiagnostics';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  Zap,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Filter,
  BarChart2,
  HelpCircle,
  Copy,
  Check,
  Download,
  Calculator,
  Layers,
  ArrowUpRight,
  Sliders,
  Maximize2
} from 'lucide-react';

interface DataHealthModalProps {
  dataset: Dataset;
  onClose: () => void;
  onSelectVariable?: (varName: string) => void;
  onOpenCompute?: () => void;
}

export const DataHealthModal: React.FC<DataHealthModalProps> = ({
  dataset,
  onClose,
  onOpenCompute
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'issues' | 'numeric' | 'categorical'>('all');
  const [selectedCol, setSelectedCol] = useState<string | null>(dataset.variables[0]?.name || null);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [hoveredBin, setHoveredBin] = useState<{ min: number; max: number; count: number } | null>(null);

  const health = useMemo(() => analyzeDatasetHealth(dataset), [dataset]);

  const issueCount = useMemo(() => {
    return health.reports.filter(r => r.missingCount > 0 || (r.outlierCount || 0) > 0 || r.normalityStatus === 'Severe Skew').length;
  }, [health]);

  const filteredReports = useMemo(() => {
    return health.reports.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.label.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (filterMode === 'issues') {
        return (r.missingCount > 0) || ((r.outlierCount || 0) > 0) || (r.normalityStatus === 'Severe Skew');
      }
      if (filterMode === 'numeric') {
        return r.type === 'Numeric';
      }
      if (filterMode === 'categorical') {
        return r.type !== 'Numeric' || r.measure === 'Nominal' || r.measure === 'Ordinal';
      }
      return true;
    });
  }, [health, searchTerm, filterMode]);

  const activeReport = useMemo(() => {
    return health.reports.find(r => r.name === selectedCol) || health.reports[0];
  }, [health, selectedCol]);

  // Generate 10-bin histogram data for the active numeric variable
  const histogramData = useMemo(() => {
    if (!activeReport || activeReport.type !== 'Numeric' || activeReport.min === undefined || activeReport.max === undefined) {
      return null;
    }

    const rawVals = dataset.data
      .map(r => Number(r[activeReport.name]))
      .filter(v => !isNaN(v) && v !== null && v !== undefined);

    if (rawVals.length === 0) return null;

    const min = activeReport.min;
    const max = activeReport.max;
    const range = max - min;
    const numBins = Math.min(12, Math.max(6, Math.floor(Math.sqrt(rawVals.length))));
    const binSize = range === 0 ? 1 : range / numBins;

    const bins = Array.from({ length: numBins }, (_, i) => ({
      min: Number((min + i * binSize).toFixed(2)),
      max: Number((min + (i + 1) * binSize).toFixed(2)),
      count: 0
    }));

    rawVals.forEach(v => {
      let bIdx = Math.floor((v - min) / binSize);
      if (bIdx >= numBins) bIdx = numBins - 1;
      if (bIdx < 0) bIdx = 0;
      bins[bIdx].count++;
    });

    const maxCount = Math.max(...bins.map(b => b.count), 1);

    return { bins, maxCount, total: rawVals.length };
  }, [activeReport, dataset]);

  const copyToClipboard = (text: string, actionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(actionId);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = ['Variable', 'Label', 'Type', 'Measure', 'Valid_N', 'Missing_N', 'Missing_Pct', 'Mean', 'Median', 'StdDev', 'Skewness', 'Outliers_Count', 'Status'];
    const rows = health.reports.map(r => [
      r.name,
      `"${r.label.replace(/"/g, '""')}"`,
      r.type,
      r.measure,
      r.validCount,
      r.missingCount,
      r.missingPct.toFixed(1),
      r.mean !== undefined ? r.mean : '',
      r.median !== undefined ? r.median : '',
      r.stdDev !== undefined ? r.stdDev : '',
      r.skewness !== undefined ? r.skewness : '',
      r.outlierCount || 0,
      r.normalityStatus || 'Normal'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name.replace(/\s+/g, '_')}_Data_Health_Audit.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Grade color helper
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return { bg: 'rgba(22, 163, 74, 0.15)', border: 'rgba(22, 163, 74, 0.35)', color: '#16a34a', label: 'Parametric Ready' };
      case 'B':
        return { bg: 'rgba(2, 132, 199, 0.15)', border: 'rgba(2, 132, 199, 0.35)', color: '#0284c7', label: 'Good Quality' };
      case 'C':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)', color: '#f59e0b', label: 'Minor Issues' };
      default:
        return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)', color: '#dc2626', label: 'Attention Needed' };
    }
  };

  const gradeInfo = getGradeBadge(health.healthGrade);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(11, 17, 33, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '1060px',
          maxWidth: '96vw',
          height: '90vh',
          maxHeight: '880px',
          minHeight: '500px',
          background: 'var(--bg-surface)',
          borderRadius: '18px',
          boxShadow: '0 30px 70px -15px rgba(0,0,0,0.6), 0 0 0 1px var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          margin: 'auto'
        }}
      >
        {/* ── Modal Header ── */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-header)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)'
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Smart Data Health & Outlier Inspector
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2.5px 10px',
                    borderRadius: '9999px',
                    background: gradeInfo.bg,
                    border: `1px solid ${gradeInfo.border}`,
                    color: gradeInfo.color,
                    letterSpacing: '0.04em'
                  }}
                >
                  Grade {health.healthGrade} &bull; {health.overallScore}/100 &bull; {gradeInfo.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Automated parametric normality screening, 1.5× IQR outlier fences, missing data audit & cleaning recommendations
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleExportCsv}
              title="Export complete health audit table as CSV"
            >
              <Download size={13} />
              <span>Export Audit</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Inspector (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Global Health Metric Tiles Bar ── */}
        <div
          style={{
            padding: '14px 24px',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            flexShrink: 0
          }}
        >
          {/* Health Score Tile */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                background: gradeInfo.bg,
                color: gradeInfo.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1rem',
                border: `1px solid ${gradeInfo.border}`
              }}
            >
              {health.healthGrade}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Data Health Score
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {health.overallScore}<span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>
          </div>

          {/* Completeness Tile */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Data Completeness
              </span>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: health.overallCompletenessPct >= 95 ? '#16a34a' : '#f59e0b' }}>
                {health.overallCompletenessPct.toFixed(1)}%
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '9999px', marginTop: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${health.overallCompletenessPct}%`,
                  height: '100%',
                  background: health.overallCompletenessPct >= 95 ? '#16a34a' : '#f59e0b',
                  borderRadius: '9999px'
                }}
              />
            </div>
          </div>

          {/* Outliers Tile */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Statistical Outliers
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: health.totalOutliers > 0 ? '#ef4444' : '#16a34a' }}>
                {health.totalOutliers} <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>points</span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', background: health.totalOutliers > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(22, 163, 74, 0.1)', color: health.totalOutliers > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
              {health.outlierColumnsCount} var{health.outlierColumnsCount === 1 ? '' : 's'}
            </span>
          </div>

          {/* Clean Columns Tile */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Clean Dimensions
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {health.cleanColumnsCount} <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>/ {health.totalCols}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', fontWeight: 700 }}>
              N = {health.totalRows} cases
            </span>
          </div>
        </div>

        {/* ── Modal Body (Two Panes) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          
          {/* Left Column: Variable List with Search & Filter Tabs */}
          <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', minHeight: 0, overflow: 'hidden' }}>
            
            {/* Search & Filter Header */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-subtle)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search variables..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)'
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {[
                  { id: 'all', label: `All (${health.reports.length})` },
                  { id: 'issues', label: `Issues (${issueCount})` },
                  { id: 'numeric', label: 'Scale' },
                  { id: 'categorical', label: 'Categorical' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterMode(f.id as any)}
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: filterMode === f.id ? 700 : 500,
                      cursor: 'pointer',
                      border: filterMode === f.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: filterMode === f.id ? 'var(--primary)' : 'var(--bg-subtle)',
                      color: filterMode === f.id ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Variable Items List */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '8px' }}>
              {filteredReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No variables match current filter
                </div>
              ) : (
                filteredReports.map(rep => {
                  const hasOutliers = (rep.outlierCount || 0) > 0;
                  const hasMissing = rep.missingCount > 0;
                  const isSkewed = rep.normalityStatus === 'Severe Skew';
                  const isSelected = activeReport?.name === rep.name;

                  return (
                    <div
                      key={rep.name}
                      onClick={() => setSelectedCol(rep.name)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isSelected ? 'rgba(2, 132, 199, 0.1)' : 'transparent',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rep.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rep.label || rep.name} &bull; {rep.measure}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        {hasOutliers && (
                          <span
                            title={`${rep.outlierCount} outliers detected`}
                            style={{ fontSize: '0.64rem', padding: '1.5px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', fontWeight: 700 }}
                          >
                            {rep.outlierCount} out
                          </span>
                        )}
                        {hasMissing && (
                          <span
                            title={`${rep.missingCount} missing cases (${rep.missingPct.toFixed(0)}%)`}
                            style={{ fontSize: '0.64rem', padding: '1.5px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontWeight: 700 }}
                          >
                            {rep.missingPct.toFixed(0)}% miss
                          </span>
                        )}
                        {isSkewed && !hasOutliers && !hasMissing && (
                          <span
                            title={`Skewness = ${rep.skewness}`}
                            style={{ fontSize: '0.64rem', padding: '1.5px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#9333ea', fontWeight: 700 }}
                          >
                            skew
                          </span>
                        )}
                        {!hasOutliers && !hasMissing && !isSkewed && (
                          <CheckCircle2 size={14} style={{ color: '#16a34a' }} />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Diagnostic Deep-Dive for Active Variable */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'var(--bg-main)' }}>
            {activeReport ? (
              <>
                {/* Active Variable Header Card */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {activeReport.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(2, 132, 199, 0.1)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(2, 132, 199, 0.25)'
                        }}
                      >
                        {activeReport.measure} &bull; {activeReport.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {activeReport.label || 'No description label assigned'} &bull; Valid observations: <b>{activeReport.validCount}</b> / {activeReport.totalCount} ({activeReport.missingCount} missing)
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => copyToClipboard(activeReport.name, 'copy-name')}
                      title="Copy variable name to clipboard"
                    >
                      {copiedAction === 'copy-name' ? <Check size={12} style={{ color: '#16a34a' }} /> : <Copy size={12} />}
                      <span>Copy Name</span>
                    </button>
                    {onOpenCompute && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        onClick={onOpenCompute}
                        title="Open Compute Variable dialog to transform this column"
                      >
                        <Calculator size={12} />
                        <span>Compute</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Distribution Visualization (Histogram for Numeric / Bar for Categorical) */}
                {activeReport.type === 'Numeric' && histogramData ? (
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BarChart2 size={15} style={{ color: 'var(--primary)' }} />
                        <span>Empirical Distribution & Outlier Boundaries</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', background: '#0284c7', borderRadius: '2px' }} />
                          Frequency Bins
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '2px', background: '#ef4444' }} />
                          1.5× IQR Fences
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '2px', background: '#10b981' }} />
                          Mean (M)
                        </span>
                      </div>
                    </div>

                    {/* SVG Histogram */}
                    <div style={{ position: 'relative', height: '140px', width: '100%', marginTop: '8px' }}>
                      <svg viewBox="0 0 700 130" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        {/* Grid lines */}
                        <line x1="20" y1="110" x2="680" y2="110" stroke="var(--border-subtle)" strokeWidth="1" />
                        <line x1="20" y1="20" x2="680" y2="20" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3,3" />

                        {/* Histogram Bars */}
                        {histogramData.bins.map((bin, bIdx) => {
                          const numBins = histogramData.bins.length;
                          const barWidth = 640 / numBins - 4;
                          const barX = 25 + bIdx * (640 / numBins);
                          const barHeight = (bin.count / histogramData.maxCount) * 85;
                          const barY = 110 - barHeight;
                          const isHighlighted = hoveredBin === bin;

                          return (
                            <g key={bIdx}>
                              <rect
                                x={barX}
                                y={barY}
                                width={Math.max(4, barWidth)}
                                height={Math.max(2, barHeight)}
                                rx="3"
                                fill={isHighlighted ? 'var(--primary)' : 'rgba(2, 132, 199, 0.75)'}
                                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                onMouseEnter={() => setHoveredBin(bin)}
                                onMouseLeave={() => setHoveredBin(null)}
                              />
                              {bin.count > 0 && (
                                <text
                                  x={barX + barWidth / 2}
                                  y={barY - 4}
                                  fontSize="9"
                                  textAnchor="middle"
                                  fill="var(--text-muted)"
                                  fontWeight="600"
                                >
                                  {bin.count}
                                </text>
                              )}
                              {bIdx % 2 === 0 && (
                                <text
                                  x={barX + barWidth / 2}
                                  y="124"
                                  fontSize="9"
                                  textAnchor="middle"
                                  fill="var(--text-muted)"
                                >
                                  {bin.min}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>

                      {/* Tooltip for hovered bin */}
                      {hoveredBin && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '12px',
                            background: 'var(--bg-header)',
                            border: '1px solid var(--border-color)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            color: 'var(--text-primary)',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          Range [{hoveredBin.min} &ndash; {hoveredBin.max}]: <b>{hoveredBin.count} cases</b> ({((hoveredBin.count / histogramData.total) * 100).toFixed(1)}%)
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeReport.categoryBreakdown && activeReport.categoryBreakdown.length > 0 ? (
                  /* Categorical Distribution Bar */
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={15} style={{ color: '#06b6d4' }} />
                      <span>Category Distribution Profile ({activeReport.distinctCount} distinct levels)</span>
                    </div>

                    {/* Progress Bar of Categories */}
                    <div style={{ width: '100%', height: '14px', background: 'var(--border-subtle)', borderRadius: '9999px', display: 'flex', overflow: 'hidden' }}>
                      {activeReport.categoryBreakdown.slice(0, 6).map((cat, idx) => {
                        const colors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                        return (
                          <div
                            key={idx}
                            style={{
                              width: `${cat.pct}%`,
                              height: '100%',
                              background: colors[idx % colors.length]
                            }}
                            title={`${cat.label}: ${cat.count} (${cat.pct}%)`}
                          />
                        );
                      })}
                    </div>

                    {/* Legend Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {activeReport.categoryBreakdown.map((cat, idx) => {
                        const colors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'var(--bg-subtle)',
                              border: '1px solid var(--border-color)',
                              fontSize: '0.74rem'
                            }}
                          >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[idx % colors.length] }} />
                            <strong style={{ color: 'var(--text-primary)' }}>{cat.label}</strong>
                            <span style={{ color: 'var(--text-muted)' }}>{cat.count} ({cat.pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Metrics Breakdown Grid (APA Parameters) */}
                {activeReport.type === 'Numeric' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Mean (M)</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {activeReport.mean !== undefined ? activeReport.mean : '-'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Median (Mdn)</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {activeReport.median !== undefined ? activeReport.median : '-'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Std Deviation (SD)</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {activeReport.stdDev !== undefined ? activeReport.stdDev : '-'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Std Error (SE)</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {activeReport.se !== undefined ? activeReport.se : '-'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Range [Min, Max]</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                        [{activeReport.min !== undefined ? activeReport.min : '-'}, {activeReport.max !== undefined ? activeReport.max : '-'}]
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Skewness (γ₁)</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: activeReport.normalityStatus === 'Severe Skew' ? '#ef4444' : 'var(--text-primary)', marginTop: '2px' }}>
                        {activeReport.skewness !== undefined ? activeReport.skewness : '-'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Excess Kurtosis (γ₂)</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {activeReport.kurtosis !== undefined ? activeReport.kurtosis : '-'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Interquartile (IQR)</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {activeReport.iqr !== undefined ? activeReport.iqr : '-'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagnostics & Recommendations */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={15} style={{ color: 'var(--primary)' }} />
                      <span>Diagnostics & Recommended Remediations</span>
                    </div>

                    {/* Quick Syntax Actions */}
                    {activeReport.normalityStatus === 'Severe Skew' && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => copyToClipboard(`COMPUTE log_${activeReport.name} = LG10(${activeReport.name}).\nEXECUTE.`, 'log-syntax')}
                      >
                        {copiedAction === 'log-syntax' ? <Check size={12} style={{ color: '#16a34a' }} /> : <Copy size={12} />}
                        <span>Copy Log10 Syntax</span>
                      </button>
                    )}
                  </div>

                  {activeReport.recommendations.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '0.82rem', padding: '8px 0' }}>
                      <CheckCircle2 size={16} />
                      <span>Data quality is clean. Distribution satisfies parametric assumptions.</span>
                    </div>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeReport.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Outlier Cases Breakdown */}
                {activeReport.outlierDetails && activeReport.outlierDetails.length > 0 && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.04)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={15} />
                        <span>Outlier Observations ({activeReport.outlierDetails.length} cases detected)</span>
                      </div>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => copyToClipboard(activeReport.outlierDetails!.map(o => o.caseIdx + 1).join(', '), 'copy-outliers')}
                      >
                        {copiedAction === 'copy-outliers' ? <Check size={12} style={{ color: '#16a34a' }} /> : <Copy size={12} />}
                        <span>Copy Case IDs</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                      {activeReport.outlierDetails.map(o => (
                        <div
                          key={o.caseIdx}
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.74rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <strong style={{ color: '#dc2626' }}>Case #{o.caseIdx + 1}:</strong>
                          <span>Val = <b>{o.value}</b></span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({o.zScore > 0 ? '+' : ''}{o.zScore}σ)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

        </div>

        {/* ── Modal Footer ── */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} style={{ color: '#10b981' }} />
            <span>Pure client-side IEEE 754 diagnostics &bull; 0 bytes leave your browser</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '7px 16px', fontSize: '0.82rem' }}
              onClick={handleExportCsv}
            >
              Export CSV Audit
            </button>
            <button
              className="btn btn-primary"
              style={{ padding: '7px 20px', fontSize: '0.82rem' }}
              onClick={onClose}
            >
              Done / Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
