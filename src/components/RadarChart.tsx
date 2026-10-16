import React from 'react';
import { RadarScores } from '../types/audit';

interface RadarChartProps {
  scores: RadarScores;
  size?: number;
  isArabic?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({ scores, size = 260, isArabic = false }) => {
  const axes = [
    { key: 'modularity', label: isArabic ? 'النمطية والتفكيك' : 'Modularity', val: scores.modularity },
    { key: 'security', label: isArabic ? 'أمن العمليات (DevSecOps)' : 'Security (OWASP)', val: scores.security },
    { key: 'cloudReadiness', label: isArabic ? 'الجاهزية السحابية' : 'Cloud Readiness', val: scores.cloudReadiness },
    { key: 'testability', label: isArabic ? 'قابلية الاختبار الآلي' : 'Testability', val: scores.testability },
    { key: 'compliance', label: isArabic ? 'الامتثال والحوكمة' : 'Compliance', val: scores.compliance },
    { key: 'scalability', label: isArabic ? 'قابلية التوسع' : 'Scalability', val: scores.scalability },
  ];

  const center = size / 2;
  const radius = (size / 2) - 40;
  const angleStep = (Math.PI * 2) / axes.length;

  // Background grid circles
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = axes
    .map((axis, i) => {
      const ratio = Math.min(Math.max(axis.val / 100, 0.05), 1);
      const { x, y } = getCoordinates(i, ratio);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background concentric rings */}
        {levels.map((level, i) => {
          const points = axes
            .map((_, idx) => {
              const { x, y } = getCoordinates(idx, level);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <polygon
              key={i}
              points={points}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={i === levels.length - 1 ? 'none' : '3 3'}
              opacity={0.4}
            />
          );
        })}

        {/* Axis spokes */}
        {axes.map((_, i) => {
          const { x, y } = getCoordinates(i, 1);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#475569"
              strokeWidth="1"
              opacity={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(59, 130, 246, 0.25)"
          stroke="#3b82f6"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out"
        />

        {/* Data points */}
        {axes.map((axis, i) => {
          const ratio = Math.min(Math.max(axis.val / 100, 0.05), 1);
          const { x, y } = getCoordinates(i, ratio);
          return (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#60a5fa"
                stroke="#1e3a8a"
                strokeWidth="2"
                className="transition-transform group-hover:scale-150"
              />
              <title>{`${axis.label}: ${axis.val}/100`}</title>
            </g>
          );
        })}

        {/* Labels */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(i, 1.25);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-semibold fill-slate-300 select-none tracking-tight"
            >
              {axis.label} ({axis.val}%)
            </text>
          );
        })}
      </svg>
    </div>
  );
};
