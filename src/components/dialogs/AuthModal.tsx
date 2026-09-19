import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Cloud,
  ChevronDown
} from 'lucide-react';

interface AuthModalProps {
  onOpenTerms?: (tab?: 'terms' | 'privacy' | 'license' | 'ethics') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onOpenTerms }) => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(authModalTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [agreedToLicense, setAgreedToLicense] = useState(false);
  const [showLicenseInfo, setShowLicenseInfo] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync tab and reset form state when opened
  useEffect(() => {
    setTab(authModalTab);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    setAgreedToLicense(false);
  }, [authModalTab, isAuthModalOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // Simple password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'transparent' };
    if (pass.length < 6) return { score: 1, text: 'Min 6 characters', color: '#ef4444' };
    let score = 1;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 2, text: 'Fair', color: '#f59e0b' };
    if (score === 3) return { score: 3, text: 'Good', color: '#3b82f6' };
    return { score: 4, text: 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength(password);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (tab === 'signup' && !agreedToLicense) {
      setErrorMessage('Please check the box to agree to the Terms of Service & Free Community Data License before continuing with Google.');
      return;
    }
    setIsLoading(true);
    const res = await signInWithGoogle();
    setIsLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (tab === 'forgot') {
      if (!email.trim()) {
        setErrorMessage('Please enter your registered email address.');
        return;
      }
      setIsLoading(true);
      const res = await resetPassword(email.trim());
      setIsLoading(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Password reset instructions have been sent to your email.');
      }
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    if (tab === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (!agreedToLicense) {
        setErrorMessage('Please check the box to agree to the Terms of Service & Free Community Data License.');
        return;
      }
    }

    setIsLoading(true);

    if (tab === 'signin') {
      const res = await signIn(email.trim(), password);
      setIsLoading(false);
      if (res.error) {
        setErrorMessage(res.error);
      }
    } else {
      const res = await signUp(email.trim(), password, fullName.trim());
      setIsLoading(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.needsEmailConfirmation) {
        setSuccessMessage('Account created! Please check your email to verify your account, then sign in.');
      }
    }
  };

  return (
    <div 
      className="auth-popup-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div 
        className="auth-popup-card" 
        role="dialog" 
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-surface-elevated, var(--bg-surface))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--bg-surface, #ffffff)',
              border: '1px solid var(--border-color)',
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
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Open SPSS Cloud
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {tab === 'signin' && 'Sign in to sync your datasets and analyses'}
                {tab === 'signup' && 'Create your free account for cloud backups'}
                {tab === 'forgot' && 'Reset your password via email'}
              </p>
            </div>
          </div>

          <button 
            onClick={closeAuthModal} 
            className="tool-btn" 
            title="Close (Esc)"
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Segment Switcher */}
        {tab !== 'forgot' && (
          <div style={{ padding: '16px 24px 0' }}>
            <div style={{
              display: 'flex',
              background: 'var(--bg-surface-subtle, #f1f5f9)',
              borderRadius: '10px',
              padding: '3px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => { setTab('signin'); setErrorMessage(null); setSuccessMessage(null); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '7px',
                  background: tab === 'signin' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  fontWeight: tab === 'signin' ? 600 : 500,
                  color: tab === 'signin' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: tab === 'signin' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '7px',
                  background: tab === 'signup' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  fontWeight: tab === 'signup' ? 600 : 500,
                  color: tab === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: tab === 'signup' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
              >
                Create Free Account
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {/* Error Message */}
          {errorMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.8rem',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.8rem',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          {tab !== 'forgot' && (
            <div style={{ marginBottom: '14px' }}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '14px 0 4px',
                gap: '10px'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  or continue with email
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Full Name (Sign Up only) */}
            {tab === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Full Name / Organization (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="e.g. Dr. Alex Morgan"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg, var(--bg-surface))',
                      color: 'var(--text-primary)',
                      fontSize: '0.86rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@university.edu or company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg, var(--bg-surface))',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            {tab !== 'forgot' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Password *
                  </label>
                  {tab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setTab('forgot'); setErrorMessage(null); setSuccessMessage(null); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.72rem',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: 500
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 38px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg, var(--bg-surface))',
                      color: 'var(--text-primary)',
                      fontSize: '0.86rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      padding: '2px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {tab === 'signup' && password.length > 0 && (
                  <div style={{ marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Strength:</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: strength.color }}>
                        {strength.text}
                      </span>
                    </div>
                    <div style={{ height: '3px', width: '100%', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(strength.score / 4) * 100}%`,
                        background: strength.color,
                        transition: 'all 0.2s ease'
                      }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fair Data Exchange Card (Sign Up only) */}
            {tab === 'signup' && (
              <div style={{
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-subtle)',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                    <ShieldCheck size={15} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Free Cloud & Data Terms</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLicenseInfo(!showLicenseInfo)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <span>{showLicenseInfo ? 'Less' : 'Details'}</span>
                    <ChevronDown size={12} style={{ transform: showLicenseInfo ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                  </button>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', cursor: 'pointer', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    required
                    checked={agreedToLicense}
                    onChange={e => setAgreedToLicense(e.target.checked)}
                    style={{
                      marginTop: '3px',
                      width: '16px',
                      height: '16px',
                      accentColor: 'var(--primary)',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: '1.4', fontWeight: 500 }}>
                    I agree to the{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600, fontSize: '0.78rem' }}
                    >
                      Terms of Service
                    </a>
                    {' '}&amp;{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600, fontSize: '0.78rem' }}
                    >
                      Free Community Data License
                    </a>
                    {' '}<span style={{ color: '#ef4444' }}>*</span>
                  </span>
                </label>

                {showLicenseInfo && (
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.4',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '6px',
                    marginTop: '2px'
                  }}>
                    • Datasets are saved to your private cloud storage.<br />
                    • De-identified research patterns help train statistical intelligence and AI models.<br />
                    • Pro tier is available anytime for 100% confidential data isolation.
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (tab === 'signup' && !agreedToLicense)}
              className="btn btn-primary"
              title={tab === 'signup' && !agreedToLicense ? 'You must check the agreement box to create an account' : ''}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: (isLoading || (tab === 'signup' && !agreedToLicense)) ? 'not-allowed' : 'pointer',
                opacity: (tab === 'signup' && !agreedToLicense) ? 0.6 : 1,
                marginTop: '4px'
              }}
            >
              {isLoading ? (
                <>
                  <div className="spin" style={{ width: '15px', height: '15px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  <span>Processing...</span>
                </>
              ) : tab === 'signin' ? (
                <>
                  <Lock size={15} />
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </>
              ) : tab === 'signup' ? (
                <>
                  <Sparkles size={15} />
                  <span>Create Free Account</span>
                  <ArrowRight size={14} />
                </>
              ) : (
                <>
                  <Mail size={15} />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {tab === 'signin' && (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('signup'); setErrorMessage(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  Create one for free
                </button>
              </span>
            )}

            {tab === 'signup' && (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('signin'); setErrorMessage(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  Sign In
                </button>
              </span>
            )}

            {tab === 'forgot' && (
              <button
                type="button"
                onClick={() => { setTab('signin'); setErrorMessage(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                ← Back to Sign In
              </button>
            )}
          </div>

          {/* Legal Footer Links */}
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.70rem', color: 'var(--text-muted)' }}>
            <span>Protected by Row Level Security • </span>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-secondary)', textDecoration: 'underline', fontSize: '0.70rem' }}
            >
              Terms of Service
            </a>
            <span> &amp; </span>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-secondary)', textDecoration: 'underline', fontSize: '0.70rem' }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
