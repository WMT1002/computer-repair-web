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
const tabs = [
  { id: 'list', label: '維修與客戶', icon: Users },
  { id: 'add', label: '新增維修', icon: UserPlus },
  { id: 'pricelist', label: '維修價目', icon: Tag },
  { id: 'warranty', label: '零件保固', icon: ShieldCheck },
  { id: 'stats', label: '營業報表', icon: BarChart3 },
] as const;

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => (
  <nav aria-label="主要功能" className="workspace-nav flex overflow-x-auto mb-6 gap-1 border-b">
    {tabs.map(({ id, label, icon: Icon }) => (
      <button key={id} type="button" aria-current={activeTab === id ? 'page' : undefined}
        onClick={() => setActiveTab(id)}
        className={`flex shrink-0 items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'tab-active' : ''}`}>
        <Icon className="w-4 h-4" /><span>{label}</span>
      </button>
    ))}
  </nav>
);
