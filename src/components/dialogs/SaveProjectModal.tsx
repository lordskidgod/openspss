import React, { useEffect, useState } from 'react';
import {
  X,
  Cloud,
  HardDrive,
  FileSpreadsheet,
  FileText,
  Package,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';

import { Dataset, OutputItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  saveCloudProject,
  ProjectCategory,
} from '../../services/cloudStorageService';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDataset: Dataset;
  outputItems: OutputItem[];
  syntaxCode: string;
  importedFileName?: string;
  importedFileType?:
    | 'xlsx'
    | 'xls'
    | 'csv'
    | 'tsv'
    | 'ospss'
    | 'sample'
    | 'new';
  onSaveLocalSession: () => void;
  onRenameDataset: (newName: string) => void;
  onExportFile: (format: 'xlsx' | 'csv' | 'ospss') => void;
  onProjectSaved: () => void;
}

export const SaveProjectModal: React.FC<SaveProjectModalProps> = ({
  isOpen,
  onClose,
  activeDataset,
  outputItems,
  syntaxCode,
  importedFileName,
  importedFileType,
  onSaveLocalSession,
  onRenameDataset,
  onExportFile,
  onProjectSaved,
}) => {
  const { user, profile, openAuthModal } = useAuth();

  const [projectName, setProjectName] = useState<string>(
    activeDataset.name || 'Untitled_Project'
  );

  const [category, setCategory] =
    useState<ProjectCategory>('General');

  const [description, setDescription] =
    useState<string>('');

  const [isSavingCloud, setIsSavingCloud] =
    useState<boolean>(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  /*
   * Reset modal state whenever it opens
   */
  useEffect(() => {
    if (!isOpen) return;

    setProjectName(
      activeDataset.name || 'Untitled_Project'
    );

    setStatusMessage(null);
    setIsSavingCloud(false);
  }, [isOpen, activeDataset.name]);

  /*
   * Close modal with Escape key
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  /*
   * Don't render anything when modal is closed
   */
  if (!isOpen) {
    return null;
  }

  /*
   * Save to browser/local storage
   */
  const handleSaveToBrowser = () => {
    const trimmedName = projectName.trim();

    if (trimmedName && trimmedName !== activeDataset.name) {
      onRenameDataset(trimmedName);
    }

    onSaveLocalSession();
    onProjectSaved();

    setStatusMessage({
      type: 'success',
      text: 'Project successfully saved to this browser!',
    });

    setTimeout(() => {
      onClose();
    }, 900);
  };

  /*
   * Save to cloud
   */
  const handleSaveToCloud = async () => {
    const trimmedName = projectName.trim();

    if (!trimmedName) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide a project name.',
      });

      return;
    }

    /*
     * User isn't logged in.
     * Store the pending save so it can be handled
     * after authentication.
     */
    if (!user) {
      const pendingData = {
        name: trimmedName,
        category,
        description: description.trim(),
      };

      sessionStorage.setItem(
        'ospss_pending_cloud_save',
        JSON.stringify(pendingData)
      );

      onClose();
      openAuthModal('signup');

      return;
    }

    setIsSavingCloud(true);
    setStatusMessage(null);

    try {
      const isPro =
        profile?.subscription_tier === 'pro';

      const result = await saveCloudProject({
        name: trimmedName,
        category,
        description: description.trim(),

        dataset: {
          ...activeDataset,
          name: trimmedName,
        },

        outputItems,
        syntaxCode,
        isPro,
      });

      if (result.error) {
        setStatusMessage({
          type: 'error',
          text: result.error,
        });

        return;
      }

      /*
       * Update dataset name if user changed it
       */
      if (trimmedName !== activeDataset.name) {
        onRenameDataset(trimmedName);
      }

      onProjectSaved();

      setStatusMessage({
        type: 'success',
        text: `"${trimmedName}" saved to your cloud account!`,
      });

      setTimeout(() => {
        onClose();
      }, 1100);
    } catch (error) {
      console.error(
        'Cloud project save failed:',
        error
      );

      setStatusMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to save project to the cloud.',
      });
    } finally {
      setIsSavingCloud(false);
    }
  };

  /*
   * Determine imported file type
   */
  const isExcel =
    importedFileType === 'xlsx' ||
    importedFileType === 'xls';

  const isCSV =
    importedFileType === 'csv' ||
    importedFileType === 'tsv';

  /*
   * Export helper
   */
  const handleExport = (
    format: 'xlsx' | 'csv' | 'ospss'
  ) => {
    onExportFile(format);
    onProjectSaved();
    onClose();
  };

  return (
    <div
      className="auth-popup-backdrop"
      onClick={onClose}
    >
      <div
        className="auth-popup-card"
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width: '560px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          padding: 0,
          borderRadius: '16px',
          overflow: 'auto',
        }}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          style={{
            padding: '20px 24px',
            borderBottom:
              '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background:
              'var(--bg-surface-subtle, #f8fafc)',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              Save Project & Data
            </h2>

            <p
              style={{
                margin: '3px 0 0',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
              }}
            >
              {activeDataset.data.length} cases
              {' • '}
              {activeDataset.variables.length} variables
              {' • '}
              {outputItems.length} output
              {outputItems.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="tool-btn"
            aria-label="Close save project dialog"
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Status message */}

          {statusMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                background:
                  statusMessage.type === 'success'
                    ? '#dcfce7'
                    : '#fee2e2',
                color:
                  statusMessage.type === 'success'
                    ? '#15803d'
                    : '#b91c1c',
                border: `1px solid ${
                  statusMessage.type === 'success'
                    ? '#bbf7d0'
                    : '#fecaca'
                }`,
              }}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}

              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* =====================================================
              PROJECT NAME
          ====================================================== */}

          <div>
            <label
              htmlFor="save-project-name"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Project / Dataset Name
            </label>

            <input
              id="save-project-name"
              type="text"
              value={projectName}
              onChange={(event) =>
                setProjectName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSaveToCloud();
                }
              }}
              placeholder="e.g. Employee_Salaries_2026"
              maxLength={150}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border:
                  '1px solid var(--border-color, #cbd5e1)',
                background:
                  'var(--bg-surface, #ffffff)',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* =====================================================
              OPTIONAL DESCRIPTION
          ====================================================== */}

          <div>
            <label
              htmlFor="save-project-description"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Description
              <span
                style={{
                  fontWeight: 400,
                  color: 'var(--text-muted)',
                  marginLeft: '6px',
                }}
              >
                Optional
              </span>
            </label>

            <textarea
              id="save-project-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Add a short description of this project..."
              maxLength={500}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border:
                  '1px solid var(--border-color, #cbd5e1)',
                background:
                  'var(--bg-surface, #ffffff)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* =====================================================
              CLOUD SAVE
          ====================================================== */}

          <div
            style={{
              border:
                '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              background:
                'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9px',
                    background:
                      'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    flexShrink: 0,
                  }}
                >
                  <Cloud size={20} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Save to Open SPSS Cloud
                    </span>

                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: user
                          ? profile?.subscription_tier ===
                            'pro'
                            ? '#dbeafe'
                            : '#dcfce7'
                          : '#dbeafe',
                        color: user
                          ? profile?.subscription_tier ===
                            'pro'
                            ? '#1e40af'
                            : '#15803d'
                          : '#1e40af',
                        padding: '2px 7px',
                        borderRadius: '12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user
                        ? profile?.subscription_tier ===
                          'pro'
                          ? '✦ PRO'
                          : '✓ FREE'
                        : 'FREE ACCOUNT'}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      lineHeight: '1.4',
                    }}
                  >
                    {user
                      ? `Syncs dataset, output tables & syntax to ${user.email}.`
                      : 'Create a free account to sync projects across devices and keep cloud backups.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveToCloud}
                disabled={isSavingCloud}
                className="btn btn-primary"
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  cursor: isSavingCloud
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: isSavingCloud ? 0.7 : 1,
                }}
              >
                {isSavingCloud ? (
                  <>
                    <Loader2
                      size={14}
                      className="spin-animation"
                    />
                    Saving...
                  </>
                ) : user ? (
                  <>
                    <Cloud size={14} />
                    Save to Cloud
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Sign In & Save
                  </>
                )}
              </button>
            </div>
          </div>

          {/* =====================================================
              LOCAL BROWSER SAVE
          ====================================================== */}

          <div
            style={{
              border:
                '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              background:
                'var(--bg-surface, #ffffff)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background:
                    'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  flexShrink: 0,
                }}
              >
                <HardDrive size={18} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Save to Local Browser Storage
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.4',
                  }}
                >
                  Saves your session in this browser.
                  No login required.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveToBrowser}
              className="btn btn-secondary"
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Save Locally
            </button>
          </div>

          {/* =====================================================
              EXPORT
          ====================================================== */}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.5px',
              }}
            >
              Export / Download Files
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: '10px',
              }}
            >
              {/* Excel */}

              {isExcel ? (
                <button
                  type="button"
                  onClick={() =>
                    handleExport('xlsx')
                  }
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                  }}
                  title="Export updated cases and columns to Excel"
                >
                  <FileSpreadsheet
                    size={16}
                    style={{
                      color: '#16a34a',
                      flexShrink: 0,
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      Save to Excel (.xlsx)
                    </div>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      Updated workbook
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleExport('xlsx')
                  }
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}
                >
                  <FileSpreadsheet
                    size={16}
                    style={{
                      color: '#16a34a',
                    }}
                  />

                  <span
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    Excel (.xlsx)
                  </span>
                </button>
              )}

              {/* CSV */}

              {isCSV ? (
                <button
                  type="button"
                  onClick={() =>
                    handleExport('csv')
                  }
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                  }}
                  title="Export updated cases and columns to CSV"
                >
                  <FileText
                    size={16}
                    style={{
                      color: '#2563eb',
                      flexShrink: 0,
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      Save to CSV (.csv)
                    </div>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        color:
                          'var(--text-muted)',
                      }}
                    >
                      Updated CSV file
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleExport('csv')
                  }
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                  }}
                >
                  <FileText
                    size={16}
                    style={{
                      color: '#2563eb',
                    }}
                  />

                  <span
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    CSV (.csv)
                  </span>
                </button>
              )}

              {/* Full OSpss Bundle */}

              <button
                type="button"
                onClick={() =>
                  handleExport('ospss')
                }
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  textAlign: 'left',
                  gridColumn: '1 / -1',
                }}
                title="Download the complete Open SPSS project bundle"
              >
                <Package
                  size={16}
                  style={{
                    color: '#8b5cf6',
                    flexShrink: 0,
                  }}
                />

                <div>
                  <div
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    Full Bundle (.ospss)
                  </div>

                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Data + Variables + Output +
                    Syntax
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* =====================================================
              CTRL + S TIP
          ====================================================== */}

          {(isExcel || isCSV) && (
            <p
              style={{
                margin: 0,
                fontSize: '0.77rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                lineHeight: '1.5',
              }}
            >
              💡 Tip: Press{' '}
              <kbd
                style={{
                  background:
                    'var(--bg-surface-subtle)',
                  border:
                    '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '1px 5px',
                  fontSize: '0.75rem',
                }}
              >
                Ctrl+S
              </kbd>{' '}
              to instantly re-export to{' '}
              {isExcel
                ? 'Excel (.xlsx)'
                : 'CSV (.csv)'}
              .
            </p>
          )}

          {/* Imported filename */}

          {importedFileName && (
            <div
              style={{
                textAlign: 'center',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={importedFileName}
            >
              Original file: {importedFileName}
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div
          style={{
            padding: '12px 24px',
            background:
              'var(--bg-surface-subtle, #f8fafc)',
            borderTop:
              '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.84rem',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};