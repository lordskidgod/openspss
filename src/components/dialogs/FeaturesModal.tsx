import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Search,
  CheckCircle2,
  Cpu,
  Database,
  Calculator,
  Code2,
  FileSpreadsheet,
  ShieldCheck,
  Palette,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface FeatureItem {
  id: string;
  category: 'stats' | 'data' | 'copilot' | 'formula' | 'code' | 'ui' | 'legal';
  title: string;
  badge: 'Core' | 'Enhanced' | 'New' | 'Unique';
  description: string;
  spssComparison: string;
  tags: string[];
}

const FEATURES_LIST: FeatureItem[] = [
  // Statistical Engine
  {
    id: 'f_freq',
    category: 'stats',
    title: 'Frequencies & Descriptives Engine',
    badge: 'Core',
    description: 'Calculate Means, Medians, Modes, Standard Deviations, Variances, Skewness, Kurtosis, SE Mean, Min/Max, and Quartiles.',
    spssComparison: 'Instant real-time client-side calculation with zero lag or license timeouts.',
    tags: ['Descriptive', 'Frequencies', 'Percentiles']
  },
  {
    id: 'f_ttest',
    category: 'stats',
    title: 'Independent-Samples T-Test',
    badge: 'Core',
    description: "Compare means between two groups. Automatically computes Student's t, Welch's t, Levene's test for equality of variances, and 95% Confidence Intervals.",
    spssComparison: "Auto-detects variance inequality and selects Welch's test automatically.",
    tags: ['T-Test', 'Levene', 'Compare Means']
  },
  {
    id: 'f_anova',
    category: 'stats',
    title: 'One-Way ANOVA with Means Diagnostics',
    badge: 'Core',
    description: 'Between-group variance analysis across 3+ levels with Between/Within SS, Mean Squares, F-ratio, p-values, and means breakdown.',
    spssComparison: 'Clean pivot tables with APA 7th reporting formatting.',
    tags: ['ANOVA', 'F-Test', 'Variance']
  },
  {
    id: 'f_regr',
    category: 'stats',
    title: 'Multiple Linear Regression',
    badge: 'Core',
    description: 'Predictive modeling with R, R², Adjusted R², Std. Error of Estimate, ANOVA F-test table, and B/Beta coefficients with 95% CIs.',
    spssComparison: 'Instant multi-predictor regression with zero cloud upload.',
    tags: ['Regression', 'R-Squared', 'Predictive']
  },
  {
    id: 'f_corr',
    category: 'stats',
    title: 'Bivariate Correlation Matrix (Pearson & Spearman)',
    badge: 'Core',
    description: 'Symmetric correlation matrix with 2-tailed significance flags (* p < .05, ** p < .01) supporting parametric and rank-based methods.',
    spssComparison: 'One-click toggle between Pearson r and Spearman rho.',
    tags: ['Correlations', 'Pearson', 'Spearman']
  },
  {
    id: 'f_factor',
    category: 'stats',
    title: 'Factor Analysis & PCA (Principal Components)',
    badge: 'Enhanced',
    description: 'Dimensionality reduction with Eigenvalues, % Variance Explained, Cumulative %, and interactive Scree Plot visualization.',
    spssComparison: 'Includes automatic Scree plot rendering in browser.',
    tags: ['PCA', 'Factor Analysis', 'Eigenvalues']
  },
  {
    id: 'f_rel',
    category: 'stats',
    title: "Reliability Analysis (Cronbach's Alpha)",
    badge: 'Core',
    description: "Test internal consistency across survey scales with Cronbach's Alpha, Item-Total Statistics, and Alpha-if-item-deleted diagnostics.",
    spssComparison: 'Helps validate survey constructs instantly.',
    tags: ['Psychometrics', 'Reliability', 'Cronbach']
  },
  {
    id: 'f_kmeans',
    category: 'stats',
    title: 'K-Means Clustering',
    badge: 'Enhanced',
    description: 'Unsupervised machine learning clustering into user-defined clusters with iteration convergence and final cluster center breakdown.',
    spssComparison: 'Runs purely in browser without Python or backend dependencies.',
    tags: ['Clustering', 'Machine Learning', 'Unsupervised']
  },

  // Assumption Co-Pilot
  {
    id: 'f_copilot_norm',
    category: 'copilot',
    title: 'Automated Statistical Assumption Co-Pilot',
    badge: 'Unique',
    description: 'Pre-flight diagnostic system checking Normality (Shapiro-Wilk/Skewness proxy), Levene equal variance test, sample size thresholds, and collinearity VIF.',
    spssComparison: 'SPSS requires manual pre-testing; Open SPSS Web scans assumptions before you run the test.',
    tags: ['Co-Pilot', 'Normality', 'Levene', 'VIF']
  },
  {
    id: 'f_health',
    category: 'copilot',
    title: 'Smart Data Health & Outlier Scanner',
    badge: 'Unique',
    description: '1-click comprehensive scan for missing values, Z-score outliers (> 3.0 SD), and skewness distribution anomalies with remediation guidance.',
    spssComparison: 'No built-in equivalent in standard SPSS without custom syntax scripts.',
    tags: ['Data Health', 'Outlier Detection', 'Data Quality']
  },

  // Formula & Data Management
  {
    id: 'f_formula',
    category: 'formula',
    title: 'Smart Formula Bar with Live 5-Row Preview',
    badge: 'Unique',
    description: 'Compute variable dialog with live row-by-row preview, instant error detection, variable autocompletion, and mathematical functions.',
    spssComparison: 'SPSS cannot preview computed rows before execution.',
    tags: ['Compute Variable', 'Live Preview', 'Formula']
  },
  {
    id: 'f_excel',
    category: 'data',
    title: 'Drag-and-Drop Excel (.xlsx / .xls) & CSV Import',
    badge: 'Enhanced',
    description: 'Drag any Excel or CSV file anywhere on the application. Auto-detects column headers, infers data types, and sets Scale/Nominal properties.',
    spssComparison: 'Seamless drag-and-drop with instant sheet parsing.',
    tags: ['Excel', 'CSV', 'Drag-and-Drop', 'Import']
  },
  {
    id: 'f_excel_exp',
    category: 'data',
    title: '1-Click Excel & APA HTML Export',
    badge: 'Enhanced',
    description: 'Export clean formatted Excel spreadsheets (.xlsx), CSV files, standalone JSON project bundles (.ospss), or publication-ready APA HTML reports.',
    spssComparison: 'Cleaner, modern export formats ready for Word or Google Docs.',
    tags: ['Export', 'Excel', 'APA 7th', 'HTML']
  },
  {
    id: 'f_spreadsheet',
    category: 'data',
    title: 'Dual View: Data View & Variable View',
    badge: 'Core',
    description: 'SPSS-standard dual view. Variable View manages Names, Types, Widths, Decimals, Labels, Value Labels (1=Male, 2=Female), Missing, and Measures.',
    spssComparison: 'Faithful reproduction of SPSS workflow with modern responsive UI.',
    tags: ['Data View', 'Variable View', 'Metadata']
  },
  {
    id: 'f_cloud',
    category: 'data',
    title: 'Cloud Project Vault & Cross-Device Sync',
    badge: 'New',
    description: 'Save and load full raw datasets, variable schemas, and output items directly to your secure cloud account with study categorization.',
    spssComparison: 'Enables instant cloud synchronization without managing local files across machines.',
    tags: ['Cloud Storage', 'Sync', 'Vault', 'Datasets']
  },

  // Code Generation
  {
    id: 'f_polyglot',
    category: 'code',
    title: 'Tri-Language Code Bridges (Python, R & SPSS Syntax)',
    badge: 'Unique',
    description: 'Every analysis automatically generates reproducible Python (pandas/scipy/statsmodels), R code (tidyverse/psych), and SPSS Syntax.',
    spssComparison: 'SPSS only pastes SPSS syntax; Open SPSS Web gives you Python and R code too.',
    tags: ['Python', 'R Language', 'SPSS Syntax', 'Reproducibility']
  },
  {
    id: 'f_syntax_editor',
    category: 'code',
    title: 'Interactive Syntax Studio',
    badge: 'Core',
    description: 'Integrated code editor with execution engine supporting FREQUENCIES, DESCRIPTIVES, T-TEST, ONEWAY, and REGRESSION syntax commands.',
    spssComparison: 'Fast, browser-based syntax execution without installation.',
    tags: ['Syntax Editor', 'CLI', 'Scripting']
  },

  // UI/UX & Theming
  {
    id: 'f_theme',
    category: 'ui',
    title: 'Full Theme Studio & Color Customizer',
    badge: 'New',
    description: 'Real-time CSS variable engine with 5 curated presets (IBM Blue, Deep Indigo, Emerald Teal, Crimson Rose, Obsidian Purple) and custom color pickers.',
    spssComparison: 'SPSS has a rigid legacy UI; Open SPSS Web is completely customizable with Dark Mode.',
    tags: ['Theming', 'Dark Mode', 'Custom Colors', 'Glassmorphism']
  },

  // Legal & Clean-Room
  {
    id: 'f_legal',
    category: 'legal',
    title: 'Independent Clean-Room Architecture',
    badge: 'Core',
    description: '100% independent JavaScript/WASM statistical engine with zero proprietary IBM SPSS binaries. Fully compliant educational open-source software.',
    spssComparison: 'Zero license keys, zero telemetry, zero IBM trademark infringement.',
    tags: ['Clean-Room', 'Open Source', 'Educational', 'Privacy']
  }
];

export const FeaturesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { key: 'all', label: 'All Features' },
    { key: 'stats', label: 'Statistical Engine' },
    { key: 'copilot', label: 'Assumption Co-Pilot' },
    { key: 'formula', label: 'Formula Bar' },
    { key: 'data', label: 'Data I/O & Excel' },
    { key: 'code', label: 'Python / R / Syntax' },
    { key: 'ui', label: 'Theming & UI' },
    { key: 'legal', label: 'Clean-Room Architecture' }
  ];

  const filteredFeatures = useMemo(() => {
    return FEATURES_LIST.filter(f => {
      const matchCat = selectedCategory === 'all' || f.category === selectedCategory;
      const matchQuery =
        searchQuery.trim() === '' ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const badgeColor = (badge: string) => {
    switch (badge) {
      case 'Unique': return '#8b5cf6';
      case 'New': return '#10b981';
      case 'Enhanced': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <div className="dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="spss-dialog modern-modal" style={{ width: '840px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="dialog-header modern-modal-header" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="modal-icon-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div className="dialog-title" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Open SPSS Web — Features & Capabilities
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                  {FEATURES_LIST.length} Features
                </span>
              </div>
              <div className="dialog-subtitle">
                Complete structured breakdown of all statistical, analytical, and workflow capabilities
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search & Category Tabs */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="val-label-input"
              placeholder="Search features by name, function, or keyword (e.g. ANOVA, Excel, Python, Normality)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', width: '100%', borderRadius: '8px' }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(c => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.74rem',
                  fontWeight: selectedCategory === c.key ? 700 : 500,
                  border: selectedCategory === c.key ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: selectedCategory === c.key ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: selectedCategory === c.key ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body: Feature Cards Grid */}
        <div className="dialog-body modern-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredFeatures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No features match your search query.</p>
            </div>
          ) : (
            filteredFeatures.map(feat => (
              <div
                key={feat.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {feat.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: `${badgeColor(feat.badge)}18`,
                        color: badgeColor(feat.badge),
                        border: `1px solid ${badgeColor(feat.badge)}33`
                      }}
                    >
                      {feat.badge}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {feat.tags.map(t => (
                      <span key={t} style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-surface-subtle)', color: 'var(--text-muted)' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {feat.description}
                </div>

                <div style={{ padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-surface-subtle)', borderLeft: '3px solid var(--primary)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>vs. Legacy SPSS:</span>
                  <span>{feat.spssComparison}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="dialog-footer modern-modal-footer" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Developed by <b>@lordskidgod</b> (GitHub) • Hobby Educational Project
          </div>
          <button className="btn btn-primary modal-primary-cta" onClick={onClose}>
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
