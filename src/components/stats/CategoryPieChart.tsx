import React, { useState, useMemo } from 'react';
import { Customer } from '../../types';
import { PieChart as PieIcon, Layers, Tag, Sparkles } from 'lucide-react';

interface CategoryPieChartProps {
  repairs: {
    customer: Customer;
    customerName: string;
    phone: string;
    repair: Customer['repairs'][0];
  }[];
}

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  revenue: number;
  percentage: number;
  color: string;
  gradient: [string, string];
}

const CATEGORY_COLORS = [
  { color: '#38bdf8', gradient: ['#38bdf8', '#0284c7'] as [string, string] }, // Sky
  { color: '#34d399', gradient: ['#34d399', '#059669'] as [string, string] }, // Emerald
  { color: '#fbbf24', gradient: ['#fbbf24', '#d97706'] as [string, string] }, // Amber
  { color: '#c084fc', gradient: ['#c084fc', '#9333ea'] as [string, string] }, // Purple
  { color: '#f43f5e', gradient: ['#f43f5e', '#e11d48'] as [string, string] }, // Rose
  { color: '#2dd4bf', gradient: ['#2dd4bf', '#0d9488'] as [string, string] }, // Teal
  { color: '#94a3b8', gradient: ['#94a3b8', '#64748b'] as [string, string] }, // Slate
];

// Smart Category Classifier
function classifyRepairItem(itemText: string): string {
  const lower = itemText.toLowerCase();

  // 1. 系統重灌 / 軟體優化
  if (
    lower.includes('重灌') ||
    lower.includes('系統') ||
    lower.includes('windows') ||
    lower.includes('win10') ||
    lower.includes('win11') ||
    lower.includes('office') ||
    lower.includes('防毒') ||
    lower.includes('開機慢') ||
    lower.includes('藍屏') ||
    lower.includes('密碼') ||
    lower.includes('驅動') ||
    lower.includes('軟體') ||
    lower.includes('格式化') ||
    lower.includes('備份')
  ) {
    return '系統重灌 / 軟體優化';
  }

  // 2. 螢幕面板 / 顯示排查
  if (
    lower.includes('螢幕') ||
    lower.includes('面板') ||
    lower.includes('破裂') ||
    lower.includes('亮線') ||
    lower.includes('黑屏') ||
    lower.includes('無畫面') ||
    lower.includes('閃爍') ||
    lower.includes('液晶') ||
    lower.includes('排線')
  ) {
    return '螢幕面板 / 顯示排查';
  }

  // 3. 散熱保養 / 清潔除塵
  if (
    lower.includes('散熱') ||
    lower.includes('風扇') ||
    lower.includes('清灰') ||
    lower.includes('保養') ||
    lower.includes('更換散熱膏') ||
    lower.includes('過熱') ||
    lower.includes('異音') ||
    lower.includes('除塵')
  ) {
    return '散熱保養 / 清潔除塵';
  }

  // 4. 主機板 / 電路晶片維修
  if (
    lower.includes('主機板') ||
    lower.includes('主板') ||
    lower.includes('電路') ||
    lower.includes('短路') ||
    lower.includes('不過電') ||
    lower.includes('通電無反應') ||
    lower.includes('泡水') ||
    lower.includes('受潮') ||
    lower.includes('晶片') ||
    lower.includes('燒毀')
  ) {
    return '主機板 / 電路修復';
  }

  // 5. 硬體升級 / 零件更換
  if (
    lower.includes('ssd') ||
    lower.includes('固態硬碟') ||
    lower.includes('記憶體') ||
    lower.includes('ram') ||
    lower.includes('硬碟') ||
    lower.includes('hdd') ||
    lower.includes('電源') ||
    lower.includes('電供') ||
    lower.includes('power') ||
    lower.includes('顯卡') ||
    lower.includes('gpu') ||
    lower.includes('cpu') ||
    lower.includes('機殼') ||
    lower.includes('更換') ||
    lower.includes('升級') ||
    lower.includes('組裝')
  ) {
    return '硬體升級 / 零件更換';
  }

  return '綜合檢測 / 其他服務';
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ repairs }) => {
  const [viewMode, setViewMode] = useState<'category' | 'item'>('category');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Process data based on viewMode
  const categoriesData: CategoryItem[] = useMemo(() => {
    if (repairs.length === 0) return [];

    const countMap: Record<string, { count: number; revenue: number }> = {};

    repairs.forEach((r) => {
      const key =
        viewMode === 'category'
          ? classifyRepairItem(r.repair.item)
          : r.repair.item.trim().split(/[，,;；]/)[0] || r.repair.item.trim() || '未分類項目';

      if (!countMap[key]) {
        countMap[key] = { count: 0, revenue: 0 };
      }
      countMap[key].count += 1;
      countMap[key].revenue += r.repair.price;
    });

    const totalCount = repairs.length;
    const sorted = Object.entries(countMap)
      .map(([name, val], idx) => ({
        id: `cat-${idx}`,
        name,
        count: val.count,
        revenue: val.revenue,
        percentage: Number(((val.count / totalCount) * 100).toFixed(1)),
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length].color,
        gradient: CATEGORY_COLORS[idx % CATEGORY_COLORS.length].gradient,
      }))
      .sort((a, b) => b.count - a.count);

    // If in item view and too many items, limit to top 6 + other
    if (viewMode === 'item' && sorted.length > 6) {
      const top5 = sorted.slice(0, 5);
      const others = sorted.slice(5);
      const otherCount = others.reduce((acc, cur) => acc + cur.count, 0);
      const otherRevenue = others.reduce((acc, cur) => acc + cur.revenue, 0);
      top5.push({
        id: 'cat-other',
        name: '其他項目彙總',
        count: otherCount,
        revenue: otherRevenue,
        percentage: Number(((otherCount / totalCount) * 100).toFixed(1)),
        color: '#94a3b8',
        gradient: ['#94a3b8', '#64748b'],
      });
      return top5;
    }

    return sorted;
  }, [repairs, viewMode]);

  // Donut Arc Generation
  const totalCount = repairs.length;
  const size = 220;
  const center = size / 2;
  const outerRadius = 85;
  const innerRadius = 52;

  // Compute SVG Slice Paths
  const slices = useMemo(() => {
    if (totalCount === 0 || categoriesData.length === 0) return [];

    let startAngle = 0;

    return categoriesData.map((item) => {
      const angle = (item.count / totalCount) * 360;
      const endAngle = startAngle + angle;

      // Convert polar to cartesian coordinates
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const isLargeArc = angle > 180 ? 1 : 0;

      const x1 = center + outerRadius * Math.cos(startRad);
      const y1 = center + outerRadius * Math.sin(startRad);
      const x2 = center + outerRadius * Math.cos(endRad);
      const y2 = center + outerRadius * Math.sin(endRad);

      const x3 = center + innerRadius * Math.cos(endRad);
      const y3 = center + innerRadius * Math.sin(endRad);
      const x4 = center + innerRadius * Math.cos(startRad);
      const y4 = center + innerRadius * Math.sin(startRad);

      // Path data for donut arc
      const pathData =
        categoriesData.length === 1
          ? `M ${center} ${center - outerRadius} A ${outerRadius} ${outerRadius} 0 1 1 ${center - 0.01} ${center - outerRadius} L ${center - 0.01} ${center - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius} Z`
          : `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${isLargeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${isLargeArc} 0 ${x4} ${y4} Z`;

      const sliceData = {
        ...item,
        pathData,
        midAngle: startAngle + angle / 2,
      };

      startAngle = endAngle;
      return sliceData;
    });
  }, [categoriesData, totalCount, center, outerRadius, innerRadius]);

  const activeItem = useMemo(() => {
    if (!hoveredSlice) return null;
    return categoriesData.find((c) => c.name === hoveredSlice) || null;
  }, [hoveredSlice, categoriesData]);

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>維修項目故障分類圓餅圖</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-normal">
                共 {totalCount} 筆工單
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              自動分析維修類型佔比與營收貢獻
            </p>
          </div>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setViewMode('category')}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition cursor-pointer ${
              viewMode === 'category'
                ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3" /> 智能分類
          </button>
          <button
            onClick={() => setViewMode('item')}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition cursor-pointer ${
              viewMode === 'item'
                ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3 h-3" /> 項目排行
          </button>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs">此時段尚無足夠維修資料進行分類。</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-auto">
          {/* Donut Chart SVG (Left 5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative select-none">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-48 h-48 sm:w-52 sm:h-52 overflow-visible drop-shadow-md"
            >
              <defs>
                {slices.map((s, idx) => (
                  <linearGradient
                    key={`grad-${idx}`}
                    id={`pie-grad-${idx}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={s.gradient[0]} />
                    <stop offset="100%" stopColor={s.gradient[1]} />
                  </linearGradient>
                ))}
              </defs>

              {/* Slices */}
              {slices.map((slice, idx) => {
                const isHovered = hoveredSlice === slice.name;
                return (
                  <path
                    key={slice.id}
                    d={slice.pathData}
                    fill={`url(#pie-grad-${idx})`}
                    stroke="#0f172a"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all duration-300 cursor-pointer hover:opacity-90"
                    style={{
                      transformOrigin: `${center}px ${center}px`,
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      filter: isHovered ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))' : 'none',
                    }}
                    onMouseEnter={() => setHoveredSlice(slice.name)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              {activeItem ? (
                <div className="space-y-0.5 fade-in px-3">
                  <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[90px]">
                    {activeItem.name}
                  </span>
                  <span className="text-xl font-black font-mono" style={{ color: activeItem.color }}>
                    {activeItem.percentage}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 block">
                    {activeItem.count} 筆
                  </span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">維修總數</span>
                  <span className="text-2xl font-black font-mono text-slate-100">
                    {totalCount}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">100%</span>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Legend & Progress Bars (Right 7 cols) */}
          <div className="md:col-span-7 space-y-2.5">
            {categoriesData.map((cat) => {
              const isHovered = hoveredSlice === cat.name;
              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredSlice(cat.name)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? 'bg-slate-700/80 border-sky-500/50 shadow-sm translate-x-1'
                      : 'bg-slate-900/40 border-slate-700/40 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-slate-200 font-semibold truncate">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 text-right">
                      <span className="text-slate-400 text-[11px]">{cat.count} 筆</span>
                      <span className="font-bold text-slate-100 w-12 text-right">
                        {cat.percentage}%
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px] w-20 text-right">
                        NT$ {cat.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer hint */}
      <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>懸停扇區或列表可檢視對應佔比與營收分析</span>
        </span>
        <span className="text-slate-500">
          最高佔比：
          <strong className="text-sky-300">
            {categoriesData[0] ? `${categoriesData[0].name} (${categoriesData[0].percentage}%)` : '無'}
          </strong>
        </span>
      </div>
    </div>
  );
};
