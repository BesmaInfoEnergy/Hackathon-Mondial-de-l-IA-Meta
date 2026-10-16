import React from 'react';
import { translations, LanguageMode } from '../locales/i18n';
import { CloudProvider } from '../types/audit';
import { ShieldCheck, Cloud, Globe, Sparkles } from 'lucide-react';

interface HeaderProps {
  lang: LanguageMode;
  onToggleLang: () => void;
  cloudTarget: CloudProvider;
  onChangeCloud: (cloud: CloudProvider) => void;
  onOpenAuditModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  cloudTarget,
  onChangeCloud,
  onOpenAuditModal,
}) => {
  const t = translations[lang];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-mono">
                {t.appTitle}
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                v4.8 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {t.roleTag}
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5">
          {/* Cloud Target Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <Cloud className="w-3.5 h-3.5 text-blue-400 mx-1.5" />
            <select
              value={cloudTarget}
              onChange={(e) => onChangeCloud(e.target.value as CloudProvider)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="AWS" className="bg-slate-900 text-white">AWS Cloud</option>
              <option value="Azure" className="bg-slate-900 text-white">Azure Cloud</option>
              <option value="GCP" className="bg-slate-900 text-white">Google Cloud (GCP)</option>
              <option value="Hybrid" className="bg-slate-900 text-white">Hybrid / Multi-Cloud</option>
            </select>
          </div>

          {/* AI Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Gemini 3.8 Flash</span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            title={lang === 'ar' ? 'تبديل إلى الإنجليزية' : 'Switch to Arabic'}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'en' ? 'العربية (RTL)' : 'English'}</span>
          </button>

          {/* New Audit Action */}
          <button
            onClick={onOpenAuditModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <span>+ {t.newAudit}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
