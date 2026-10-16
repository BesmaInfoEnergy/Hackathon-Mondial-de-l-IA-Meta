import React, { useState } from 'react';
import { translations, LanguageMode } from '../locales/i18n';
import { CloudProvider, ComplianceStandard, ModernizationGoal } from '../types/audit';
import { SAMPLE_CASES, SampleCase } from '../data/samples';
import { X, Upload, Code2, Server, CheckSquare, Square, Play, ShieldAlert } from 'lucide-react';

interface AuditInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageMode;
  cloudTarget: CloudProvider;
  onChangeCloud: (c: CloudProvider) => void;
  onExecuteAudit: (payload: {
    code: string;
    filename: string;
    language: string;
    cloudTarget: CloudProvider;
    complianceStandards: ComplianceStandard[];
    modernizationGoal: ModernizationGoal;
  }) => Promise<void>;
  loading: boolean;
}

export const AuditInputModal: React.FC<AuditInputModalProps> = ({
  isOpen,
  onClose,
  lang,
  cloudTarget,
  onChangeCloud,
  onExecuteAudit,
  loading,
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'sample' | 'custom'>('sample');
  const [selectedSample, setSelectedSample] = useState<SampleCase>(SAMPLE_CASES[0]);
  const [customCode, setCustomCode] = useState('');
  const [customFilename, setCustomFilename] = useState('LegacyService.java');
  const [customLanguage, setCustomLanguage] = useState('Java');
  const [complianceList, setComplianceList] = useState<ComplianceStandard[]>([
    'PCI-DSS',
    'GDPR',
    'ISO 27001',
  ]);
  const [modernizationGoal, setModernizationGoal] = useState<ModernizationGoal>(
    'Event-Driven Microservices (Kafka/EDA)'
  );

  if (!isOpen) return null;

  const toggleCompliance = (std: ComplianceStandard) => {
    if (complianceList.includes(std)) {
      setComplianceList(complianceList.filter((c) => c !== std));
    } else {
      setComplianceList([...complianceList, std]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFilename(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'cbl' || ext === 'cob') setCustomLanguage('COBOL');
    else if (ext === 'java') setCustomLanguage('Java');
    else if (ext === 'sql') setCustomLanguage('SQL');
    else if (ext === 'cpp' || ext === 'c' || ext === 'h') setCustomLanguage('C++');
    else if (ext === 'cs') setCustomLanguage('C#');
    else setCustomLanguage('Code/Log');

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomCode((event.target?.result as string) || '');
      setActiveTab('custom');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'sample') {
      await onExecuteAudit({
        code: selectedSample.code,
        filename: selectedSample.filename,
        language: selectedSample.language,
        cloudTarget,
        complianceStandards: complianceList,
        modernizationGoal,
      });
    } else {
      if (!customCode.trim()) return;
      await onExecuteAudit({
        code: customCode,
        filename: customFilename || 'CustomLegacyModule',
        language: customLanguage || 'Auto-detect',
        cloudTarget,
        complianceStandards: complianceList,
        modernizationGoal,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">{t.newAudit}</h2>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'اختر من النماذج المؤسسية العتيقة الجاهزة أو ارفع شفرتك الأحادية الخاصة'
                  : 'Select an enterprise legacy archetype or upload custom monolithic code'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tabs: Pre-packaged Archetypes vs Custom Upload */}
          <div className="flex border-b border-slate-800 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('sample')}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'sample'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>{t.samplesTitle}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'custom'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{t.inputTabCode}</span>
            </button>
          </div>

          {/* Sample Picker View */}
          {activeTab === 'sample' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_CASES.map((sample) => {
                  const isSelected = selectedSample.id === sample.id;
                  return (
                    <div
                      key={sample.id}
                      onClick={() => {
                        setSelectedSample(sample);
                        onChangeCloud(sample.cloudTarget);
                        setModernizationGoal(sample.modernizationGoal);
                        setComplianceList(sample.compliance);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                          {sample.language}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {sample.cloudTarget}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-white mb-1">
                        {lang === 'ar' ? sample.titleAr : sample.titleEn}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {lang === 'ar' ? sample.descriptionAr : sample.descriptionEn}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Sample Code Preview */}
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                  <span>{selectedSample.filename}</span>
                  <span>{selectedSample.code.split('\n').length} lines</span>
                </div>
                <pre className="font-mono text-xs text-slate-300 max-h-36 overflow-y-auto whitespace-pre leading-relaxed p-2 bg-slate-900/60 rounded">
                  <code>{selectedSample.code.slice(0, 1000)}...</code>
                </pre>
              </div>
            </div>
          ) : (
            /* Custom Upload / Paste View */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder="FileName (e.g. OrderService.java)"
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                  <select
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="Java">Java (EJB / Spring / WebLogic)</option>
                    <option value="COBOL">COBOL (CICS / zOS Batch)</option>
                    <option value="SQL">T-SQL / PL-SQL Stored Procedure</option>
                    <option value="C++">C++ (Legacy Daemon / POSIX)</option>
                    <option value="C#">C# .NET Framework (WCF / ASMX)</option>
                    <option value="Log/Config">Server Logs / Docker / Architecture</option>
                  </select>
                </div>

                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.uploadFile}</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder={t.inputPlaceholder}
                rows={9}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-4 font-mono text-xs text-slate-200 placeholder-slate-600 leading-relaxed"
              />
            </div>
          )}

          {/* Configuration Parameters: Cloud, Compliance, Archetype */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            {/* Target Cloud */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                {t.targetCloudLabel}
              </label>
              <select
                value={cloudTarget}
                onChange={(e) => onChangeCloud(e.target.value as CloudProvider)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-semibold"
              >
                <option value="AWS">Amazon Web Services (AWS)</option>
                <option value="Azure">Microsoft Azure</option>
                <option value="GCP">Google Cloud Platform (GCP)</option>
                <option value="Hybrid">Hybrid Multi-Cloud</option>
              </select>
            </div>

            {/* Modernization Archetype */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                {t.modernizationArchetype}
              </label>
              <select
                value={modernizationGoal}
                onChange={(e) => setModernizationGoal(e.target.value as ModernizationGoal)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-semibold"
              >
                <option value="Event-Driven Microservices (Kafka/EDA)">
                  Event-Driven Microservices (Kafka/EDA)
                </option>
                <option value="Containerized Kubernetes (EKS/GKE/AKS)">
                  Containerized Kubernetes (EKS/GKE/AKS)
                </option>
                <option value="Serverless Cloud Functions (Lambda/Cloud Run)">
                  Serverless Cloud Functions (Lambda/Cloud Run)
                </option>
                <option value="Modernized Modular Monolith">
                  Modernized Modular Monolith
                </option>
              </select>
            </div>

            {/* Compliance Frameworks Toggles */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                {t.complianceLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['PCI-DSS', 'GDPR', 'ISO 27001', 'HIPAA', 'SOC 2'] as ComplianceStandard[]).map(
                  (std) => {
                    const active = complianceList.includes(std);
                    return (
                      <button
                        key={std}
                        type="button"
                        onClick={() => toggleCompliance(std)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-bold cursor-pointer transition-all border ${
                          active
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {active ? <CheckSquare className="w-3 h-3 text-blue-400" /> : <Square className="w-3 h-3" />}
                        <span>{std}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.executingAudit}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.newAudit}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
