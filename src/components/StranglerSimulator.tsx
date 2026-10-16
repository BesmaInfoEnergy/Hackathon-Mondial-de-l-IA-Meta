import React, { useState } from 'react';
import { translations, LanguageMode } from '../locales/i18n';
import { GitBranch, Activity, ShieldAlert, Cpu, Server, Database, ArrowRight, Zap } from 'lucide-react';

interface StranglerSimulatorProps {
  lang: LanguageMode;
}

export const StranglerSimulator: React.FC<StranglerSimulatorProps> = ({ lang }) => {
  const t = translations[lang];
  const [migrationPercent, setMigrationPercent] = useState<number>(35);

  const monolithLoad = 100 - migrationPercent;
  const cloudLoad = migrationPercent;

  // Dynamic calculations based on cutover
  const legacyRiskIndex = Math.round(95 - (migrationPercent * 0.8));
  const avgLatencyMs = Math.round(480 - (migrationPercent * 3.4));
  const monthlyCostUSD = Math.round(42000 - (migrationPercent * 240));

  return (
    <div className="space-y-6">
      {/* Simulator Header */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">{t.simTitle}</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">{t.simSubtitle}</p>

        {/* Interactive Slider */}
        <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-red-400 flex items-center gap-1.5">
              <Server className="w-4 h-4" />
              {t.monolithShare}: {monolithLoad}%
            </span>
            <span className="text-indigo-400 font-black text-sm">
              {lang === 'ar' ? 'نسبة التحويل السحابي:' : 'Traffic Diverted:'} {migrationPercent}%
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              {t.microservicesShare}: {cloudLoad}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={migrationPercent}
            onChange={(e) => setMigrationPercent(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-all"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0% (Pure Monolith)</span>
            <span>25% (Edge Gateway)</span>
            <span>50% (Core Decoupled)</span>
            <span>75% (CDC Sync)</span>
            <span>100% (Full Cloud-Native)</span>
          </div>
        </div>
      </div>

      {/* Real-time Architecture Routing Simulation Canvas */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          {lang === 'ar' ? 'مسار تدفق البيانات التفاعلي المباشر' : 'Live Traffic Routing & Ingress Telemetry'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Client & Gateway */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'ar' ? 'بوابة التوجيه الواقية' : 'Strangler Ingress Proxy'}
            </span>
            <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Envoy / API Gateway</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">100% Ingress Traffic</div>
          </div>

          {/* Traffic Split Branches */}
          <div className="flex flex-col gap-4">
            {/* Top Branch to Legacy */}
            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-red-300">{monolithLoad}%</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {lang === 'ar' ? 'إلى النظام القديم' : 'To Legacy Core'}
              </span>
            </div>

            {/* Bottom Branch to Microservices */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">{cloudLoad}%</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {lang === 'ar' ? 'إلى الخدمات السحابية' : 'To Cloud Microservices'}
              </span>
            </div>
          </div>

          {/* Destination Nodes */}
          <div className="space-y-3">
            {/* Legacy Monolith */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                monolithLoad > 0
                  ? 'bg-red-950/30 border-red-800/50 text-red-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  Legacy Monolith (Host)
                </span>
                <span className="font-mono">{monolithLoad}% Load</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {monolithLoad === 0
                  ? (lang === 'ar' ? 'تم عزل وإيقاف الخادم القديم بنجاح!' : 'Decommissioned / Quarantined')
                  : (lang === 'ar' ? 'يعالج الطلبات المتبقية' : 'Active monolithic execution')}
              </div>
            </div>

            {/* Cloud Microservices */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                cloudLoad > 0
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Cloud Microservices (K8s/EDA)
                </span>
                <span className="font-mono">{cloudLoad}% Load</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {lang === 'ar' ? 'معالجة غير متزامنة ومقاومة للأعطال' : 'Non-blocking, autoscaled containers'}
              </div>
            </div>
          </div>
        </div>

        {/* CDC Synchronization Indicator */}
        <div className="mt-4 p-3 bg-slate-950/90 border border-slate-800/90 rounded-lg flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-purple-400" />
            <span>
              {lang === 'ar'
                ? 'مزامنة البيانات الحية (Debezium Kafka CDC):'
                : 'Data Synchronization (Debezium Kafka CDC):'}
            </span>
          </div>
          <span className="text-purple-300 font-bold">
            {migrationPercent === 100
              ? (lang === 'ar' ? 'مزامنة منتهية - السحابة هي المصدر الوحيد' : 'Cutover Complete - Cloud Single Source of Truth')
              : `${lang === 'ar' ? 'تأخر التكرار:' : 'Replication Lag:'} ~12ms`}
          </span>
        </div>
      </div>

      {/* Live Calculated Impact Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'ar' ? 'مؤشر المخاطر الأمنية' : 'Security Risk Index'}</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">{legacyRiskIndex}/100</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {100 - legacyRiskIndex}% {lang === 'ar' ? 'انخفاض في المخاطر الإجمالية' : 'total risk mitigated'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'ar' ? 'متوسط زمن الاستجابة' : 'Average End-to-End Latency'}</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">{avgLatencyMs} ms</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {Math.round(((480 - avgLatencyMs) / 480) * 100)}% {lang === 'ar' ? 'تسارع استجابة' : 'latency reduction'}
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'ar' ? 'تكلفة التشغيل الشهرية' : 'Monthly Operational Cost'}</span>
            <span className="font-bold text-emerald-400 text-xs">USD</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${monthlyCostUSD.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ${(42000 - monthlyCostUSD).toLocaleString()}/mo {lang === 'ar' ? 'وفر شهري مستمر' : 'monthly runway savings'}
          </div>
        </div>
      </div>
    </div>
  );
};
