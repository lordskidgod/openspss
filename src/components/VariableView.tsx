import React from 'react';
import { Dataset, Variable, VariableType, Alignment, Measure, VariableRole } from '../types';
import { Plus, Trash2, Edit3, Tag } from 'lucide-react';

interface VariableViewProps {
  dataset: Dataset;
  onUpdateVariable: (index: number, updated: Partial<Variable>) => void;
  onAddVariable: () => void;
  onDeleteVariable: (index: number) => void;
  onOpenValueLabelsModal: (varIndex: number) => void;
}

export const VariableView: React.FC<VariableViewProps> = ({
  dataset,
  onUpdateVariable,
  onAddVariable,
  onDeleteVariable,
  onOpenValueLabelsModal
}) => {
  return (
    <div className="spreadsheet-container">
      <table className="spss-grid-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th className="row-header" style={{ width: '44px' }}>#</th>
            <th style={{ width: '130px' }}>Name</th>
            <th style={{ width: '110px' }}>Type</th>
            <th style={{ width: '75px' }}>Width</th>
            <th style={{ width: '75px' }}>Decimals</th>
            <th style={{ width: '240px' }}>Label</th>
            <th style={{ width: '160px' }}>Values</th>
            <th style={{ width: '90px' }}>Missing</th>
            <th style={{ width: '80px' }}>Columns</th>
            <th style={{ width: '95px' }}>Align</th>
            <th style={{ width: '120px' }}>Measure</th>
            <th style={{ width: '95px' }}>Role</th>
            <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dataset.variables.map((v, idx) => {
            const valuesCount = v.values?.length || 0;
            const valuesPreview = valuesCount > 0
              ? `{${v.values[0].value}, ${v.values[0].label}}` + (valuesCount > 1 ? ` +${valuesCount - 1}` : '')
              : 'None';

            return (
              <tr key={v.id}>
                <th className="row-header">{idx + 1}</th>

                {/* Name */}
                <td style={{ padding: '3px 8px' }}>
                  <input
                    type="text"
                    value={v.name}
                    onChange={e => onUpdateVariable(idx, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, color: 'var(--text-primary)' }}
                  />
                </td>

                {/* Type */}
                <td style={{ padding: '3px 8px' }}>
                  <select
                    value={v.type}
                    onChange={e => onUpdateVariable(idx, { type: e.target.value as VariableType })}
                    style={{
                      width: '100%',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      background: 'var(--bg-surface)',
                      outline: 'none',
                      fontSize: '0.78rem',
                      color: 'inherit'
                    }}
                  >
                    <option value="Numeric">Numeric</option>
                    <option value="String">String</option>
                    <option value="Date">Date</option>
                    <option value="Dollar">Dollar</option>
                  </select>
                </td>

                {/* Width */}
                <td style={{ padding: '3px 8px' }}>
                  <input
                    type="number"
                    value={v.width}
                    onChange={e => onUpdateVariable(idx, { width: Number(e.target.value) })}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', textAlign: 'right', color: 'inherit' }}
                  />
                </td>

                {/* Decimals */}
                <td style={{ padding: '3px 8px' }}>
                  <input
                    type="number"
                    value={v.decimals}
                    disabled={v.type === 'String'}
                    onChange={e => onUpdateVariable(idx, { decimals: Number(e.target.value) })}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', textAlign: 'right', color: 'inherit' }}
                  />
                </td>

                {/* Label */}
                <td style={{ padding: '3px 8px' }}>
                  <input
                    type="text"
                    value={v.label}
                    placeholder="Add descriptive label..."
                    onChange={e => onUpdateVariable(idx, { label: e.target.value })}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: 'inherit' }}
                  />
                </td>

                {/* Values Modal Trigger */}
                <td style={{ padding: '3px 8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onOpenValueLabelsModal(idx)}
                    style={{
                      width: '100%',
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      justifyContent: 'space-between',
                      borderRadius: '5px',
                      background: valuesCount > 0 ? 'var(--primary-light)' : 'transparent',
                      color: valuesCount > 0 ? 'var(--primary)' : 'var(--text-secondary)',
                      borderColor: valuesCount > 0 ? 'var(--primary)' : 'var(--border-color)'
                    }}
                    title="Click to define Value Labels"
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: valuesCount > 0 ? 600 : 400 }}>
                      {valuesPreview}
                    </span>
                    <Edit3 size={11} style={{ opacity: 0.7 }} />
                  </button>
                </td>

                {/* Missing */}
                <td style={{ padding: '3px 8px' }}>
                  <input
                    type="text"
                    value={v.missing}
                    placeholder="None"
                    onChange={e => onUpdateVariable(idx, { missing: e.target.value })}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: 'inherit' }}
                  />
                </td>

                {/* Columns */}
                <td style={{ padding: '3px 8px' }}>
                  <input
                    type="number"
                    value={v.columns}
                    onChange={e => onUpdateVariable(idx, { columns: Number(e.target.value) })}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', textAlign: 'right', color: 'inherit' }}
                  />
                </td>

                {/* Align */}
                <td style={{ padding: '3px 8px' }}>
                  <select
                    value={v.align}
                    onChange={e => onUpdateVariable(idx, { align: e.target.value as Alignment })}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: 'inherit', fontSize: '0.78rem' }}
                  >
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                    <option value="Center">Center</option>
                  </select>
                </td>

                {/* Measure */}
                <td style={{ padding: '3px 8px' }}>
                  <select
                    value={v.measure}
                    onChange={e => onUpdateVariable(idx, { measure: e.target.value as Measure })}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontWeight: 600,
                      color: 'inherit',
                      fontSize: '0.78rem'
                    }}
                  >
                    <option value="Scale">📏 Scale</option>
                    <option value="Ordinal">📶 Ordinal</option>
                    <option value="Nominal">⚪ Nominal</option>
                  </select>
                </td>

                {/* Role */}
                <td style={{ padding: '3px 8px' }}>
                  <select
                    value={v.role}
                    onChange={e => onUpdateVariable(idx, { role: e.target.value as VariableRole })}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: 'inherit', fontSize: '0.78rem' }}
                  >
                    <option value="Input">Input</option>
                    <option value="Target">Target</option>
                    <option value="Both">Both</option>
                    <option value="None">None</option>
                  </select>
                </td>

                {/* Delete */}
                <td style={{ textAlign: 'center' }}>
                  <button
                    className="tool-btn"
                    title="Delete Variable"
                    onClick={() => onDeleteVariable(idx)}
                    style={{ color: 'var(--danger)', padding: '3px', margin: '0 auto' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={onAddVariable} style={{ padding: '6px 14px' }}>
          <Plus size={14} /> Add New Variable
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {dataset.variables.length} variables registered in dataset dictionary
        </span>
      </div>
    </div>
  );
};
