import React, { useState } from 'react';
import { Customer, RepairRecord, RepairStatus, getStatusLabel } from '../types';
import { Search, Phone, User, Calendar, CheckCircle2, Clock, Printer, Trash2, ChevronRight, Filter, Edit3 } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onPrintCustomer: (customer: Customer, repair: RepairRecord) => void;
  onToggleStatus: (customerId: string, repairId: string, specificStatus?: RepairStatus) => void;
  onTogglePickedUp?: (customerId: string, repairId: string, isPickedUp: boolean) => void;
  onDeleteCustomer: (customerId: string) => void;
}

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

  const isSearchActive =
    searchName.trim() !== '' || searchPhone.trim() !== '' || statusFilter !== 'all';

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
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Search & Filter Toolbar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between shadow-lg"
      >
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* 客戶姓名搜尋 */}
          <div className="relative flex-1">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="搜尋客戶姓名..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          {/* 聯絡電話搜尋 */}
          <div className="relative flex-1">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="搜尋聯絡電話..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          {/* 查詢按鈕 */}
          <button
            type="submit"
            className="px-4 py-2 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border border-sky-500/30 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>查詢</span>
          </button>
        </div>

        {/* 狀態篩選 */}
        <div className="flex items-center gap-2 self-start xl:self-auto pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-700/50">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-sky-500/20 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              全部 ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                statusFilter === 'pending'
                  ? 'bg-amber-500/20 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              待處理
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
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
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-12 text-center fade-in">
          <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4 text-sky-400 shadow-inner">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-slate-200 font-bold text-lg">請輸入客戶姓名或電話進行搜尋</h3>
          <p className="text-slate-400 text-xs mt-1.5 max-w-md mx-auto">
            為保持首頁畫面整潔，請在上方欄位輸入欲查詢的客戶姓名或聯絡電話，按下 Enter 鍵或點擊「查詢」即可顯示對應的維修紀錄。
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.map((customer) => {
            const latestRepair = customer.repairs[customer.repairs.length - 1];

            return (
              <div
                key={customer.id}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 rounded-xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition">
                          {customer.name}
                        </h3>
                        <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/50">
                          {customer.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-sky-400" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 只有設定成「完工待取」的時候，在右上角完工待取的左邊出現「已取件」勾選小區塊 */}
                      {latestRepair && latestRepair.status === 'completed' && (
                        <label
                          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border cursor-pointer select-none transition-all duration-150 animate-fadeIn ${
                            latestRepair.isPickedUp
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-xs'
                              : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                          }`}
                          title="勾選表示客戶已取件完成"
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
                            {latestRepair.isPickedUp ? '✓ 已取件' : '已取件'}
                          </span>
                        </label>
                      )}

                      {latestRepair ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${
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
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                          )}
                          {getStatusLabel(latestRepair.status)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          無工單
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Latest Repair Preview */}
                  {latestRepair && (
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/40 my-3 text-xs">
                      <div className="flex items-center justify-between text-slate-400 font-mono mb-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {latestRepair.date}
                        </span>
                        <span className="text-sky-400 font-semibold font-mono text-sm">
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
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-600 text-[10px] font-mono">
                              ✓ 左側板
                            </span>
                          )}
                          {latestRepair.hasRightPanel && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-600 text-[10px] font-mono">
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

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-700/50 gap-2">
                  <button
                    onClick={() => onDeleteCustomer(customer.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="刪除客戶資料"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditCustomer(customer)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> 編輯
                    </button>
                    {latestRepair && (
                      <>
                        <select
                          value={latestRepair.status === 'pending' ? 'received' : latestRepair.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as RepairStatus;
                            onToggleStatus(customer.id, latestRepair.id, newStatus);
                            if (newStatus !== 'completed' && latestRepair.isPickedUp) {
                              onTogglePickedUp?.(customer.id, latestRepair.id, false);
                            }
                          }}
                          className={`px-2 py-1 text-xs font-semibold rounded-lg border cursor-pointer focus:outline-none transition ${
                            latestRepair.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                              : latestRepair.status === 'repairing'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25'
                              : latestRepair.status === 'diagnosing'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                              : 'bg-sky-500/15 text-sky-300 border-sky-500/40 hover:bg-sky-500/25'
                          }`}
                          title="快速切換維修進度狀態"
                        >
                          <option value="received" className="bg-slate-900 text-slate-100">【1. 收件建檔】</option>
                          <option value="diagnosing" className="bg-slate-900 text-slate-100">【2. 故障檢測】</option>
                          <option value="repairing" className="bg-slate-900 text-slate-100">【3. 維修更換】</option>
                          <option value="completed" className="bg-slate-900 text-slate-100">【4. 完工待取】</option>
                        </select>
                        <button
                          onClick={() => onPrintCustomer(customer, latestRepair)}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-700/60 text-slate-200 border border-slate-600 hover:bg-sky-500/20 hover:text-sky-400 hover:border-sky-500/30 flex items-center gap-1 transition"
                        >
                          <Printer className="w-3.5 h-3.5" /> 列印單據
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onSelectCustomer(customer)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 flex items-center gap-1 transition"
                    >
                      詳情 <ChevronRight className="w-3.5 h-3.5" />
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
