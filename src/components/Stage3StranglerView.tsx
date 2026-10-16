import React from 'react';
import { Stage3CloudNativeStrangler, StranglerPhase, TargetService } from '../types/audit';
import { translations, LanguageMode } from '../locales/i18n';
import { GitBranch, Cloud, ArrowRight, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

interface Stage3StranglerViewProps {
  data: Stage3CloudNativeStrangler;
  lang: LanguageMode;
}

export const Stage3StranglerView: React.FC<Stage3StranglerViewProps> = ({ data, lang }) => {
  const t = translations[lang];

  const getRiskBadge = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
      case 'medium':
        return 'bg-amber-950/40 text-amber-300 border-amber-800/40';
      case 'high':
      case 'critical':
        return 'bg-red-950/40 text-red-300 border-red-800/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Cloud Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-800/40 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <Cloud className="w-4 h-4" />
            {t.targetCloudLabel}
          </div>
          <div className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>{data.targetCloud} Cloud-Native Target</span>
            <span className="text-xs bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-full font-mono">
              {data.recommendedArchetype}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'ar' ? 'تصميم خالي من التوقف التشغيلي (Zero Downtime)' : 'Zero Operational Downtime Guarantee'}</span>
        </div>
      </div>

      {/* Martin Fowler Strangler Fig Phased Execution Timeline */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">{t.stranglerTitle}</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">{t.stranglerSubtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {data.stranglerPhases.map((phase: StranglerPhase, idx) => (
            <div
              key={phase.step}
              className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl relative flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              {/* Traffic Cutover Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs font-mono">
                    {phase.step}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRiskBadge(phase.riskLevel)}`}>
                    {phase.riskLevel} Risk
                  </span>
                </div>

                <div className="font-bold text-sm text-white mb-2 leading-snug">{phase.name}</div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{phase.action}</p>
              </div>

              {/* Progress Bar */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                  <span className="text-slate-400">{t.trafficCutover}:</span>
                  <span className="font-bold text-indigo-400">{phase.trafficCutoverPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${phase.trafficCutoverPercent}%` }}
                  />
                </div>
              </div>

              {/* Arrow connector on desktop */}
              {idx < data.stranglerPhases.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-900 border border-slate-700 rounded-full p-1 text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Target Microservices Specs */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">{t.targetServicesTitle}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.targetServices.map((svc: TargetService, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-emerald-400 px-2 py-0.5 bg-emerald-950/40 rounded border border-emerald-800/30">
                    {svc.communicationProtocol}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-bold text-sm text-white mb-2">{svc.serviceName}</div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{svc.responsibility}</p>
                <div className="text-xs text-slate-400 mb-2 font-mono">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Stack:</span>
                  {svc.techStack}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {lang === 'ar' ? 'الموارد السحابية:' : 'Cloud Resources:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {svc.cloudResources.map((res, rIdx) => (
                    <span
                      key={rIdx}
                      className="text-[10px] px-2 py-0.5 bg-slate-800/80 text-blue-300 rounded border border-slate-700/60 font-mono"
                    >
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
