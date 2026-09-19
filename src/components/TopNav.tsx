import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Moon, Sun, Database, Sparkles, Palette, Cloud, User, LogOut, ChevronDown, CheckCircle2, ShieldCheck, FileText, Layers } from 'lucide-react';
import { Dataset } from '../types';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type MenuActionItem = {
  type?: never;
  label: string;
  shortcut?: string;
  action: () => void;
};

type MenuDivider = { type: 'divider' };
type MenuSection = { type: 'section'; label: string };

type MenuItem = MenuActionItem | MenuDivider | MenuSection;

interface MenuDef {
  key: string;
  label: string;
  width?: string;
  items: MenuItem[];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TopNavProps {
  activeDataset: Dataset;
  activeTab: 'data' | 'variable' | 'output' | 'syntax';
  setActiveTab: (tab: 'data' | 'variable' | 'output' | 'syntax') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  openDialog: (dialogName: string) => void;
  onNewDataset: () => void;
  onOpenSample: (sampleKey: 'employee' | 'survey') => void;
  onExportCSV: () => void;
  onExportExcel?: () => void;
  onExportProject: () => void;
  onExportHTMLReport: () => void;
  onImportCSVClick: () => void;
  onImportExcelClick?: () => void;
  onClearData: () => void;
  onOpenTheme?: () => void;
  valueLabelsActive: boolean;
  setValueLabelsActive: (v: boolean) => void;
  onOpenCloudModal?: (mode: 'save' | 'open') => void;
  onOpenSaveModal?: () => void;
  hasUnsavedChanges?: boolean;
}

// Flag to toggle AI report visibility (can be enabled when requested)
export const SHOW_AI_REPORT = false;

// ─── Component ────────────────────────────────────────────────────────────────

export const TopNav: React.FC<TopNavProps> = ({
  activeDataset,
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  openDialog,
  onNewDataset,
  onOpenSample,
  onExportCSV,
  onExportExcel,
  onExportProject,
  onExportHTMLReport,
  onImportCSVClick,
  onImportExcelClick,
  onClearData,
  onOpenTheme,
  valueLabelsActive,
  setValueLabelsActive,
  onOpenCloudModal,
  onOpenSaveModal,
  hasUnsavedChanges = false,
}) => {
  const { user, profile, signOut, openAuthModal, isAdmin } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const toggleMenu = (key: string) =>
    setOpenMenu(prev => (prev === key ? null : key));

  // Execute an action and close the menu
  const runAction = useCallback(
    (action: () => void) => (e: React.MouseEvent) => {
      e.stopPropagation(); // prevent bubbling to parent menu-item
      action();
      setOpenMenu(null);
    },
    []
  );

  // ─── Menu Definitions (stable — no stale closures) ─────────────────────────

  const menus: MenuDef[] = [
    {
      key: 'file',
      label: 'File',
      items: [
        { label: 'New Dataset', shortcut: 'Ctrl+N', action: onNewDataset },
        { label: 'Import Excel (.xlsx, .xls)…', action: () => (onImportExcelClick ? onImportExcelClick() : onImportCSVClick()) },
        { label: 'Open Data (CSV, TSV, JSON)…', shortcut: 'Ctrl+O', action: onImportCSVClick },
        { type: 'divider' },
        { type: 'section', label: 'SAMPLE DATASETS' },
        { label: 'Employee Data (Classic Benchmark)', action: () => onOpenSample('employee') },
        { label: 'Customer Survey & NPS (Satisfaction)', action: () => onOpenSample('survey') },
        { type: 'divider' },
        { label: 'Save Project & Data…', shortcut: 'Ctrl+S', action: () => (onOpenSaveModal ? onOpenSaveModal() : onExportProject()) },
        { label: 'Export Dataset to Excel (.xlsx)…', action: () => (onExportExcel ? onExportExcel() : onExportCSV()) },
        { label: 'Export Dataset to CSV…', action: onExportCSV },
        { label: 'Export Output (APA 7th HTML)…', action: onExportHTMLReport },
        ...(SHOW_AI_REPORT ? [{ label: '🤖 Generate AI Research Report…', action: () => openDialog('ai_report') }] : []),
        { type: 'divider' },
        { type: 'section', label: 'CLOUD DATA & RESEARCH SYNC' },
        { label: '☁ Save Active Project to Cloud…', action: () => (onOpenSaveModal ? onOpenSaveModal() : onOpenCloudModal?.('save')) },
        { label: '☁ Open Project from Cloud…', action: () => onOpenCloudModal?.('open') },
        { type: 'divider' },
        { label: '🗑 Clear Current Data…', action: onClearData },
      ],
    },
    {
      key: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => document.execCommand('undo') },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => document.execCommand('redo') },
        { type: 'divider' },
        { label: 'Clear Current Data…', action: onClearData },
        { type: 'divider' },
        { label: 'Define Variables…', action: () => setActiveTab('variable') },
        {
          label: valueLabelsActive ? '✓ Value Labels ON' : 'Value Labels OFF',
          shortcut: '1↔A',
          action: () => setValueLabelsActive(!valueLabelsActive),
        },
      ],
    },
    {
      key: 'view',
      label: 'View',
      items: [
        { label: activeTab === 'data' ? '✓ Data View' : 'Data View', action: () => setActiveTab('data') },
        { label: activeTab === 'variable' ? '✓ Variable View' : 'Variable View', action: () => setActiveTab('variable') },
        { label: activeTab === 'output' ? '✓ Output Viewer' : 'Output Viewer', action: () => setActiveTab('output') },
        { label: activeTab === 'syntax' ? '✓ Syntax Editor' : 'Syntax Editor', action: () => setActiveTab('syntax') },
        { type: 'divider' },
        { label: '🎨 Theme Customizer…', action: () => onOpenTheme?.() },
        { label: isDarkMode ? '✓ Dark Mode' : 'Dark Mode', action: () => setIsDarkMode(!isDarkMode) },
      ],
    },
    {
      key: 'data',
      label: 'Data',
      items: [
        { label: 'Define Variable Properties…', action: () => setActiveTab('variable') },
        { label: 'Sort Cases…', action: () => setActiveTab('data') },
        { type: 'divider' },
        { label: 'Select Cases…', action: () => setActiveTab('data') },
        { label: 'Weight Cases…', action: () => setActiveTab('data') },
      ],
    },
    {
      key: 'transform',
      label: 'Transform',
      items: [
        { label: '⚡ Smart Data Health & Outlier Scan…', action: () => openDialog('health') },
        { type: 'divider' },
        { label: 'Compute Variable…', action: () => openDialog('compute') },
        { label: 'Recode into Same Variables…', action: () => openDialog('compute') },
        { label: 'Recode into Different Variables…', action: () => openDialog('compute') },
      ],
    },
    {
      key: 'analyze',
      label: 'Analyze',
      width: '295px',
      items: [
        ...(SHOW_AI_REPORT ? [
          { type: 'section' as const, label: 'AI RESEARCH COPILOT' },
          { label: '🤖 Generate Full AI Research Report…', action: () => openDialog('ai_report') },
          { type: 'divider' as const }
        ] : []),
        { type: 'section', label: 'DATA DIAGNOSTICS & QUALITY' },
        { label: '⚡ Smart Data Health & Outlier Inspector…', action: () => openDialog('health') },
        { type: 'divider' },
        { type: 'section', label: 'DESCRIPTIVE STATISTICS' },
        { label: 'Frequencies…', action: () => openDialog('frequencies') },
        { label: 'Descriptives…', action: () => openDialog('descriptives') },
        { label: 'Crosstabs (Chi-Square Test)…', action: () => openDialog('crosstabs') },
        { type: 'divider' },
        { type: 'section', label: 'COMPARE MEANS' },
        { label: 'Independent-Samples T-Test…', action: () => openDialog('ttest_indep') },
        { label: 'One-Way ANOVA…', action: () => openDialog('oneway_anova') },
        { type: 'divider' },
        { type: 'section', label: 'CORRELATION & REGRESSION' },
        { label: 'Bivariate Correlations (Pearson / Spearman)…', action: () => openDialog('correlation') },
        { label: 'Multiple Linear Regression…', action: () => openDialog('regression') },
        { type: 'divider' },
        { type: 'section', label: 'ADVANCED PROCEDURES' },
        { label: 'Factor Analysis / PCA…', action: () => openDialog('factor') },
        { label: 'K-Means Cluster…', action: () => openDialog('kmeans') },
        { label: "Reliability Analysis (Cronbach's α)…", action: () => openDialog('reliability') },
      ],
    },
    {
      key: 'graphs',
      label: 'Graphs',
      items: [
        { label: 'Bar Chart & Histogram…', action: () => openDialog('frequencies') },
        { label: 'Scatter Plot Matrix…', action: () => openDialog('regression') },
        { label: 'Scree Plot (Eigenvalues)…', action: () => openDialog('factor') },
        { label: 'Means Plot…', action: () => openDialog('oneway_anova') },
      ],
    },
    {
      key: 'utilities',
      label: 'Utilities',
      items: [
        ...(SHOW_AI_REPORT ? [
          { label: '🤖 Generate AI Research Report…', action: () => openDialog('ai_report') },
          { type: 'divider' as const }
        ] : []),
        { label: '⚡ Smart Data Health & Outlier Scan…', action: () => openDialog('health') },
        { label: 'Variables Information…', action: () => setActiveTab('variable') },
        { label: 'Compute Variable…', action: () => openDialog('compute') },
        { type: 'divider' },
        { label: 'Export HTML Report…', action: onExportHTMLReport },
      ],
    },
    {
      key: 'syntax',
      label: 'Syntax',
      items: [
        { label: 'Open Syntax Studio', action: () => setActiveTab('syntax') },
        { label: 'Run Syntax Commands', shortcut: 'Ctrl+R', action: () => setActiveTab('syntax') },
      ],
    },
    {
      key: 'help',
      label: 'Help',
      items: [
        { label: '✨ Features & Capabilities Matrix…', action: () => openDialog('features') },
        { label: '📋 Release Changelog…', action: () => openDialog('changelog') },
        { type: 'divider' },
        { type: 'section', label: 'LEGAL & PRIVACY' },
        { label: '🔒 Privacy Policy (GDPR / CCPA) ↗', action: () => window.open('/privacy', '_blank') },
        { label: '📄 Terms of Service ↗', action: () => window.open('/terms', '_blank') },
        { label: '🛡️ Community Data License (Fair Exchange) ↗', action: () => window.open('/license', '_blank') },
        { label: '⚖️ Academic Ethics & IRB FAQ ↗', action: () => window.open('/ethics', '_blank') },
        { type: 'divider' },
        { label: 'About Open SPSS Web…', action: () => openDialog('about') },
        { label: '⚖️ Legal & Trademark Notice…', action: () => openDialog('about') },
        { type: 'divider' },
        { label: '⭐ Developer: @lordskidgod (GitHub)', action: () => window.open('https://github.com/lordskidgod', '_blank') },
        { label: '🎓 Educational Purpose & Info', action: () => openDialog('about') },
      ],
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="top-nav-bar" ref={menuRef}>
      <div className="nav-main-row">

        {/* ── Brand Logo with Official User Icon ── */}
        <div className="brand-logo" title="Open SPSS Web v1.4.0 • Developed by JaNuK">
          <img
            src="/logo.png"
            alt="Open SPSS Logo"
            className="brand-logo-img"
          />
          <span className="brand-wordmark">
            <span className="brand-word-open">Open</span>
            <span className="brand-word-spss">SPSS</span>
          </span>
          <span className="brand-badge">v1.4.0</span>
        </div>

        <div className="nav-sep" />

        {/* ── Menu Bar ── */}
        <div className="menu-bar-inline">
          {menus.map(menu => (
            <div
              key={menu.key}
              id={`menu-${menu.key}`}
              className={`menu-item${openMenu === menu.key ? ' active' : ''}`}
              onClick={() => toggleMenu(menu.key)}
              role="button"
              aria-haspopup="true"
              aria-expanded={openMenu === menu.key}
            >
              {menu.label}

              {openMenu === menu.key && (
                <div
                  className="dropdown-menu"
                  style={menu.width ? { width: menu.width } : {}}
                  role="menu"
                >
                  {menu.items.map((item, idx) => {
                    if (item.type === 'divider') {
                      return <div key={idx} className="dropdown-divider" role="separator" />;
                    }
                    if (item.type === 'section') {
                      return (
                        <div key={idx} className="dropdown-section-header">
                          {item.label}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={idx}
                        id={`menu-${menu.key}-item-${idx}`}
                        className="dropdown-item"
                        role="menuitem"
                        tabIndex={0}
                        onClick={runAction(item.action)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') runAction(item.action)(e as any); }}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="dropdown-shortcut">{item.shortcut}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Right Utilities ── */}
        <div className="nav-right-utils">

          {/* Dataset info chip */}
          <div
            className="dataset-chip"
            title={`Dataset: ${activeDataset.name} — ${activeDataset.data.length} cases, ${activeDataset.variables.length} variables`}
          >
            <Database size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span className="ds-name">{activeDataset.name}</span>
            <span className="ds-meta">
              {activeDataset.data.length} × {activeDataset.variables.length}
            </span>
          </div>

          {/* Unsaved / Saved Status indicator */}
          <button
            id="btn-save-status"
            className="tool-btn"
            onClick={onOpenSaveModal}
            title={hasUnsavedChanges ? 'Unsaved changes. Click or press Ctrl+S to save.' : 'Project is saved. Click or press Ctrl+S to save/export.'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '0.74rem',
              fontWeight: 600,
              background: hasUnsavedChanges ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: hasUnsavedChanges ? '#d97706' : '#059669',
              border: `1px solid ${hasUnsavedChanges ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              cursor: 'pointer'
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: hasUnsavedChanges ? '#f59e0b' : '#10b981',
              display: 'inline-block'
            }} />
            <span>{hasUnsavedChanges ? 'Unsaved' : 'Saved'}</span>
          </button>

          {/* Value labels toggle */}
          <button
            id="btn-value-labels"
            className={`tool-btn${valueLabelsActive ? ' active' : ''}`}
            title={valueLabelsActive ? 'Value Labels: ON — click to show codes' : 'Value Labels: OFF — click to show labels'}
            onClick={() => setValueLabelsActive(!valueLabelsActive)}
            aria-pressed={valueLabelsActive}
          >
            <span style={{ fontWeight: 700, letterSpacing: '0.04em', fontSize: '0.76rem' }}>
              1↔A
            </span>
          </button>

          {/* Dark / Light mode toggle */}
          <button
            id="btn-dark-mode"
            className="tool-btn"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode
              ? <Sun size={15} style={{ color: '#fbbf24' }} />
              : <Moon size={15} />
            }
          </button>

          {/* Theme customizer button */}
          <button
            id="btn-theme"
            className="tool-btn"
            title="Customize Theme & Colors"
            onClick={() => onOpenTheme?.()}
            aria-label="Customize Theme & Colors"
          >
            <Palette size={15} style={{ color: 'var(--primary)' }} />
          </button>

          {/* Quick Analyze CTA */}
          <button
            id="btn-quick-analyze"
            className="btn btn-primary nav-cta"
            title="Quick Analyze — open Frequencies procedure"
            onClick={e => { e.stopPropagation(); openDialog('frequencies'); }}
          >
            <Sparkles size={13} />
            Analyze
          </button>

          {/* Supabase User & Cloud Account Section */}
          {user ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                id="btn-user-profile"
                className="tool-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  background: 'var(--bg-secondary, #f1f5f9)',
                  cursor: 'pointer'
                }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                title={`Signed in as ${user.email}`}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary, #2563eb), #6366f1)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {profile?.full_name ? profile.full_name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span style={{ fontSize: '0.76rem', fontWeight: 500, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <ChevronDown size={12} style={{ opacity: 0.6 }} />
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '6px',
                  minWidth: '240px',
                  background: 'var(--card-bg, #ffffff)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  zIndex: 2000,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color, #e2e8f0)', background: 'var(--header-bg, #f8fafc)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid var(--primary)'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary, #2563eb), #6366f1)',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {profile?.full_name ? profile.full_name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile?.full_name || 'Open SPSS Researcher'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </div>
                      <div style={{ marginTop: '3px' }}>
                        <span style={{
                          fontSize: '0.64rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: profile?.subscription_tier === 'pro' ? '#fef3c7' : '#e0f2fe',
                          color: profile?.subscription_tier === 'pro' ? '#b45309' : '#0369a1',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {profile?.subscription_tier === 'pro' ? 'Pro Plan (Private)' : 'Free Cloud Plan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '4px 0' }}>
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); onOpenCloudModal?.('save'); }}
                      style={{
                        width: '100%',
                        padding: '8px 14px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.78rem',
                        color: 'var(--text-primary, #0f172a)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg, #f1f5f9)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <Cloud size={14} style={{ color: 'var(--primary, #2563eb)' }} />
                      <span>Save Project to Cloud…</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); onOpenCloudModal?.('open'); }}
                      style={{
                        width: '100%',
                        padding: '8px 14px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.78rem',
                        color: 'var(--text-primary, #0f172a)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg, #f1f5f9)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <Database size={14} style={{ color: '#10b981' }} />
                      <span>My Cloud Datasets…</span>
                    </button>

                    {/* Admin portal — only visible to users with role='admin' */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); openDialog('admin'); }}
                        style={{
                          width: '100%',
                          padding: '8px 14px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          fontSize: '0.78rem',
                          color: 'var(--primary, #0f62fe)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg, #f1f5f9)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <Layers size={14} style={{ color: 'var(--primary, #0f62fe)' }} />
                        <span>Data Intelligence (Admin)</span>
                      </button>
                    )}

                    <div style={{ height: '1px', background: 'var(--border-color, #e2e8f0)', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); window.open('/privacy', '_blank'); }}
                      style={{
                        width: '100%',
                        padding: '8px 14px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary, #475569)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg, #f1f5f9)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <ShieldCheck size={14} style={{ color: '#10b981' }} />
                      <span>Privacy Policy &amp; Terms…</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); signOut(); }}
                      style={{
                        width: '100%',
                        padding: '8px 14px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.78rem',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg, #f1f5f9)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-nav-login"
              className="btn btn-secondary nav-cta"
              style={{
                fontSize: '0.76rem',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600
              }}
              title="Sign in or create free account for cloud sync"
              onClick={() => openAuthModal('signin')}
            >
              <Cloud size={14} style={{ color: 'var(--primary, #2563eb)' }} />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
