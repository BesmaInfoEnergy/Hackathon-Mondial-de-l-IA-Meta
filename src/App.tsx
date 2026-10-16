import React, { useState, useEffect } from 'react';
import { AuditReport, CloudProvider, ComplianceStandard, ModernizationGoal } from './types/audit';
import { translations, LanguageMode } from './locales/i18n';
import { SAMPLE_CASES } from './data/samples';
import { Header } from './components/Header';
import { ExecutiveSummaryView } from './components/ExecutiveSummaryView';
import { Stage1TopologyView } from './components/Stage1TopologyView';
import { Stage2DevSecOpsView } from './components/Stage2DevSecOpsView';
import { Stage3StranglerView } from './components/Stage3StranglerView';
import { Stage4CodeWorkbench } from './components/Stage4CodeWorkbench';
import { Stage5RoadmapView } from './components/Stage5RoadmapView';
import { ArchitectChat } from './components/ArchitectChat';
import { StranglerSimulator } from './components/StranglerSimulator';
import { AuditInputModal } from './components/AuditInputModal';
import {
  Activity,
  Layers,
  ShieldCheck,
  GitBranch,
  Code2,
  Calendar,
  MessageSquare,
  Sliders,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<LanguageMode>('en'); // Default to English as requested
  const [cloudTarget, setCloudTarget] = useState<CloudProvider>('AWS');
  const [activeTab, setActiveTab] = useState<string>('executive');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [auditSource, setAuditSource] = useState<string>('local-expert-rules');
  const [auditProgressStep, setAuditProgressStep] = useState(0);

  const t = translations[lang];

  // Perform initial default audit on load using the first legacy archetype
  useEffect(() => {
    const initialSample = SAMPLE_CASES[0];
    runAudit({
      code: initialSample.code,
      filename: initialSample.filename,
      language: initialSample.language,
      cloudTarget: initialSample.cloudTarget,
      complianceStandards: initialSample.compliance,
      modernizationGoal: initialSample.modernizationGoal,
    });
  }, []);

  const runAudit = async (payload: {
    code: string;
    filename: string;
    language: string;
    cloudTarget: CloudProvider;
    complianceStandards: ComplianceStandard[];
    modernizationGoal: ModernizationGoal;
  }) => {
    setLoading(true);
    setAuditProgressStep(1);

    const stepTimer = setInterval(() => {
      setAuditProgressStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 800);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          language_mode: lang,
        }),
      });

      const data = await res.json();
      if (data.audit) {
        setAuditReport(data.audit);
        setAuditSource(data.source || 'gemini-3.8-flash');
      }
    } catch (err) {
      console.error('Audit execution failed:', err);
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
      setAuditProgressStep(0);
    }
  };

  const navTabs = [
    { id: 'executive', label: t.tabSummary, icon: <Activity className="w-4 h-4" /> },
    { id: 'stage1', label: t.tabStage1, icon: <Layers className="w-4 h-4" /> },
    { id: 'stage2', label: t.tabStage2, icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'stage3', label: t.tabStage3, icon: <GitBranch className="w-4 h-4" /> },
    { id: 'stage4', label: t.tabStage4, icon: <Code2 className="w-4 h-4" /> },
    { id: 'stage5', label: t.tabStage5, icon: <Calendar className="w-4 h-4" /> },
    { id: 'simulator', label: t.tabSimulator, icon: <Sliders className="w-4 h-4" /> },
    { id: 'chat', label: t.tabChat, icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white ${
        lang === 'ar' ? 'font-[Tajawal]' : 'font-[Plus_Jakarta_Sans]'
      }`}
    >
      {/* Top Enterprise Header */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        cloudTarget={cloudTarget}
        onChangeCloud={setCloudTarget}
        onOpenAuditModal={() => setIsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Loading Overlay State */}
        {loading && (
          <div className="p-8 bg-slate-900/90 border border-indigo-500/40 rounded-2xl text-center space-y-4 shadow-2xl animate-pulse">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.executingAudit}</h3>
              <p className="text-xs text-slate-400 max-w-xl mx-auto mt-1">{t.executingSub}</p>
            </div>

            {/* Phased Pipeline Progress */}
            <div className="max-w-md mx-auto grid grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
              <span className={`p-1.5 rounded border ${auditProgressStep >= 1 ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300' : 'border-slate-800 text-slate-600'}`}>
                1. AST & TDR
              </span>
              <span className={`p-1.5 rounded border ${auditProgressStep >= 2 ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300' : 'border-slate-800 text-slate-600'}`}>
                2. OWASP Scan
              </span>
              <span className={`p-1.5 rounded border ${auditProgressStep >= 3 ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300' : 'border-slate-800 text-slate-600'}`}>
                3. Strangler Fig
              </span>
              <span className={`p-1.5 rounded border ${auditProgressStep >= 4 ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300' : 'border-slate-800 text-slate-600'}`}>
                4. Refactoring
              </span>
            </div>
          </div>
        )}

        {/* System Bar & Active Engine Status */}
        {auditReport && !loading && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-white">
                {lang === 'ar' ? 'المنظومة المفحوصة:' : 'Audited Target:'}{' '}
                <span className="font-mono text-indigo-400 font-semibold">{auditReport.executiveSummary.systemName}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono">{auditReport.executiveSummary.detectedStack}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {auditSource === 'gemini-3.8-flash' ? t.modelBadge : t.offlineEngineBadge}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-bold cursor-pointer transition-colors"
              >
                {t.reAudit}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Horizontal Scrollable Bar) */}
        <div className="flex border-b border-slate-800 overflow-x-auto gap-2 pb-px scrollbar-none">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        {auditReport && !loading && (
          <div className="pt-2">
            {activeTab === 'executive' && (
              <ExecutiveSummaryView summary={auditReport.executiveSummary} lang={lang} />
            )}

            {activeTab === 'stage1' && (
              <Stage1TopologyView data={auditReport.stage1_topologyDebt} lang={lang} />
            )}

            {activeTab === 'stage2' && (
              <Stage2DevSecOpsView data={auditReport.stage2_devSecOpsCompliance} lang={lang} />
            )}

            {activeTab === 'stage3' && (
              <Stage3StranglerView data={auditReport.stage3_cloudNativeStrangler} lang={lang} />
            )}

            {activeTab === 'stage4' && (
              <Stage4CodeWorkbench data={auditReport.stage4_codeReengineering} lang={lang} />
            )}

            {activeTab === 'stage5' && (
              <Stage5RoadmapView
                data={auditReport.stage5_deliverablesRoadmap}
                auditReport={auditReport}
                lang={lang}
              />
            )}

            {activeTab === 'simulator' && <StranglerSimulator lang={lang} />}

            {activeTab === 'chat' && <ArchitectChat auditContext={auditReport} lang={lang} />}
          </div>
        )}
      </main>

      {/* New Audit Modal */}
      <AuditInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lang={lang}
        cloudTarget={cloudTarget}
        onChangeCloud={setCloudTarget}
        onExecuteAudit={runAudit}
        loading={loading}
      />
    </div>
  );
}
