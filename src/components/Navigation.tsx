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
        onClick={() => setActiveTab('list')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'list'
            ? 'bg-gradient-to-r from-sky-500/20 to-emerald-500/10 text-sky-400 border border-sky-500/30 shadow-md'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>維修與客戶列表</span>
        <span className="ml-1.5 px-2 py-0.5 text-xs font-mono rounded-full bg-slate-900/60 text-slate-300 border border-slate-700">
          {customerCount}
        </span>
        {pendingCount > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {pendingCount} 待取
          </span>
        )}
      </button>

      <button
        onClick={() => setActiveTab('add')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'add'
            ? 'bg-gradient-to-r from-sky-500/20 to-emerald-500/10 text-sky-400 border border-sky-500/30 shadow-md'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
      >
        <UserPlus className="w-4 h-4" />
        <span>新增客戶紀錄</span>
      </button>

      <button
        onClick={() => setActiveTab('pricelist')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'pricelist'
            ? 'bg-gradient-to-r from-emerald-500/20 to-sky-500/10 text-emerald-400 border border-emerald-500/30 shadow-md'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
      >
        <Tag className="w-4 h-4" />
        <span>維修價目表</span>
      </button>

      <button
        onClick={() => setActiveTab('warranty')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'warranty'
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-md'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
      >
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        <span>零件保固履歷庫</span>
        {warrantyCount > 0 && (
          <span className="ml-1.5 px-2 py-0.5 text-xs font-mono rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
            {warrantyCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setActiveTab('stats')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'stats'
            ? 'bg-gradient-to-r from-sky-500/20 to-emerald-500/10 text-sky-400 border border-sky-500/30 shadow-md'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span>營業統計報表</span>
      </button>
    </nav>
  );
};

