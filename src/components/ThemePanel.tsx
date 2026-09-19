import React, { useEffect, useRef } from 'react';
import { X, Palette, Check, Monitor, Moon } from 'lucide-react';

// ─── Theme Definitions ─────────────────────────────────────────────────────────

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  primaryHover: string;
  gradientEnd: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'ocean',    name: 'Ocean Blue',      primary: '#0f62fe', primaryHover: '#0043ce', gradientEnd: '#6366f1' },
  { id: 'violet',   name: 'Cosmic Violet',   primary: '#7c3aed', primaryHover: '#6d28d9', gradientEnd: '#a855f7' },
  { id: 'emerald',  name: 'Emerald',         primary: '#059669', primaryHover: '#047857', gradientEnd: '#10b981' },
  { id: 'teal',     name: 'Cyan Teal',       primary: '#0891b2', primaryHover: '#0e7490', gradientEnd: '#06b6d4' },
  { id: 'orange',   name: 'Sunset',          primary: '#ea580c', primaryHover: '#c2410c', gradientEnd: '#f59e0b' },
  { id: 'rose',     name: 'Rose',            primary: '#e11d48', primaryHover: '#be123c', gradientEnd: '#f43f5e' },
  { id: 'sakura',   name: 'Sakura',          primary: '#db2777', primaryHover: '#be185d', gradientEnd: '#ec4899' },
  { id: 'graphite', name: 'Graphite',        primary: '#374151', primaryHover: '#1f2937', gradientEnd: '#6b7280' },
];

export interface ThemeConfig {
  presetId: string;
  primary: string;
  primaryHover: string;
  gradientEnd: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  presetId: 'ocean',
  primary: '#0f62fe',
  primaryHover: '#0043ce',
  gradientEnd: '#6366f1',
};

// ─── Apply theme to document ───────────────────────────────────────────────────

export function applyTheme(theme: ThemeConfig, isDark: boolean) {
  const r = document.documentElement;

  r.style.setProperty('--primary', theme.primary);
  r.style.setProperty('--primary-hover', theme.primaryHover);
  r.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${theme.primary} 0%, ${theme.gradientEnd} 100%)`);

  if (isDark) {
    // Dark: lighter, glowing version
    r.style.setProperty('--primary-light',  hexToRgba(theme.primary, 0.18));
    r.style.setProperty('--primary-glow',   hexToRgba(theme.primary, 0.30));
    r.style.setProperty('--grid-cell-border-active', lighten(theme.primary, 20));
  } else {
    // Light: tinted pastel
    r.style.setProperty('--primary-light',  hexToRgba(theme.primary, 0.09));
    r.style.setProperty('--primary-glow',   hexToRgba(theme.primary, 0.22));
    r.style.setProperty('--grid-cell-border-active', theme.primary);
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function deriveHover(hex: string): string {
  // Darken by 20
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - 20);
  const g = Math.max(0, ((num >> 8) & 0xff) - 20);
  const b = Math.max(0, (num & 0xff) - 20);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ─── ThemePanel Component ──────────────────────────────────────────────────────

interface ThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  isDarkMode: boolean;
  onDarkModeChange: (v: boolean) => void;
}

export const ThemePanel: React.FC<ThemePanelProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  isDarkMode,
  onDarkModeChange,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const applyPreset = (preset: ThemePreset) => {
    const next: ThemeConfig = {
      presetId: preset.id,
      primary: preset.primary,
      primaryHover: preset.primaryHover,
      gradientEnd: preset.gradientEnd,
    };
    onThemeChange(next);
  };

  const applyCustomColor = (hex: string) => {
    const next: ThemeConfig = {
      presetId: 'custom',
      primary: hex,
      primaryHover: deriveHover(hex),
      gradientEnd: hex,
    };
    onThemeChange(next);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="theme-panel-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-in drawer */}
      <div
        ref={panelRef}
        className={`theme-panel${isOpen ? ' theme-panel--open' : ''}`}
        role="dialog"
        aria-label="Theme Customizer"
        aria-modal="true"
      >
        {/* Header */}
        <div className="theme-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="theme-panel-icon">
              <Palette size={16} />
            </div>
            <div>
              <div className="theme-panel-title">Theme Customizer</div>
              <div className="theme-panel-subtitle">Personalize your workspace</div>
            </div>
          </div>
          <button className="theme-panel-close" onClick={onClose} title="Close (Esc)">
            <X size={16} />
          </button>
        </div>

        <div className="theme-panel-body">

          {/* ── Appearance Mode ── */}
          <div className="theme-section">
            <div className="theme-section-label">Appearance</div>
            <div className="theme-mode-row">
              <button
                className={`theme-mode-btn${!isDarkMode ? ' active' : ''}`}
                onClick={() => onDarkModeChange(false)}
              >
                <Monitor size={18} />
                <span>Light</span>
                {!isDarkMode && <Check size={12} className="theme-mode-check" />}
              </button>
              <button
                className={`theme-mode-btn${isDarkMode ? ' active' : ''}`}
                onClick={() => onDarkModeChange(true)}
              >
                <Moon size={18} />
                <span>Dark</span>
                {isDarkMode && <Check size={12} className="theme-mode-check" />}
              </button>
            </div>
          </div>

          {/* ── Color Presets ── */}
          <div className="theme-section">
            <div className="theme-section-label">Color Themes</div>
            <div className="theme-presets-grid">
              {THEME_PRESETS.map(preset => {
                const isActive = theme.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    className={`theme-swatch${isActive ? ' active' : ''}`}
                    title={preset.name}
                    onClick={() => applyPreset(preset)}
                    style={{
                      background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.gradientEnd} 100%)`,
                    }}
                  >
                    {isActive && <Check size={14} color="white" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>

            {/* Preset labels */}
            <div className="theme-preset-names">
              {THEME_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  className={`theme-preset-label${theme.presetId === preset.id ? ' active' : ''}`}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── Custom Color ── */}
          <div className="theme-section">
            <div className="theme-section-label">Custom Accent Color</div>
            <div className="theme-custom-row">
              <div
                className="theme-custom-preview"
                style={{ background: theme.primary }}
              />
              <input
                type="color"
                className="theme-color-input"
                value={theme.primary}
                onChange={e => applyCustomColor(e.target.value)}
                title="Pick a custom accent color"
              />
              <input
                type="text"
                className="theme-hex-input"
                value={theme.primary.toUpperCase()}
                onChange={e => {
                  const v = e.target.value.trim();
                  if (/^#[0-9A-Fa-f]{6}$/.test(v)) applyCustomColor(v);
                }}
                spellCheck={false}
                maxLength={7}
                placeholder="#0f62fe"
              />
            </div>
            <p className="theme-hint">
              Type a hex value or use the color picker to set a fully custom accent.
            </p>
          </div>

          {/* ── Live Preview ── */}
          <div className="theme-section">
            <div className="theme-section-label">Preview</div>
            <div className="theme-preview-card">
              <div className="theme-preview-bar" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.gradientEnd})` }} />
              <div style={{ display: 'flex', gap: '8px', padding: '12px', flexWrap: 'wrap' }}>
                <button
                  className="theme-preview-btn-primary"
                  style={{ background: theme.primary }}
                >
                  Primary Button
                </button>
                <button className="theme-preview-btn-ghost" style={{ borderColor: theme.primary, color: theme.primary }}>
                  Ghost Button
                </button>
              </div>
              <div style={{ padding: '0 12px 12px' }}>
                <div
                  className="theme-preview-badge"
                  style={{ background: hexToRgba(theme.primary, 0.12), color: theme.primary, border: `1px solid ${hexToRgba(theme.primary, 0.3)}` }}
                >
                  Active Tag
                </div>
              </div>
            </div>
          </div>

          {/* ── Reset ── */}
          <div className="theme-section">
            <button
              className="theme-reset-btn"
              onClick={() => {
                const def = THEME_PRESETS.find(p => p.id === 'ocean')!;
                applyPreset(def);
              }}
            >
              Reset to Default
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="theme-panel-footer">
          <span className="theme-panel-footer-text">Theme is saved automatically</span>
          <button className="btn btn-primary" style={{ padding: '5px 16px', fontSize: '0.78rem' }} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  );
};
