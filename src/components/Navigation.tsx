import React from 'react';
import { Users, UserPlus, BarChart3, Tag, ShieldCheck } from 'lucide-react';

export type TabType = 'list' | 'add' | 'pricelist' | 'warranty' | 'stats';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  customerCount: number;
  pendingCount: number;
  warrantyCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  customerCount,
  pendingCount,
  warrantyCount = 0,
}) => {
  return (
    <nav className="flex flex-wrap gap-2 p-1.5 mb-6 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg">
      <button
        type="button"
        onClick={() => setActiveTab('list')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'list'
            ? 'bg-sky-500/20 text-slate-800 border border-sky-500/40 shadow-xs'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-700/15'
        }`}
      >
        <Users className="w-4 h-4 text-sky-600" />
        <span className="text-slate-800">維修與客戶列表</span>
        <span className="ml-1.5 px-2 py-0.5 text-xs font-mono rounded-full bg-slate-900/10 text-slate-700 border border-slate-300">
          {customerCount}
        </span>
        {pendingCount > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-700 border border-amber-500/40">
            {pendingCount} 待取
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('add')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'add'
            ? 'bg-sky-500/20 text-slate-800 border border-sky-500/40 shadow-xs'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-700/15'
        }`}
      >
        <UserPlus className="w-4 h-4 text-sky-600" />
        <span className="text-slate-800">新增客戶紀錄</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('pricelist')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'pricelist'
            ? 'bg-emerald-500/20 text-slate-800 border border-emerald-500/40 shadow-xs'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-700/15'
        }`}
      >
        <Tag className="w-4 h-4 text-emerald-600" />
        <span className="text-slate-800">維修價目表</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('warranty')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'warranty'
            ? 'bg-cyan-500/20 text-slate-800 border border-cyan-500/40 shadow-xs'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-700/15'
        }`}
      >
        <ShieldCheck className="w-4 h-4 text-cyan-600" />
        <span className="text-slate-800">零件保固履歷庫</span>
        {warrantyCount > 0 && (
          <span className="ml-1.5 px-2 py-0.5 text-xs font-mono rounded-full bg-cyan-500/20 text-cyan-800 border border-cyan-500/40 font-bold">
            {warrantyCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('stats')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'stats'
            ? 'bg-sky-500/20 text-slate-800 border border-sky-500/40 shadow-xs'
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-700/15'
        }`}
      >
        <BarChart3 className="w-4 h-4 text-sky-600" />
        <span className="text-slate-800">營業統計報表</span>
      </button>
    </nav>
  );
};

