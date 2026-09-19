import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  saveCloudProject, 
  listCloudProjects, 
  loadCloudProject, 
  deleteCloudProject, 
  CloudProjectSummary, 
  ProjectCategory 
} from '../../services/cloudStorageService';
import { Dataset, OutputItem } from '../../types';
import { 
  Cloud, 
  X, 
  Save, 
  FolderOpen, 
  Trash2, 
  RefreshCw, 
  Tag, 
  Layers, 
  Table, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Lock
} from 'lucide-react';

interface CloudProjectsModalProps {
  isOpen: boolean;
  mode: 'save' | 'open';
  onClose: () => void;
  activeDataset: Dataset;
  outputItems: OutputItem[];
  syntaxCode: string;
  onLoadProject: (dataset: Dataset, outputs: OutputItem[], syntax?: string) => void;
}

const CATEGORIES: ProjectCategory[] = [
  'Market Research',
  'Consumer & Dating Surveys',
  'E-Commerce & Tech',
  'Academic & Psychology',
  'Finance & Business',
  'Healthcare & Bio',
  'General',
];

export const CloudProjectsModal: React.FC<CloudProjectsModalProps> = ({
  isOpen,
  mode: initialMode,
  onClose,
  activeDataset,
  outputItems,
  syntaxCode,
  onLoadProject,
}) => {
  const { user, profile, openAuthModal } = useAuth();
  const [mode, setMode] = useState<'save' | 'open'>(initialMode);
  
  // Save form state
  const [projectName, setProjectName] = useState(activeDataset.name || 'Untitled Analysis');
  const [category, setCategory] = useState<ProjectCategory>('Market Research');
  const [description, setDescription] = useState('');
  
  // Project list state
  const [projects, setProjects] = useState<CloudProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setStatusMessage(null);
    setProjectName(activeDataset.name || 'Untitled Analysis');
  }, [initialMode, isOpen, activeDataset]);

  // Load project list when opened in 'open' mode or user logged in
  const fetchProjectList = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await listCloudProjects();
    setIsLoading(false);
    if (error) {
      setStatusMessage({ type: 'error', text: error });
    } else {
      setProjects(data);
    }
  };

  useEffect(() => {
    if (isOpen && user && mode === 'open') {
      fetchProjectList();
    }
  }, [isOpen, user, mode]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // If user is not logged in, prompt to log in
  if (!user) {
    return (
      <div 
        className="auth-popup-backdrop" 
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div 
          className="auth-popup-card" 
          onClick={e => e.stopPropagation()} 
          style={{ width: '420px', padding: '28px 24px', textAlign: 'center' }}
        >
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            margin: '0 auto 16px'
          }}>
            <img
              src="/logo.png"
              alt="Open SPSS Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 600 }}>Sign In for Cloud Storage</h3>
          <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', lineHeight: '1.5' }}>
            Cloud project storage, cross-device sync, and dataset management require a free Open SPSS cloud account.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: '8px' }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={() => {
                onClose();
                openAuthModal('signin');
              }}
              style={{ padding: '10px 20px', borderRadius: '8px' }}
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide a project name.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    const isPro = profile?.subscription_tier === 'pro';

    const res = await saveCloudProject({
      name: projectName,
      category,
      description,
      dataset: activeDataset,
      outputItems,
      syntaxCode,
      isPro,
    });

    setIsLoading(false);

    if (res.error) {
      setStatusMessage({ type: 'error', text: res.error });
    } else {
      setStatusMessage({ type: 'success', text: `Project "${projectName}" saved successfully to Cloud!` });
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  // Handle Load
  const handleLoad = async (project: CloudProjectSummary) => {
    setIsLoading(true);
    setStatusMessage(null);

    const res = await loadCloudProject(project.id);
    setIsLoading(false);

    if (res.error || !res.data) {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to load project details.' });
      return;
    }

    const loadedDataset: Dataset = {
      id: res.data.id,
      name: res.data.name,
      variables: res.data.variables_schema || [],
      data: res.data.raw_data || [],
    };

    onLoadProject(loadedDataset, res.data.output_items || [], res.data.syntax_code);
    onClose();
  };

  // Handle Delete
  const handleDelete = async (projectId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the cloud?`)) return;

    setIsLoading(true);
    const res = await deleteCloudProject(projectId);
    setIsLoading(false);

    if (res.error) {
      setStatusMessage({ type: 'error', text: res.error });
    } else {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setStatusMessage({ type: 'success', text: `Project "${name}" deleted.` });
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div 
      className="auth-popup-backdrop" 
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="auth-popup-card" 
        onClick={e => e.stopPropagation()}
        style={{ width: '640px', maxWidth: 'calc(100vw - 32px)' }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--header-bg, #f8fafc)',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--bg-surface, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              flexShrink: 0
            }}>
              <img
                src="/logo.png"
                alt="Open SPSS Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                {mode === 'save' ? 'Save Project to Cloud' : 'My Cloud Datasets & Projects'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                {user.email} • {profile?.subscription_tier === 'pro' ? 'Pro Tier (Private)' : 'Free Cloud Tier'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mode switch */}
            <div style={{ display: 'flex', background: 'var(--tab-bg, #e2e8f0)', borderRadius: '6px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => { setMode('save'); setStatusMessage(null); }}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: mode === 'save' ? 'var(--bg-primary, #ffffff)' : 'transparent',
                  color: mode === 'save' ? 'var(--primary, #2563eb)' : 'var(--text-muted, #64748b)',
                  fontWeight: mode === 'save' ? 600 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Save Active
              </button>
              <button
                type="button"
                onClick={() => { setMode('open'); setStatusMessage(null); fetchProjectList(); }}
                style={{
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: mode === 'open' ? 'var(--bg-primary, #ffffff)' : 'transparent',
                  color: mode === 'open' ? 'var(--primary, #2563eb)' : 'var(--text-muted, #64748b)',
                  fontWeight: mode === 'open' ? 600 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Browse ({projects.length})
              </button>
            </div>
            <button 
              onClick={onClose} 
              className="tool-btn" 
              style={{ padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div style={{
            margin: '12px 20px 0',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: statusMessage.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: statusMessage.type === 'error' ? '#b91c1c' : '#15803d',
            border: `1px solid ${statusMessage.type === 'error' ? '#fecaca' : '#bbf7d0'}`
          }}>
            {statusMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content Area */}
        <div style={{ padding: '20px' }}>
          {mode === 'save' ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. Q3 Customer Satisfaction & Churn Survey"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Research Category / Industry *
                </label>
                <div style={{ position: 'relative' }}>
                  <Tag size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ProjectCategory)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      background: 'var(--input-bg, #ffffff)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.88rem'
                    }}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  Description / Study Objective (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Notes about sample population, hypothesis, or methodology..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.88rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Data Summary Card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--card-bg, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary, #2563eb)' }}>
                    {activeDataset.data.length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Cases / Rows</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                    {activeDataset.variables.length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Variables</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>
                    {outputItems.length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Output Items</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  style={{ padding: '9px 16px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600
                  }}
                >
                  <Save size={16} />
                  <span>{isLoading ? 'Saving...' : 'Save to Cloud'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Search & Refresh */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Search saved datasets by name or category..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  className="tool-btn"
                  title="Refresh List"
                  onClick={fetchProjectList}
                  disabled={isLoading}
                  style={{ padding: '8px 12px' }}
                >
                  <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
                </button>
              </div>

              {/* Projects List */}
              <div style={{
                maxHeight: '360px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {isLoading && projects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted, #64748b)' }}>
                    Loading your cloud datasets...
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '36px 20px',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-color, #cbd5e1)',
                    color: 'var(--text-muted, #64748b)'
                  }}>
                    <FolderOpen size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No cloud projects found</p>
                    <p style={{ margin: '4px 0 12px', fontSize: '0.8rem' }}>
                      Switch to "Save Active" above to save your current analysis dataset to the cloud.
                    </p>
                  </div>
                ) : (
                  filteredProjects.map(proj => (
                    <div
                      key={proj.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        background: 'var(--card-bg, #f8fafc)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary, #0f172a)' }}>
                            {proj.name}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            fontWeight: 500
                          }}>
                            {proj.category}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginTop: '4px',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted, #64748b)'
                        }}>
                          <span>{proj.row_count} Cases</span>
                          <span>•</span>
                          <span>{proj.col_count} Variables</span>
                          <span>•</span>
                          <span>{new Date(proj.updated_at).toLocaleDateString()}</span>
                        </div>
                        {proj.description && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary, #475569)',
                            marginTop: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {proj.description}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleLoad(proj)}
                          disabled={isLoading}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FolderOpen size={14} />
                          <span>Load</span>
                        </button>
                        <button
                          type="button"
                          className="tool-btn"
                          title="Delete project"
                          onClick={() => handleDelete(proj.id, proj.name)}
                          disabled={isLoading}
                          style={{ padding: '6px', color: '#ef4444' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
