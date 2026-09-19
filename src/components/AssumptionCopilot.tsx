import React from 'react';
import { AssumptionReport, AssumptionResult } from '../engine/assumptionChecker';
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight, Zap } from 'lucide-react';

interface AssumptionCopilotProps {
  report: AssumptionReport;
}

export const AssumptionCopilot: React.FC<AssumptionCopilotProps> = ({ report }) => {
  const statusIcon = (status: 'pass' | 'warn' | 'fail') => {
    if (status === 'pass') return <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />;
    if (status === 'warn') return <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />;
    return <XCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />;
  };

  const statusBg = (status: 'pass' | 'warn' | 'fail') => {
    if (status === 'pass') return 'rgba(16,185,129,0.08)';
    if (status === 'warn') return 'rgba(245,158,11,0.08)';
    return 'rgba(239,68,68,0.08)';
  };

  const statusBorder = (status: 'pass' | 'warn' | 'fail') => {
    if (status === 'pass') return 'rgba(16,185,129,0.25)';
    if (status === 'warn') return 'rgba(245,158,11,0.25)';
    return 'rgba(239,68,68,0.25)';
  };

  const overallColor = report.canProceed
    ? report.assumptions.some(a => a.status === 'warn') ? '#f59e0b' : '#10b981'
    : '#ef4444';

  return (
    <div style={{
      margin: '0 0 14px 0',
      borderRadius: '10px',
      border: `1.5px solid ${overallColor}33`,
      background: `${overallColor}08`,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        background: `${overallColor}12`,
        borderBottom: `1px solid ${overallColor}22`,
        display: 'flex',
        alignItems: 'center',
        gap: '7px'
      }}>
        <Zap size={13} style={{ color: overallColor, flexShrink: 0 }} />
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Statistical Assumption Co-Pilot
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>—</span>
        <span style={{ fontSize: '0.72rem', color: overallColor, fontWeight: 600 }}>
          {report.procedure}
        </span>
      </div>

      {/* Assumption List */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {report.assumptions.map((a, i) => (
          <div
            key={i}
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              background: statusBg(a.status),
              border: `1px solid ${statusBorder(a.status)}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '7px'
            }}
          >
            {statusIcon(a.status)}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}>{a.name}</span>
                {a.value && (
                  <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {a.value}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.71rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                {a.message}
              </div>
              {a.suggestion && (
                <div style={{ fontSize: '0.69rem', color: overallColor, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ChevronRight size={10} />
                  <span style={{ fontStyle: 'italic' }}>{a.suggestion}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Recommendation */}
      <div style={{
        padding: '7px 12px',
        borderTop: `1px solid ${overallColor}22`,
        fontSize: '0.73rem',
        fontWeight: 600,
        color: overallColor,
        lineHeight: 1.4
      }}>
        {report.recommendation}
      </div>
    </div>
  );
};
