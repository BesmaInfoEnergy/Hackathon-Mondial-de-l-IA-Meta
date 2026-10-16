import React, { useMemo } from 'react';
import Prism from 'prismjs';

// Import essential languages for Enterprise Legacy Modernization
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-cobol';
import 'prismjs/components/prism-docker';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function getPrismLanguage(rawLang: string): string {
  const normalized = (rawLang || '').toLowerCase().trim();
  if (normalized.includes('cobol') || normalized.includes('cbl')) return 'cobol';
  if (normalized.includes('java') && !normalized.includes('script')) return 'java';
  if (normalized.includes('sql')) return 'sql';
  if (normalized.includes('c++') || normalized.includes('cpp')) return 'cpp';
  if (normalized.includes('c#') || normalized.includes('csharp') || normalized.includes('cs')) return 'csharp';
  if (normalized.includes('docker')) return 'docker';
  if (normalized.includes('typescript') || normalized.includes('ts')) return 'typescript';
  if (normalized.includes('javascript') || normalized.includes('js')) return 'javascript';
  return 'clike';
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  showLineNumbers = true,
  className = '',
}) => {
  const prismLang = getPrismLanguage(language);

  const highlightedLines = useMemo(() => {
    const lines = (code || '').split('\n');
    const grammar = Prism.languages[prismLang] || Prism.languages.clike;

    return lines.map((line) => {
      // Prism highlight on individual lines
      return Prism.highlight(line || ' ', grammar, prismLang);
    });
  }, [code, prismLang]);

  return (
    <div className={`font-mono text-xs overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <tbody>
          {highlightedLines.map((htmlLine, idx) => (
            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
              {showLineNumbers && (
                <td className="w-10 px-2 py-0.5 text-right text-slate-600 select-none font-mono text-[11px] border-r border-slate-800/80 shrink-0">
                  {idx + 1}
                </td>
              )}
              <td className="px-3 py-0.5 whitespace-pre leading-relaxed text-slate-200">
                <span
                  dangerouslySetInnerHTML={{
                    __html: htmlLine.trim() === '' ? '&nbsp;' : htmlLine,
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export function highlightLineText(text: string, language: string): string {
  const prismLang = getPrismLanguage(language);
  const grammar = Prism.languages[prismLang] || Prism.languages.clike;
  return Prism.highlight(text || ' ', grammar, prismLang);
}
