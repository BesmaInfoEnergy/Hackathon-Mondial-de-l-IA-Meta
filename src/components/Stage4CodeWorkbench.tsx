import React, { useState, useMemo } from 'react';
import { Stage4CodeReengineering } from '../types/audit';
import { translations, LanguageMode } from '../locales/i18n';
import { CodeBlock, highlightLineText } from './CodeBlock';
import {
  Code,
  Check,
  Copy,
  CheckCircle,
  ShieldAlert,
  Box,
  FileText,
  Columns2,
  FileDiff,
  Plus,
  Minus,
  Download,
  Sparkles
} from 'lucide-react';

interface Stage4CodeWorkbenchProps {
  data: Stage4CodeReengineering;
  lang: LanguageMode;
}

interface DiffLine {
  type: 'add' | 'delete' | 'context' | 'header';
  oldLineNumber?: number;
  newLineNumber?: number;
  text: string;
}

export const Stage4CodeWorkbench: React.FC<Stage4CodeWorkbenchProps> = ({ data, lang }) => {
  const t = translations[lang];
  const [viewMode, setViewMode] = useState<'sideBySide' | 'unifiedDiff'>('sideBySide');
  const [activeRightTab, setActiveRightTab] = useState<'refactored' | 'unitTest' | 'dockerfile'>('refactored');
  const [copied, setCopied] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);

  const getActiveCode = () => {
    if (activeRightTab === 'unitTest') return data.unitTestCode || '// No unit tests generated';
    if (activeRightTab === 'dockerfile') return data.dockerfile || '# No dockerfile generated';
    return data.refactoredSnippet.code;
  };

  const getActiveLanguage = () => {
    if (activeRightTab === 'dockerfile') return 'docker';
    if (activeRightTab === 'unitTest') return 'typescript';
    return data.refactoredSnippet.language || 'typescript';
  };

  const activeTargetName = () => {
    if (activeRightTab === 'unitTest') return 'unit_test_suite';
    if (activeRightTab === 'dockerfile') return 'Dockerfile';
    return `${data.refactoredSnippet.framework.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_service`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate production-grade Unified Diff
  const { diffLines, rawPatch, additionsCount, deletionsCount } = useMemo(() => {
    const legacyLines = (data.legacySnippet.code || '').split('\n');
    const refactoredLines = (getActiveCode() || '').split('\n');

    const lines: DiffLine[] = [];
    const patchParts: string[] = [];

    const oldPath = `a/legacy/${data.legacySnippet.language.toLowerCase()}_monolith`;
    const newPath = `b/cloud-native/${activeTargetName()}`;

    // Header info
    patchParts.push(`diff --git ${oldPath} ${newPath}`);
    patchParts.push(`--- ${oldPath}`);
    patchParts.push(`+++ ${newPath}`);
    patchParts.push(`@@ -1,${legacyLines.length} +1,${refactoredLines.length} @@`);

    lines.push({
      type: 'header',
      text: `--- ${oldPath}`,
    });
    lines.push({
      type: 'header',
      text: `+++ ${newPath}`,
    });
    lines.push({
      type: 'header',
      text: `@@ -1,${legacyLines.length} +1,${refactoredLines.length} @@ [SI-Modernize AI: Refactored Monolith -> Cloud-Native Microservice]`,
    });

    // Add legacy deletions
    legacyLines.forEach((line, idx) => {
      lines.push({
        type: 'delete',
        oldLineNumber: idx + 1,
        text: line,
      });
      patchParts.push(`-${line}`);
    });

    // Add modernized additions
    refactoredLines.forEach((line, idx) => {
      lines.push({
        type: 'add',
        newLineNumber: idx + 1,
        text: line,
      });
      patchParts.push(`+${line}`);
    });

    return {
      diffLines: lines,
      rawPatch: patchParts.join('\n'),
      additionsCount: refactoredLines.length,
      deletionsCount: legacyLines.length,
    };
  }, [data.legacySnippet, activeRightTab, data.refactoredSnippet, data.unitTestCode, data.dockerfile]);

  const handleCopyPatch = () => {
    navigator.clipboard.writeText(rawPatch);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([rawPatch], { type: 'text/x-diff;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `modernization_${activeTargetName()}.patch`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Workbench Header & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2.5">
          <Code className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{t.codeReengTitle}</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Prism.js Highlighted
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'تلوين برمجي عالي الدقة للشفرة القديمة والخدمة السحابية مع إمكانية التبديل بين العرض المزدوج وعرض الفوارق'
                : 'Syntax-highlighted code comparison with language-specific color-coding for legacy & modern stacks'}
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle: Side-by-Side vs Unified Diff */}
          <div className="flex items-center bg-slate-950 p-1 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('sideBySide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'sideBySide'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>{t.sideBySide}</span>
            </button>

            <button
              onClick={() => setViewMode('unifiedDiff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'unifiedDiff'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileDiff className="w-3.5 h-3.5" />
              <span>{t.unifiedDiff}</span>
            </button>
          </div>

          {/* Sub-tab selection (Implementation / Tests / Dockerfile) */}
          <div className="flex items-center bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveRightTab('refactored')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                activeRightTab === 'refactored'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>{lang === 'ar' ? 'الخدمة المعاد بناؤها' : 'Service'}</span>
            </button>

            {data.unitTestCode && (
              <button
                onClick={() => setActiveRightTab('unitTest')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activeRightTab === 'unitTest'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                <span>{lang === 'ar' ? 'الاختبارات' : 'Tests'}</span>
              </button>
            )}

            {data.dockerfile && (
              <button
                onClick={() => setActiveRightTab('dockerfile')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  activeRightTab === 'dockerfile'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box className="w-3 h-3" />
                <span>Dockerfile</span>
              </button>
            )}
          </div>

          {/* Copy Buttons */}
          {viewMode === 'sideBySide' ? (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الشفرة' : 'Copy Code')}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyPatch}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                {copiedPatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPatch ? (lang === 'ar' ? 'تم نسخ الرقعة!' : 'Patch Copied!') : t.copyDiff}</span>
              </button>

              <button
                onClick={handleDownloadPatch}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                title="Download .patch file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.patch</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Code View: Conditional Side-by-Side vs Unified Diff */}
      {viewMode === 'sideBySide' ? (
        /* Split-screen Dual Pane View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Pane: Legacy Code */}
          <div className="flex flex-col border border-red-900/40 bg-slate-950 rounded-xl overflow-hidden shadow-xl">
            <div className="px-4 py-2.5 bg-red-950/30 border-b border-red-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-300 uppercase tracking-wider">{t.beforeLegacy}</span>
              </div>
              <span className="text-[11px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                {data.legacySnippet.language}
              </span>
            </div>

            <div className="p-3 flex-1 overflow-x-auto max-h-[500px] overflow-y-auto">
              <CodeBlock
                code={data.legacySnippet.code}
                language={data.legacySnippet.language}
                showLineNumbers={true}
              />
            </div>

            {/* Annotations Footer */}
            <div className="p-3 bg-red-950/20 border-t border-red-900/40 text-xs">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'العيوب المعمارية المرصودة في هذا المقطع:' : 'Identified Architectural Debt Points:'}
              </span>
              <ul className="space-y-1 text-[11px] text-red-200/90 list-disc list-inside">
                {data.legacySnippet.antiPatternAnnotations.map((ann, idx) => (
                  <li key={idx}>{ann}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Pane: Refactored Modern Microservice */}
          <div className="flex flex-col border border-emerald-900/40 bg-slate-950 rounded-xl overflow-hidden shadow-xl">
            <div className="px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  {t.afterRefactored}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {data.refactoredSnippet.framework}
              </span>
            </div>

            <div className="p-3 flex-1 overflow-x-auto max-h-[500px] overflow-y-auto">
              <CodeBlock
                code={getActiveCode()}
                language={getActiveLanguage()}
                showLineNumbers={true}
              />
            </div>

            {/* SOLID & Resilience Attributes Footer */}
            <div className="p-3 bg-emerald-950/20 border-t border-emerald-900/40 text-xs space-y-2">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  {t.solidApplied}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.refactoredSnippet.solidPrinciplesApplied.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 rounded text-[11px]"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                  {t.resilienceApplied}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.refactoredSnippet.resiliencePatterns.map((r, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-blue-950/40 border border-blue-800/40 text-blue-300 rounded text-[11px]"
                    >
                      ⚡ {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Unified Diff View */
        <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          {/* Diff Header Bar */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <FileDiff className="w-4 h-4 text-indigo-400" />
              <span className="text-red-400">legacy/{data.legacySnippet.language.toLowerCase()}_monolith</span>
              <span className="text-slate-600">→</span>
              <span className="text-emerald-400">cloud-native/{activeTargetName()}</span>
            </div>

            {/* Diff Stats Badge */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                <Plus className="w-3 h-3" />
                {additionsCount} {t.diffAdditions}
              </span>
              <span className="flex items-center gap-1 text-red-400 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded">
                <Minus className="w-3 h-3" />
                {deletionsCount} {t.diffDeletions}
              </span>
              <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Git Unified Diff
              </span>
            </div>
          </div>

          {/* Unified Diff Table with Prism Syntax Highlighting */}
          <div className="overflow-x-auto max-h-[560px] overflow-y-auto font-mono text-xs bg-slate-950">
            <table className="w-full border-collapse select-text">
              <tbody>
                {diffLines.map((line, idx) => {
                  if (line.type === 'header') {
                    return (
                      <tr key={idx} className="bg-slate-900/90 text-indigo-300 font-bold border-y border-slate-800">
                        <td className="w-12 px-2 py-1 text-right text-slate-600 select-none border-r border-slate-800/60">
                          ...
                        </td>
                        <td className="w-12 px-2 py-1 text-right text-slate-600 select-none border-r border-slate-800/60">
                          ...
                        </td>
                        <td className="w-6 px-2 py-1 text-center select-none text-slate-500"></td>
                        <td className="px-3 py-1 whitespace-pre leading-relaxed font-semibold">
                          {line.text}
                        </td>
                      </tr>
                    );
                  }

                  if (line.type === 'delete') {
                    const highlighted = highlightLineText(line.text, data.legacySnippet.language);
                    return (
                      <tr
                        key={idx}
                        className="bg-red-950/35 hover:bg-red-950/50 text-red-200 transition-colors border-l-2 border-red-500"
                      >
                        <td className="w-12 px-2 py-0.5 text-right text-red-400/70 select-none font-mono text-[11px] border-r border-red-900/30">
                          {line.oldLineNumber}
                        </td>
                        <td className="w-12 px-2 py-0.5 text-right text-slate-700 select-none font-mono text-[11px] border-r border-red-900/30">
                          {/* empty new line */}
                        </td>
                        <td className="w-6 px-1.5 py-0.5 text-center text-red-400 select-none font-bold">
                          -
                        </td>
                        <td className="px-3 py-0.5 whitespace-pre leading-relaxed text-red-100/90">
                          <span dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
                        </td>
                      </tr>
                    );
                  }

                  // Addition (line.type === 'add')
                  const highlighted = highlightLineText(line.text, getActiveLanguage());
                  return (
                    <tr
                      key={idx}
                      className="bg-emerald-950/30 hover:bg-emerald-950/45 text-emerald-200 transition-colors border-l-2 border-emerald-500"
                    >
                      <td className="w-12 px-2 py-0.5 text-right text-slate-700 select-none font-mono text-[11px] border-r border-emerald-900/30">
                        {/* empty old line */}
                      </td>
                      <td className="w-12 px-2 py-0.5 text-right text-emerald-400/80 select-none font-mono text-[11px] border-r border-emerald-900/30">
                        {line.newLineNumber}
                      </td>
                      <td className="w-6 px-1.5 py-0.5 text-center text-emerald-400 select-none font-bold">
                        +
                      </td>
                      <td className="px-3 py-0.5 whitespace-pre leading-relaxed text-emerald-100">
                        <span dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Diff Footer */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                {lang === 'ar'
                  ? 'تم استبدال الاستدعاءات المتزامنة والاتصالات المباشرة بقواعد البيانات بهندسة نظيفة قائمة على الحاويات والعمليات اللاتزامنية'
                  : 'Monolithic blocking synchronous JDBC/RPC calls replaced with non-blocking async Reactive architecture'}
              </span>
            </div>
            <span className="font-mono text-indigo-400 font-semibold">
              {data.refactoredSnippet.framework}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
