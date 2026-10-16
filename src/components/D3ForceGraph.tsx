import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Stage1TopologyDebt, TopologicalNode } from '../types/audit';
import { translations, LanguageMode } from '../locales/i18n';
import {
  RotateCcw,
  Pause,
  Play,
  Flame,
  Layers,
  Database,
  Radio,
  Cpu,
  Server,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

interface D3ForceGraphProps {
  data: Stage1TopologyDebt;
  lang: LanguageMode;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'monolith' | 'db' | 'queue' | 'client' | 'service';
  health: 'critical' | 'warning' | 'good';
  isCircular: boolean;
  radius: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  isCircular: boolean;
}

export const D3ForceGraph: React.FC<D3ForceGraphProps> = ({ data, lang }) => {
  const t = translations[lang];
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightCircularOnly, setHighlightCircularOnly] = useState<boolean>(true);
  const [isPhysicsActive, setIsPhysicsActive] = useState<boolean>(true);

  // Keep reference to simulation and zoom behavior for interactive controls
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Parse circular dependency sequences
  const parsedCycles = useMemo(() => {
    const cycles: { path: string[]; edges: Set<string>; nodes: Set<string> } = {
      path: [],
      edges: new Set<string>(),
      nodes: new Set<string>(),
    };

    (data.circularDependencies || []).forEach((depString) => {
      // Split on -> or ➔ or similar
      const parts = depString.split(/->|➔/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        for (let i = 0; i < parts.length; i++) {
          const from = parts[i].toLowerCase().replace(/[^a-z0-9_]/g, '_');
          const to = parts[(i + 1) % parts.length].toLowerCase().replace(/[^a-z0-9_]/g, '_');
          cycles.edges.add(`${from}->${to}`);
          cycles.nodes.add(from);
          cycles.nodes.add(to);
        }
      }
    });

    return cycles;
  }, [data.circularDependencies]);

  // Build nodes and links dataset
  const { initialNodes, initialLinks } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // Add base topological nodes
    (data.topologicalNodes || []).forEach((n) => {
      const normalizedId = n.id.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const isCirc = parsedCycles.nodes.has(normalizedId) ||
        parsedCycles.nodes.has(n.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'));

      const r = n.type === 'monolith' ? 28 : n.type === 'db' ? 24 : 20;

      nodeMap.set(normalizedId, {
        id: normalizedId,
        name: n.name,
        type: n.type,
        health: isCirc ? 'critical' : n.health,
        isCircular: isCirc,
        radius: r,
      });
    });

    // Ensure all cycle nodes exist
    parsedCycles.nodes.forEach((cNode) => {
      if (!nodeMap.has(cNode)) {
        nodeMap.set(cNode, {
          id: cNode,
          name: cNode
            .split('_')
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' '),
          type: 'service',
          health: 'critical',
          isCircular: true,
          radius: 22,
        });
      }
    });

    // Add connections from topological nodes
    (data.topologicalNodes || []).forEach((n) => {
      const fromId = n.id.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      (n.connections || []).forEach((conn) => {
        const toId = conn.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (nodeMap.has(toId)) {
          const edgeKey = `${fromId}->${toId}`;
          const isCirc = parsedCycles.edges.has(edgeKey);
          links.push({
            source: fromId,
            target: toId,
            isCircular: isCirc,
          });
        }
      });
    });

    // Add cycle edges
    parsedCycles.edges.forEach((edgeKey) => {
      const [from, to] = edgeKey.split('->');
      if (nodeMap.has(from) && nodeMap.has(to)) {
        const alreadyExists = links.some(
          (l) =>
            (typeof l.source === 'string' ? l.source : l.source.id) === from &&
            (typeof l.target === 'string' ? l.target : l.target.id) === to
        );
        if (!alreadyExists) {
          links.push({
            source: from,
            target: to,
            isCircular: true,
          });
        }
      }
    });

    return {
      initialNodes: Array.from(nodeMap.values()),
      initialLinks: links,
    };
  }, [data.topologicalNodes, parsedCycles]);

  // D3 force layout rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Definitions: Gradients, Filters, Markers
    const defs = svg.append('defs');

    // Arrow marker for standard connections
    defs
      .append('marker')
      .attr('id', 'arrow-normal')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#64748b');

    // Arrow marker for circular reference connections (Red pulsing)
    defs
      .append('marker')
      .attr('id', 'arrow-circular')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#ef4444');

    // Glow filter for circular reference highlighting
    const filter = defs.append('filter').attr('id', 'circular-glow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Root zoom group
    const g = svg.append('g').attr('class', 'graph-container');

    // Zoom setup
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Center initial zoom
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));

    // Deep copy data to avoid d3 mutation side-effects
    const nodes: GraphNode[] = initialNodes.map((d) => ({ ...d }));
    const links: GraphLink[] = initialLinks.map((d) => ({ ...d }));

    // Simulation forces
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance((d) => (d.isCircular ? 90 : 130))
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 24))
      .alphaDecay(0.025);

    simulationRef.current = simulation;

    // Draw Links
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', (d) => (d.isCircular ? 'link-circular' : 'link-normal'))
      .attr('stroke', (d) => (d.isCircular ? '#ef4444' : '#475569'))
      .attr('stroke-width', (d) => (d.isCircular ? 2.5 : 1.5))
      .attr('stroke-dasharray', (d) => (d.isCircular ? '6,4' : 'none'))
      .attr('stroke-opacity', (d) => {
        if (highlightCircularOnly && !d.isCircular) return 0.2;
        return d.isCircular ? 0.95 : 0.6;
      })
      .attr('marker-end', (d) => (d.isCircular ? 'url(#arrow-circular)' : 'url(#arrow-normal)'))
      .style('filter', (d) => (d.isCircular ? 'url(#circular-glow)' : 'none'));

    // Draw Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-item cursor-pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active && isPhysicsActive) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active && isPhysicsActive) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (_event, d) => {
        setSelectedNode(d);
      });

    // Circular warning ring for cycle nodes
    node
      .filter((d) => d.isCircular)
      .append('circle')
      .attr('r', (d) => d.radius + 6)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,3')
      .attr('class', 'animate-spin')
      .style('transform-origin', 'center');

    // Base Circle
    node
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (d.type === 'monolith') return '#7f1d1d';
        if (d.type === 'db') return '#78350f';
        if (d.type === 'queue') return '#581c87';
        if (d.type === 'client') return '#1e3a8a';
        return d.isCircular ? '#991b1b' : '#1e293b';
      })
      .attr('stroke', (d) => {
        if (d.isCircular) return '#f87171';
        if (d.health === 'critical') return '#ef4444';
        if (d.health === 'warning') return '#f59e0b';
        return '#10b981';
      })
      .attr('stroke-width', (d) => (d.isCircular ? 3 : 2))
      .style('filter', (d) => (d.isCircular ? 'url(#circular-glow)' : 'none'))
      .attr('opacity', (d) => {
        if (highlightCircularOnly && !d.isCircular) return 0.35;
        return 1;
      });

    // Center Type Icon / Text
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#ffffff')
      .attr('font-size', (d) => (d.type === 'monolith' ? '12px' : '10px'))
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d) => {
        if (d.type === 'monolith') return 'M';
        if (d.type === 'db') return 'DB';
        if (d.type === 'queue') return 'Q';
        if (d.type === 'client') return 'CLI';
        return 'SVC';
      });

    // Warning Badge on top of circular nodes
    node
      .filter((d) => d.isCircular)
      .append('text')
      .attr('x', (d) => d.radius * 0.7)
      .attr('y', (d) => -d.radius * 0.7)
      .attr('font-size', '13px')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .text('⚠️');

    // Node Label with subtle background
    const labelGroup = node
      .append('g')
      .attr('transform', (d) => `translate(0, ${d.radius + 12})`)
      .attr('pointer-events', 'none');

    labelGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => (d.isCircular ? '#fca5a5' : '#cbd5e1'))
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .attr('font-weight', (d) => (d.isCircular ? 'bold' : 'normal'))
      .text((d) => d.name)
      .attr('stroke', '#090d16')
      .attr('stroke-width', 3)
      .attr('paint-order', 'stroke fill');

    // Simulation Tick Updates
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [initialNodes, initialLinks, highlightCircularOnly, isPhysicsActive]);

  // Controls Handlers
  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(600)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(0, 0).scale(1));
  };

  const handleTogglePhysics = () => {
    if (!simulationRef.current) return;
    if (isPhysicsActive) {
      simulationRef.current.stop();
      setIsPhysicsActive(false);
    } else {
      simulationRef.current.alpha(0.3).restart();
      setIsPhysicsActive(true);
    }
  };

  // Connected links for selected node
  const selectedNodeConnections = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };

    const incoming: string[] = [];
    const outgoing: string[] = [];

    initialLinks.forEach((l) => {
      const srcId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgtId = typeof l.target === 'string' ? l.target : (l.target as any).id;

      if (tgtId === selectedNode.id) incoming.push(srcId);
      if (srcId === selectedNode.id) outgoing.push(tgtId);
    });

    return { incoming, outgoing };
  }, [selectedNode, initialLinks]);

  return (
    <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">{t.d3GraphTitle}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
              D3.js Force Simulation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{t.d3GraphSubtitle}</p>
        </div>

        {/* Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Highlight Circular Reference Toggle */}
          <button
            onClick={() => setHighlightCircularOnly(!highlightCircularOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              highlightCircularOnly
                ? 'bg-red-950/60 text-red-300 border-red-500/60 shadow-lg shadow-red-950/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${highlightCircularOnly ? 'text-red-400 animate-pulse' : ''}`} />
            <span>{t.highlightCircular}</span>
          </button>

          {/* Toggle Physics */}
          <button
            onClick={handleTogglePhysics}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            title={isPhysicsActive ? t.freezePhysics : t.resumePhysics}
          >
            {isPhysicsActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPhysicsActive ? t.freezePhysics : t.resumePhysics}</span>
          </button>

          {/* Reset Zoom */}
          <button
            onClick={handleResetZoom}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            title={t.resetZoom}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.resetZoom}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[480px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center select-none"
      >
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Legend Overlay in top-left */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-[11px] space-y-1.5 pointer-events-none shadow-lg">
          <div className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            {lang === 'ar' ? 'دليل الرموز والعقد:' : 'Topology Legend:'}
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-red-900 border border-red-500 inline-block" />
            <span>{lang === 'ar' ? 'نظام أحادي (Monolith Core)' : 'Monolith Core (Host)'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-amber-900 border border-amber-500 inline-block" />
            <span>{lang === 'ar' ? 'قاعدة بيانات مقترنة (Shared DB)' : 'Shared Database Engine'}</span>
          </div>
          <div className="flex items-center gap-2 text-red-300 font-semibold">
            <span className="w-4 border-t-2 border-dashed border-red-500 inline-block" />
            <span>{lang === 'ar' ? 'حلقة اعتمادية دائرية (Circular Ref)' : 'Circular Reference Loop'}</span>
          </div>
        </div>

        {/* Helper Hint */}
        <div className="absolute bottom-3 right-3 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-[10px] text-slate-400 pointer-events-none font-mono">
          {lang === 'ar' ? 'اسحب العقد أو قم بالتقريب بعجلة الفأرة' : 'Drag nodes to reposition • Scroll to zoom'}
        </div>
      </div>

      {/* Node Inspection Details Drawer / Card */}
      {selectedNode && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  selectedNode.isCircular
                    ? 'bg-red-500 animate-ping'
                    : selectedNode.health === 'critical'
                    ? 'bg-red-400'
                    : selectedNode.health === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-bold text-sm text-white">{selectedNode.name}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Type: {selectedNode.type}
              </span>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer underline"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>

          {selectedNode.isCircular && (
            <div className="p-2.5 bg-red-950/40 border border-red-500/50 rounded-lg text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                <strong>{t.circularAlert}</strong>
                {lang === 'ar'
                  ? ' — يسبب هذا الارتباط الدائري اختناقاً في الأداء ويمنع استخراج الخدمة دون كسر النظام.'
                  : ' — This circular coupling locks shared state and prevents clean bounded context isolation.'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
              <span className="text-slate-400 font-semibold block mb-1">
                {t.incomingDeps} ({selectedNodeConnections.incoming.length}):
              </span>
              <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                {selectedNodeConnections.incoming.length > 0 ? (
                  selectedNodeConnections.incoming.map((src, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-800 text-blue-300 rounded border border-slate-700">
                      ← {src}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">None</span>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
              <span className="text-slate-400 font-semibold block mb-1">
                {t.outgoingDeps} ({selectedNodeConnections.outgoing.length}):
              </span>
              <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                {selectedNodeConnections.outgoing.length > 0 ? (
                  selectedNodeConnections.outgoing.map((tgt, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-800 text-indigo-300 rounded border border-slate-700">
                      → {tgt}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
