import React, { useState } from 'react';
import { ChartOutput } from '../../types';

interface InteractiveChartProps {
  chart: ChartOutput;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ chart }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const width = 640;
  const height = 340;
  const margin = { top: 40, right: 30, bottom: 60, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (chart.type === 'bar') {
    if (chart.series && chart.series.length > 0) {
      // Clustered bar chart
      const numGroups = chart.labels?.length || 0;
      const numSeries = chart.series.length;
      const allVals = chart.series.flatMap(s => s.values);
      const maxVal = Math.max(...allVals, 1) * 1.15;
      const groupWidth = innerWidth / (numGroups || 1);
      const barWidth = Math.max(8, (groupWidth * 0.75) / numSeries);
      const colorGradients = [
        { id: 'gradBlue', start: '#0f62fe', end: '#60a5fa' },
        { id: 'gradGreen', start: '#10b981', end: '#34d399' },
        { id: 'gradAmber', start: '#f59e0b', end: '#fbbf24' },
        { id: 'gradPurple', start: '#8b5cf6', end: '#a78bfa' },
        { id: 'gradPink', start: '#ec4899', end: '#f472b6' }
      ];

      return (
        <div style={{ margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {chart.title}
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLUSTERED BAR CHART</span>
          </div>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: '640px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
            <defs>
              {colorGradients.map((g, i) => (
                <linearGradient key={i} id={g.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={g.end} />
                  <stop offset="100%" stopColor={g.start} />
                </linearGradient>
              ))}
            </defs>
            <g transform={`translate(${margin.left},${margin.top})`}>
              {/* Y Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = innerHeight - ratio * innerHeight;
                const val = Math.round(ratio * maxVal);
                return (
                  <g key={i}>
                    <line x1={0} y1={y} x2={innerWidth} y2={y} stroke="var(--border-subtle)" strokeDasharray="4,4" />
                    <text x={-10} y={y + 4} textAnchor="end" fontSize="10" fontWeight="500" fill="var(--text-muted)">{val}</text>
                  </g>
                );
              })}

              {/* Bars */}
              {chart.labels?.map((label, gIdx) => {
                const groupX = gIdx * groupWidth + groupWidth * 0.12;
                return (
                  <g key={gIdx}>
                    {chart.series?.map((s, sIdx) => {
                      const val = s.values[gIdx] || 0;
                      const barH = (val / maxVal) * innerHeight;
                      const barX = groupX + sIdx * barWidth;
                      const barY = innerHeight - barH;
                      const grad = colorGradients[sIdx % colorGradients.length];

                      return (
                        <g key={sIdx}>
                          <rect
                            x={barX}
                            y={barY}
                            width={barWidth - 2}
                            height={barH}
                            fill={`url(#${grad.id})`}
                            rx={3}
                            style={{ transition: 'opacity 0.15s ease' }}
                          >
                            <title>{`${s.name}: ${val}`}</title>
                          </rect>
                        </g>
                      );
                    })}
                    <text
                      x={gIdx * groupWidth + groupWidth / 2}
                      y={innerHeight + 20}
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight="500"
                      fill="var(--text-secondary)"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Axis labels */}
              <text x={innerWidth / 2} y={innerHeight + 46} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)" letterSpacing="0.02em">
                {chart.xLabel}
              </text>
              <text transform="rotate(-90)" x={-innerHeight / 2} y={-42} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">
                {chart.yLabel || 'Count'}
              </text>
            </g>
          </svg>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '18px', marginTop: '10px', fontSize: '0.78rem', justifyContent: 'center' }}>
            {chart.series.map((s, idx) => {
              const grad = colorGradients[idx % colorGradients.length];
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', background: `linear-gradient(135deg, ${grad.end}, ${grad.start})`, borderRadius: '3px' }} />
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Simple single-variable bar chart
    const labels = chart.labels || [];
    const values = chart.values || [];
    const maxVal = Math.max(...values, 1) * 1.15;
    const barWidth = Math.max(20, (innerWidth / (labels.length || 1)) * 0.62);

    return (
      <div style={{ margin: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {chart.title}
          </h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>FREQUENCY DISTRIBUTION</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: '640px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
          <defs>
            <linearGradient id="singleBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#0f62fe" />
            </linearGradient>
          </defs>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = innerHeight - ratio * innerHeight;
              const val = Math.round(ratio * maxVal);
              return (
                <g key={i}>
                  <line x1={0} y1={y} x2={innerWidth} y2={y} stroke="var(--border-subtle)" strokeDasharray="4,4" />
                  <text x={-10} y={y + 4} textAnchor="end" fontSize="10" fontWeight="500" fill="var(--text-muted)">{val}</text>
                </g>
              );
            })}

            {labels.map((label, idx) => {
              const val = values[idx] || 0;
              const barH = (val / maxVal) * innerHeight;
              const x = idx * (innerWidth / labels.length) + (innerWidth / labels.length - barWidth) / 2;
              const y = innerHeight - barH;
              const isHovered = hoveredIndex === idx;

              return (
                <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    fill="url(#singleBarGrad)"
                    rx={4}
                    opacity={isHovered ? 1 : 0.9}
                    style={{ transition: 'opacity 0.15s, transform 0.15s', cursor: 'pointer' }}
                  >
                    <title>{`${label}: ${val}`}</title>
                  </rect>
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="700"
                    fill={isHovered ? 'var(--primary)' : 'var(--text-secondary)'}
                  >
                    {val}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={innerHeight + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="500"
                    fill="var(--text-secondary)"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            <text x={innerWidth / 2} y={innerHeight + 44} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">
              {chart.xLabel}
            </text>
            <text transform="rotate(-90)" x={-innerHeight / 2} y={-42} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">
              {chart.yLabel || 'Frequency'}
            </text>
          </g>
        </svg>
      </div>
    );
  }

  if (chart.type === 'scatter' && chart.dataPoints) {
    const points = chart.dataPoints;
    const xVals = points.map(p => p.x);
    const yVals = points.map(p => p.y);
    const minX = Math.min(...xVals);
    const maxX = Math.max(...xVals);
    const minY = Math.min(...yVals);
    const maxY = Math.max(...yVals);

    const padX = (maxX - minX) * 0.08 || 1;
    const padY = (maxY - minY) * 0.08 || 1;

    return (
      <div style={{ margin: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {chart.title}
          </h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SCATTER / FIT PLOT</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: '640px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Grid */}
            <line x1={0} y1={0} x2={innerWidth} y2={0} stroke="var(--border-subtle)" strokeDasharray="4,4" />
            <line x1={0} y1={innerHeight / 2} x2={innerWidth} y2={innerHeight / 2} stroke="var(--border-subtle)" strokeDasharray="4,4" />
            <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="var(--border-color)" />
            <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="var(--border-color)" />

            {/* Regression Fit Line Approximation */}
            <line
              x1={0}
              y1={innerHeight * 0.85}
              x2={innerWidth}
              y2={innerHeight * 0.15}
              stroke="#0f62fe"
              strokeWidth={2}
              strokeDasharray="6,4"
              opacity={0.8}
            />

            {/* Points */}
            {points.map((p, idx) => {
              const cx = ((p.x - (minX - padX)) / ((maxX + padX) - (minX - padX))) * innerWidth;
              const cy = innerHeight - ((p.y - (minY - padY)) / ((maxY + padY) - (minY - padY))) * innerHeight;

              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r={4.5}
                  fill="#6366f1"
                  opacity={0.75}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  style={{ transition: 'r 0.1s' }}
                >
                  <title>{`Predicted: ${p.x.toFixed(2)}, Observed: ${p.y.toFixed(2)}`}</title>
                </circle>
              );
            })}

            <text x={innerWidth / 2} y={innerHeight + 44} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">
              {chart.xLabel}
            </text>
            <text transform="rotate(-90)" x={-innerHeight / 2} y={-42} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">
              {chart.yLabel}
            </text>
          </g>
        </svg>
      </div>
    );
  }

  if (chart.type === 'line') {
    // Scree plot with Kaiser cutoff
    const labels = chart.labels || [];
    const values = chart.values || [];
    const maxVal = Math.max(...values, 1) * 1.15;
    const stepX = innerWidth / (labels.length - 1 || 1);

    const pathD = values
      .map((val, idx) => {
        const x = idx * stepX;
        const y = innerHeight - (val / maxVal) * innerHeight;
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const areaD = `${pathD} L ${innerWidth} ${innerHeight} L 0 ${innerHeight} Z`;

    return (
      <div style={{ margin: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {chart.title}
          </h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>EIGENVALUE DECOMPOSITION</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: '640px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Area under curve */}
            <path d={areaD} fill="url(#areaGrad)" />

            {/* Cutoff line at Eigenvalue = 1 (Kaiser criterion) */}
            {maxVal >= 1 && (
              <g>
                <line
                  x1={0}
                  y1={innerHeight - (1 / maxVal) * innerHeight}
                  x2={innerWidth}
                  y2={innerHeight - (1 / maxVal) * innerHeight}
                  stroke="#ef4444"
                  strokeDasharray="4,4"
                  strokeWidth={1.5}
                />
                <rect
                  x={innerWidth - 110}
                  y={innerHeight - (1 / maxVal) * innerHeight - 18}
                  width="105"
                  height="16"
                  rx="3"
                  fill="#ef4444"
                />
                <text
                  x={innerWidth - 58}
                  y={innerHeight - (1 / maxVal) * innerHeight - 6}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="#ffffff"
                  fontWeight="700"
                >
                  Kaiser Cutoff (λ = 1)
                </text>
              </g>
            )}

            <path d={pathD} fill="none" stroke="#0f62fe" strokeWidth={2.8} />

            {values.map((val, idx) => {
              const cx = idx * stepX;
              const cy = innerHeight - (val / maxVal) * innerHeight;
              return (
                <g key={idx}>
                  <circle cx={cx} cy={cy} r={5.5} fill="#0f62fe" stroke="#ffffff" strokeWidth={2.5}>
                    <title>{`Component ${labels[idx]}: ${val.toFixed(3)}`}</title>
                  </circle>
                  <text x={cx} y={innerHeight + 18} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-secondary)">
                    {labels[idx]}
                  </text>
                </g>
              );
            })}

            <text x={innerWidth / 2} y={innerHeight + 44} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">
              {chart.xLabel || 'Component Number'}
            </text>
            <text transform="rotate(-90)" x={-innerHeight / 2} y={-42} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">
              {chart.yLabel || 'Eigenvalue'}
            </text>
          </g>
        </svg>
      </div>
    );
  }

  return null;
};
