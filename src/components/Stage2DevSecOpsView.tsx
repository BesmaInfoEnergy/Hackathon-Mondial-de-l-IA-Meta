import React, { useState } from 'react';
import { Stage2DevSecOps, VulnerabilityItem } from '../types/audit';
import { translations, LanguageMode } from '../locales/i18n';
import { ShieldAlert, Key, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface Stage2DevSecOpsViewProps {
  data: Stage2DevSecOps;
  lang: LanguageMode;
}

export const Stage2DevSecOpsView: React.FC<Stage2DevSecOpsViewProps> = ({ data, lang }) => {
  const t = translations[lang];
  const [expandedVuln, setExpandedVuln] = useState<string | null>(data.vulnerabilities[0]?.id || null);

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  const getComplianceIcon = (status: string) => {
    if (status === 'Compliant') {
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
    if (status === 'Partially-Compliant') {
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const getComplianceBg = (status: string) => {
    if (status === 'Compliant') return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
    if (status === 'Partially-Compliant') return 'border-amber-500/40 bg-amber-950/20 text-amber-300';
    return 'border-red-500/40 bg-red-950/20 text-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Compliance Matrix Cards */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">{t.complianceMatrixTitle}</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${getComplianceBg(data.complianceMatrix.pciDssStatus)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono tracking-wider">PCI-DSS 4.0</span>
              {getComplianceIcon(data.complianceMatrix.pciDssStatus)}
            </div>
            <div className="text-sm font-semibold">{data.complianceMatrix.pciDssStatus}</div>
            <div className="text-[11px] text-slate-400 mt-1">Payment Card Data Security</div>
          </div>

          <div className={`p-4 rounded-xl border ${getComplianceBg(data.complianceMatrix.gdprStatus)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono tracking-wider">GDPR</span>
              {getComplianceIcon(data.complianceMatrix.gdprStatus)}
            </div>
            <div className="text-sm font-semibold">{data.complianceMatrix.gdprStatus}</div>
            <div className="text-[11px] text-slate-400 mt-1">EU Privacy & Art. 32 Encryption</div>
          </div>

          <div className={`p-4 rounded-xl border ${getComplianceBg(data.complianceMatrix.iso27001Status)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono tracking-wider">ISO/IEC 27001</span>
              {getComplianceIcon(data.complianceMatrix.iso27001Status)}
            </div>
            <div className="text-sm font-semibold">{data.complianceMatrix.iso27001Status}</div>
            <div className="text-[11px] text-slate-400 mt-1">ISMS & Cryptographic Control</div>
          </div>

          <div className={`p-4 rounded-xl border ${getComplianceBg(data.complianceMatrix.hipaaStatus)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono tracking-wider">HIPAA Security</span>
              {getComplianceIcon(data.complianceMatrix.hipaaStatus)}
            </div>
            <div className="text-sm font-semibold">{data.complianceMatrix.hipaaStatus}</div>
            <div className="text-[11px] text-slate-400 mt-1">PHI Protection § 164.312</div>
          </div>
        </div>
      </div>

      {/* Hardcoded Secrets Detected Banner */}
      {data.hardcodedSecretsDetected && data.hardcodedSecretsDetected.length > 0 && (
        <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-red-300 mb-2">
            <Key className="w-4 h-4 text-red-400 animate-pulse" />
            {t.hardcodedSecrets}
          </div>
          <div className="space-y-1.5">
            {data.hardcodedSecretsDetected.map((secret, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 bg-black/60 rounded border border-red-900/60 font-mono text-xs text-red-400 flex items-center justify-between"
              >
                <span>{secret}</span>
                <span className="text-[10px] bg-red-900/40 text-red-300 px-2 py-0.5 rounded uppercase font-bold">
                  {lang === 'ar' ? 'انتهاك أمني حرج' : 'CWE-798 Secret'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vulnerability Matrix Accordion List */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-bold text-white">{t.vulnerabilitiesList}</h3>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            {data.vulnerabilities.length} {lang === 'ar' ? 'ثغرات مرصودة' : 'Vulnerabilities Identified'}
          </span>
        </div>

        <div className="space-y-3">
          {data.vulnerabilities.map((vuln: VulnerabilityItem) => {
            const isExpanded = expandedVuln === vuln.id;
            return (
              <div
                key={vuln.id}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-slate-700 bg-slate-950/70' : 'border-slate-800/80 bg-slate-900/60'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedVuln(isExpanded ? null : vuln.id)}
                  className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded border ${getSeverityBadge(vuln.severity)}`}>
                      {vuln.severity}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{vuln.id}</span>
                    <span className="font-bold text-sm text-white">{vuln.title}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      CVSS {vuln.cvss}
                    </span>
                    <span className="text-xs font-mono bg-purple-950/40 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded">
                      {vuln.cwe}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/70 space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                        <span className="text-slate-400 font-semibold block mb-1">
                          {lang === 'ar' ? 'فئة OWASP ومعرف CWE:' : 'OWASP & CWE Classification:'}
                        </span>
                        <div className="font-mono text-slate-200">{vuln.owaspCategory}</div>
                        <div className="text-slate-400 mt-1 font-mono">{vuln.lineReference}</div>
                      </div>

                      <div className="p-3 bg-slate-900/80 rounded border border-slate-800">
                        <span className="text-slate-400 font-semibold block mb-1">
                          {lang === 'ar' ? 'انتهاك معايير الامتثال والحوكمة:' : 'Compliance Standard Violations:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {vuln.complianceViolations.map((v, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-red-950/40 border border-red-800/40 text-red-300 rounded font-mono text-[11px]"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80 text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-200 block mb-1">
                        {lang === 'ar' ? 'الوصف الفني التفصيلي:' : 'Technical Vulnerability Analysis:'}
                      </span>
                      {vuln.description}
                    </div>

                    <div className="p-3.5 bg-emerald-950/20 rounded border border-emerald-800/40 text-emerald-200">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        {lang === 'ar' ? 'خطة المعالجة المعمارية الموصى بها:' : 'Architectural Remediation Directive:'}
                      </span>
                      <p className="leading-relaxed">{vuln.remediation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
