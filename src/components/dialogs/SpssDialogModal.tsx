import React, { useState, useEffect } from 'react';
import { Variable, Dataset } from '../../types';
import {
  X,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  HelpCircle,
  Search,
  Check,
  ChevronRight,
  Sparkles,
  Sliders,
  Info,
  Layers,
  Hash,
  Type
} from 'lucide-react';

export interface TargetGroup {
  id: string;
  title: string;
  description?: string;
  isMulti?: boolean;
  selectedVarNames: string[];
}

interface SpssDialogModalProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  dataset: Dataset;
  targetGroups: TargetGroup[];
  onTargetGroupsChange: (updated: TargetGroup[]) => void;
  onOk: () => void;
  onPaste: () => void;
  onClose: () => void;
  optionsContent?: React.ReactNode;
  helpContent?: React.ReactNode;
}

export const SpssDialogModal: React.FC<SpssDialogModalProps> = ({
  title,
  subtitle,
  icon,
  dataset,
  targetGroups,
  onTargetGroupsChange,
  onOk,
  onPaste,
  onClose,
  optionsContent,
  helpContent
}) => {
  const [selectedSourceVar, setSelectedSourceVar] = useState<string | null>(null);
  const [activeTargetGroupId, setActiveTargetGroupId] = useState<string>(targetGroups[0]?.id || '');
  const [selectedTargetVar, setSelectedTargetVar] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        if (canRun) onOk();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onOk]);

  // Collect all assigned variable names
  const assignedVarNames = new Set(targetGroups.flatMap(g => g.selectedVarNames));

  // Available source variables
  const availableVars = dataset.variables
    .filter(v => !assignedVarNames.has(v.name))
    .filter(v =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.label || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleTransferToTarget = () => {
    if (!selectedSourceVar) return;
    const group = targetGroups.find(g => g.id === activeTargetGroupId);
    if (!group) return;

    const newTargetGroups = targetGroups.map(g => {
      if (g.id === activeTargetGroupId) {
        return {
          ...g,
          selectedVarNames: g.isMulti !== false ? [...g.selectedVarNames, selectedSourceVar] : [selectedSourceVar]
        };
      }
      return g;
    });

    onTargetGroupsChange(newTargetGroups);
    setSelectedSourceVar(null);
  };

  const handleTransferToSource = () => {
    if (!selectedTargetVar) return;
    const newTargetGroups = targetGroups.map(g => {
      return {
        ...g,
        selectedVarNames: g.selectedVarNames.filter(v => v !== selectedTargetVar)
      };
    });

    onTargetGroupsChange(newTargetGroups);
    setSelectedTargetVar(null);
  };

  const handleRemoveSingle = (varName: string, groupId: string) => {
    const newTargetGroups = targetGroups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          selectedVarNames: g.selectedVarNames.filter(v => v !== varName)
        };
      }
      return g;
    });
    onTargetGroupsChange(newTargetGroups);
  };

  const handleReset = () => {
    const cleared = targetGroups.map(g => ({ ...g, selectedVarNames: [] }));
    onTargetGroupsChange(cleared);
    setSelectedSourceVar(null);
    setSelectedTargetVar(null);
  };

  const renderMeasureBadge = (measure: string, type?: string) => {
    if (measure === 'Scale') {
      return <span className="modal-measure-pill scale" title="Scale (Continuous numeric)">📏 Scale</span>;
    }
    if (measure === 'Ordinal') {
      return <span className="modal-measure-pill ordinal" title="Ordinal (Ranked categories)">📶 Ordinal</span>;
    }
    return <span className="modal-measure-pill nominal" title="Nominal (Categorical labels)">🏷️ Nominal</span>;
  };

  const canRun = targetGroups.some(g => g.selectedVarNames.length > 0);

  return (
    <div className="dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="spss-dialog modern-modal" role="dialog" aria-modal="true" aria-labelledby="dialog-heading">
        
        {/* Modal Header */}
        <div className="dialog-header modern-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="modal-icon-badge">
              {icon || <Sparkles size={16} />}
            </div>
            <div>
              <div id="dialog-heading" className="dialog-title">{title}</div>
              <div className="dialog-subtitle">
                {subtitle || `Statistical analysis procedure • Dataset: ${dataset.name}`}
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close dialog (Esc)">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="dialog-body modern-modal-body">

          {/* Expandable Procedure Info Box */}
          {helpContent && (
            <div className={`modal-help-drawer${showHelp ? ' open' : ''}`}>
              <div className="modal-help-header" onClick={() => setShowHelp(!showHelp)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>Statistical Procedure Guide & APA Notes</span>
                </div>
                <button className="tool-btn" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                  {showHelp ? 'Hide Guide' : 'Show Guide'}
                </button>
              </div>
              {showHelp && (
                <div className="modal-help-content">
                  {helpContent}
                </div>
              )}
            </div>
          )}

          {/* ── Variable Selector Two-Column Canvas ── */}
          <div className="var-picker-canvas">

            {/* Left Box: Source Variables */}
            <div className="var-box source-box">
              <div className="var-box-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={13} style={{ color: 'var(--primary)' }} />
                  <span className="var-box-title">Dataset Variables</span>
                  <span className="var-box-count">{availableVars.length}</span>
                </div>
              </div>

              {/* Search Filter input */}
              <div className="var-box-search">
                <Search size={12} className="var-search-icon" />
                <input
                  type="text"
                  className="var-search-input"
                  placeholder="Search variable name or label..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="var-search-clear" onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>

              {/* Variables Scroll List */}
              <div className="var-items-list">
                {availableVars.length === 0 ? (
                  <div className="var-list-empty">
                    {searchQuery ? 'No variables match filter.' : 'All variables assigned to target lists.'}
                  </div>
                ) : (
                  availableVars.map(v => {
                    const isSelected = selectedSourceVar === v.name;
                    return (
                      <div
                        key={v.id}
                        className={`var-item-card${isSelected ? ' selected' : ''}`}
                        onClick={() => {
                          setSelectedSourceVar(v.name);
                          setSelectedTargetVar(null);
                        }}
                        onDoubleClick={handleTransferToTarget}
                        title={`Double-click to move to ${targetGroups.find(g => g.id === activeTargetGroupId)?.title || 'target'}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <span className="var-type-icon">
                            {v.type === 'Numeric' ? <Hash size={11} /> : <Type size={11} />}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div className="var-card-name">{v.name}</div>
                            {v.label && <div className="var-card-label">{v.label}</div>}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {renderMeasureBadge(v.measure, v.type)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Middle: Transfer Buttons */}
            <div className="var-transfer-column">
              <button
                className="modal-transfer-btn"
                disabled={!selectedSourceVar}
                onClick={handleTransferToTarget}
                title="Transfer selected variable to active target list"
              >
                <ArrowRight size={15} />
              </button>
              <button
                className="modal-transfer-btn"
                disabled={!selectedTargetVar}
                onClick={handleTransferToSource}
                title="Remove selected variable from target list"
              >
                <ArrowLeft size={15} />
              </button>
            </div>

            {/* Right Box: Target Groups */}
            <div className="var-target-column">
              {targetGroups.map(group => {
                const isActive = activeTargetGroupId === group.id;
                return (
                  <div
                    key={group.id}
                    className={`var-box target-box${isActive ? ' active-target' : ''}`}
                    onClick={() => setActiveTargetGroupId(group.id)}
                  >
                    <div className="var-box-header">
                      <div>
                        <span className="var-box-title">{group.title}</span>
                        {group.isMulti === false && <span className="var-single-pill">Single</span>}
                      </div>
                      <span className="var-box-count">{group.selectedVarNames.length}</span>
                    </div>

                    <div className="var-items-list">
                      {group.selectedVarNames.length === 0 ? (
                        <div className="var-target-placeholder">
                          <span>Click a variable or double-click to place here</span>
                        </div>
                      ) : (
                        group.selectedVarNames.map(varName => {
                          const v = dataset.variables.find(item => item.name === varName);
                          const isSelected = selectedTargetVar === varName;
                          return (
                            <div
                              key={varName}
                              className={`var-item-card target-item${isSelected ? ' selected' : ''}`}
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedTargetVar(varName);
                                setSelectedSourceVar(null);
                                setActiveTargetGroupId(group.id);
                              }}
                              onDoubleClick={handleTransferToSource}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                <span className="var-type-icon">
                                  {v?.type === 'Numeric' ? <Hash size={11} /> : <Type size={11} />}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                  <div className="var-card-name">{varName}</div>
                                  {v?.label && <div className="var-card-label">{v.label}</div>}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {v && renderMeasureBadge(v.measure, v.type)}
                                <button
                                  className="var-tag-remove"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRemoveSingle(varName, group.id);
                                  }}
                                  title="Remove variable"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Procedure Custom Options Slot */}
          {optionsContent && (
            <div className="modal-options-panel">
              <div className="modal-options-header">
                <Sliders size={13} style={{ color: 'var(--primary)' }} />
                <span>Procedure Settings & Options</span>
              </div>
              <div className="modal-options-body">
                {optionsContent}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="dialog-footer modern-modal-footer">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={handleReset} title="Reset all variable assignments">
              <RotateCcw size={13} /> Reset
            </button>
            {helpContent && !showHelp && (
              <button className="btn btn-secondary" onClick={() => setShowHelp(true)} title="View procedure documentation">
                <HelpCircle size={13} /> Guide
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-secondary"
              disabled={!canRun}
              onClick={onPaste}
              title="Paste SPSS syntax command into Syntax Editor"
            >
              Paste Syntax
            </button>
            <button
              className="btn btn-primary modal-primary-cta"
              disabled={!canRun}
              onClick={onOk}
              title="Run analysis and display in Output Viewer (Ctrl+Enter)"
            >
              Run Analysis
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
