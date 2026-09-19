import React, { useState, useEffect } from 'react';
import { Dataset, OutputItem } from '../../types';
import { InteractiveChart } from '../charts/InteractiveChart';
import {
  generateFullAiResearchReport,
  getSavedApiKey,
  saveApiKey,
  reportToOutputItem,
  exportReportToWord,
  exportReportToHtml,
  markdownToHtml,
  GeneratedResearchReport,
  AiReportConfig
} from '../../services/aiReportService';
import {
  Sparkles,
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Settings,
  Key,
  HelpCircle,
  Database,
  BarChart2,
  TrendingUp,
  Award,
  AlertCircle,
  X,
  Layers,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Share2,
  Sliders,
  ExternalLink,
  Table,
  Cpu
} from 'lucide-react';

interface AiReportModalProps {
  dataset: Dataset;
  onClose: () => void;
  onAddOutput: (output: OutputItem) => void;
  onViewOutputs: () => void;
}

export const AiReportModal: React.FC<AiReportModalProps> = ({
  dataset,
  onClose,
  onAddOutput,
  onViewOutputs
}) => {
  const [apiKey, setApiKey] = useState<string>(getSavedApiKey());
  const [showKeySettings, setShowKeySettings] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'studio' | 'guide' | 'preview'>('studio');
  const [reportTone, setReportTone] = useState<'academic' | 'executive' | 'clinical' | 'exploratory'>('academic');
  const [researchQuestion, setResearchQuestion] = useState<string>('');
  const [selectedVars, setSelectedVars] = useState<string[]>([]);
  const [model, setModel] = useState<string>('openai/gpt-oss-120b');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [report, setReport] = useState<GeneratedResearchReport | null>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [addedToOutput, setAddedToOutput] = useState<boolean>(false);

  // Initialize selected variables to all
  useEffect(() => {
    setSelectedVars(dataset.variables.map(v => v.name));
  }, [dataset]);

  const handleSaveKey = () => {
    saveApiKey(apiKey);
    setShowKeySettings(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setProgressStatus('Extracting mathematical parameters & descriptive metrics...');

    try {
      const config: AiReportConfig = {
        apiKey,
        model,
        reportTone,
        researchQuestion: researchQuestion.trim() || undefined,
        selectedVariables: selectedVars.length > 0 ? selectedVars : undefined
      };

      const generated = await generateFullAiResearchReport(dataset, config, status => {
        setProgressStatus(status);
      });

      setReport(generated);
      setAddedToOutput(false);
      setActiveTab('preview');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during AI report generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToOutputs = () => {
    if (!report) return;
    const outputItem = reportToOutputItem(report);
    onAddOutput(outputItem);
    setAddedToOutput(true);
  };

  const handleCopyMarkdown = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectAllVars = () => {
    setSelectedVars(dataset.variables.map(v => v.name));
  };

  const selectScaleOnly = () => {
    setSelectedVars(dataset.variables.filter(v => v.type === 'Numeric' && v.measure !== 'Nominal').map(v => v.name));
  };

  const toggleVariable = (vName: string) => {
    if (selectedVars.includes(vName)) {
      if (selectedVars.length > 1) {
        setSelectedVars(selectedVars.filter(v => v !== vName));
      }
    } else {
      setSelectedVars([...selectedVars, vName]);
    }
  };

  const quickPrompts = [
    'Analyze salary variance, tenure, and education predictors',
    'Evaluate gender and demographic equality across continuous metrics',
    'Examine bivariate correlations and test key directional hypotheses',
    'Investigate normality, distributional skewness, and extreme outliers'
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(11, 17, 33, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !isGenerating) onClose();
      }}
    >
      <div
        style={{
          width: '1040px',
          maxWidth: '96vw',
          height: '90vh',
          maxHeight: '900px',
          minHeight: '500px',
          background: 'var(--bg-surface)',
          borderRadius: '18px',
          boxShadow: '0 30px 70px -15px rgba(0,0,0,0.6), 0 0 0 1px var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          margin: 'auto'
        }}
      >
        {/* ── Modal Header with Ambient Gradient Accent ── */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-header)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 60%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 6px 18px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  AI Research Report Studio
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '2.5px 9px',
                    borderRadius: '9999px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#6366f1',
                    border: '1px solid rgba(99, 102, 241, 0.35)'
                  }}
                >
                  APA 7th &bull; Client-Side &bull; Tri-Engine
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Synthesize publication-grade research manuscripts, empirical statistical tables, and SVG visuals
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px'
              }}
              onClick={() => setShowKeySettings(!showKeySettings)}
              title="Configure Groq AI LLM Key & Model"
            >
              <Settings size={14} />
              <span>Config</span>
            </button>
            <button
              onClick={onClose}
              disabled={isGenerating}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Subheader Navigation Tabs ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-subtle)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('studio')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 16px',
                fontSize: '0.84rem',
                fontWeight: activeTab === 'studio' ? 700 : 500,
                color: activeTab === 'studio' ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                background: 'transparent',
                borderBottom: `2.5px solid ${activeTab === 'studio' ? 'var(--primary)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Cpu size={15} />
              <span>Report Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 16px',
                fontSize: '0.84rem',
                fontWeight: activeTab === 'guide' ? 700 : 500,
                color: activeTab === 'guide' ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                background: 'transparent',
                borderBottom: `2.5px solid ${activeTab === 'guide' ? 'var(--primary)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <BookOpen size={15} />
              <span>Quick Guide & APA Tips</span>
              <span
                style={{
                  fontSize: '0.66rem',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: 'rgba(2, 132, 199, 0.12)',
                  color: '#0284c7',
                  fontWeight: 700
                }}
              >
                Guide
              </span>
            </button>

            <button
              onClick={() => {
                if (report) setActiveTab('preview');
              }}
              disabled={!report}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 16px',
                fontSize: '0.84rem',
                fontWeight: activeTab === 'preview' ? 700 : 500,
                color: activeTab === 'preview' ? 'var(--primary)' : report ? 'var(--text-secondary)' : 'var(--text-muted)',
                border: 'none',
                background: 'transparent',
                borderBottom: `2.5px solid ${activeTab === 'preview' ? 'var(--primary)' : 'transparent'}`,
                cursor: report ? 'pointer' : 'not-allowed',
                opacity: report ? 1 : 0.6,
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={15} />
              <span>Manuscript Document</span>
              {report && (
                <span
                  style={{
                    fontSize: '0.66rem',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    background: 'rgba(22, 163, 74, 0.15)',
                    color: '#16a34a',
                    fontWeight: 700
                  }}
                >
                  Ready
                </span>
              )}
            </button>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <strong>Dataset:</strong> {dataset.name} ({dataset.data.length} cases)
          </div>
        </div>

        {/* ── API Key Settings Drawer (if toggled) ── */}
        {showKeySettings && (
          <div
            style={{
              padding: '14px 24px',
              background: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} style={{ color: '#0284c7' }} />
                Groq AI Cloud Engine Configuration
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Pre-configured default included. Offline mathematical synthesizer always available.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="gsk_..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
                }}
              />
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="openai/gpt-oss-120b">GPT-OSS 120B (High Reasoning)</option>
                <option value="qwen/qwen3.8-27b">Qwen 3.8 27B (Ultra Fast)</option>
                <option value="openai/gpt-oss-20b">GPT-OSS 20B (Compact)</option>
              </select>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                onClick={handleSaveKey}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* ── Modal Body (Scrollable) ── */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '24px' }}>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: REPORT STUDIO (CONFIGURE & GENERATE)
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'studio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Dataset Status & Metrics Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0%, rgba(99, 102, 241, 0.06) 100%)',
                  padding: '18px 22px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-color)',
                      color: 'var(--primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <Database size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {dataset.name}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {dataset.data.length} cases &bull; {dataset.variables.length} operationalized variables ready for empirical analysis
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}
                  >
                    📊 {dataset.variables.filter(v => v.type === 'Numeric' && v.measure !== 'Nominal').length} Scale Vars
                  </span>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}
                  >
                    🏷️ {dataset.variables.filter(v => v.measure === 'Nominal' || v.measure === 'Ordinal' || v.type === 'String').length} Categorical
                  </span>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(22, 163, 74, 0.1)',
                      border: '1px solid rgba(22, 163, 74, 0.25)',
                      color: '#16a34a',
                      fontWeight: 700
                    }}
                  >
                    ✓ Ready for Synthesis
                  </span>
                </div>
              </div>

              {/* Variable Selection Row */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={14} style={{ color: 'var(--primary)' }} />
                    Variables Included in Analysis ({selectedVars.length} of {dataset.variables.length}):
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={selectAllVars}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={selectScaleOnly}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Scale Only
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
                  {dataset.variables.map(v => {
                    const isSelected = selectedVars.includes(v.name);
                    return (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => toggleVariable(v.name)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-surface)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-secondary)'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {v.label || v.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Research parameters: Tone and Hypothesis */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
                {/* Tone / Format */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={14} style={{ color: '#6366f1' }} />
                    Manuscript Style & Tone:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { id: 'academic', icon: '🎓', label: 'APA 7th Academic', desc: 'Peer-reviewed empirical format with (M, SD, r, p) notation' },
                      { id: 'executive', icon: '💼', label: 'Business Executive', desc: 'Strategic KPI findings, variance, and managerial decisions' },
                      { id: 'clinical', icon: '🏥', label: 'Clinical / Health', desc: 'Epidemiological parameters, demographics, and risk factors' },
                      { id: 'exploratory', icon: '🔬', label: 'Data Science EDA', desc: 'Distribution skewness, pattern clusters, and anomalies' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setReportTone(t.id as any)}
                        style={{
                          textAlign: 'left',
                          padding: '12px',
                          borderRadius: '10px',
                          border: `1.5px solid ${reportTone === t.id ? 'var(--primary)' : 'var(--border-color)'}`,
                          background: reportTone === t.id ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.84rem', color: reportTone === t.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                          <span>{t.icon}</span>
                          <span>{t.label}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          {t.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Research Question */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lightbulb size={14} style={{ color: '#f59e0b' }} />
                    Research Question / Target Hypothesis:
                  </label>
                  <textarea
                    rows={4}
                    value={researchQuestion}
                    onChange={e => setResearchQuestion(e.target.value)}
                    placeholder="e.g., Investigate what factors drive salary variance and job satisfaction, and test for significant demographic differences."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  
                  {/* Quick Starter Prompts */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Examples:</span>
                    {quickPrompts.slice(0, 2).map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setResearchQuestion(p)}
                        style={{
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-color)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* What will be synthesized preview box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)',
                  border: '1px dashed var(--primary)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} />
                  Components Included in your Research Manuscript:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <div>&bull; <b>Academic Title & Structured Abstract</b></div>
                  <div>&bull; <b>Sample Characteristics & N={dataset.data.length}</b></div>
                  <div>&bull; <b>APA Descriptive Statistics (M, SD, Med)</b></div>
                  <div>&bull; <b>Pearson Correlation Matrix with Flags</b></div>
                  <div>&bull; <b>Interactive Visual Figures (SVG)</b></div>
                  <div>&bull; <b>Directional Hypothesis Evaluations</b></div>
                  <div>&bull; <b>Methodological Assumptions & Limitations</b></div>
                  <div>&bull; <b>Word (.doc), HTML & SPSS Tree Export</b></div>
                </div>
              </div>

              {/* Action Button / Progress */}
              {isGenerating ? (
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '14px',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '3.5px solid var(--border-color)',
                      borderTopColor: 'var(--primary)',
                      animation: 'spin 0.8s linear infinite'
                    }}
                  />
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Synthesizing Research Document...
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {progressStatus}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                  <button
                    id="btn-trigger-ai-generate"
                    onClick={handleGenerate}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 50%, #8b5cf6 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '14px 36px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.35)',
                      transition: 'all 0.2s ease',
                      letterSpacing: '-0.01em'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Sparkles size={20} />
                    <span>Generate Full Research Report</span>
                  </button>
                </div>
              )}

              {/* Error Box if applicable */}
              {errorMessage && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    color: '#dc2626',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>Notice</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>{errorMessage}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: QUICK GUIDE & APA BEST PRACTICES (THE "SMALL GUIDE")
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'guide' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Hero Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)',
                    color: 'var(--primary)',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    AI Research Studio: User Guide & APA 7th Best Practices
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Learn how the client-side statistical engine digests your dataset, how to formulate research hypotheses, and how to export publication-ready manuscripts.
                  </p>
                </div>
              </div>

              {/* Guide Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
                
                {/* 1. How It Works */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.92rem' }}>
                    <Cpu size={17} />
                    <span>1. Client-Side Mathematical Digest</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    Unlike ordinary chatbots, Open SPSS Web <strong>never uploads your raw data rows</strong>. It calculates 64-bit IEEE 754 precision statistics right inside your browser:
                  </p>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li>Central tendency: Means, medians, standard errors</li>
                    <li>Dispersion: Variances, standard deviations, IQR</li>
                    <li>Distributional health: Skewness (γ₁), min, max</li>
                    <li>Bivariate Pearson product-moment correlation matrix (<em>r</em>, <em>p</em>)</li>
                  </ul>
                </div>

                {/* 2. Selecting the Best Style */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: 800, fontSize: '0.92rem' }}>
                    <Award size={17} />
                    <span>2. Choosing the Right Tone</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li><strong>APA 7th Academic:</strong> Formats exact statistical notation (<em>M</em> = 42.10, <em>SD</em> = 8.35, <em>r</em> = .64, <em>p</em> &lt; .001). Perfect for university coursework, capstones, and thesis chapters.</li>
                    <li><strong>Business Executive:</strong> Direct, actionable summaries highlighting variance, group differences, and managerial ROI.</li>
                    <li><strong>Clinical / Health:</strong> Focuses on patient cohorts, demographic disparities, and risk parameter evaluations.</li>
                  </ul>
                </div>

                {/* 3. Formulating Hypotheses */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '0.92rem' }}>
                    <Lightbulb size={17} />
                    <span>3. Framing Targeted Hypotheses</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    Supplying a target hypothesis focuses the AI's discussion on specific relationships:
                  </p>
                  <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <em>"H1: Beginning salary (salbegin) and education level (educ) will demonstrate statistically significant positive covariance with current salary."</em>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    The synthesizer will explicitly evaluate effect sizes (Cohen, 1988) and cite directional confirmation.
                  </p>
                </div>

                {/* 4. Exporting & Microsoft Word */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 800, fontSize: '0.92rem' }}>
                    <Download size={17} />
                    <span>4. Exporting Your Work</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li><strong>Microsoft Word (.doc):</strong> Generates an editable Word document with native Word tables, triple-rule APA formatting, and headers.</li>
                    <li><strong>Standalone HTML:</strong> Self-contained file ready to view in any browser without requiring internet.</li>
                    <li><strong>Send to SPSS Output:</strong> Injects the entire paper, tables, and charts into the SPSS Output Viewer tree next to your syntax runs.</li>
                  </ul>
                </div>
              </div>

              {/* Ready CTA */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Ready to create your document? Click below to return to the studio.
                  </span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('studio')}
                  style={{ padding: '8px 20px', fontSize: '0.84rem' }}
                >
                  Configure & Generate
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3: GENERATED MANUSCRIPT PREVIEW
             ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'preview' && report && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Sticky Action Bar */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Research Manuscript Generated
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Export Word */}
                  <button
                    id="btn-export-doc"
                    className="btn btn-primary"
                    style={{
                      padding: '7px 15px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#0284c7',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                    }}
                    onClick={() => exportReportToWord(report)}
                    title="Download editable Microsoft Word (.doc) manuscript"
                  >
                    <Download size={14} />
                    <span>Download Word (.doc)</span>
                  </button>

                  {/* Export HTML */}
                  <button
                    id="btn-export-html"
                    className="btn btn-secondary"
                    style={{ padding: '7px 13px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => exportReportToHtml(report)}
                    title="Download standalone HTML report"
                  >
                    <FileText size={14} />
                    <span>HTML Report</span>
                  </button>

                  {/* Print / PDF */}
                  <button
                    id="btn-print-report"
                    className="btn btn-secondary"
                    style={{ padding: '7px 13px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={handlePrint}
                    title="Print or Save as PDF"
                  >
                    <Printer size={14} />
                    <span>Print / PDF</span>
                  </button>

                  {/* Copy Markdown */}
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '7px 13px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={handleCopyMarkdown}
                    title="Copy full markdown text to clipboard"
                  >
                    {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {/* Add to SPSS Outputs */}
                  <button
                    id="btn-add-to-spss-output"
                    className="btn btn-secondary"
                    style={{
                      padding: '7px 13px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderColor: addedToOutput ? '#16a34a' : undefined,
                      color: addedToOutput ? '#16a34a' : undefined
                    }}
                    onClick={handleAddToOutputs}
                    title="Add document to SPSS Output Viewer tab"
                  >
                    {addedToOutput ? <Check size={14} /> : <Layers size={14} />}
                    <span>{addedToOutput ? 'Added to Output' : 'Send to Output'}</span>
                  </button>

                  {/* Regenerate */}
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                    onClick={() => setActiveTab('studio')}
                    title="Modify parameters and regenerate"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Research Document Sheet (Paper Style) */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '38px 46px',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}
              >
                {/* Paper Header & Running Head */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '8px',
                      marginBottom: '16px'
                    }}
                  >
                    <span>Running Head: QUANTITATIVE RESEARCH REPORT</span>
                    <span>APA 7TH EDITION</span>
                  </div>

                  <h1
                    style={{
                      fontSize: '1.7rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: '0 0 12px 0',
                      lineHeight: 1.3,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {report.title}
                  </h1>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      borderBottom: '1.5px solid var(--border-color)',
                      paddingBottom: '16px'
                    }}
                  >
                    <span><strong>Dataset:</strong> {report.datasetName}</span>
                    <span>&bull;</span>
                    <span><strong>Sample:</strong> N = {report.totalCases} cases</span>
                    <span>&bull;</span>
                    <span><strong>Variables:</strong> {report.totalVariables}</span>
                    <span>&bull;</span>
                    <span><strong>Date:</strong> {report.generatedAt}</span>
                    <span>&bull;</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Open SPSS Web AI Research Studio</span>
                  </div>
                </div>

                {/* Abstract Box */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    borderLeft: '4px solid var(--primary)',
                    padding: '18px 22px',
                    borderRadius: '0 10px 10px 0',
                    fontSize: '0.92rem',
                    lineHeight: 1.65,
                    color: 'var(--text-primary)',
                    fontStyle: 'italic'
                  }}
                >
                  <strong style={{ fontStyle: 'normal', color: 'var(--primary)', display: 'block', marginBottom: '6px', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Abstract & Executive Summary
                  </strong>
                  {report.abstract}
                </div>

                {/* Embedded Charts Section */}
                <div>
                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
                    Empirical Visualizations & Figures
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                    {report.charts.map((chart, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-subtle)',
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <InteractiveChart chart={chart} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Narrative Manuscript Markdown Text */}
                <div
                  className="report-manuscript-body"
                  style={{
                    fontSize: '0.92rem',
                    lineHeight: 1.78,
                    color: 'var(--text-primary)'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(
                      report.fullMarkdown
                        // skip the main title (already shown above)
                        .replace(/^#\s+.+\n?/, '')
                        // skip abstract section (already shown in abstract box)
                        .replace(/##\s+Abstract[^#]*/i, '')
                    )
                  }}
                />

                {/* APA Statistical Summary Tables */}
                <div>
                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <TrendingUp size={18} style={{ color: '#16a34a' }} />
                    Statistical Data Tables (APA 7th Format)
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {report.tables.map((table, tIdx) => (
                      <div
                        key={tIdx}
                        style={{
                          overflowX: 'auto',
                          background: 'var(--bg-subtle)',
                          padding: '18px 22px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {table.title}
                        </div>
                        {table.subtitle && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
                            {table.subtitle}
                          </div>
                        )}

                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.82rem'
                          }}
                        >
                          <thead>
                            {table.headers.map((hRow, hIdx) => (
                              <tr key={hIdx} style={{ borderTop: '2px solid var(--text-primary)', borderBottom: '1px solid var(--text-primary)' }}>
                                {hRow.map((cell, cIdx) => (
                                  <th
                                    key={cIdx}
                                    style={{
                                      padding: '9px 12px',
                                      textAlign: cIdx === 0 ? 'left' : 'right',
                                      fontWeight: 700,
                                      color: 'var(--text-primary)',
                                      background: 'transparent'
                                    }}
                                  >
                                    {cell}
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody>
                            {table.rows.map((rRow, rIdx) => (
                              <tr
                                key={rIdx}
                                style={{
                                  borderBottom: rIdx === table.rows.length - 1 ? '2px solid var(--text-primary)' : '1px solid var(--border-subtle)'
                                }}
                              >
                                {rRow.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    style={{
                                      padding: '7px 12px',
                                      textAlign: cIdx === 0 ? 'left' : 'right',
                                      color: 'var(--text-secondary)'
                                    }}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {table.footnotes && table.footnotes.length > 0 && (
                          <div style={{ marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Note. {table.footnotes.join(' ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer credit */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span>Open SPSS Web &bull; Automated AI Research Studio</span>
                  <span>Developed by JaNuK (@lordskidgod)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
