import React from 'react';
import { Stage5Deliverables, AuditReport } from '../types/audit';
import { translations, LanguageMode } from '../locales/i18n';
import { Calendar, DollarSign, TrendingUp, Download, Printer, CheckCircle2, Award } from 'lucide-react';

interface Stage5RoadmapViewProps {
  data: Stage5Deliverables;
  auditReport: AuditReport;
  lang: LanguageMode;
}

export const Stage5RoadmapView: React.FC<Stage5RoadmapViewProps> = ({ data, auditReport, lang }) => {
  const t = translations[lang];

  const handleDownloadMarkdown = () => {
    const mdContent = `# SI-MODERNIZE AI - ENTERPRISE SYSTEMS AUDIT & MODERNIZATION REPORT
**System Target:** ${auditReport.executiveSummary.systemName}
**Detected Stack:** ${auditReport.executiveSummary.detectedStack}
**Health Score:** ${auditReport.executiveSummary.healthScore}/100
**Technical Debt Ratio (TDR):** ${auditReport.executiveSummary.technicalDebtRatio}%
**Estimated Annual Maintenance Overhead:** $${auditReport.executiveSummary.estimatedMaintenanceOverheadAnnualUSD.toLocaleString()}
**Audit Date:** ${new Date().toISOString().split('T')[0]}

---

## 1. EXECUTIVE SUMMARY & ARCHITECT FINDINGS
${auditReport.executiveSummary.keyFindingsSummary}

### 6-Axis Modernization Readiness:
- Modularity: ${auditReport.executiveSummary.radarScores.modularity}%
- Security: ${auditReport.executiveSummary.radarScores.security}%
- Cloud Readiness: ${auditReport.executiveSummary.radarScores.cloudReadiness}%
- Testability: ${auditReport.executiveSummary.radarScores.testability}%
- Compliance: ${auditReport.executiveSummary.radarScores.compliance}%
- Scalability: ${auditReport.executiveSummary.radarScores.scalability}%

---

## 2. STAGE 1: SYSTEM TOPOLOGY & TECHNICAL DEBT MAPPING
- **Runtime Environment:** ${auditReport.stage1_topologyDebt.runtimeEnvironment}
- **Database Engines:** ${auditReport.stage1_topologyDebt.databaseEngines.join(', ')}
- **Coupling Analysis:** ${auditReport.stage1_topologyDebt.couplingAnalysis}

### Monolithic Anti-Patterns:
${auditReport.stage1_topologyDebt.monolithicAntiPatterns
  .map(
    (p) => `- **${p.pattern}** (${p.location}): ${p.impact} [Debt Weight: ${p.maintenanceCostScore}/10]`
  )
  .join('\n')}

---

## 3. STAGE 2: DEVSECOPS & REGULATORY COMPLIANCE
### Compliance Status:
- PCI-DSS 4.0: ${auditReport.stage2_devSecOpsCompliance.complianceMatrix.pciDssStatus}
- GDPR Art. 32: ${auditReport.stage2_devSecOpsCompliance.complianceMatrix.gdprStatus}
- ISO/IEC 27001: ${auditReport.stage2_devSecOpsCompliance.complianceMatrix.iso27001Status}
- HIPAA: ${auditReport.stage2_devSecOpsCompliance.complianceMatrix.hipaaStatus}

### Identified Vulnerabilities:
${auditReport.stage2_devSecOpsCompliance.vulnerabilities
  .map(
    (v) =>
      `### [${v.severity}] ${v.id}: ${v.title} (${v.cwe})\n- **OWASP Category:** ${v.owaspCategory}\n- **Line Reference:** ${v.lineReference}\n- **Violations:** ${v.complianceViolations.join(', ')}\n- **Description:** ${v.description}\n- **Remediation:** ${v.remediation}\n`
  )
  .join('\n')}

---

## 4. STAGE 3: CLOUD-NATIVE REFACTORING STRATEGY (MARTIN FOWLER'S STRANGLER FIG)
**Target Cloud:** ${auditReport.stage3_cloudNativeStrangler.targetCloud}
**Archetype:** ${auditReport.stage3_cloudNativeStrangler.recommendedArchetype}

### Strangler Phases:
${auditReport.stage3_cloudNativeStrangler.stranglerPhases
  .map(
    (p) =>
      `Phase ${p.step}: ${p.name} (Cutover: ${p.trafficCutoverPercent}%, Risk: ${p.riskLevel})\n${p.action}\n`
  )
  .join('\n')}

---

## 5. STAGE 4: ACTIONABLE REFACTORING
\`\`\`typescript
${auditReport.stage4_codeReengineering.refactoredSnippet.code}
\`\`\`

---

## 6. STAGE 5: PHASED ROADMAP & FINANCIAL ROI
- Current Annual On-Prem Run Cost: $${data.roiAnalysis.currentAnnualRunCostUSD.toLocaleString()}
- Projected Modernized Cloud Cost: $${data.roiAnalysis.projectedModernizedRunCostUSD.toLocaleString()}
- **Net Annual Savings:** $${data.roiAnalysis.netAnnualSavingsUSD.toLocaleString()}
- **Payback Period:** ${data.roiAnalysis.paybackPeriodMonths} Months

### Executive Recommendations:
${data.executiveRecommendations.map((r) => `- ${r}`).join('\n')}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SI_Modernize_Audit_${auditReport.executiveSummary.systemName}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Export & Actions Header */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            {t.roadmapTitle}
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'ar'
              ? 'خارطة طريق تنفيذية مقسمة لمراحل مع تقدير التكاليف ومؤشرات العائد المالي'
              : 'Enterprise-grade phased migration timeline with budget allocations and ROI payback estimation'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadReport}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printReport}</span>
          </button>
        </div>
      </div>

      {/* Financial ROI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.currentRunCost}</span>
            <DollarSign className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-bold font-mono text-red-300">
            ${data.roiAnalysis.currentAnnualRunCostUSD.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Datacenter, MIPS, legacy licenses</div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.modernizedRunCost}</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            ${data.roiAnalysis.projectedModernizedRunCostUSD.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Managed Cloud PaaS & Serverless</div>
        </div>

        <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
            <span>{t.netSavings}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            +${data.roiAnalysis.netAnnualSavingsUSD.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1">68% operational cost reduction</div>
        </div>

        <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl">
          <div className="flex items-center justify-between text-xs text-blue-300 mb-1">
            <span>{t.paybackPeriod}</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-400">
            {data.roiAnalysis.paybackPeriodMonths} {lang === 'ar' ? 'أشهر' : 'Months'}
          </div>
          <div className="text-[11px] text-blue-300/80 mt-1">Fast enterprise payback horizon</div>
        </div>
      </div>

      {/* Phased Roadmap Execution Timeline */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">{t.phasePlan}</h3>
        </div>

        <div className="space-y-4">
          {data.roadmapPhases.map((phase, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded">
                    {phase.timeline}
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-400">
                    -{phase.riskReductionPercent}% {lang === 'ar' ? 'انخفاض في المخاطر' : 'Risk Reduction'}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-300">
                  {phase.milestones.map((m, mIdx) => (
                    <li key={mIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:border-l md:border-slate-800 md:pl-6 text-right shrink-0">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {lang === 'ar' ? 'ميزانية المرحلة التقديرية:' : 'Allocated Budget Est:'}
                </span>
                <span className="text-lg font-bold font-mono text-white">
                  ${phase.remediationBudgetEstUSD.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Executive Recommendations */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          {t.recommendations}
        </h3>
        <div className="space-y-2 text-xs text-slate-300">
          {data.executiveRecommendations.map((rec, idx) => (
            <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-[11px] shrink-0">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
