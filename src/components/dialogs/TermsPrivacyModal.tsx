import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  FileText,
  Shield,
  ShieldCheck,
  Scale,
  Database,
  Sparkles,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Info,
  BookOpen,
  Lock,
  Globe,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export type PolicyTab = 'terms' | 'privacy' | 'license' | 'ethics';

interface TermsPrivacyModalProps {
  isOpen?: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
  onOpenAuth?: (tab?: 'signin' | 'signup') => void;
}

export const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({
  initialTab = 'terms',
  onClose,
  onOpenAuth
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync initial tab when changed externally
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="dialog-backdrop" 
      style={{ zIndex: 100000 }} 
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="spss-dialog modern-modal" 
        style={{ 
          width: '920px', 
          maxWidth: '96vw', 
          height: '88vh', 
          maxHeight: '880px', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)'
        }}
      >
        {/* Top Header */}
        <div className="dialog-header modern-modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}>
              <img src="/logo.png" alt="Open SPSS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Legal, Terms & Privacy Center
                </span>
                <span style={{
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  letterSpacing: '0.03em'
                }}>
                  v1.4.0 • Updated Sept 2026
                </span>
              </div>
              <div style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Open SPSS Web Platform • Clear Terms, Strict Privacy & Community Data Governance
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px'
              }}
              title="Print or Save as PDF"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
              
            </button>
            <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Selection Bar & Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-color)',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('terms')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '12px 14px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'terms' ? 700 : 500,
                color: activeTab === 'terms' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'terms' ? '3px solid var(--primary)' : '3px solid transparent',
                background: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <FileText size={15} />
              <span>Terms of Service</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '12px 14px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'privacy' ? 700 : 500,
                color: activeTab === 'privacy' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'privacy' ? '3px solid var(--primary)' : '3px solid transparent',
                background: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <ShieldCheck size={15} />
              <span>Privacy Policy (GDPR / CCPA)</span>
            </button>

            <button
              onClick={() => setActiveTab('license')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '12px 14px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'license' ? 700 : 500,
                color: activeTab === 'license' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'license' ? '3px solid var(--primary)' : '3px solid transparent',
                background: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Database size={15} />
              <span>Community Data License (Fair Exchange)</span>
            </button>

            <button
              onClick={() => setActiveTab('ethics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '12px 14px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'ethics' ? 700 : 500,
                color: activeTab === 'ethics' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'ethics' ? '3px solid var(--primary)' : '3px solid transparent',
                background: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <BookOpen size={15} />
              <span>Academic Ethics & IRB FAQ</span>
            </button>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '220px', margin: '6px 0' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search policy terms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '6px 10px 6px 30px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div 
          className="dialog-body modern-modal-body" 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '24px 28px', 
            lineHeight: '1.65', 
            color: 'var(--text-primary)',
            fontSize: '0.88rem'
          }}
        >
          {/* Quick Summary Pill Banner */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.80rem' }}>
                <b>Executive Summary:</b> Open SPSS Web is 100% free for educational, research, and professional analysis. You retain full ownership of your data. Free cloud accounts participate in anonymized statistical benchmarking, while Pro accounts enjoy 100% air-gapped private isolation.
              </div>
            </div>
            {onOpenAuth && (
              <button
                onClick={() => { onClose(); onOpenAuth('signup'); }}
                className="btn btn-primary"
                style={{ fontSize: '0.76rem', padding: '6px 12px', whiteSpace: 'nowrap', borderRadius: '6px' }}
              >
                Create Account
              </button>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: TERMS OF SERVICE                                             */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                  Terms of Service (ToS)
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Last Updated: September 17, 2026 • Effective Immediately
                </div>
              </div>

              {/* Section 1 */}
              <section style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  1. Acceptance of Terms & Educational Mission
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  By accessing, browsing, registering for, or using the <b>Open SPSS Web</b> platform (available at this web domain and associated cloud services), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service and our Privacy Policy.
                </p>
                <p style={{ margin: 0 }}>
                  Open SPSS Web is built as an accessible, high-performance, browser-native statistical workbench for students, academic researchers, educators, data analysts, and enterprises worldwide.
                </p>
              </section>

              {/* Section 2 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  2. Clean-Room Architecture & Trademark Disclaimer
                </h3>
                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                    <Scale size={16} />
                    <span>Independent Software Notice</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem' }}>
                    <b>SPSS®</b> is a registered trademark of International Business Machines Corporation (IBM Corp). <b>Open SPSS Web</b> is an independent, clean-room educational project developed by JaNuK and open-source contributors. Open SPSS Web is <b>not</b> affiliated with, sponsored by, endorsed by, or associated with IBM Corp in any manner.
                  </p>
                </div>
                <p style={{ margin: 0 }}>
                  All mathematical calculation routines (including ANOVA, t-tests, linear regression, factor analysis/PCA, Cronbach's alpha, and descriptive statistics) are implemented independently from first-principles statistical equations and verified against published benchmark standards.
                </p>
              </section>

              {/* Section 3 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  3. User Accounts & Google Single Sign-On
                </h3>
                <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><b>Account Creation:</b> You may create an account using your email address or through Google Single Sign-On (OAuth 2.0).</li>
                  <li><b>Account Integrity:</b> You agree to provide accurate registration information and to maintain the confidentiality of your login credentials. You are responsible for all activities occurring under your account.</li>
                  <li><b>Account Linking:</b> If you register with an email and subsequently authenticate via Google using the identical verified email, the platform seamlessly recognizes and links your identity.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  4. Data Ownership & Intellectual Property
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  <b>You retain 100% ownership of your original datasets, variables, code scripts, and research findings.</b> We make no claim to the copyright or intellectual property of datasets you import or projects you analyze.
                </p>
                <p style={{ margin: 0 }}>
                  You may export your datasets to Excel (.xlsx), CSV, TSV, or the Open SPSS (.ospss) JSON format, and export all generated APA 7th style statistical tables and charts at any time without fees, lock-in, or proprietary restrictions.
                </p>
              </section>

              {/* Section 5 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  5. Service Tiers & Fair Cloud Storage
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '10px 0' }}>
                  <div style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-surface)'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Free Community Tier</div>
                    <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginBottom: '8px' }}>For students, educators & public researchers</div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.80rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Unlimited local in-browser computation</li>
                      <li>Cloud project storage & cross-device sync</li>
                      <li>Governed by Community Data License (anonymized research intelligence)</li>
                    </ul>
                  </div>

                  <div style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--primary)',
                    background: 'var(--bg-surface-subtle)'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>Pro & Enterprise Tier</div>
                    <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginBottom: '8px' }}>For clinical, commercial & strictly confidential data</div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.80rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li><b>100% Zero-Mining Guarantee</b></li>
                      <li>Complete air-gapped private database isolation</li>
                      <li>Dedicated high-volume cloud storage</li>
                      <li>Full institutional audit trail</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  6. Acceptable Use Policy
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  You agree not to misuse the Open SPSS Web service. Prohibited activities include:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Uploading intentionally malicious payloads, malware, or code injections into variable labels or syntax editors.</li>
                  <li>Conducting Denial of Service (DoS) attacks or automated scraper bombardment against our cloud infrastructure.</li>
                  <li>Attempting to circumvent database security controls, multi-tenant Row Level Security (RLS), or user permissions.</li>
                  <li>Uploading classified military data or personal health records without necessary IRB/HIPAA compliance clearances.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  7. Warranties, Disclaimers & Limitation of Liability
                </h3>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
                    <AlertTriangle size={15} />
                    <span>Statistical Verification Notice</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
                    Open SPSS Web is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. While all statistical algorithms have been calibrated against standard analytical test fixtures, users performing clinical medical diagnoses, mission-critical engineering calculations, or legal compliance filings must independently verify their findings.
                  </p>
                </div>
                <p style={{ margin: 0 }}>
                  To the maximum extent permitted by applicable law, Open SPSS Web and its developers shall not be liable for any indirect, incidental, punitive, or consequential damages arising from the use or inability to use this platform.
                </p>
              </section>

              {/* Section 8 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  8. Termination & Account Cancellation
                </h3>
                <p style={{ margin: 0 }}>
                  You may stop using Open SPSS Web at any time. You can delete any or all cloud datasets through the Cloud Projects interface. You can request complete account deletion at any time, which permanently purges your account records and linked projects from our primary storage.
                </p>
              </section>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: PRIVACY POLICY                                               */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                  Privacy Policy & Data Protection
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Compliant with EU GDPR, California CCPA/CPRA, and International Privacy Principles
                </div>
              </div>

              {/* Privacy Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)' }}>
                  <Shield size={18} style={{ color: '#10b981', marginBottom: '6px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Zero Ad Trackers</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>No behavioral advertising cookies, Facebook pixels, or data broker beacons.</div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)' }}>
                  <Lock size={18} style={{ color: 'var(--primary)', marginBottom: '6px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Row-Level Security</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Cryptographically enforced database isolation ensuring only you access your saved datasets.</div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)' }}>
                  <Globe size={18} style={{ color: '#8b5cf6', marginBottom: '6px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Local Mode Available</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Run full statistical analyses 100% in your browser without ever transmitting data to any server.</div>
                </div>
              </div>

              {/* Section 1 */}
              <section style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  1. Information We Collect
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  We practice data minimization. We only collect information essential for service functionality:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>
                    <b>Account Profile Data:</b> When you register, we store your email address, full name (optional), and user avatar URL (if provided by Google OAuth).
                  </li>
                  <li>
                    <b>Project & Dataset Contents:</b> When you explicitly click <i>"Save Active Project to Cloud"</i>, the dataset rows, variable metadata, syntax scripts, and output logs are encrypted and saved to your cloud workspace.
                  </li>
                  <li>
                    <b>Client-Side Local Storage:</b> We use your browser's <code>localStorage</code> solely to remember UI preferences (e.g. Dark Mode, color themes, value label toggle state).
                  </li>
                  <li>
                    <b>Operational Telemetry:</b> Technical error logs (such as unhandled JavaScript exceptions or API timeout codes) to help us patch bugs and maintain 99.9% uptime.
                  </li>
                </ul>
              </section>

              {/* Section 2 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  2. What We NEVER Do With Your Data
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>We <b>never</b> sell personal identifiers or email lists to third-party data brokers or marketing firms.</li>
                  <li>We <b>never</b> inject third-party promotional trackers or behavioral tracking cookies into your statistical analysis workspace.</li>
                  <li>We <b>never</b> expose raw survey respondent records or identifiable individual data points to other users.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  3. GDPR (European Union) & CCPA (California) Compliance
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  Under the European General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA/CPRA), you have fundamental legal rights:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <div><b>Right to Access & Portability:</b> You can export all your project data anytime in standard formats (CSV, Excel, JSON).</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <div><b>Right to Erasure ("Right to be Forgotten"):</b> You can delete any saved cloud project or contact support to have all account metadata permanently expunged.</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <div><b>Right to Rectification:</b> Update your user profile details or email preferences at any time.</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <div><b>Right to Opt-Out:</b> You can opt out of any cloud data processing simply by using Open SPSS Web in local offline browser mode or upgrading to the Pro private tier.</div>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  4. Security Architecture & Encryption
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  Your research security is our highest priority:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><b>In-Transit Encryption:</b> All data transmitted between your browser and our cloud servers uses TLS 1.3 encryption with modern forward secrecy ciphers.</li>
                  <li><b>At-Rest Encryption:</b> All cloud databases and backup volumes are encrypted using industry-standard AES-256 block encryption.</li>
                  <li><b>Database Row Level Security (RLS):</b> PostgreSQL Row Level Security strictly ensures that only authorized database sessions can query your project records.</li>
                </ul>
              </section>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: COMMUNITY DATA LICENSE (FAIR EXCHANGE)                       */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'license' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                  Community Data License & Fair Exchange Model
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  The transparent model powering free cloud computing and open research analytics
                </div>
              </div>

              {/* Explanatory Hero Card */}
              <div style={{
                background: 'var(--bg-surface-subtle)',
                border: '1.5px solid var(--primary)',
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Database size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    How the Fair Exchange Model Works
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Commercial legacy software charges thousands of dollars per seat per year for statistical software licenses. 
                    <b>Open SPSS Web</b> provides high-performance computing, clean data diagnostics, and cloud project backup <b>100% free of charge</b> to the world.
                    In exchange for free cloud hosting, Free Tier accounts grant a license allowing anonymized, de-identified statistical patterns to power market benchmarks and statistical AI intelligence.
                  </p>
                </div>
              </div>

              {/* Section 1 */}
              <section style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  1. Scope of the Free Community Data License
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  When you save datasets to our free cloud storage, you grant Open SPSS Web a non-exclusive, worldwide, royalty-free license to analyze dataset structures for:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '10px 0' }}>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.84rem', marginBottom: '4px' }}>
                      📊 Statistical Benchmarking
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Computing global sample size distributions, industry NPS averages, scale variance norms, and empirical reliability coefficients.
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.84rem', marginBottom: '4px' }}>
                      🤖 AI Statistical Engine Training
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Training intelligent models that assist researchers in diagnosing normality violations, detecting outliers, and choosing optimal statistical procedures.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  2. Mandatory De-Identification & PII Stripping
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                  Before any dataset pattern is processed for aggregate analysis, our ingestion pipeline enforces strict de-identification:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
                  <li><b>Direct Identifiers Scrubbed:</b> Columns containing individual names, personal email addresses, phone numbers, social security IDs, or street addresses are discarded.</li>
                  <li><b>k-Anonymity & Differential Privacy:</b> Data distributions are generalized into mathematical bins so that no individual respondent or participant can be re-identified.</li>
                  <li><b>Zero Raw Row Dissemination:</b> We never sell or publish your raw tabular rows. Only aggregate mathematical summary matrices and distributions are utilized.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  3. Pro Tier Confidential Data Isolation Guarantee
                </h3>
                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    <ShieldCheck size={18} style={{ color: '#10b981' }} />
                    <span>Complete Zero-Mining Exemption</span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.82rem' }}>
                    Organizations, medical clinics, legal teams, and researchers handling strictly confidential or proprietary datasets can upgrade to the <b>Open SPSS Pro Tier</b>.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.80rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li><b>Zero Mining Guarantee:</b> Pro projects have <code>can_mine_data = false</code> cryptographically enforced.</li>
                    <li><b>Zero Aggregation:</b> Pro datasets are never included in benchmark metrics or model training.</li>
                    <li><b>Confidentiality SLA:</b> Protected by enterprise non-disclosure and institutional compliance agreements.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  4. Freedom of Choice: 100% Offline Local Mode
                </h3>
                <p style={{ margin: 0 }}>
                  You are never forced to store data in the cloud! If you do not wish to grant the Free Community Data License, you can use Open SPSS Web entirely in local in-browser mode. Simply do not save projects to the cloud. All file parsing (CSV, Excel), statistical calculations, and HTML report generations will run in your computer's local memory and will never leave your browser.
                </p>
              </section>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: ACADEMIC ETHICS & IRB FAQ                                    */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'ethics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                  Academic Ethics & Institutional Review Board (IRB) FAQ
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Practical guidance for university researchers, thesis students, professors, and ethics committees
                </div>
              </div>

              {/* FAQ 1 */}
              <div style={{
                background: 'var(--bg-surface-subtle)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Q: Can I use Open SPSS Web for my Master's thesis, doctoral dissertation, or peer-reviewed journal research?
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  <b>Yes, absolutely!</b> Open SPSS Web computes standard parametric and non-parametric statistical metrics adhering to established academic mathematical standards. All outputs can be exported in APA 7th edition table format for direct inclusion in manuscripts.
                </p>
              </div>

              {/* FAQ 2 */}
              <div style={{
                background: 'var(--bg-surface-subtle)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Q: How should I address data confidentiality in my IRB / Ethics Committee application?
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  For IRB protocol applications, you may declare the following:
                </p>
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--bg-surface)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.80rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)'
                }}>
                  "Data analysis will be conducted using Open SPSS Web. When utilizing local in-browser mode or the Pro confidential tier, datasets are processed locally within the client browser memory with zero external transmission of participant records, ensuring full compliance with participant confidentiality covenants."
                </div>
              </div>

              {/* FAQ 3 */}
              <div style={{
                background: 'var(--bg-surface-subtle)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Q: How do I cite Open SPSS Web in my publication references?
                </h4>
                <p style={{ margin: '0 0 6px 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  You may use the following standard APA 7th citation:
                </p>
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--bg-surface)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.80rem',
                  color: 'var(--text-primary)'
                }}>
                  JaNuK, et al. (2026). <i>Open SPSS Web: Independent Browser-Based Statistical Analysis Platform (Version 1.4.0)</i> [Computer software]. https://openspss.xyz
                </div>
              </div>

              {/* FAQ 4 */}
              <div style={{
                background: 'var(--bg-surface-subtle)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Q: Who do I contact if my university requires a formal Data Protection Assessment (DPIA) or signed agreement?
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Academic institutions requiring custom Data Protection Impact Assessments (DPIA), Business Associate Agreements (BAA), or custom on-premise deployments can contact the development team through our official GitHub repository or developer contact channels.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-surface-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.80rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} style={{ color: '#10b981' }} />
            <span>Open SPSS Web complies with educational open-access, GDPR, and academic ethics charters.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenAuth('signup'); }}
                className="btn btn-outline"
                style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '6px' }}
              >
                Sign Up
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '6px 18px', fontSize: '0.78rem', borderRadius: '6px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
