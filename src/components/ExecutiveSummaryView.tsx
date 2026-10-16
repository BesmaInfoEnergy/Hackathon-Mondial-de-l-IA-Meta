import React from 'react';
import { ExecutiveSummary } from '../types/audit';
import { RadarChart } from './RadarChart';
import { translations, LanguageMode } from '../locales/i18n';
import { Activity, AlertOctagon, DollarSign, Layers, CheckCircle } from 'lucide-react';

interface ExecutiveSummaryViewProps {
  summary: ExecutiveSummary;
  lang: LanguageMode;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({ summary, lang }) => {
  const t = translations[lang];

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-400 stroke-red-500';
    if (score < 70) return 'text-amber-400 stroke-amber-500';
    return 'text-emerald-400 stroke-emerald-500';
  };

  const getComplexityBadge = (comp: string) => {
    switch (comp.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score Card */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {t.healthScore}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-black font-mono ${getScoreColor(summary.healthScore).split(' ')[0]}`}>
                {summary.healthScore}
              </span>
              <span className="text-sm text-slate-400 font-mono">/100</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {summary.healthScore < 40
                ? (lang === 'ar' ? 'حالة حرجة: تراكم ديون خطيرة' : 'Critical Debt Accumulation')
                : (lang === 'ar' ? 'حالة متوسطة' : 'Moderate Debt')}
            </div>
          </div>

          {/* Mini circular progress */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getScoreColor(summary.healthScore).split(' ')[1]} transition-all duration-1000`}
                strokeDasharray={`${summary.healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Activity className="w-4 h-4 text-slate-400 absolute inset-0 m-auto" />
          </div>
        </div>

        {/* Technical Debt Ratio (TDR) */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>{t.tdrLabel}</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-400">
            {summary.technicalDebtRatio}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {lang === 'ar' ? 'نسبة تكلفة الإصلاح إلى تكلفة البناء' : 'Remediation vs Creation ratio'}
          </div>
        </div>

        {/* Estimated Annual Maintenance Overhead */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>{t.annualOverhead}</span>
            <DollarSign className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-300">
            ${summary.estimatedMaintenanceOverheadAnnualUSD.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {lang === 'ar' ? 'هدر سنوي في معالجة الأعطال' : 'Wasted on reactive firefighting'}
          </div>
        </div>

        {/* Decoupling Complexity */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>{t.decouplingComplexity}</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-1">
            <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold border ${getComplexityBadge(summary.decouplingComplexity)}`}>
              {summary.decouplingComplexity}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {summary.detectedStack}
          </div>
        </div>
      </div>

      {/* Radar Chart & Key Findings Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Key Findings Box */}
        <div className="lg:col-span-7 p-5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">{t.findingsSummary}</h3>
            </div>
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs leading-relaxed text-slate-300 font-sans">
              <p className="whitespace-pre-line">{summary.keyFindingsSummary}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300">{lang === 'ar' ? 'المنظومة المفحوصة:' : 'Audited Target:'}</span>{' '}
              <span className="font-mono text-blue-300">{summary.systemName}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-300">{lang === 'ar' ? 'البيئة التقنية:' : 'Detected Platform:'}</span>{' '}
              <span className="font-mono text-indigo-300">{summary.detectedStack}</span>
            </div>
          </div>
        </div>

        {/* 6-Axis Radar Chart */}
        <div className="lg:col-span-5 p-5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-white mb-2 self-start">{t.radarTitle}</h3>
          <div className="py-2">
            <RadarChart scores={summary.radarScores} size={250} isArabic={lang === 'ar'} />
          </div>
        </div>
      </div>
    </div>
  );
};
