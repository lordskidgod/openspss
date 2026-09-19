import React, { useState, useRef } from 'react';
import { Dataset, Variable } from '../types';
import { ArrowUp, ArrowDown, Plus } from 'lucide-react';

interface DataViewProps {
  dataset: Dataset;
  valueLabelsActive: boolean;
  onUpdateCell: (rowIndex: number, colName: string, value: any) => void;
  onSortColumn: (colName: string, ascending: boolean) => void;
  onAddCase: () => void;
  onAddVariable: () => void;
}

export const DataView: React.FC<DataViewProps> = ({
  dataset,
  valueLabelsActive,
  onUpdateCell,
  onSortColumn,
  onAddCase,
  onAddVariable
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [sortState, setSortState] = useState<{ col: string; asc: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCellClick = (row: number, col: string) => {
    setSelectedCell({ row, col });
    setEditingCell(null);
  };

  const handleCellDoubleClick = (row: number, col: string) => {
    const rawVal = dataset.data[row]?.[col];
    setSelectedCell({ row, col });
    setEditingCell({ row, col });
    setEditValue(rawVal !== null && rawVal !== undefined ? String(rawVal) : '');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: string) => {
    if (editingCell) {
      if (e.key === 'Enter') saveEdit();
      else if (e.key === 'Escape') setEditingCell(null);
      return;
    }

    const varIndex = dataset.variables.findIndex(v => v.name === col);
    if (e.key === 'Enter') {
      handleCellDoubleClick(row, col);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (row < dataset.data.length - 1) setSelectedCell({ row: row + 1, col });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (row > 0) setSelectedCell({ row: row - 1, col });
    } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
      e.preventDefault();
      if (varIndex < dataset.variables.length - 1) setSelectedCell({ row, col: dataset.variables[varIndex + 1].name });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (varIndex > 0) setSelectedCell({ row, col: dataset.variables[varIndex - 1].name });
    }
  };

  const saveEdit = () => {
    if (!editingCell) return;
    const { row, col } = editingCell;
    const varDef = dataset.variables.find(v => v.name === col);
    let newVal: any = editValue.trim();
    if (newVal === '') newVal = null;
    else if (varDef?.type === 'Numeric') newVal = isNaN(Number(newVal)) ? null : Number(newVal);
    onUpdateCell(row, col, newVal);
    setEditingCell(null);
  };

  const handleHeaderClick = (colName: string) => {
    const newAsc = sortState?.col === colName ? !sortState.asc : true;
    setSortState({ col: colName, asc: newAsc });
    onSortColumn(colName, newAsc);
  };

  const renderMeasureBadge = (measure: string) => {
    if (measure === 'Scale') {
      return (
        <span className="measure-icon-badge scale" title="Measure: Scale (Continuous variable)">
          📏
        </span>
      );
    }
    if (measure === 'Ordinal') {
      return (
        <span className="measure-icon-badge ordinal" title="Measure: Ordinal (Rank-ordered variable)">
          📶
        </span>
      );
    }
    return (
      <span className="measure-icon-badge nominal" title="Measure: Nominal (Categorical variable)">
        ⚪
      </span>
    );
  };

  return (
    <div className="spreadsheet-container" tabIndex={0} style={{ minHeight: 0 }}>
      <table className="spss-grid-table">
        <thead>
          <tr>
            <th className="row-header" style={{ width: '48px', minWidth: '48px' }}>#</th>
            {dataset.variables.map(v => (
              <th
                key={v.id}
                style={{ width: `${Math.max(105, v.columns * 13)}px`, minWidth: '100px', cursor: 'pointer' }}
                onClick={() => handleHeaderClick(v.name)}
                title={`${v.label || v.name} | Type: ${v.type} | Measure: ${v.measure} — click to sort`}
                className="grid-col-header"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                    {renderMeasureBadge(v.measure)}
                    <span className="col-header-name" title={v.name}>{v.name}</span>
                  </div>
                  {sortState?.col === v.name && (
                    <span className="sort-indicator" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                      {sortState.asc ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                    </span>
                  )}
                </div>
              </th>
            ))}
            <th style={{ width: '68px', textAlign: 'center', background: 'var(--grid-header-bg)' }}>
              <button className="add-var-header-btn" title="Add New Variable" onClick={onAddVariable}>
                <Plus size={12} /> var
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {dataset.data.map((row, rIdx) => (
            <tr key={rIdx} className="grid-data-row">
              <th className="row-header">{rIdx + 1}</th>
              {dataset.variables.map(v => {
                const isSelected = selectedCell?.row === rIdx && selectedCell?.col === v.name;
                const isEditing = editingCell?.row === rIdx && editingCell?.col === v.name;
                const rawVal = row[v.name];
                let displayVal = rawVal !== null && rawVal !== undefined ? String(rawVal) : '';
                if (valueLabelsActive && v.values && v.values.length > 0 && rawVal !== null) {
                  const match = v.values.find(vl => String(vl.value) === String(rawVal));
                  if (match) displayVal = match.label;
                }
                return (
                  <td
                    key={v.id}
                    className={`grid-cell ${isSelected ? 'cell-active' : ''}`}
                    style={{ textAlign: v.align.toLowerCase() as any }}
                    onClick={() => handleCellClick(rIdx, v.name)}
                    onDoubleClick={() => handleCellDoubleClick(rIdx, v.name)}
                    onKeyDown={e => handleKeyDown(e, rIdx, v.name)}
                    tabIndex={0}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        className="cell-editor-input"
                        style={{ textAlign: v.align.toLowerCase() as any }}
                      />
                    ) : (
                      <>
                        <span className="cell-text">
                          {displayVal !== '' ? displayVal : <span className="cell-empty-dot">.</span>}
                        </span>
                        {isSelected && <span className="cell-handle" />}
                      </>
                    )}
                  </td>
                );
              })}
              <td style={{ background: 'var(--bg-surface-subtle)' }} />
            </tr>
          ))}
          <tr>
            <th className="row-header" style={{ cursor: 'pointer', background: 'var(--primary-light)', color: 'var(--primary)' }} onClick={onAddCase} title="Click to add new case">
              <Plus size={13} style={{ margin: '0 auto' }} />
            </th>
            {dataset.variables.map(v => (
              <td key={v.id} style={{ background: 'var(--bg-surface-subtle)' }}>&nbsp;</td>
            ))}
            <td style={{ background: 'var(--bg-surface-subtle)' }} />
          </tr>
        </tbody>
      </table>
    </div>
  );
};
