import React, { useState, useEffect, useRef } from 'react';
import { Dataset, Variable, OutputItem, ValueLabel } from './types';
import { EMPLOYEE_DATA, CUSTOMER_SURVEY_DATA } from './sample_data/datasets';
import { parseCSV, parseExcel, exportToCSV, exportToExcel, exportProjectBundle, exportOutputToHTML } from './utils/dataIO';
import { TopNav } from './components/TopNav';
import { Toolbar } from './components/Toolbar';
import { DataView } from './components/DataView';
import { VariableView } from './components/VariableView';
import { OutputViewer } from './components/OutputViewer';
import { SyntaxEditor } from './components/SyntaxEditor';
import { ValueLabelsModal } from './components/dialogs/ValueLabelsModal';
import { ThemePanel, ThemeConfig, DEFAULT_THEME, applyTheme } from './components/ThemePanel';
import {
  FrequenciesDialog,
  DescriptivesDialog,
  CrosstabsDialog,
  TTestIndependentDialog,
  OneWayAnovaDialog,
  CorrelationsDialog,
  LinearRegressionDialog,
  FactorAnalysisDialog,
  ReliabilityDialog,
  KMeansClusterDialog,
  ComputeVariableDialog,
  AboutModal
} from './components/dialogs/AllAnalysisDialogs';
import { DataHealthModal } from './components/dialogs/DataHealthModal';
import { FeaturesModal } from './components/dialogs/FeaturesModal';
import { ChangelogModal, CURRENT_RELEASE_VERSION, CHANGELOG_STORAGE_KEY } from './components/dialogs/ChangelogModal';
import { AiReportModal } from './components/dialogs/AiReportModal';
import { AuthModal } from './components/dialogs/AuthModal';
import { CloudProjectsModal } from './components/dialogs/CloudProjectsModal';
import { SaveProjectModal } from './components/dialogs/SaveProjectModal';
import { AdminDataModal } from './components/dialogs/AdminDataModal';
import { LegalPage } from './pages/LegalPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { useAuth } from './contexts/AuthContext';
import { saveLocalSession, loadLocalSession, saveRecoveryDraft } from './services/localSessionService';
import { saveCloudProject } from './services/cloudStorageService';
import { Table, Layers, FileText, Code, UploadCloud } from 'lucide-react';

export const App: React.FC = () => {
  const { user, profile, openAuthModal, isAdmin, isLoading: authLoading } = useAuth();
  const [pageRoute, setPageRoute] = useState<'app' | 'privacy' | 'terms' | 'license' | 'ethics' | 'admin'>('app');
  const [activeDataset, setActiveDataset] = useState<Dataset>(EMPLOYEE_DATA);
  const [activeTab, setActiveTab] = useState<'data' | 'variable' | 'output' | 'syntax'>('data');
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [syntaxCode, setSyntaxCode] = useState<string>(`* Open SPSS Web — Syntax Editor
* Load a dataset, then run your analysis commands below.
`);

  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [cloudModalMode, setCloudModalMode] = useState<'save' | 'open' | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [importedFileName, setImportedFileName] = useState<string | undefined>(undefined);
  const [importedFileType, setImportedFileType] = useState<'xlsx' | 'xls' | 'csv' | 'tsv' | 'ospss' | 'sample' | 'new'>('sample');

  const [valueLabelsModalIndex, setValueLabelsModalIndex] = useState<number | null>(null);
  const [valueLabelsActive, setValueLabelsActive] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('ospss-theme');
      return saved ? JSON.parse(saved) : DEFAULT_THEME;
    } catch { return DEFAULT_THEME; }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme whenever theme or dark mode changes
  useEffect(() => {
    applyTheme(theme, isDarkMode);
    try { localStorage.setItem('ospss-theme', JSON.stringify(theme)); } catch {}
  }, [theme, isDarkMode]);

  // Sync dark theme class to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Path and Hash routing for separate pages: /privacy, /terms, /license, /ethics, /admin
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (
        pathname.startsWith('/admin') || hash.includes('admin') ||
        pathname.startsWith('/dashboard') || hash.includes('dashboard')
      ) {
        // Only allow route to resolve once auth has loaded and role is confirmed
        // If not admin, silently redirect to root — no error page, no hint it exists
        if (!authLoading && isAdmin) {
          setPageRoute('admin');
        } else if (!authLoading) {
          window.history.replaceState({}, '', '/');
          setPageRoute('app');
        }
      } else if (pathname.startsWith('/privacy') || hash.includes('privacy')) {
        setPageRoute('privacy');
      } else if (pathname.startsWith('/terms') || hash.includes('terms')) {
        setPageRoute('terms');
      } else if (pathname.startsWith('/license') || hash.includes('license')) {
        setPageRoute('license');
      } else if (pathname.startsWith('/ethics') || hash.includes('ethics')) {
        setPageRoute('ethics');
      } else {
        setPageRoute('app');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [isAdmin, authLoading]);

  // Show "What's New / Changelog" popup once per release when users arrive at the app
  useEffect(() => {
    if (pageRoute !== 'app') return;

    try {
      const lastSeenVersion = localStorage.getItem(CHANGELOG_STORAGE_KEY);
      if (lastSeenVersion !== CURRENT_RELEASE_VERSION) {
        // Wait 700ms after initial mount to allow workspace UI to settle smoothly
        const timer = setTimeout(() => {
          setActiveDialog(prev => (prev === null ? 'changelog' : prev));
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('LocalStorage error reading changelog state:', e);
    }
  }, [pageRoute]);

  // 1. On initial mount, restore saved session or disaster recovery draft if available
  useEffect(() => {
    try {
      const saved = loadLocalSession();
      if (saved && saved.dataset && saved.dataset.variables && saved.dataset.variables.length > 0) {
        setActiveDataset(saved.dataset);
        if (saved.outputs && Array.isArray(saved.outputs)) setOutputs(saved.outputs);
        if (saved.syntax) setSyntaxCode(saved.syntax);
        if (saved.importedFileName) setImportedFileName(saved.importedFileName);
        if (saved.importedFileType) setImportedFileType(saved.importedFileType);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.warn('Could not restore local session:', err);
    }
  }, []);

  // 2. Auto-save session to localStorage on EVERY change (debounced 1.5s)
  //    This ensures refresh always restores current work — no manual action needed
  useEffect(() => {
    const timer = setTimeout(() => {
      saveRecoveryDraft({
        dataset: activeDataset,
        outputs,
        syntax: syntaxCode,
        importedFileName,
        importedFileType,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [activeDataset, outputs, syntaxCode, importedFileName, importedFileType]);

  // 3. Global Ctrl+S / Cmd+S — smart save
  //    • Imported Excel/CSV → silently re-export to that file format (no modal)
  //    • New dataset / Sample → open Save Modal for options
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyS' || e.key.toLowerCase() === 's')) {
        e.preventDefault();
        e.stopPropagation();
        if (importedFileType === 'xlsx' || importedFileType === 'xls') {
          exportToExcel(activeDataset);
          setHasUnsavedChanges(false);
        } else if (importedFileType === 'csv' || importedFileType === 'tsv') {
          exportToCSV(activeDataset);
          setHasUnsavedChanges(false);
        } else if (importedFileType === 'ospss') {
          exportProjectBundle(activeDataset, outputs, syntaxCode);
          setHasUnsavedChanges(false);
        } else {
          // New dataset or sample data — show modal with options
          setIsSaveModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
  }, [importedFileType, activeDataset, outputs, syntaxCode]);

  // 5. Auto-save pending cloud project once user signs in or registers
  useEffect(() => {
    if (user) {
      const pendingRaw = sessionStorage.getItem('ospss_pending_cloud_save');
      if (pendingRaw) {
        sessionStorage.removeItem('ospss_pending_cloud_save');
        try {
          const pending = JSON.parse(pendingRaw);
          saveCloudProject({
            name: pending.name || activeDataset.name,
            category: pending.category || 'General',
            description: pending.description || '',
            dataset: activeDataset,
            outputItems: outputs,
            syntaxCode,
            isPro: profile?.subscription_tier === 'pro'
          }).then(res => {
            if (!res.error) {
              setHasUnsavedChanges(false);
              alert(`Welcome, ${user.email}!\n\nYour project "${pending.name || activeDataset.name}" has been successfully saved to your Open SPSS Cloud account.`);
            }
          });
        } catch (e) {
          console.error('Failed to auto-save pending cloud project:', e);
        }
      }
    }
  }, [user, profile, activeDataset, outputs, syntaxCode]);

  const handleOpenDialog = (dialogName: string) => {
    if (dialogName === 'admin' || dialogName === 'admin_data') {
      // Admin gate: only proceed if currently authenticated as admin
      if (!isAdmin) return;
      window.history.pushState({}, '', '/');
      setPageRoute('admin');
    } else if (dialogName === 'terms') {
      window.history.pushState({}, '', '/terms');
      setPageRoute('terms');
    } else if (dialogName === 'license') {
      window.history.pushState({}, '', '/license');
      setPageRoute('license');
    } else if (dialogName === 'privacy' || dialogName === 'terms_privacy') {
      window.history.pushState({}, '', '/privacy');
      setPageRoute('privacy');
    } else if (dialogName === 'ethics') {
      window.history.pushState({}, '', '/ethics');
      setPageRoute('ethics');
    } else {
      setActiveDialog(dialogName);
    }
  };

  // Data View cell update
  const handleUpdateCell = (rowIndex: number, colName: string, value: any) => {
    setHasUnsavedChanges(true);
    setActiveDataset(prev => {
      const updatedData = [...prev.data];
      updatedData[rowIndex] = { ...updatedData[rowIndex], [colName]: value };
      return { ...prev, data: updatedData };
    });
  };

  // Sort cases
  const handleSortColumn = (colName: string, ascending: boolean) => {
    setHasUnsavedChanges(true);
    setActiveDataset(prev => {
      const sorted = [...prev.data].sort((a, b) => {
        const valA = a[colName];
        const valB = b[colName];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return ascending ? valA - valB : valB - valA;
        }
        return ascending
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
      return { ...prev, data: sorted };
    });
  };

  // Add Case
  const handleAddCase = () => {
    setHasUnsavedChanges(true);
    setActiveDataset(prev => {
      const emptyRow: Record<string, any> = {};
      prev.variables.forEach(v => {
        emptyRow[v.name] = null;
      });
      return { ...prev, data: [...prev.data, emptyRow] };
    });
  };

  // Clear all data rows (keep variable definitions)
  const handleClearData = () => {
    const confirmed = window.confirm(
      `Clear all ${activeDataset.data.length} case(s) from "${activeDataset.name}"?\n\nVariable definitions will be kept. This cannot be undone.`
    );
    if (!confirmed) return;
    setHasUnsavedChanges(true);
    setActiveDataset(prev => {
      // Create one blank starter row so the grid isn't empty
      const blankRow: Record<string, any> = {};
      prev.variables.forEach(v => { blankRow[v.name] = null; });
      return { ...prev, data: [blankRow] };
    });
  };

  // Add Variable
  const handleAddVariable = () => {
    setHasUnsavedChanges(true);
    setActiveDataset(prev => {
      const newVarIndex = prev.variables.length + 1;
      const newVarName = `var${newVarIndex}`;
      const newVar: Variable = {
        id: `v_${newVarName}_${Date.now()}`,
        name: newVarName,
        type: 'Numeric',
        width: 8,
        decimals: 2,
        label: `New Variable ${newVarIndex}`,
        values: [],
        missing: '',
        columns: 8,
        align: 'Right',
        measure: 'Scale',
        role: 'Input'
      };

      const updatedData = prev.data.map(row => ({ ...row, [newVarName]: null }));
      return {
        ...prev,
        variables: [...prev.variables, newVar],
        data: updatedData
      };
    });
  };

  // Update Variable metadata
  const handleUpdateVariable = (index: number, updated: Partial<Variable>) => {
    setHasUnsavedChanges(true);
    setActiveDataset(prev => {
      const oldName = prev.variables[index].name;
      const newVars = [...prev.variables];
      newVars[index] = { ...newVars[index], ...updated };

      // If variable was renamed, rename keys in all rows
      let updatedData = prev.data;
      if (updated.name && updated.name !== oldName) {
        const newName = updated.name;
        updatedData = prev.data.map(row => {
          const newRow = { ...row };
          newRow[newName] = newRow[oldName];
          delete newRow[oldName];
          return newRow;
        });
      }

      return { ...prev, variables: newVars, data: updatedData };
    });
  };

  // Delete Variable
  const handleDeleteVariable = (index: number) => {
    setHasUnsavedChanges(true);
    setActiveDataset(prev => {
      const varNameToDelete = prev.variables[index].name;
      const newVars = prev.variables.filter((_, i) => i !== index);
      const updatedData = prev.data.map(row => {
        const newRow = { ...row };
        delete newRow[varNameToDelete];
        return newRow;
      });
      return { ...prev, variables: newVars, data: updatedData };
    });
  };

  // Save Value Labels
  const handleSaveValueLabels = (varIndex: number, labels: ValueLabel[]) => {
    setHasUnsavedChanges(true);
    handleUpdateVariable(varIndex, { values: labels });
  };

  // Compute Variable
  const handleCompute = (targetVar: string, expression: string) => {
    setHasUnsavedChanges(true);
    setActiveDataset(prev => {
      // Check if target variable already exists or create new
      let varExists = prev.variables.some(v => v.name === targetVar);
      let newVars = [...prev.variables];
      if (!varExists) {
        newVars.push({
          id: `v_${targetVar}_${Date.now()}`,
          name: targetVar,
          type: 'Numeric',
          width: 8,
          decimals: 2,
          label: `Computed: ${expression}`,
          values: [],
          missing: '',
          columns: 8,
          align: 'Right',
          measure: 'Scale',
          role: 'Input'
        });
      }

      // Compute row by row with math sandbox
      const updatedData = prev.data.map(row => {
        try {
          // Replace functions and variables
          let expr = expression;
          expr = expr.replace(/\bLN\(/gi, 'Math.log(');
          expr = expr.replace(/\bEXP\(/gi, 'Math.exp(');
          expr = expr.replace(/\bSQRT\(/gi, 'Math.sqrt(');
          expr = expr.replace(/\bABS\(/gi, 'Math.abs(');
          expr = expr.replace(/\bROUND\(/gi, 'Math.round(');

          prev.variables.forEach(v => {
            const regex = new RegExp(`\\b${v.name}\\b`, 'g');
            const val = row[v.name];
            expr = expr.replace(regex, val !== null && val !== undefined ? String(val) : '0');
          });

          // Evaluate safely
          // eslint-disable-next-line no-eval
          const result = Function(`"use strict"; return (${expr});`)();
          return {
            ...row,
            [targetVar]: typeof result === 'number' && !isNaN(result) ? result : null
          };
        } catch (e) {
          return { ...row, [targetVar]: null };
        }
      });

      return {
        ...prev,
        variables: newVars,
        data: updatedData
      };
    });
  };

  // Unified File Processor (Excel .xlsx/.xls, CSV, TSV, JSON, OSPSS)
  const processFile = async (file: File) => {
    try {
      const lowerName = file.name.toLowerCase();
      setImportedFileName(file.name);
      if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const ds = await parseExcel(buffer, file.name);
        setActiveDataset(ds);
        setImportedFileType('xlsx');
      } else if (lowerName.endsWith('.ospss') || lowerName.endsWith('.json')) {
        const text = await file.text();
        const bundle = JSON.parse(text);
        if (bundle.dataset) {
          setActiveDataset(bundle.dataset);
          if (bundle.outputs) setOutputs(bundle.outputs);
          if (bundle.syntax) setSyntaxCode(bundle.syntax);
        }
        setImportedFileType('ospss');
      } else {
        // CSV / TSV / TXT
        const text = await file.text();
        const ds = parseCSV(text, file.name);
        setActiveDataset(ds);
        setImportedFileType(lowerName.endsWith('.tsv') ? 'tsv' : 'csv');
      }
      setHasUnsavedChanges(false);
    } catch (err) {
      alert('Error loading dataset: ' + (err as Error).message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handlePasteSyntax = (syntax: string) => {
    setHasUnsavedChanges(true);
    setSyntaxCode(prev => prev + '\n\n' + syntax);
    setActiveTab('syntax');
  };

  const handleAddOutput = (item: OutputItem) => {
    setHasUnsavedChanges(true);
    setOutputs(prev => [item, ...prev]);
  };

  if (pageRoute === 'admin') {
    // Double-check role at render time — blocks anyone who manipulates state directly
    if (!isAdmin) {
      window.history.replaceState({}, '', '/');
      setPageRoute('app');
      return null;
    }
    return (
      <AdminDashboardPage
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onBack={() => {
          window.history.pushState({}, '', '/');
          setPageRoute('app');
        }}
        onLoadDataset={(ds) => {
          setActiveDataset(ds);
          setActiveTab('data');
          window.history.pushState({}, '', '/');
          setPageRoute('app');
        }}
      />
    );
  }

  if (pageRoute !== 'app') {
    return (
      <LegalPage
        initialTab={pageRoute}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onBack={() => {
          window.history.pushState({}, '', '/');
          setPageRoute('app');
        }}
      />
    );
  }

  return (
    <div
      className="app-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input for open data */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.tsv,.txt,.json,.ospss"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Top Header & Menu */}
      <TopNav
        activeDataset={activeDataset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        openDialog={handleOpenDialog}
        onNewDataset={() => {
          setActiveDataset({
            id: 'ds_' + Date.now(),
            name: 'Untitled_DataSet',
            variables: [
              { id: 'v1', name: 'var1', type: 'Numeric', width: 8, decimals: 2, label: '', values: [], missing: '', columns: 8, align: 'Right', measure: 'Scale', role: 'Input' }
            ],
            data: [{ var1: null }]
          });
          setOutputs([]);
          setImportedFileName(undefined);
          setImportedFileType('new');
          setHasUnsavedChanges(false);
        }}
        onOpenSample={key => {
          if (key === 'employee') setActiveDataset(EMPLOYEE_DATA);
          else if (key === 'survey') setActiveDataset(CUSTOMER_SURVEY_DATA);
          setImportedFileName(undefined);
          setImportedFileType('sample');
          setHasUnsavedChanges(false);
        }}
        onExportCSV={() => exportToCSV(activeDataset)}
        onExportExcel={() => exportToExcel(activeDataset)}
        onExportProject={() => exportProjectBundle(activeDataset, outputs, syntaxCode)}
        onExportHTMLReport={() => exportOutputToHTML(outputs, activeDataset.name)}
        onImportCSVClick={() => fileInputRef.current?.click()}
        onImportExcelClick={() => fileInputRef.current?.click()}
        onClearData={handleClearData}
        onOpenTheme={() => setIsThemePanelOpen(true)}
        valueLabelsActive={valueLabelsActive}
        setValueLabelsActive={setValueLabelsActive}
        onOpenCloudModal={mode => setCloudModalMode(mode)}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Action Toolbar */}
      <Toolbar
        onOpenClick={() => fileInputRef.current?.click()}
        onSaveClick={() => {
          if (importedFileType === 'xlsx' || importedFileType === 'xls') {
            exportToExcel(activeDataset); setHasUnsavedChanges(false);
          } else if (importedFileType === 'csv' || importedFileType === 'tsv') {
            exportToCSV(activeDataset); setHasUnsavedChanges(false);
          } else if (importedFileType === 'ospss') {
            exportProjectBundle(activeDataset, outputs, syntaxCode); setHasUnsavedChanges(false);
          } else {
            setIsSaveModalOpen(true);
          }
        }}
        onPrintClick={() => window.print()}
        openDialog={handleOpenDialog}
        valueLabelsActive={valueLabelsActive}
        setValueLabelsActive={setValueLabelsActive}
        onGoToCase={() => {
          const caseNum = prompt('Go to Case number (1 to ' + activeDataset.data.length + '):');
          if (caseNum && !isNaN(Number(caseNum))) {
            setActiveTab('data');
          }
        }}
        onGoToVar={() => {
          const varName = prompt('Enter Variable name:');
          if (varName) {
            setActiveTab('data');
          }
        }}
      />

      {/* Main View Display */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'data' && (
          <DataView
            dataset={activeDataset}
            valueLabelsActive={valueLabelsActive}
            onUpdateCell={handleUpdateCell}
            onSortColumn={handleSortColumn}
            onAddCase={handleAddCase}
            onAddVariable={handleAddVariable}
          />
        )}

        {activeTab === 'variable' && (
          <VariableView
            dataset={activeDataset}
            onUpdateVariable={handleUpdateVariable}
            onAddVariable={handleAddVariable}
            onDeleteVariable={handleDeleteVariable}
            onOpenValueLabelsModal={idx => setValueLabelsModalIndex(idx)}
          />
        )}

        {activeTab === 'output' && (
          <OutputViewer
            outputs={outputs}
            projectName={activeDataset.name}
            onClearOutput={() => setOutputs([])}
            onExportHTML={() => exportOutputToHTML(outputs, activeDataset.name)}
          />
        )}

        {activeTab === 'syntax' && (
          <SyntaxEditor
            syntaxCode={syntaxCode}
            setSyntaxCode={setSyntaxCode}
            dataset={activeDataset}
            onAddOutput={handleAddOutput}
            onViewOutputs={() => setActiveTab('output')}
          />
        )}
      </div>

      {/* Unified Modern Desktop Dock & Status Bar */}
      <footer className="modern-footer-dock">
        {/* View Mode Switcher Tabs */}
        <nav className="footer-view-tabs" aria-label="View Switchers">
          <button
            className={`footer-tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
            title="Data View (Spreadsheet cases & values)"
          >
            <Table size={13} />
            <span>Data View</span>
          </button>
          <button
            className={`footer-tab-btn ${activeTab === 'variable' ? 'active' : ''}`}
            onClick={() => setActiveTab('variable')}
            title="Variable View (Metadata dictionary)"
          >
            <Layers size={13} />
            <span>Variable View</span>
          </button>
          <button
            className={`footer-tab-btn ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
            title="Analysis Output Viewer & APA Tables"
          >
            <FileText size={13} />
            <span>Output</span>
            {outputs.length > 0 && (
              <span className="footer-tab-badge">{outputs.length}</span>
            )}
          </button>
          <button
            className={`footer-tab-btn ${activeTab === 'syntax' ? 'active' : ''}`}
            onClick={() => setActiveTab('syntax')}
            title="SPSS Command Syntax Studio"
          >
            <Code size={13} />
            <span>Syntax</span>
          </button>
        </nav>

        {/* Status Indicators & Metadata */}
        <div className="footer-status-gutter">
          {/* Left side */}
          <div className="footer-status-left">
            <div className="status-indicator-group" title="Statistical computation engine active">
              <span className="status-pulse-dot" />
              <span className="status-processor-text">Open SPSS Processor is ready</span>
            </div>
            <span className="footer-sep">•</span>
            <div className="dataset-indicator" title={`Active Dataset: ${activeDataset.name}`}>
              <span className="dataset-label">DataSet:</span>
              <span className="dataset-name-text">{activeDataset.name}</span>
            </div>
            <span className="footer-sep">•</span>
            <button
              id="footer-save-status-btn"
              onClick={() => setIsSaveModalOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.72rem',
                color: hasUnsavedChanges ? '#d97706' : '#10b981',
                fontWeight: 600
              }}
              title={hasUnsavedChanges ? 'You have unsaved changes. Click or press Ctrl+S to save.' : 'Project is saved.'}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: hasUnsavedChanges ? '#f59e0b' : '#10b981'
              }} />
              <span>{hasUnsavedChanges ? 'Unsaved (Ctrl+S)' : 'Saved'}</span>
            </button>
          </div>

          {/* Right side */}
          <div className="footer-status-right">
            <div className="filter-group">
              <span className="flag-pill">Filter: OFF</span>
              <span className="flag-pill">Weight: OFF</span>
              <span className="flag-pill">Split: OFF</span>
            </div>
            <span className="footer-sep">•</span>
            <span className="metric-pill"><b>{activeDataset.data.length}</b> Cases</span>
            <span className="footer-sep">•</span>
            <span className="metric-pill"><b>{activeDataset.variables.length}</b> Variables</span>
            <span className="footer-sep">•</span>
            <a
              href="/privacy"
              id="footer-privacy-policy-link"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
              title="View Open SPSS Web Privacy Policy (GDPR / CCPA)"
            >
              Privacy Policy ↗
            </a>
            <span className="footer-sep">•</span>
            <a
              href="/terms"
              id="footer-terms-of-service-link"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
              title="View Open SPSS Web Terms of Service"
            >
              Terms of Service ↗
            </a>
          </div>
        </div>
      </footer>

      {/* Value Labels Modal */}
      {valueLabelsModalIndex !== null && (
        <ValueLabelsModal
          variable={activeDataset.variables[valueLabelsModalIndex]}
          onSave={labels => handleSaveValueLabels(valueLabelsModalIndex, labels)}
          onClose={() => setValueLabelsModalIndex(null)}
        />
      )}

      {/* Statistical Procedure Modals */}
      {activeDialog === 'frequencies' && (
        <FrequenciesDialog
          dataset={activeDataset}
          onAddOutput={handleAddOutput}
          onPasteSyntax={handlePasteSyntax}
          onClose={() => setActiveDialog(null)}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {activeDialog === 'descriptives' && (
        <DescriptivesDialog
          dataset={activeDataset}
          onAddOutput={handleAddOutput}
          onPasteSyntax={handlePasteSyntax}
          onClose={() => setActiveDialog(null)}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {activeDialog === 'crosstabs' && (
        <CrosstabsDialog
          dataset={activeDataset}
          onAddOutput={handleAddOutput}
          onPasteSyntax={handlePasteSyntax}
          onClose={() => setActiveDialog(null)}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {activeDialog === 'ttest_indep' && (
        <TTestIndependentDialog
          dataset={activeDataset}
          onAddOutput={handleAddOutput}
          onPasteSyntax={handlePasteSyntax}
          onClose={() => setActiveDialog(null)}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {activeDialog === 'oneway_anova' && (
        <OneWayAnovaDialog
          dataset={activeDataset}
          onAddOutput={handleAddOutput}
          onPasteSyntax={handlePasteSyntax}
          onClose={() => setActiveDialog(null)}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {activeDialog === 'correlation' && (
        <CorrelationsDialog
          dataset={activeDataset}
          onAddOutput={handleAddOutput}
          onPasteSyntax={handlePasteSyntax}
          onClose={() => setActiveDialog(null)}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {activeDialog === 'regression' && (
        <LinearRegressionDialog
          dataset={activeDataset}
          onAddOutput={handleAddOutput}
          onPasteSyntax={handlePasteSyntax}
          onClose={() => setActiveDialog(null)}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {activeDialog === 'factor' && (
        <FactorAnalysisDialog
          dataset={activeDataset}
          onAddOutput={handleAddOutput}
          onPasteSyntax={handlePasteSyntax}
          onClose={() => setActiveDialog(null)}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {activeDialog === 'reliability' && (
        <ReliabilityDialog
          dataset={activeDataset}
          onAddOutput={handleAddOutput}
          onPasteSyntax={handlePasteSyntax}
          onClose={() => setActiveDialog(null)}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {activeDialog === 'kmeans' && (
        <KMeansClusterDialog
          dataset={activeDataset}
          onAddOutput={handleAddOutput}
          onPasteSyntax={handlePasteSyntax}
          onClose={() => setActiveDialog(null)}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {activeDialog === 'compute' && (
        <ComputeVariableDialog
          dataset={activeDataset}
          onCompute={handleCompute}
          onClose={() => setActiveDialog(null)}
        />
      )}

      {activeDialog === 'health' && (
        <DataHealthModal
          dataset={activeDataset}
          onClose={() => setActiveDialog(null)}
          onOpenCompute={() => setActiveDialog('compute')}
        />
      )}

      {activeDialog === 'about' && (
        <AboutModal
          onClose={() => setActiveDialog(null)}
          onOpenFeatures={() => setActiveDialog('features')}
          onOpenChangelog={() => setActiveDialog('changelog')}
          onOpenTerms={(tab) => {
            const page = tab || 'terms';
            window.history.pushState({}, '', `/${page}`);
            setPageRoute(page);
            setActiveDialog(null);
          }}
        />
      )}

      {activeDialog === 'features' && (
        <FeaturesModal onClose={() => setActiveDialog(null)} />
      )}

      {activeDialog === 'changelog' && (
        <ChangelogModal
          onClose={() => {
            try {
              localStorage.setItem(CHANGELOG_STORAGE_KEY, CURRENT_RELEASE_VERSION);
            } catch (e) {
              // ignore
            }
            setActiveDialog(null);
          }}
        />
      )}

      {activeDialog === 'admin_data' && (
        <AdminDataModal
          isOpen={true}
          onClose={() => setActiveDialog(null)}
          onLoadDataset={(ds) => {
            setActiveDataset(ds);
            setActiveTab('data');
            setActiveDialog(null);
          }}
        />
      )}

      {activeDialog === 'ai_report' && (
        <AiReportModal
          dataset={activeDataset}
          onClose={() => setActiveDialog(null)}
          onAddOutput={handleAddOutput}
          onViewOutputs={() => setActiveTab('output')}
        />
      )}

      {/* Theme Customizer Panel */}
      <ThemePanel
        isOpen={isThemePanelOpen}
        onClose={() => setIsThemePanelOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        isDarkMode={isDarkMode}
        onDarkModeChange={setIsDarkMode}
      />

      {/* Drag & Drop Overlay */}
      {isDraggingFile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px dashed var(--primary)',
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            padding: '36px 48px',
            borderRadius: '20px',
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
            border: '1.5px solid var(--border-color)',
            animation: 'pulse 2s infinite'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <UploadCloud size={40} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                Drop Dataset to Import
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                Instant parsing for <b>Excel (.xlsx, .xls)</b>, <b>CSV</b>, <b>TSV</b>, and <b>Open SPSS (.ospss)</b>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Dialog */}
      <AuthModal
        onOpenTerms={(tab) => {
          const page = tab === 'terms' ? 'terms' : 'privacy';
          window.open(`/${page}`, '_blank');
        }}
      />

      {/* Save Project & Data Dialog */}
      <SaveProjectModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        activeDataset={activeDataset}
        outputItems={outputs}
        syntaxCode={syntaxCode}
        importedFileName={importedFileName}
        importedFileType={importedFileType}
        onSaveLocalSession={() => {
          saveLocalSession({
            dataset: activeDataset,
            outputs,
            syntax: syntaxCode,
            importedFileName,
            importedFileType
          });
          setHasUnsavedChanges(false);
        }}
        onRenameDataset={(newName) => {
          setActiveDataset(prev => ({ ...prev, name: newName }));
        }}
        onExportFile={(format) => {
          if (format === 'xlsx') {
            exportToExcel(activeDataset);
          } else if (format === 'csv') {
            exportToCSV(activeDataset);
          } else if (format === 'ospss') {
            exportProjectBundle(activeDataset, outputs, syntaxCode);
          }
        }}
        onProjectSaved={() => setHasUnsavedChanges(false)}
      />

      {/* Supabase Cloud Projects Storage Dialog */}
      <CloudProjectsModal
        isOpen={cloudModalMode !== null}
        mode={cloudModalMode || 'save'}
        onClose={() => setCloudModalMode(null)}
        activeDataset={activeDataset}
        outputItems={outputs}
        syntaxCode={syntaxCode}
        onLoadProject={(dataset, newOutputs, newSyntax) => {
          setActiveDataset(dataset);
          setOutputs(newOutputs);
          if (newSyntax) setSyntaxCode(newSyntax);
          setActiveTab('data');
        }}
      />
    </div>
  );
};
