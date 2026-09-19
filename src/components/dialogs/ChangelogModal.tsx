import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  GitCommit,
  Sparkles,
  Zap,
  ShieldCheck,
  Tag,
  CheckCircle,
  FileCode,
  Layers,
  Palette,
  Calculator,
  UploadCloud
} from 'lucide-react';

export const CHANGELOG_STORAGE_KEY = 'open_spss_last_seen_changelog';

interface ReleaseItem {
  version: string;
  date: string;
  tag: 'Latest' | 'Major' | 'Feature Update' | 'Initial Release';
  title: string;
  summary: string;
  sections: {
    type: 'added' | 'changed' | 'improved' | 'fixed';
    items: string[];
  }[];
}

const RELEASES: ReleaseItem[] = [
  {
    version: 'v1.4.0',
    date: 'Current Release (September 2026)',
    tag: 'Latest',
    title: 'Google Sign-In, Cloud Project Vault, Terms & Privacy Center, and Smart Health Diagnostics',
    summary: 'Major enhancement introducing Google Single Sign-On (OAuth 2.0), comprehensive Terms of Service & Privacy Policy center, Cloud Project Vault, Smart Data Health scanning, and redesigned native modal dialogs.',
    sections: [
      {
        type: 'added',
        items: [
          'Google Single Sign-On (OAuth 2.0): One-click authentication with Google profile picture, display name, and automatic account linking for existing email accounts.',
          'Comprehensive Legal, Privacy & Terms Center: Dedicated multi-tab center for Terms of Service, GDPR/CCPA Privacy Policy, Community Data License (Fair Exchange Model), and Academic Ethics / IRB FAQ.',
          'Direct URL Legal Routing: Standalone hash navigation to #privacy, #terms, #license, and #ethics with crawler-accessible anchor links for Google OAuth compliance.',
          'Smart Data Health & Outlier Inspector: Instant scanning of dataset health, missing value rates, distribution skewness, Z-score outliers (>3 SD), and automated data-cleaning recommendations with live charts.',
          'Cloud Project Vault: Save and load complete datasets, variables metadata, and output tables directly to/from your private cloud account.',
          'Cloud User Authentication: Secure email/password and Google OAuth with persistent cross-device sessions.',
          'Research & Market Intelligence Categorization: Tag cloud projects by study type (Market Research, Consumer Surveys, E-Commerce, Academic, Healthcare, etc.).',
          'Strict Terms & License Consent: Mandatory explicit agreement checkbox before sign-up with full Pro tier zero-mining isolation guarantees.'
        ]
      },
      {
        type: 'improved',
        items: [
          'Modernized Native Modal Popups: Redesigned authentication, legal center, and cloud project dialogs with fixed viewport positioning, smooth scale-in animations, and Escape key dismissal.',
          'Help Menu Navigation: Dedicated "Legal & Privacy" section in Help dropdown and user profile menu for instant access to Terms and Policies.',
          'Header & Toolbar Experience: Integrated cloud account profile chip, user avatar image, real-time sync status, and direct Health scanner button.',
          'Clean Workspace Aesthetics: Streamlined status bar and navigation chrome with permanent crawlable footer links for Google OAuth compliance.'
        ]
      }
    ]
  },
  {
    version: 'v1.3.0',
    date: 'September 2026',
    tag: 'Feature Update',
    title: 'Assumption Co-Pilot, Excel Drag-and-Drop & Smart Formula Bar',
    summary: 'Major enhancement introducing pre-flight statistical diagnostic automation, seamless Excel import/export, and instant formula row previews.',
    sections: [
      {
        type: 'added',
        items: [
          'Automated Statistical Assumption Co-Pilot: Auto-scans Normality (Shapiro-Wilk W proxy), Levene variance test, and sample size before running T-Test and ANOVA.',
          'Multicollinearity & VIF diagnostics in Linear Regression to detect redundant predictors.',
          'Excel (.xlsx / .xls) Drag-and-Drop Import with automatic header detection, type inference, and measure classification.',
          'Export to Excel (.xlsx) 1-click option added to File menu alongside CSV and .ospss.',
          'Smart Formula Bar with Live 5-Row Preview: Real-time preview of computed values before modifying data.',
          'Math and aggregator functions added to Compute Variable: ZSCORE(), MEAN(), SUM(), MAX(), MIN(), LN(), LOG10().',
          'Features & Capabilities Matrix interactive catalog modal.',
          'Release Changelog interactive timeline viewer.'
        ]
      },
      {
        type: 'changed',
        items: [
          'Removed side Column Inspector from DataView per user request for a cleaner, full-width spreadsheet interface.',
          'Cleaned status bar to maintain professional desktop-software aesthetics.'
        ]
      },
      {
        type: 'improved',
        items: [
          'Enhanced drag-and-drop window listener with animated backdrop overlay.',
          'Optimized bundle size with on-demand dynamic import of Excel parser.'
        ]
      }
    ]
  },
  {
    version: 'v1.2.0',
    date: 'September 2026',
    tag: 'Feature Update',
    title: 'Tri-Language Code Bridges & Diagnostics',
    summary: 'Added automatic generation of Python, R, and SPSS Syntax scripts for all analyses, plus Data Health scanning.',
    sections: [
      {
        type: 'added',
        items: [
          'Multi-Language Code Bridges: Generate reproducible Python (pandas/scipy/statsmodels) and R (tidyverse/psych) code for any performed analysis.',
          'Interactive Output Viewer code tabs: Switch between SPSS Syntax, Python, and R code with 1-click copy.',
          'Data Health & Outlier Scanner: Automatic detection of missing values, Z-score outliers (> 3 SD), and skewness.',
          'Clean-room legal & trademark disclaimers in About modal and documentation.'
        ]
      },
      {
        type: 'improved',
        items: [
          'Refined APA 7th edition HTML export formatting for pivot tables.',
          'Enhanced responsive typography using Outfit font.'
        ]
      }
    ]
  },
  {
    version: 'v1.1.0',
    date: 'September 2026',
    tag: 'Major',
    title: 'Custom Theme Studio & Modern UI Upgrade',
    summary: 'Introduced complete theme customizer with curated presets and customizable CSS variables.',
    sections: [
      {
        type: 'added',
        items: [
          'Theme Studio with 5 presets: Classic IBM Blue, Deep Indigo, Emerald Teal, Crimson Rose, and Obsidian Purple.',
          'Custom HSL color pickers for Primary, Background, Surface, and Border styling.',
          'Dark Mode / Light Mode toggle with instant persistence in localStorage.',
          'Custom Open SPSS Web SVG logo deployed across header, favicon, and about dialogs.'
        ]
      },
      {
        type: 'improved',
        items: [
          'Glassmorphism dialog backdrops and smooth micro-animations.',
          'Refined syntax editor with code-block dark container styling.'
        ]
      }
    ]
  },
  {
    version: 'v1.0.0',
    date: 'September 2026',
    tag: 'Initial Release',
    title: 'Open SPSS Web Launch',
    summary: 'First release of Open SPSS Web — client-side statistical analysis suite inspired by IBM SPSS Statistics.',
    sections: [
      {
        type: 'added',
        items: [
          'SPSS-style Data View and Variable View with value labels, decimal places, widths, and measurement levels.',
          'Statistical Engine: Frequencies, Descriptives, Crosstabs (Chi-Square), Independent T-Test, One-Way ANOVA, Correlations, Multiple Linear Regression, Factor Analysis (PCA), Reliability (Cronbach Alpha), and K-Means Clustering.',
          'Syntax Editor with command interpreter for core procedures.',
          'CSV / TSV / OSPSS project file import and export.',
          'Pre-loaded benchmark datasets: Employee Salary Demographics and Customer Satisfaction Survey.'
        ]
      }
    ]
  }
];

export const CURRENT_RELEASE_VERSION = RELEASES[0]?.version || 'v1.4.0';

export const ChangelogModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState<string>('all');

  // Mark current version as seen in storage whenever the modal opens
  useEffect(() => {
    try {
      localStorage.setItem(CHANGELOG_STORAGE_KEY, CURRENT_RELEASE_VERSION);
    } catch (e) {
      // Ignore in case of private browsing or storage disabled
    }
  }, []);

  const filteredReleases = selectedVersion === 'all'
    ? RELEASES
    : RELEASES.filter(r => r.version === selectedVersion);

  const sectionBadgeColor = (type: 'added' | 'changed' | 'improved' | 'fixed') => {
    switch (type) {
      case 'added': return '#10b981';
      case 'improved': return '#3b82f6';
      case 'changed': return '#f59e0b';
      case 'fixed': return '#8b5cf6';
    }
  };

  return (
    <div className="dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="spss-dialog modern-modal" style={{ width: '800px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="dialog-header modern-modal-header" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="modal-icon-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <History size={18} />
            </div>
            <div>
              <div className="dialog-title" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Release Changelog & Update History
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>
                  {CURRENT_RELEASE_VERSION} Latest
                </span>
              </div>
              <div className="dialog-subtitle">
                Chronological record of releases, improvements, features, and fixes in Open SPSS Web
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Version Filter Bar */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Version:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setSelectedVersion('all')}
              style={{
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.74rem',
                fontWeight: selectedVersion === 'all' ? 700 : 500,
                border: selectedVersion === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: selectedVersion === 'all' ? 'var(--primary-light)' : 'var(--bg-surface)',
                color: selectedVersion === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              All Releases
            </button>
            {RELEASES.map(r => (
              <button
                key={r.version}
                onClick={() => setSelectedVersion(r.version)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.74rem',
                  fontWeight: selectedVersion === r.version ? 700 : 500,
                  border: selectedVersion === r.version ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: selectedVersion === r.version ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: selectedVersion === r.version ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {r.version}
              </button>
            ))}
          </div>
        </div>

        {/* Body: Timeline */}
        <div className="dialog-body modern-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredReleases.map((release, rIdx) => (
            <div
              key={release.version}
              style={{
                padding: '18px 20px',
                borderRadius: '12px',
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              {/* Release Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {release.version}
                  </span>
                  <span
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: release.tag === 'Latest' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                      color: release.tag === 'Latest' ? '#10b981' : '#3b82f6',
                      border: `1px solid ${release.tag === 'Latest' ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)'}`
                    }}
                  >
                    {release.tag}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {release.title}
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {release.date}
                </span>
              </div>

              <div style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {release.summary}
              </div>

              {/* Sections: Added, Changed, Improved */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {release.sections.map((sec, sIdx) => (
                  <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: `${sectionBadgeColor(sec.type)}18`,
                          color: sectionBadgeColor(sec.type)
                        }}
                      >
                        {sec.type}
                      </span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {sec.items.map((item, iIdx) => (
                        <li key={iIdx} style={{ fontSize: '0.76rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="dialog-footer modern-modal-footer" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Open SPSS Web • Maintained by <b>@lordskidgod</b>
          </div>
          <button className="btn btn-primary modal-primary-cta" onClick={onClose}>
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
