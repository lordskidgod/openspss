import React, { useState } from 'react';
import { Variable, ValueLabel } from '../../types';
import { X, Plus, Trash2, Tag, Sparkles, Check } from 'lucide-react';

interface ValueLabelsModalProps {
  variable: Variable;
  onSave: (values: ValueLabel[]) => void;
  onClose: () => void;
}

const PRESET_LABEL_SETS: { name: string; labels: ValueLabel[] }[] = [
  {
    name: 'Gender (1=Male, 2=Female)',
    labels: [
      { value: 1, label: 'Male' },
      { value: 2, label: 'Female' }
    ]
  },
  {
    name: 'Binary (0=No, 1=Yes)',
    labels: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ]
  },
  {
    name: '5-Point Likert (Agreement)',
    labels: [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' }
    ]
  },
  {
    name: '5-Point Satisfaction',
    labels: [
      { value: 1, label: 'Very Dissatisfied' },
      { value: 2, label: 'Dissatisfied' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Satisfied' },
      { value: 5, label: 'Very Satisfied' }
    ]
  }
];

export const ValueLabelsModal: React.FC<ValueLabelsModalProps> = ({
  variable,
  onSave,
  onClose
}) => {
  const [labels, setLabels] = useState<ValueLabel[]>([...(variable.values || [])]);
  const [newValue, setNewValue] = useState<string>('');
  const [newLabel, setNewLabel] = useState<string>('');

  const handleAdd = () => {
    if (newValue.trim() === '' || newLabel.trim() === '') return;
    const parsedVal = variable.type === 'Numeric' && !isNaN(Number(newValue)) ? Number(newValue) : newValue.trim();
    const filtered = labels.filter(l => String(l.value) !== String(parsedVal));
    setLabels([...filtered, { value: parsedVal, label: newLabel.trim() }].sort((a, b) => {
      if (typeof a.value === 'number' && typeof b.value === 'number') return a.value - b.value;
      return String(a.value).localeCompare(String(b.value));
    }));
    setNewValue('');
    setNewLabel('');
  };

  const handleRemove = (val: string | number) => {
    setLabels(labels.filter(l => String(l.value) !== String(val)));
  };

  const applyPreset = (presetLabels: ValueLabel[]) => {
    setLabels([...presetLabels]);
  };

  return (
    <div className="dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="spss-dialog modern-modal" style={{ width: '520px' }}>
        
        {/* Header */}
        <div className="dialog-header modern-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="modal-icon-badge">
              <Tag size={15} />
            </div>
            <div>
              <div className="dialog-title">Value Labels: {variable.name}</div>
              <div className="dialog-subtitle">{variable.label || 'Assign categorical labels to numeric values'}</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close (Esc)"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="dialog-body modern-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Quick Presets */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              Quick Presets
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_LABEL_SETS.map(preset => (
                <button
                  key={preset.name}
                  className="modal-preset-btn"
                  onClick={() => applyPreset(preset.labels)}
                  title={`Apply ${preset.name}`}
                >
                  <Sparkles size={11} style={{ color: 'var(--primary)' }} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Form */}
          <div className="val-labels-form">
            <div style={{ width: '90px' }}>
              <label className="val-label-field-title">Value</label>
              <input
                type="text"
                className="val-label-input"
                value={newValue}
                placeholder="e.g. 1"
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="val-label-field-title">Label Description</label>
              <input
                type="text"
                className="val-label-input"
                value={newLabel}
                placeholder="e.g. Clerical / Administrative"
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={!newValue.trim() || !newLabel.trim()}
              style={{ height: '34px', padding: '0 12px' }}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {/* Labels List */}
          <div className="val-labels-box">
            <div className="val-labels-box-header">
              <span>Defined Value Labels</span>
              <span className="var-box-count">{labels.length}</span>
            </div>
            <div className="val-labels-items">
              {labels.length === 0 ? (
                <div className="var-list-empty" style={{ padding: '24px 16px' }}>
                  No value labels assigned yet. Type a value & label above or click a quick preset.
                </div>
              ) : (
                labels.map(l => (
                  <div key={String(l.value)} className="val-label-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="val-badge">{String(l.value)}</span>
                      <span style={{ color: 'var(--text-muted)' }}>=</span>
                      <span className="val-text">"{l.label}"</span>
                    </div>
                    <button
                      className="var-tag-remove"
                      onClick={() => handleRemove(l.value)}
                      title={`Remove value label ${String(l.value)}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="dialog-footer modern-modal-footer">
          <button className="btn btn-secondary" onClick={() => setLabels([])} disabled={labels.length === 0}>
            Clear All
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { onSave(labels); onClose(); }}>
              <Check size={14} /> Save Labels
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
