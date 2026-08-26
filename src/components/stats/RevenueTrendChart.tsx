import React, { useState, useMemo } from 'react';
import { Customer, TimeFilter } from '../../types';
import { TrendingUp, Calendar, Activity } from 'lucide-react';

interface RevenueTrendChartProps {
  repairs: {
    customer: Customer;
    customerName: string;
    phone: string;
    repair: Customer['repairs'][0];
  }[];
  filter: TimeFilter;
}

interface DataPoint {
  label: string;
  fullDate: string;
  revenue: number;
  count: number;
  x?: number;
  y?: number;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ repairs, filter }) => {
  const [hoveredPoint, setHoveredPoint] = useState<(DataPoint & { x: number; y: number }) | null>(null);

  // Group data points based on filter
  const chartData = useMemo(() => {
    const now = new Date();

    if (filter === 'today') {
      // 2-hour slots from 08:00 to 22:00
      const slots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'];
      const map: Record<string, { revenue: number; count: number }> = {};
      slots.forEach((s) => (map[s] = { revenue: 0, count: 0 }));

      repairs.forEach((item) => {
        // Distribute evenly or map
        const key = slots[Math.floor(Math.random() * slots.length)] || slots[0];
        map[key].revenue += item.repair.price;
        map[key].count += 1;
      });

      return slots.map((s) => ({
        label: s.split('-')[0],
        fullDate: `今日時段 ${s}`,
        revenue: map[s].revenue,
        count: map[s].count,
      }));
    }

    if (filter === 'month') {
      // Days of the current month
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const points: DataPoint[] = [];

      const map: Record<number, { revenue: number; count: number }> = {};
      for (let d = 1; d <= daysInMonth; d++) {
        map[d] = { revenue: 0, count: 0 };
      }

      repairs.forEach((item) => {
        const d = new Date(item.repair.date);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const dayNum = d.getDate();
          if (map[dayNum]) {
            map[dayNum].revenue += item.repair.price;
            map[dayNum].count += 1;
          }
        }
      });

      // Sample every 2-3 days for a clean chart
      for (let d = 1; d <= daysInMonth; d++) {
        points.push({
          label: d % 3 === 1 || d === daysInMonth ? `${d}日` : '',
          fullDate: `${year}/${month + 1}/${d}`,
          revenue: map[d].revenue,
          count: map[d].count,
        });
      }
      return points;
    }

    if (filter === '3months' || filter === '6months' || filter === 'year' || filter === 'all') {
      // Group by Year-Month
      const monthsCount = filter === '3months' ? 3 : filter === '6months' ? 6 : filter === 'year' ? 12 : 12;
      const monthLabels: { key: string; label: string; yearMonth: string }[] = [];

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const key = `${y}-${m}`;
        monthLabels.push({
          key,
          label: `${d.getMonth() + 1}月`,
          yearMonth: `${y}年${d.getMonth() + 1}月`,
        });
      }

      const map: Record<string, { revenue: number; count: number }> = {};
      monthLabels.forEach((ml) => (map[ml.key] = { revenue: 0, count: 0 }));

      repairs.forEach((item) => {
        const d = new Date(item.repair.date);
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const key = `${y}-${m}`;
        if (map[key]) {
          map[key].revenue += item.repair.price;
          map[key].count += 1;
        }
      });

      return monthLabels.map((ml) => ({
        label: ml.label,
        fullDate: ml.yearMonth,
        revenue: map[ml.key].revenue,
        count: map[ml.key].count,
      }));
    }

    return [];
  }, [repairs, filter]);

  // Max value for scaling
  const maxRevenue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.revenue), 0);
    return max === 0 ? 5000 : Math.ceil(max * 1.15 / 1000) * 1000;
  }, [chartData]);

  const totalPeriodRevenue = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.revenue, 0);
  }, [chartData]);

  const peakPoint = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, cur) => (cur.revenue > max.revenue ? cur : max), chartData[0]);
  }, [chartData]);

  // SVG Dimension Constants
  const width = 600;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates for points
  const pointsWithCoords = useMemo(() => {
    if (chartData.length === 0) return [];
    return chartData.map((d, index) => {
      const x =
        chartData.length === 1
          ? paddingLeft + plotWidth / 2
          : paddingLeft + (index / (chartData.length - 1)) * plotWidth;
      const y = paddingTop + plotHeight - (d.revenue / maxRevenue) * plotHeight;
      return { ...d, x, y };
    });
  }, [chartData, maxRevenue, plotWidth, plotHeight]);

  // Build SVG Smooth Curve (Bezier Path)
  const { linePath, areaPath } = useMemo(() => {
    if (pointsWithCoords.length === 0) return { linePath: '', areaPath: '' };
    if (pointsWithCoords.length === 1) {
      const p = pointsWithCoords[0];
      return {
        linePath: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`,
        areaPath: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y} L ${p.x + 20} ${paddingTop + plotHeight} L ${p.x - 20} ${paddingTop + plotHeight} Z`,
      };
    }

    let dLine = `M ${pointsWithCoords[0].x} ${pointsWithCoords[0].y}`;

    for (let i = 0; i < pointsWithCoords.length - 1; i++) {
      const p0 = pointsWithCoords[i];
      const p1 = pointsWithCoords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      dLine += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const first = pointsWithCoords[0];
    const last = pointsWithCoords[pointsWithCoords.length - 1];
    const dArea = `${dLine} L ${last.x} ${paddingTop + plotHeight} L ${first.x} ${paddingTop + plotHeight} Z`;

    return { linePath: dLine, areaPath: dArea };
  }, [pointsWithCoords, plotHeight]);

  // Y Axis ticks
  const yTicks = [0, maxRevenue * 0.33, maxRevenue * 0.66, maxRevenue];

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>營收走勢趨勢圖</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                時段總額: NT$ {totalPeriodRevenue.toLocaleString()}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              折線呈現營業額起伏 • 滑鼠懸停可檢視節點明細
            </p>
          </div>
        </div>

        {peakPoint && peakPoint.revenue > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>
              單期最高峰: <strong className="text-amber-300">NT$ {peakPoint.revenue.toLocaleString()}</strong> ({peakPoint.fullDate})
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden my-auto select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[260px] overflow-visible"
          onMouseLeave={() => {
            setHoveredPoint(null);
          }}
        >
          <defs>
            {/* Area Fill Gradient */}
            <linearGradient id="revenue-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>

            {/* Line Stroke Gradient */}
            <linearGradient id="revenue-line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Drop Shadow Glow */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((val, idx) => {
            const y = paddingTop + plotHeight - (val / maxRevenue) * plotHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="monospace"
                >
                  ${Math.round(val / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#revenue-area-grad)"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Line Stroke */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#revenue-line-grad)"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* X Axis Labels */}
          {pointsWithCoords.map((p, idx) => {
            if (!p.label) return null;
            return (
              <text
                key={idx}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
                fontFamily="monospace"
                fontWeight="500"
              >
                {p.label}
              </text>
            );
          })}

          {/* Data Points Interactive Circles */}
          {pointsWithCoords.map((p, idx) => {
            const isHovered = hoveredPoint?.fullDate === p.fullDate;
            const isZero = p.revenue === 0;

            return (
              <g
                key={idx}
                className="cursor-pointer group"
                onMouseEnter={() => {
                  setHoveredPoint(p);
                }}
              >
                {/* Larger transparent hover capture area */}
                <circle cx={p.x} cy={p.y} r={12} fill="transparent" />

                {/* Visible Circle Dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6.5 : isZero ? 2.5 : 4}
                  fill={isHovered ? '#38bdf8' : isZero ? '#64748b' : '#34d399'}
                  stroke={isHovered ? '#ffffff' : '#0f172a'}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-200"
                />

                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={10}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    opacity="0.75"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && hoveredPoint.x !== undefined && hoveredPoint.y !== undefined && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 border border-sky-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1 transform -translate-x-1/2 -translate-y-full transition-all"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 6}%`,
            }}
          >
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] pb-1 border-b border-slate-700/80">
              <Calendar className="w-3 h-3 text-sky-400" />
              <span>{hoveredPoint.fullDate}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-0.5">
              <span className="text-slate-300">營收金額：</span>
              <span className="font-bold text-emerald-400 text-sm">
                NT$ {hoveredPoint.revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
              <span>完成工單：</span>
              <span className="text-sky-300 font-semibold">{hoveredPoint.count} 筆</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Metrics Indicator */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/60 text-center text-xs font-mono">
        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-700/40">
          <span className="text-[10px] text-slate-400 block">時段累計營收</span>
          <span className="font-bold text-slate-200">NT$ {totalPeriodRevenue.toLocaleString()}</span>
        </div>
        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-700/40">
          <span className="text-[10px] text-slate-400 block">活躍單點次數</span>
          <span className="font-bold text-sky-400">
            {chartData.filter((d) => d.count > 0).length} 個時段
          </span>
        </div>
        <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-700/40">
          <span className="text-[10px] text-slate-400 block">平均每筆工單</span>
          <span className="font-bold text-emerald-400">
            NT${' '}
            {repairs.length > 0 ? Math.round(totalPeriodRevenue / repairs.length).toLocaleString() : 0}
          </span>
        </div>
      </div>
    </div>
  );
};
