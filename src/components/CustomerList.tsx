import React, { useState, useRef, useEffect } from 'react';
import { Customer, RepairRecord, RepairStatus, getStatusLabel } from '../types';
import {
  Search,
  Phone,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Trash2,
  ChevronRight,
  Filter,
  Edit3,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onPrintCustomer: (customer: Customer, repair: RepairRecord) => void;
  onToggleStatus: (customerId: string, repairId: string, specificStatus?: RepairStatus) => void;
  onTogglePickedUp?: (customerId: string, repairId: string, isPickedUp: boolean) => void;
  onDeleteCustomer: (customerId: string) => void;
}

const STATUS_OPTIONS_CONFIG: Record<
  string,
  { label: string; short: string; bg: string; text: string; border: string; dot: string; hoverBg: string }
> = {
  received: {
    label: '【1. 收件建檔】',
    short: '1. 收件建檔',
    bg: 'bg-sky-500/15',
    text: 'text-sky-300',
    border: 'border-sky-500/40',
    dot: 'bg-sky-400',
    hoverBg: 'hover:bg-sky-500/25',
  },
  diagnosing: {
    label: '【2. 故障檢測】',
    short: '2. 故障檢測',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    dot: 'bg-amber-400',
    hoverBg: 'hover:bg-amber-500/25',
  },
  repairing: {
    label: '【3. 維修更換】',
    short: '3. 維修更換',
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-500/40',
    dot: 'bg-purple-400',
    hoverBg: 'hover:bg-purple-500/25',
  },
  completed: {
    label: '【4. 完工待取】',
    short: '4. 完工待取',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-400',
    hoverBg: 'hover:bg-emerald-500/25',
  },
};

const StatusDropdown: React.FC<{
  status: RepairStatus;
  onSelect: (status: RepairStatus) => void;
}> = ({ status, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalized = status === 'pending' ? 'received' : status;
  const current = STATUS_OPTIONS_CONFIG[normalized] || STATUS_OPTIONS_CONFIG.received;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const items: { key: RepairStatus; label: string }[] = [
    { key: 'received', label: '【1. 收件建檔】' },
    { key: 'diagnosing', label: '【2. 故障檢測】' },
    { key: 'repairing', label: '【3. 維修更換】' },
    { key: 'completed', label: '【4. 完工待取】' },
  ];

  return (
    <div className="relative inline-block shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`px-1.5 sm:px-2 py-1 text-[11px] font-semibold rounded-lg border flex items-center gap-1 transition-colors cursor-pointer select-none whitespace-nowrap shrink-0 ${current.bg} ${current.text} ${current.border} ${current.hoverBg}`}
        title="點擊切換維修進度狀態"
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
        <span className="whitespace-nowrap">{current.short}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full mb-1.5 right-0 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] font-mono text-slate-400 px-2 py-1 border-b border-slate-800 mb-1">
            快速切換進度
          </div>
          {items.map((item) => {
            const isSelected = normalized === item.key;
            const cfg = STATUS_OPTIONS_CONFIG[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect(item.key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left my-0.5 ${
                  isSelected
                    ? `${cfg.bg} ${cfg.text} border ${cfg.border}`
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onSelectCustomer,
  onEditCustomer,
  onPrintCustomer,
  onToggleStatus,
  onTogglePickedUp,
  onDeleteCustomer,
}) => {
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [hasQueried, setHasQueried] = useState(false);

  const isSearchActive =
    searchName.trim() !== '' ||
    searchPhone.trim() !== '' ||
    statusFilter !== 'all' ||
    hasQueried;

  const filteredCustomers = customers.filter((customer) => {
    const matchesName =
      !searchName.trim() ||
      customer.name.toLowerCase().includes(searchName.trim().toLowerCase());
    const matchesPhone =
      !searchPhone.trim() || customer.phone.includes(searchPhone.trim());

    if (!matchesName || !matchesPhone) return false;

    if (statusFilter === 'all') return true;

    // Check if customer has any repair matching status filter
    const hasUncompleted = customer.repairs.some((r) => r.status !== 'completed');
    const hasCompleted = customer.repairs.some((r) => r.status === 'completed');

    if (statusFilter === 'pending') return hasUncompleted;
    if (statusFilter === 'completed') return !hasUncompleted && hasCompleted;

    return true;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasQueried(true);
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Search & Filter Toolbar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-slate-800/60 p-3 sm:p-4 rounded-xl border border-slate-700/60 flex flex-col xl:flex-row gap-3 sm:gap-4 items-stretch xl:items-center justify-between shadow-lg"
      >
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 flex-1">
          {/* 客戶姓名搜尋 */}
          <div className="relative flex-1">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchName}
              onChange={(e) => {
                const val = e.target.value;
                setSearchName(val);
                if (!val.trim() && !searchPhone.trim() && statusFilter === 'all') {
                  setHasQueried(false);
                }
              }}
              placeholder="搜尋客戶姓名..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-10 pr-9 py-2 sm:py-2 text-base sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
            {searchName && (
              <button
                type="button"
                onClick={() => {
                  setSearchName('');
                  if (!searchPhone.trim() && statusFilter === 'all') {
                    setHasQueried(false);
                  }
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="清除"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 聯絡電話搜尋 */}
          <div className="relative flex-1">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => {
                const val = e.target.value;
                setSearchPhone(val);
                if (!searchName.trim() && !val.trim() && statusFilter === 'all') {
                  setHasQueried(false);
                }
              }}
              placeholder="搜尋聯絡電話..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-10 pr-9 py-2 sm:py-2 text-base sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
            {searchPhone && (
              <button
                type="button"
                onClick={() => {
                  setSearchPhone('');
                  if (!searchName.trim() && statusFilter === 'all') {
                    setHasQueried(false);
                  }
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="清除"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 查詢按鈕 */}
          <button
            type="submit"
            className="px-4 py-2.5 sm:py-2 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border border-sky-500/30 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>查詢</span>
          </button>
        </div>

        {/* 狀態篩選 */}
        <div className="flex items-center gap-2 self-stretch sm:self-start xl:self-auto pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-700/50">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="grid grid-cols-3 sm:flex flex-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setHasQueried(true);
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-md font-medium text-center transition ${
                statusFilter === 'all' && isSearchActive
                  ? 'bg-sky-500/20 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              全部 ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('pending');
                setHasQueried(true);
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-md font-medium text-center transition ${
                statusFilter === 'pending'
                  ? 'bg-amber-500/20 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              待處理
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('completed');
                setHasQueried(true);
              }}
              className={`px-2 sm:px-3 py-1.5 rounded-md font-medium text-center transition ${
                statusFilter === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              已完成
            </button>
          </div>
        </div>
      </form>

      {/* Customer Cards Grid or Initial Prompt */}
      {!isSearchActive ? (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-12 text-center fade-in shadow-inner">
          <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4 text-sky-400 shadow-inner">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-slate-200 font-bold text-lg">請輸入客戶姓名或電話進行搜尋</h3>
          <p className="text-slate-400 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
            為保持畫面整潔，請在上方欄位輸入欲查詢的客戶姓名或聯絡電話，按下 Enter 鍵或點擊「查詢」即可顯示對應的維修紀錄。
          </p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-12 text-center fade-in">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <p className="text-slate-300 font-medium text-lg">查無符合條件的客戶資料</p>
          <p className="text-slate-500 text-xs mt-1">請嘗試變更搜尋關鍵字或切換狀態篩選條目</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredCustomers.map((customer) => {
            const latestRepair = customer.repairs[0];

            return (
              <div
                key={customer.id}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 rounded-xl p-3.5 sm:p-4 shadow-lg transition-all duration-200 flex flex-col justify-between group overflow-hidden"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {/* 左側：姓名 -> 顧客編號 -> 聯絡電話 */}
                    <div className="min-w-0 flex-1">
                      {/* 姓名：不換行 */}
                      <h3
                        className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition whitespace-nowrap truncate"
                        title={customer.name}
                      >
                        {customer.name}
                      </h3>

                      {/* 顧客編號：放在電話上方 */}
                      <div className="mt-1">
                        <span className="inline-block text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/50 whitespace-nowrap">
                          {customer.id}
                        </span>
                      </div>

                      {/* 聯絡電話 */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono whitespace-nowrap">
                        <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>

                    {/* 右側：已取件勾選 + 進度狀態（不換行） */}
                    <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                      {/* 只有設定成「完工待取」的時候，在右上角完工待取的左邊出現「已取件」勾選小區塊 */}
                      {latestRepair && latestRepair.status === 'completed' && (
                        <label
                          className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg border cursor-pointer select-none transition-all duration-150 shrink-0 whitespace-nowrap animate-fadeIn ${
                            latestRepair.isPickedUp
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-xs'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                          }`}
                          title="勾選表示客戶已取件完成（將連動啟動零件保固倒數）"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(latestRepair.isPickedUp)}
                            onChange={(e) =>
                              onTogglePickedUp?.(customer.id, latestRepair.id, e.target.checked)
                            }
                            className="w-3.5 h-3.5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                          />
                          <span className="whitespace-nowrap font-mono text-[11px]">
                            {latestRepair.isPickedUp ? '✓ 已取件' : '勾選已取件'}
                          </span>
                        </label>
                      )}

                      {latestRepair ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm shrink-0 whitespace-nowrap ${
                            latestRepair.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : latestRepair.status === 'repairing'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : latestRepair.status === 'diagnosing'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          }`}
                        >
                          {latestRepair.status === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                          )}
                          <span className="whitespace-nowrap">{getStatusLabel(latestRepair.status)}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0 whitespace-nowrap">
                          無工單
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Latest Repair Preview */}
                  {latestRepair && (
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/40 my-3 text-xs">
                      <div className="flex items-center justify-between text-slate-400 font-mono mb-1">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {latestRepair.date}
                        </span>
                        <span className="text-sky-400 font-semibold font-mono text-sm whitespace-nowrap">
                          NT$ {latestRepair.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-200 line-clamp-2 font-medium">
                        {latestRepair.item}
                      </p>

                      {/* Side Panel badges */}
                      {(latestRepair.hasLeftPanel || latestRepair.hasRightPanel) && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {latestRepair.hasLeftPanel && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-600 text-[10px] font-mono whitespace-nowrap">
                              ✓ 左側板
                            </span>
                          )}
                          {latestRepair.hasRightPanel && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-600 text-[10px] font-mono whitespace-nowrap">
                              ✓ 右側板
                            </span>
                          )}
                        </div>
                      )}

                      {latestRepair.note && (
                        <p className="text-slate-400 text-[11px] mt-1 italic truncate">
                          備註：{latestRepair.note}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                    <span>歷史紀錄：{customer.repairs.length} 筆維修</span>
                    <span>建立於 {customer.createdAt}</span>
                  </div>
                </div>

                {/* Bottom Actions - 同一行不換行，影印放在刪除右邊 */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-700/50 gap-1 w-full whitespace-nowrap">
                  {/* 左側：刪除 + 列印（放在刪除右邊） */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDeleteCustomer(customer.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-700/60 hover:border-rose-500/30 transition shrink-0 cursor-pointer"
                      title="刪除客戶資料"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {latestRepair && (
                      <button
                        type="button"
                        onClick={() => onPrintCustomer(customer, latestRepair)}
                        className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg border border-slate-700/60 hover:border-emerald-500/40 transition shrink-0 cursor-pointer"
                        title="列印 A4 雙聯客戶取件收據"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* 右側：編輯 + 狀態選單 + 詳情 */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditCustomer(customer)}
                      className="px-2 py-1 text-[11px] font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-0.5 transition shrink-0 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> <span>編輯</span>
                    </button>
                    {latestRepair && (
                      <StatusDropdown
                        status={latestRepair.status}
                        onSelect={(newStatus) => {
                          onToggleStatus(customer.id, latestRepair.id, newStatus);
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectCustomer(customer)}
                      className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 flex items-center gap-0.5 transition shrink-0 cursor-pointer"
                    >
                      <span>詳情</span> <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
