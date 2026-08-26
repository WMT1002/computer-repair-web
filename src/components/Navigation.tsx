import React from 'react';
import { Users, UserPlus, BarChart3, Tag, ShieldCheck } from 'lucide-react';

export type TabType = 'list' | 'add' | 'pricelist' | 'warranty' | 'stats';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  customerCount?: number;
  pendingCount?: number;
  warrantyCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <nav className="flex flex-wrap gap-2 p-1.5 mb-6 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg">
      <button
        type="button"
        onClick={() => setActiveTab('list')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'list'
            ? 'tab-active bg-sky-500/20 text-white border border-sky-400 shadow-md shadow-sky-500/10'
            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <Users className="w-4 h-4 text-sky-400" />
        <span>維修與客戶列表</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('add')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'add'
            ? 'tab-active bg-sky-500/20 text-white border border-sky-400 shadow-md shadow-sky-500/10'
            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <UserPlus className="w-4 h-4 text-sky-400" />
        <span>新增客戶紀錄</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('pricelist')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'pricelist'
            ? 'tab-active tab-emerald bg-emerald-500/20 text-white border border-emerald-400 shadow-md shadow-emerald-500/10'
            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <Tag className="w-4 h-4 text-emerald-400" />
        <span>維修價目表</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('warranty')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'warranty'
            ? 'tab-active tab-cyan bg-cyan-500/20 text-white border border-cyan-400 shadow-md shadow-cyan-500/10'
            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        <span>零件保固履歷庫</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('stats')}
        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
          activeTab === 'stats'
            ? 'tab-active bg-sky-500/20 text-white border border-sky-400 shadow-md shadow-sky-500/10'
            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        <BarChart3 className="w-4 h-4 text-sky-400" />
        <span>營業統計報表</span>
      </button>
    </nav>
  );
};

