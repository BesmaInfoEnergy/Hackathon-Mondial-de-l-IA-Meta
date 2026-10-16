import React, { useState } from 'react';
import { Stage1TopologyDebt, TopologicalNode } from '../types/audit';
import { translations, LanguageMode } from '../locales/i18n';
import { D3ForceGraph } from './D3ForceGraph';
import {
  Server,
  Database,
  Layers,
  AlertTriangle,
  Cpu,
  RefreshCw,
  Radio,
  ShieldAlert,
  GitGraph,
  LayoutGrid
} from 'lucide-react';

interface Stage1TopologyViewProps {
  data: Stage1TopologyDebt;
  lang: LanguageMode;
}

export const Stage1TopologyView: React.FC<Stage1TopologyViewProps> = ({ data, lang }) => {
  const t = translations[lang];
  const [selectedNode, setSelectedNode] = useState<TopologicalNode | null>(null);
  const [viewMode, setViewMode] = useState<'d3' | 'grid'>('d3');

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'monolith':
        return <Layers className="w-5 h-5 text-red-400" />;
      case 'db':
        return <Database className="w-5 h-5 text-amber-400" />;
      case 'queue':
        return <Radio className="w-5 h-5 text-purple-400" />;
      case 'client':
        return <Cpu className="w-5 h-5 text-blue-400" />;
      default:
        return <Server className="w-5 h-5 text-slate-400" />;
    }
  };

  const getNodeBorder = (health: string) => {
    switch (health) {
      case 'critical':
        return 'border-red-500/70 bg-red-950/30 text-red-200';
      case 'warning':
        return 'border-amber-500/70 bg-amber-950/30 text-amber-200';
      case 'good':
        return 'border-emerald-500/70 bg-emerald-950/30 text-emerald-200';
      default:
        return 'border-slate-700 bg-slate-900 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <Server className="w-4 h-4 text-blue-400" />
            {t.runtimeLabel}
          </div>
          <div className="text-base font-bold text-white font-mono">{data.runtimeEnvironment}</div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            <Database className="w-4 h-4 text-amber-400" />
            {t.databaseEngines}
          </div>
          <div className="flex flex-wrap gap-2">
            {data.databaseEngines.map((engine, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs font-mono bg-slate-800 border border-slate-700 rounded-md text-amber-300"
              >
                {engine}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* View Switcher: D3 Force Directed Graph vs Grid View */}
      <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <GitGraph className="w-4 h-4 text-indigo-400" />
          <span>{lang === 'ar' ? 'نمط استعراض الطوبولوجيا المعمارية:' : 'Topology Visualization Mode:'}</span>
        </div>

        <div className="flex items-center bg-slate-950 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={() => setViewMode('d3')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              viewMode === 'd3'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitGraph className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'محاكاة D3.js (قوى وترابط)' : 'D3.js Force Graph'}</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'شبكة العقد' : 'Node Grid'}</span>
          </button>
        </div>
      </div>

      {/* Main Graph Component */}
      {viewMode === 'd3' ? (
        <D3ForceGraph data={data} lang={lang} />
      ) : (
        /* Alternate Grid-based Node Visualizer */
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">{t.topologyCanvas}</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
              {lang === 'ar' ? 'انقر على أي عقدة للاطلاع على التفاصيل' : 'Click any node to inspect coupling'}
            </span>
          </div>

          <div className="relative min-h-[220px] bg-slate-950/80 rounded-lg p-6 border border-slate-800/80 flex flex-wrap items-center justify-center gap-6">
            {data.topologicalNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg ${getNodeBorder(
                    node.health
                  )} ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                  style={{ minWidth: '180px' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    {getNodeIcon(node.type)}
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        node.health === 'critical'
                          ? 'bg-red-900/60 text-red-300'
                          : node.health === 'warning'
                          ? 'bg-amber-900/60 text-amber-300'
                          : 'bg-emerald-900/60 text-emerald-300'
                      }`}
                    >
                      {node.health}
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-white mb-1">{node.name}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>{lang === 'ar' ? 'الروابط:' : 'Coupled to:'}</span>
                    <span className="font-mono text-slate-300">{node.connections.length}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedNode && (
            <div className="mt-4 p-3 bg-blue-950/40 border border-blue-800/50 rounded-lg text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-300">{selectedNode.name}</span>
                <span className="text-slate-300 mx-2">
                  ({lang === 'ar' ? 'النوع:' : 'Type:'} {selectedNode.type})
                </span>
                <span className="text-slate-400">
                  {lang === 'ar' ? 'الارتباطات المباشرة:' : 'Direct Connections:'}{' '}
                  {selectedNode.connections.join(', ') || 'None'}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-blue-400 hover:text-white underline cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Monolithic Anti-Patterns Table */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">{t.antiPatternsDetected}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{lang === 'ar' ? 'النمط المضاد' : 'Anti-Pattern'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'الموقع' : 'Location'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'الأثر التشغيلي والمعماري' : 'Impact'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'مؤشر تكلفة الصيانة' : 'Debt Weight'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {data.monolithicAntiPatterns.map((pat, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {pat.pattern}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{pat.location}</td>
                  <td className="py-3 px-4 text-slate-300">{pat.impact}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${Math.min(pat.maintenanceCostScore * 10, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-amber-400">{pat.maintenanceCostScore}/10</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Circular Dependencies & Deprecated APIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Circular Dependencies */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-red-400 mb-3">
            <RefreshCw className="w-4 h-4" />
            {t.circularDeps}
          </div>
          <ul className="space-y-2 text-xs">
            {data.circularDependencies.map((dep, idx) => (
              <li
                key={idx}
                className="p-2.5 bg-red-950/20 border border-red-900/40 rounded text-red-200 font-mono flex items-start gap-2"
              >
                <span className="text-red-400 font-bold shrink-0">#{idx + 1}</span>
                <span>{dep}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Deprecated APIs */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
            <Cpu className="w-4 h-4 text-blue-400" />
            {t.deprecatedApis}
          </div>
          <ul className="space-y-2 text-xs">
            {data.deprecatedApis.map((api, idx) => (
              <li
                key={idx}
                className="p-2.5 bg-slate-800/40 border border-slate-700/50 rounded text-slate-300 font-mono flex items-start gap-2"
              >
                <span className="text-blue-400 font-bold shrink-0">•</span>
                <span>{api}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
