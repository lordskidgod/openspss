import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  Scale,
  Database,
  Lock,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Search,
  BookOpen,
  FileText,
  Moon,
  Sun,
  ChevronUp,
  ChevronRight,
  ExternalLink,
  Info,
  Key,
  Cpu,
  Download,
  Share2,
  Copy,
  Check,
  HelpCircle,
  Award,
  Sparkles,
  Layers,
  Fingerprint,
  FileCheck2,
  EyeOff
} from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'license' | 'ethics';

interface LegalPageProps {
  initialTab?: LegalTab | 'privacy' | 'terms';
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  initialTab = 'privacy',
  isDarkMode,
  setIsDarkMode,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(
    (initialTab === 'terms' || initialTab === 'license' || initialTab === 'ethics') ? initialTab : 'privacy'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  // Sync tab with initialTab prop changes
  useEffect(() => {
    if (initialTab === 'terms' || initialTab === 'license' || initialTab === 'ethics' || initialTab === 'privacy') {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Handle native window/body scrolling so standard browser scroll and trackpad gestures work seamlessly
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlHeight = document.documentElement.style.height;

    // Allow window to scroll natively
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';

    window.scrollTo(0, 0);

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // ScrollSpy detection for table of contents
      const sections = document.querySelectorAll<HTMLElement>('.legal-section[id]');
      let currentSection = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 150;
        if (window.scrollY >= top) {
          currentSection = sec.getAttribute('id') || '';
        }
      });
      if (currentSection) {
        setActiveSectionId(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.height = originalBodyHeight;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.height = originalHtmlHeight;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const switchTab = (tab: LegalTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setActiveSectionId('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const newPath = tab === 'terms' ? '/terms' : tab === 'privacy' ? '/privacy' : `/${tab}`;
    window.history.pushState({}, '', newPath);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSectionId(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {}
  };

  const handleCopyCitation = () => {
    const citation = `JaNuK. (2026). Open SPSS Web: Accessible browser-native statistical analysis workbench (Version 1.4.0) [Computer software]. https://openspss.xyz`;
    try {
      navigator.clipboard.writeText(citation);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2200);
    } catch {}
  };

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Table of Contents Definitions for each tab
  const tableOfContents = useMemo(() => {
    switch (activeTab) {
      case 'privacy':
        return [
          { id: 'sec-info', title: '1. Information We Collect', icon: <Database size={14} /> },
          { id: 'sec-never', title: '2. What We NEVER Do', icon: <EyeOff size={14} /> },
          { id: 'sec-gdpr', title: '3. EU GDPR & UK Rights', icon: <Globe size={14} /> },
          { id: 'sec-ccpa', title: '4. California CCPA / CPRA', icon: <ShieldCheck size={14} /> },
          { id: 'sec-fair-exchange', title: '5. Community Data License', icon: <Scale size={14} /> },
          { id: 'sec-security', title: '6. Security & Safeguards', icon: <Lock size={14} /> },
        ];
      case 'terms':
        return [
          { id: 'sec-clean-room', title: '1. Clean-Room Architecture', icon: <Scale size={14} /> },
          { id: 'sec-accounts', title: '2. User Accounts & SSO', icon: <Fingerprint size={14} /> },
          { id: 'sec-ownership', title: '3. 100% Data Ownership', icon: <FileCheck2 size={14} /> },
          { id: 'sec-tiers', title: '4. Service Tiers & Storage', icon: <Layers size={14} /> },
          { id: 'sec-acceptable', title: '5. Acceptable Use Policy', icon: <AlertTriangle size={14} /> },
          { id: 'sec-liability', title: '6. Warranties & Liability', icon: <Award size={14} /> },
        ];
      case 'license':
        return [
          { id: 'sec-lic-scope', title: '1. Scope of Free License', icon: <Database size={14} /> },
          { id: 'sec-lic-deid', title: '2. Mandatory De-Identification', icon: <ShieldCheck size={14} /> },
          { id: 'sec-lic-pro', title: '3. Pro Zero-Mining SLA', icon: <Lock size={14} /> },
          { id: 'sec-lic-offline', title: '4. 100% Offline Local Mode', icon: <Globe size={14} /> },
        ];
      case 'ethics':
        return [
          { id: 'sec-eth-thesis', title: '1. Thesis & Dissertation Use', icon: <BookOpen size={14} /> },
          { id: 'sec-eth-irb', title: '2. IRB Human-Subjects Text', icon: <FileText size={14} /> },
          { id: 'sec-eth-cite', title: '3. APA 7th Citation Guide', icon: <Award size={14} /> },
          { id: 'sec-eth-verify', title: '4. Algorithmic Verification', icon: <Cpu size={14} /> },
        ];
    }
  }, [activeTab]);

  return (
    <div
      className="legal-page-container"
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg-main, #0b0f19)',
        color: 'var(--text-primary, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        lineHeight: 1.65,
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      <style>{`
        /* Text selection allowed on legal docs */
        .legal-page-container,
        .legal-page-container * {
          user-select: text !important;
        }

        .legal-page-container button,
        .legal-page-container a,
        .legal-page-container .no-select {
          user-select: none !important;
        }

        /* Scroll offset compensation for sticky headers */
        .legal-section,
        .legal-page-container [id^="sec-"] {
          scroll-margin-top: 110px;
        }

        /* Subtle ambient gradient mesh background */
        .legal-ambient-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 1400px;
          height: 480px;
          background: radial-gradient(circle at 50% -20%, rgba(15, 98, 254, 0.16) 0%, rgba(139, 92, 246, 0.08) 45%, transparent 75%);
          pointer-events: none;
          z-index: 0;
        }

        /* Modern card design with smooth hover */
        .legal-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 26px 28px;
          box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        }

        .dark .legal-card {
          background: rgba(18, 24, 38, 0.85);
          border-color: rgba(255, 255, 255, 0.07);
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.45);
        }

        .legal-card:hover {
          border-color: var(--primary);
          box-shadow: 0 12px 32px -4px rgba(15, 98, 254, 0.12);
        }

        /* Sidebar item styling */
        .toc-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          width: 100%;
          text-align: left;
        }

        .toc-item:hover {
          background: var(--bg-surface-subtle);
          color: var(--text-primary);
          transform: translateX(3px);
        }

        .toc-item.active {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 700;
          border-color: rgba(15, 98, 254, 0.25);
        }

        /* Pill tabs styling */
        .nav-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border-radius: 9px;
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .nav-pill-btn:hover {
          background: var(--bg-surface-hover);
          color: var(--text-primary);
        }

        .nav-pill-btn.active {
          background: var(--primary);
          color: #ffffff !important;
          box-shadow: 0 4px 14px rgba(15, 98, 254, 0.35);
        }

        /* Responsive Layout */
        @media (max-width: 900px) {
          .legal-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .legal-sidebar {
            display: none !important;
          }
        }

        /* Header navigation styling - strictly single row */
        .legal-header-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-surface);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 0 32px;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          height: 56px !important;
          box-shadow: var(--shadow-xs);
          box-sizing: border-box;
          width: 100%;
        }

        /* Print formatting */
        @media print {
          .legal-header-nav,
          .sticky-subheader,
          .floating-back-top,
          .legal-sidebar,
          .legal-ambient-glow,
          .no-print {
            display: none !important;
          }
          .legal-page-container {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .legal-card {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            margin-bottom: 24px;
          }
        }
      `}</style>

      <div className="legal-ambient-glow" />

      {/* ── 1. Top Navigation Bar (Sticky Glassmorphism) ── */}
      <header
        className="legal-header-nav no-print"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Brand Logo & Wordmark */}
          <div
            className="brand-logo"
            onClick={onBack}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px' }}
            title="Return to Open SPSS Workspace"
          >
            <img
              src="/logo.png"
              alt="Open SPSS Logo"
              className="brand-logo-img"
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
            />
            <span className="brand-wordmark" style={{ fontSize: '1.12rem', fontWeight: 800 }}>
              <span className="brand-word-open">Open</span>
              <span className="brand-word-spss" style={{ color: 'var(--primary)' }}>SPSS</span>
            </span>
            <span
              className="brand-badge"
              style={{
                fontSize: '0.70rem',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: 700
              }}
            >
              v1.4.0
            </span>
          </div>

          <div style={{ height: '20px', width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />

          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.80rem', color: 'var(--text-muted)' }}>
            <span style={{ cursor: 'pointer' }} onClick={onBack}>Workspace</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Legal Center</span>
          </nav>
        </div>

        {/* Right Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-primary)',
              transition: 'all 0.15s'
            }}
            title="Copy direct shareable link"
          >
            {copiedLink ? <Check size={14} style={{ color: '#10b981' }} /> : <Share2 size={14} />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-primary)',
              transition: 'all 0.15s'
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={14} style={{ color: '#fbbf24' }} /> : <Moon size={14} />}
            <span>{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={() => window.print()}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-primary)',
              transition: 'all 0.15s'
            }}
            title="Print or Save as PDF"
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>

          {/* Return to Studio */}
          <button
            onClick={onBack}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <ArrowLeft size={15} />
            <span>Studio Workspace</span>
          </button>
        </div>
      </header>

      {/* ── 2. Hero Section ── */}
      <section
        style={{
          padding: '46px 28px 24px',
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            {/* Status Pill Badge with animated pulse */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
                borderRadius: '20px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '14px',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-primary)' }}>Published &amp; Active Worldwide</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span>Updated: September 17, 2026</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span>v1.4.0 Production</span>
            </div>

            <h1
              style={{
                fontSize: '2.7rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                margin: '0 0 10px 0',
                color: 'var(--text-primary)',
                lineHeight: 1.15
              }}
            >
              {activeTab === 'privacy' && 'Privacy Policy & Data Protection'}
              {activeTab === 'terms' && 'Terms of Service & Platform Usage'}
              {activeTab === 'license' && 'Community Data License & Fair Exchange'}
              {activeTab === 'ethics' && 'Academic Ethics, IRB & Citation Guide'}
            </h1>

            <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '780px' }}>
              {activeTab === 'privacy' && 'Our commitment to data minimization, zero advertising trackers, GDPR/CCPA compliance, and institutional-grade database security.'}
              {activeTab === 'terms' && 'Transparent rules of engagement, 100% researcher data ownership, independent clean-room architecture, and service tier specifications.'}
              {activeTab === 'license' && 'The transparent model powering free computing for students and researchers, paired with complete air-gapped private isolation for Pro tiers.'}
              {activeTab === 'ethics' && 'Clear guidance for university theses, IRB human-subjects protocol descriptions, and peer-reviewed journal publication citations.'}
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <ShieldCheck size={20} style={{ color: '#10b981' }} />
              <div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-primary)' }}>100% User Ownership</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Zero vendor lock-in</div>
              </div>
            </div>

            <div style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <Lock size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-primary)' }}>Row-Level Security</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PostgreSQL tenant isolation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div
          className="no-print"
          style={{
            marginTop: '32px',
            padding: '6px',
            background: 'var(--bg-surface-subtle)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'inline-flex',
            gap: '6px',
            flexWrap: 'wrap',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <button
            className={`nav-pill-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => switchTab('privacy')}
          >
            <ShieldCheck size={16} />
            <span>Privacy Policy (GDPR / CCPA)</span>
          </button>

          <button
            className={`nav-pill-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => switchTab('terms')}
          >
            <FileText size={16} />
            <span>Terms of Service (ToS)</span>
          </button>

          <button
            className={`nav-pill-btn ${activeTab === 'license' ? 'active' : ''}`}
            onClick={() => switchTab('license')}
          >
            <Database size={16} />
            <span>Community Data License</span>
          </button>

          <button
            className={`nav-pill-btn ${activeTab === 'ethics' ? 'active' : ''}`}
            onClick={() => switchTab('ethics')}
          >
            <BookOpen size={16} />
            <span>Academic Ethics &amp; IRB FAQ</span>
          </button>
        </div>
      </section>

      {/* ── 3. Dual-Column Main Content & Sticky Sidebar ── */}
      <div
        style={{
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          padding: '16px 28px 120px',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
          flex: 1
        }}
      >
        <div
          className="legal-layout-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '290px 1fr',
            gap: '36px',
            alignItems: 'start'
          }}
        >
          {/* ── LEFT STICKY SIDEBAR ── */}
          <aside
            className="legal-sidebar no-print"
            style={{
              position: 'sticky',
              top: '72px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Quick Search */}
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Search legal clauses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  transition: 'border-color 0.15s'
                }}
              />
            </div>

            {/* Table of Contents Card */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px 14px',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0 8px 10px',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>On This Page</span>
                <Sparkles size={13} style={{ color: 'var(--primary)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {tableOfContents.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`toc-item ${activeSectionId === item.id ? 'active' : ''}`}
                  >
                    <span style={{ flexShrink: 0, opacity: 0.8 }}>{item.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Help Callout Card */}
            <div
              style={{
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '0.80rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                <HelpCircle size={16} style={{ color: 'var(--primary)' }} />
                <span>Questions or IRB Inquiries?</span>
              </div>
              <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Need enterprise DPA agreements, HIPAA clearance, or a university bulk research license?
              </p>
              <a
                href="https://github.com/lordskidgod"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <span>Contact Developer (JaNuK)</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </aside>

          {/* ── RIGHT MAIN CONTENT AREA ── */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* TAB 1: PRIVACY POLICY                                             */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {activeTab === 'privacy' && (
              <>
                {/* 3 Pillars Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div className="legal-card" style={{ borderTop: '3px solid #10b981' }}>
                    <ShieldCheck size={26} style={{ color: '#10b981', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>Zero Ad Trackers</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      No third-party behavioral cookies, tracking pixels, or resale of personal identities.
                    </div>
                  </div>

                  <div className="legal-card" style={{ borderTop: '3px solid var(--primary)' }}>
                    <Lock size={26} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>Row-Level Security (RLS)</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      PostgreSQL database isolation ensuring only your verified account queries your datasets.
                    </div>
                  </div>

                  <div className="legal-card" style={{ borderTop: '3px solid #8b5cf6' }}>
                    <Globe size={26} style={{ color: '#8b5cf6', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)' }}>Local Offline Mode</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Run full statistical calculations 100% in browser memory without transmitting data over the internet.
                    </div>
                  </div>
                </div>

                {/* Section 1 */}
                {matchesSearch('Information We Collect profile dataset telemetry') && (
                  <section id="sec-info" className="legal-card legal-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <Database size={22} style={{ color: 'var(--primary)' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        1. Information We Collect &amp; Process
                      </h2>
                    </div>
                    <p style={{ margin: '0 0 14px 0', color: 'var(--text-secondary)' }}>
                      Open SPSS Web adheres strictly to data minimization principles under <b>GDPR Article 5(1)(c)</b>. We only collect information essential for service operation:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                      <li>
                        <b style={{ color: 'var(--text-primary)' }}>Account Profile Data:</b> When you register an account or authenticate using Google OAuth 2.0, we store your email address, full name (optional), and user avatar URL.
                      </li>
                      <li>
                        <b style={{ color: 'var(--text-primary)' }}>Cloud Project &amp; Dataset Storage:</b> When you explicitly choose to save a project to the cloud, tabular data, variable metadata dictionary (variable names, types, labels, measurement scales, and value labels), output analysis tables, and syntax scripts are encrypted and saved to your private cloud storage.
                      </li>
                      <li>
                        <b style={{ color: 'var(--text-primary)' }}>Local Browser Storage:</b> We use your browser's <code>localStorage</code> solely to store UI preferences (e.g. Dark Mode, color themes, value label toggle state).
                      </li>
                      <li>
                        <b style={{ color: 'var(--text-primary)' }}>Operational Telemetry:</b> Technical performance metrics (such as client browser version, operating system, and API response error codes) to maintain platform stability and 99.9% uptime.
                      </li>
                    </ul>
                  </section>
                )}

                {/* Section 2 */}
                {matchesSearch('What We Never Do sell tracking cookies') && (
                  <section id="sec-never" className="legal-card legal-section" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <EyeOff size={22} style={{ color: '#ef4444' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        2. What We NEVER Do With Your Data
                      </h2>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                      <li>We <b style={{ color: 'var(--text-primary)' }}>never</b> sell your contact information, email address, or survey records to third-party advertisers or data brokers.</li>
                      <li>We <b style={{ color: 'var(--text-primary)' }}>never</b> inject behavioral advertising trackers, cookie banners from marketing affiliates, or invasive web beacons.</li>
                      <li>We <b style={{ color: 'var(--text-primary)' }}>never</b> publish or share identifiable individual survey respondents or participant rows from your datasets.</li>
                    </ul>
                  </section>
                )}

                {/* Section 3 */}
                {matchesSearch('GDPR European Union UK Data Protection Rights') && (
                  <section id="sec-gdpr" className="legal-card legal-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <Globe size={22} style={{ color: '#10b981' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        3. European Union GDPR &amp; UK Data Protection Rights
                      </h2>
                    </div>
                    <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>
                      Under the General Data Protection Regulation (GDPR) and UK Data Protection Act, users located in the EU/EEA and UK possess fundamental legal rights:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        <div><b style={{ color: 'var(--text-primary)' }}>Right to Access &amp; Portability (Art. 15 &amp; 20):</b> Export all your project datasets anytime in standard formats (CSV, Excel .xlsx, and .ospss JSON bundle).</div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        <div><b style={{ color: 'var(--text-primary)' }}>Right to Erasure ("Right to be Forgotten", Art. 17):</b> Permanently delete any cloud project from your workspace or request complete account termination.</div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        <div><b style={{ color: 'var(--text-primary)' }}>Right to Rectification (Art. 16):</b> Update your profile details or email address preferences at any time.</div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        <div><b style={{ color: 'var(--text-primary)' }}>Right to Opt-Out:</b> You can opt out of any cloud data processing simply by using Open SPSS Web in local offline browser mode or upgrading to the Pro tier.</div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Section 4 */}
                {matchesSearch('California CCPA CPRA') && (
                  <section id="sec-ccpa" className="legal-card legal-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <ShieldCheck size={22} style={{ color: 'var(--primary)' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        4. California Consumer Privacy Act (CCPA / CPRA)
                      </h2>
                    </div>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>
                      California residents possess rights under the CCPA and CPRA to know, access, delete, and opt out of the sale or sharing of their personal information.
                    </p>
                    <div style={{
                      background: 'var(--bg-surface-subtle)',
                      padding: '16px 20px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}>
                      Open SPSS Web does not sell or share personal information for cross-context behavioral advertising.
                    </div>
                  </section>
                )}

                {/* Section 5 */}
                {matchesSearch('Community Data License Fair Exchange') && (
                  <section id="sec-fair-exchange" className="legal-card legal-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <Scale size={22} style={{ color: '#8b5cf6' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        5. Community Data License &amp; Fair Exchange Governance
                      </h2>
                    </div>
                    <p style={{ margin: '0 0 14px 0', color: 'var(--text-secondary)' }}>
                      Open SPSS Web provides high-performance computing, clean data diagnostics, and cloud project backup <b>100% free of charge</b>.
                      In exchange for free cloud hosting, Free Tier accounts grant a license allowing anonymized, de-identified statistical patterns to power market benchmarks and statistical AI intelligence.
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                      <li><b style={{ color: 'var(--text-primary)' }}>Mandatory De-Identification:</b> Direct identifiers (individual names, phone numbers, email addresses, street addresses) are stripped prior to ingestion.</li>
                      <li><b style={{ color: 'var(--text-primary)' }}>Zero Raw Row Dissemination:</b> We never sell or publish your raw tabular rows. Only aggregate mathematical distributions are utilized.</li>
                      <li><b style={{ color: 'var(--text-primary)' }}>Pro Tier Confidential Isolation:</b> Pro accounts have <code>can_mine_data = false</code> cryptographically enforced, guaranteeing 100% private data isolation with zero mining and zero model training.</li>
                    </ul>
                  </section>
                )}

                {/* Section 6 */}
                {matchesSearch('Security Architecture Encryption TLS RLS') && (
                  <section id="sec-security" className="legal-card legal-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <Lock size={22} style={{ color: 'var(--primary)' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        6. Security Architecture &amp; Safeguards
                      </h2>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                      <li><b style={{ color: 'var(--text-primary)' }}>Transport Encryption:</b> TLS 1.3 encryption across all client-server communications with modern forward-secrecy ciphers.</li>
                      <li><b style={{ color: 'var(--text-primary)' }}>At-Rest Encryption:</b> AES-256 block encryption across all database volumes.</li>
                      <li><b style={{ color: 'var(--text-primary)' }}>Row Level Security (RLS):</b> PostgreSQL Row Level Security guarantees multi-tenant isolation, ensuring database queries are scoped exclusively to the authenticated user ID.</li>
                    </ul>
                  </section>
                )}
              </>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* TAB 2: TERMS OF SERVICE                                           */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {activeTab === 'terms' && (
              <>
                {/* Clean-Room Notice Card */}
                {matchesSearch('Clean-Room Implementation IBM SPSS Trademark') && (
                  <div
                    id="sec-clean-room"
                    className="legal-card legal-section"
                    style={{ borderLeft: '4px solid var(--primary)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
                      <Scale size={22} />
                      <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Independent Clean-Room Architecture Notice</h2>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                      <b>SPSS®</b> is a registered trademark of International Business Machines Corporation (IBM Corp). <b>Open SPSS Web</b> is an independent educational creation developed by JaNuK. It is <b>not</b> affiliated with, sponsored by, authorized by, or endorsed by IBM Corporation. Reference to SPSS syntax conventions and statistical terminology is made strictly under <i>Nominative Fair Use</i> for educational description and analytical script interoperability.
                    </p>
                  </div>
                )}

                {/* Section 1 */}
                {matchesSearch('Agreement to Terms Acceptance') && (
                  <section className="legal-card legal-section">
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
                      1. Agreement to Terms
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                      By accessing or using the <b>Open SPSS Web</b> platform (hosted at <code>https://openspss.xyz</code> and associated endpoints), you agree to be bound by these Terms of Service, our Privacy Policy, and any applicable Community Data License agreements. If you do not agree, please discontinue use of the platform.
                    </p>
                  </section>
                )}

                {/* Section 2 */}
                {matchesSearch('User Accounts Google Single Sign-On SSO') && (
                  <section id="sec-accounts" className="legal-card legal-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <Fingerprint size={22} style={{ color: 'var(--primary)' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        2. User Accounts &amp; Google Single Sign-On
                      </h2>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                      <li><b style={{ color: 'var(--text-primary)' }}>Authentication:</b> You may create an account using email/password or with one-click Google OAuth 2.0.</li>
                      <li><b style={{ color: 'var(--text-primary)' }}>Account Linking:</b> If you register with an email and subsequently authenticate with Google using that same verified email, your accounts are automatically linked without duplicate profiles.</li>
                      <li><b style={{ color: 'var(--text-primary)' }}>Account Responsibility:</b> You are responsible for safeguarding your login credentials and for all activities that occur under your account.</li>
                    </ul>
                  </section>
                )}

                {/* Section 3 */}
                {matchesSearch('100% User Data Ownership Intellectual Property') && (
                  <section id="sec-ownership" className="legal-card legal-section" style={{ borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <FileCheck2 size={22} style={{ color: '#10b981' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        3. 100% User Data Ownership
                      </h2>
                    </div>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>
                      <b style={{ color: 'var(--text-primary)' }}>You retain 100% ownership and copyright of all raw data, survey responses, variables, custom formulas, syntax scripts, and generated reports that you input or create on Open SPSS Web.</b>
                    </p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                      You may export all project datasets and APA 7th style analytical tables at any time without fees, vendor lock-in, or proprietary restrictions.
                    </p>
                  </section>
                )}

                {/* Section 4 */}
                {matchesSearch('Service Tiers Fair Cloud Storage Free Pro') && (
                  <section id="sec-tiers" className="legal-card legal-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <Layers size={22} style={{ color: '#8b5cf6' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        4. Service Tiers &amp; Cloud Storage
                      </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', margin: '14px 0' }}>
                      <div style={{
                        padding: '18px',
                        borderRadius: '10px',
                        background: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Free Community Tier</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Students, educators &amp; open researchers</div>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
                          <li>Unlimited local in-browser computation</li>
                          <li>Cloud project storage &amp; cross-device sync</li>
                          <li>Community Data License benchmarking</li>
                        </ul>
                      </div>

                      <div style={{
                        padding: '18px',
                        borderRadius: '10px',
                        background: 'var(--bg-surface-subtle)',
                        border: '1.5px solid var(--primary)'
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--primary)', marginBottom: '4px' }}>Pro Confidential Tier</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Clinical, commercial &amp; private data</div>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
                          <li><b>100% Zero-Mining Guarantee</b></li>
                          <li>Air-gapped database isolation (<code>can_mine_data = false</code>)</li>
                          <li>Dedicated high-volume cloud storage</li>
                        </ul>
                      </div>
                    </div>
                  </section>
                )}

                {/* Section 5 */}
                {matchesSearch('Acceptable Use Policy') && (
                  <section id="sec-acceptable" className="legal-card legal-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <AlertTriangle size={22} style={{ color: '#f59e0b' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        5. Acceptable Use Policy
                      </h2>
                    </div>
                    <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>Users must not:</p>
                    <ul style={{ margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                      <li>Upload malicious scripts, viruses, or cross-site scripting exploits.</li>
                      <li>Attempt to bypass database Row Level Security (RLS) or access other users' data.</li>
                      <li>Conduct automated scraping or denial of service attacks against platform servers.</li>
                    </ul>
                  </section>
                )}

                {/* Section 6 */}
                {matchesSearch('Warranties Limitation of Liability Medical Clinical') && (
                  <section id="sec-liability" className="legal-card legal-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <Award size={22} style={{ color: 'var(--text-muted)' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        6. Warranties &amp; Limitation of Liability
                      </h2>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                      Open SPSS Web is provided on an "AS IS" and "AS AVAILABLE" basis. While all statistical algorithms have been calibrated against standard analytical test fixtures, users performing critical medical, clinical, structural, or legal calculations must independently verify all statistical outputs.
                    </p>
                  </section>
                )}
              </>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* TAB 3: COMMUNITY DATA LICENSE                                     */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {activeTab === 'license' && (
              <>
                <div className="legal-card legal-section" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Database size={24} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      How the Fair Exchange Model Works
                    </h2>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Commercial legacy software charges thousands of dollars per seat per year for statistical software licenses.
                    <b> Open SPSS Web</b> provides high-performance computing, clean data diagnostics, and cloud project backup <b>100% free of charge</b> to the world.
                    In exchange for free cloud hosting, Free Tier accounts grant a license allowing anonymized, de-identified statistical patterns to power market benchmarks and statistical AI intelligence.
                  </p>
                </div>

                {/* Section 1 */}
                {matchesSearch('Scope of the Free Community Data License') && (
                  <section id="sec-lic-scope" className="legal-card legal-section">
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
                      1. Scope of the Free Community Data License
                    </h2>
                    <p style={{ margin: '0 0 14px 0', color: 'var(--text-secondary)' }}>
                      When you save datasets to our free cloud storage, you grant Open SPSS Web a non-exclusive, worldwide, royalty-free license to analyze dataset structures for:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.90rem', marginBottom: '6px' }}>
                          📊 Statistical Benchmarking
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          Computing global sample size distributions, industry NPS averages, scale variance norms, and empirical reliability coefficients.
                        </div>
                      </div>
                      <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.90rem', marginBottom: '6px' }}>
                          🤖 AI Statistical Engine Training
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          Training intelligent models that assist researchers in diagnosing normality violations, detecting outliers, and choosing optimal statistical procedures.
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Section 2 */}
                {matchesSearch('Mandatory De-Identification PII Stripping') && (
                  <section id="sec-lic-deid" className="legal-card legal-section">
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
                      2. Mandatory De-Identification &amp; PII Stripping
                    </h2>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>
                      Before any dataset pattern is processed for aggregate analysis, our ingestion pipeline enforces strict de-identification:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                      <li><b style={{ color: 'var(--text-primary)' }}>Direct Identifiers Scrubbed:</b> Columns containing individual names, personal email addresses, phone numbers, social security IDs, or street addresses are discarded.</li>
                      <li><b style={{ color: 'var(--text-primary)' }}>k-Anonymity &amp; Differential Privacy:</b> Data distributions are generalized into mathematical bins so that no individual respondent or participant can be re-identified.</li>
                      <li><b style={{ color: 'var(--text-primary)' }}>Zero Raw Row Dissemination:</b> We never sell or publish your raw tabular rows. Only aggregate mathematical summary matrices and distributions are utilized.</li>
                    </ul>
                  </section>
                )}

                {/* Section 3 */}
                {matchesSearch('Pro Tier Confidential Data Isolation Guarantee') && (
                  <section id="sec-lic-pro" className="legal-card legal-section" style={{ borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      <ShieldCheck size={22} style={{ color: '#10b981' }} />
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                        3. Pro Tier Confidential Data Isolation Guarantee
                      </h2>
                    </div>
                    <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>
                      Organizations, medical clinics, legal teams, and researchers handling strictly confidential or proprietary datasets can upgrade to the <b>Open SPSS Pro Tier</b>:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                      <li><b style={{ color: 'var(--text-primary)' }}>Zero Mining Guarantee:</b> Pro projects have <code>can_mine_data = false</code> cryptographically enforced in the database.</li>
                      <li><b style={{ color: 'var(--text-primary)' }}>Zero Aggregation:</b> Pro datasets are never included in benchmark metrics or model training.</li>
                      <li><b style={{ color: 'var(--text-primary)' }}>Enterprise Confidentiality:</b> Fully air-gapped data isolation backed by enterprise non-disclosure.</li>
                    </ul>
                  </section>
                )}

                {/* Section 4 */}
                {matchesSearch('Freedom of Choice Offline Local Mode') && (
                  <section id="sec-lic-offline" className="legal-card legal-section">
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
                      4. Freedom of Choice: 100% Offline Local Mode
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                      You are never forced to store data in the cloud! If you do not wish to grant the Free Community Data License, you can use Open SPSS Web entirely in local in-browser mode. Simply do not save projects to the cloud. All file parsing (CSV, Excel), statistical calculations, and HTML report generations will run in your computer's local memory and will never leave your browser.
                    </p>
                  </section>
                )}
              </>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* TAB 4: ACADEMIC ETHICS & IRB FAQ                                  */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {activeTab === 'ethics' && (
              <>
                {/* FAQ 1 */}
                {matchesSearch('Thesis Dissertation peer-reviewed journal research') && (
                  <section id="sec-eth-thesis" className="legal-card legal-section">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                      1. Can I use Open SPSS Web for my Master's thesis, doctoral dissertation, or peer-reviewed journal research?
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                      <b style={{ color: 'var(--text-primary)' }}>Yes, absolutely!</b> Open SPSS Web computes standard parametric and non-parametric statistical metrics adhering strictly to established academic mathematical standards. All outputs can be exported in APA 7th edition table format for direct inclusion in manuscripts and defense slides.
                    </p>
                  </section>
                )}

                {/* FAQ 2 */}
                {matchesSearch('Institutional Review Board IRB University Protocol') && (
                  <section id="sec-eth-irb" className="legal-card legal-section">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                      2. How do I describe Open SPSS Web in my Institutional Review Board (IRB) human-subjects application?
                    </h3>
                    <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>
                      You may copy and paste the following sample text in Section C ("Data Security &amp; Storage") of your IRB protocol:
                    </p>
                    <div style={{
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      fontSize: '0.88rem',
                      fontStyle: 'italic',
                      color: 'var(--text-primary)',
                      lineHeight: 1.6
                    }}>
                      "Statistical analyses will be conducted using Open SPSS Web (v1.4.0), a web-based statistical computation platform. Data processing is conducted locally in-memory within the research team's encrypted browser session. Identifiable participant information is scrubbed prior to any cloud backup, adhering to GDPR Article 25 privacy-by-design principles."
                    </div>
                  </section>
                )}

                {/* FAQ 3 */}
                {matchesSearch('APA 7th Edition Citation Academic Papers') && (
                  <section id="sec-eth-cite" className="legal-card legal-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        3. How should I cite Open SPSS Web in APA 7th edition format?
                      </h3>
                      <button
                        onClick={handleCopyCitation}
                        className="btn btn-outline"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          fontSize: '0.78rem',
                          borderRadius: '7px'
                        }}
                      >
                        {copiedCitation ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                        <span>{copiedCitation ? 'Citation Copied!' : 'Copy Citation'}</span>
                      </button>
                    </div>
                    <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>
                      Use the standard APA 7th software citation format in your references section:
                    </p>
                    <div style={{
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      fontSize: '0.88rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--primary)',
                      lineHeight: 1.6
                    }}>
                      JaNuK. (2026). Open SPSS Web: Accessible browser-native statistical analysis workbench (Version 1.4.0) [Computer software]. https://openspss.xyz
                    </div>
                  </section>
                )}

                {/* FAQ 4 */}
                {matchesSearch('Algorithmic Verification Numerical Precision Benchmark') && (
                  <section id="sec-eth-verify" className="legal-card legal-section">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                      4. How are Open SPSS statistical algorithms verified for numerical precision?
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                      All algorithms in Open SPSS Web (including descriptive metrics, Pearson &amp; Spearman correlations, Student's t-tests, One-Way ANOVA with Tukey HSD post-hoc tests, Ordinary Least Squares regression, factor extraction with Varimax rotation, and Cronbach's alpha) are validated against published statistical benchmark fixtures and peer-reviewed test datasets to IEEE-754 64-bit precision.
                    </p>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── 4. Floating Scroll-to-Top Button ── */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="floating-back-top no-print"
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 999,
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(15, 98, 254, 0.45)',
            transition: 'transform 0.2s ease, background 0.2s ease'
          }}
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ChevronUp size={22} />
        </button>
      )}

      {/* ── 5. Responsive Footer ── */}
      <footer
        className="no-print"
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-color)',
          padding: '36px 28px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.84rem',
          background: 'var(--bg-surface)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.84rem' }}
          >
            Studio Workspace
          </button>
          <button
            onClick={() => switchTab('privacy')}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.84rem' }}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => switchTab('terms')}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.84rem' }}
          >
            Terms of Service
          </button>
          <button
            onClick={() => switchTab('license')}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.84rem' }}
          >
            Community Data License
          </button>
          <button
            onClick={() => switchTab('ethics')}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.84rem' }}
          >
            Academic Ethics &amp; IRB
          </button>
          <a
            href="https://github.com/lordskidgod"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}
          >
            GitHub
          </a>
        </div>
        <p style={{ margin: 0 }}>
          © 2026 Open SPSS Web. Clean-room educational statistical platform developed by JaNuK.
        </p>
      </footer>
    </div>
  );
};
