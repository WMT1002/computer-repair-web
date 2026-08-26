import React, { useState, useMemo } from 'react';
import { Customer, PartWarrantyRecord, ShopInfo } from '../../types';
import { AddWarrantyModal } from './AddWarrantyModal';
import { WarrantyPrintModal } from './WarrantyPrintModal';
import {
  ShieldCheck,
  Plus,
  Search,
  Barcode,
  User,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Printer,
  Edit3,
  Trash2,
  ExternalLink,
  Cpu,
  HardDrive,
  Zap,
  Monitor,
  Fan,
  Box,
  LayoutGrid,
  List,
  ChevronRight,
} from 'lucide-react';

interface WarrantyHistoryPanelProps {
  warranties: PartWarrantyRecord[];
  customers: Customer[];
  shopInfo: ShopInfo;
  onSaveWarranty: (record: PartWarrantyRecord) => void;
  onDeleteWarranty: (id: string) => void;
  onSelectCustomer?: (customer: Customer) => void;
  onTogglePickedUp?: (customerId: string, repairId: string, isPickedUp: boolean) => void;
}

export const WarrantyHistoryPanel: React.FC<WarrantyHistoryPanelProps> = ({
  warranties,
  customers,
  shopInfo,
  onSaveWarranty,
  onDeleteWarranty,
  onSelectCustomer,
  onTogglePickedUp,
}) => {
  const [searchName, setSearchName] = useState('');
  const [searchRepairId, setSearchRepairId] = useState('');
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending_pickup' | 'expired'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PartWarrantyRecord | null>(null);
  const [printingRecord, setPrintingRecord] = useState<PartWarrantyRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);

  // Helper to compute live status & countdown for each warranty
  const computedWarranties = useMemo(() => {
    return warranties.map((w) => {
      // Find matching customer & repair record
      const customer = customers.find(
        (c) => c.id === w.customerId || c.name === w.customerName
      );
      const repair = customer?.repairs.find((r) => r.id === w.repairId);

      // Linkage: If repair.isPickedUp is true, countdown is active!
      const isPickedUp = repair ? Boolean(repair.isPickedUp) : Boolean(w.startDate);
      const effectiveStartDate = isPickedUp
        ? repair?.pickedUpDate || w.startDate || todayStr
        : undefined;

      let daysRemaining = w.warrantyDays;
      let endDateStr = '—';
      let progressPercent = 100;
      let statusType: 'active' | 'pending_pickup' | 'expired' = 'pending_pickup';

      if (isPickedUp && effectiveStartDate) {
        const startObj = new Date(effectiveStartDate);
        const endObj = new Date(startObj);
        endObj.setDate(endObj.getDate() + w.warrantyDays);
        endDateStr = endObj.toISOString().split('T')[0];

        const diffTime = endObj.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        progressPercent = Math.max(
          0,
          Math.min(100, Math.round((daysRemaining / w.warrantyDays) * 100))
        );

        if (daysRemaining < 0) {
          statusType = 'expired';
        } else {
          statusType = 'active';
        }
      } else {
        statusType = 'pending_pickup';
        progressPercent = 100;
      }

      return {
        ...w,
        customer,
        repair,
        isPickedUp,
        effectiveStartDate,
        endDateStr,
        daysRemaining,
        progressPercent,
        statusType,
      };
    });
  }, [warranties, customers, today, todayStr]);

  // Statistics KPIs
  const stats = useMemo(() => {
    const total = computedWarranties.length;
    const active = computedWarranties.filter((w) => w.statusType === 'active').length;
    const pendingPickup = computedWarranties.filter((w) => w.statusType === 'pending_pickup').length;
    const expired = computedWarranties.filter((w) => w.statusType === 'expired').length;
    return { total, active, pendingPickup, expired };
  }, [computedWarranties]);

  // Filtered List based on Customer Name and Repair Order ID
  const filteredList = useMemo(() => {
    return computedWarranties.filter((item) => {
      // Customer Name filter
      if (searchName.trim()) {
        const nameQ = searchName.trim().toLowerCase();
        const matchesName =
          item.customerName.toLowerCase().includes(nameQ) ||
          (item.customerPhone && item.customerPhone.includes(nameQ));
        if (!matchesName) return false;
      }

      // Repair ID (單號) or S/N filter
      if (searchRepairId.trim()) {
        const idQ = searchRepairId.trim().toLowerCase();
        const matchesId =
          item.repairId.toLowerCase().includes(idQ) ||
          item.serialNumber.toLowerCase().includes(idQ) ||
          item.partName.toLowerCase().includes(idQ);
        if (!matchesId) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && item.statusType !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [computedWarranties, searchName, searchRepairId, statusFilter]);

  const hasSearchQuery = Boolean(searchName.trim() || searchRepairId.trim());
  const isSearchActive = hasSearchQuery || showAllRecords || statusFilter !== 'all';

  const handleCopySn = (sn: string, id: string) => {
    navigator.clipboard.writeText(sn);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('SSD') || cat.includes('硬碟')) return HardDrive;
    if (cat.includes('RAM') || cat.includes('記憶體')) return Zap;
    if (cat.includes('PSU') || cat.includes('電源')) return Zap;
    if (cat.includes('GPU') || cat.includes('顯卡')) return Cpu;
    if (cat.includes('MB') || cat.includes('主機板')) return Cpu;
    if (cat.includes('CPU')) return Cpu;
    if (cat.includes('螢幕')) return Monitor;
    if (cat.includes('散熱')) return Fan;
    return Box;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
              <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  零件保固履歷庫
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  即時序號履歷庫
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium leading-relaxed">
                記錄更換零件原廠序號 (S/N) 與保固天數，於客戶維修單打勾「已取件」即時啟動精確倒數
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingRecord(null);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>新增零件保固</span>
          </button>
        </div>

        {/* Top KPI Cards (4 cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div
            onClick={() => {
              setStatusFilter('all');
              setShowAllRecords(true);
            }}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'all' && showAllRecords
                ? 'bg-slate-800 border-cyan-500 ring-2 ring-cyan-500/50 shadow-md'
                : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>全部保固零件</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono mt-1">
              {stats.total}
              <span className="text-xs text-slate-400 ml-1 font-sans font-medium">件</span>
            </div>
          </div>

          <div
            onClick={() => {
              setStatusFilter('active');
              setShowAllRecords(false);
            }}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-emerald-500 font-bold">
              <span>🟢 保固中</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500 font-mono mt-1">
              {stats.active}
              <span className="text-xs text-slate-400 ml-1 font-sans font-medium">件</span>
            </div>
          </div>

          <div
            onClick={() => {
              setStatusFilter('pending_pickup');
              setShowAllRecords(false);
            }}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'pending_pickup'
                ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/50 shadow-md'
                : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-amber-500 font-bold">
              <span>⏳ 待取件起算</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500 font-mono mt-1">
              {stats.pendingPickup}
              <span className="text-xs text-slate-400 ml-1 font-sans font-medium">件</span>
            </div>
          </div>

          <div
            onClick={() => {
              setStatusFilter('expired');
              setShowAllRecords(false);
            }}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/50 shadow-md'
                : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-rose-500 font-bold">
              <span>🔴 已過保固</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-500 font-mono mt-1">
              {stats.expired}
              <span className="text-xs text-slate-400 ml-1 font-sans font-medium">件</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search by Name & Order ID, View Switcher */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowAllRecords(true);
            (document.activeElement as HTMLElement)?.blur();
          }}
          className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
        >
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* 客戶姓名搜尋 */}
            <div className="relative flex-1">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋客戶姓名..."
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  if (e.target.value.trim()) setShowAllRecords(false);
                }}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>

            {/* 維修單號搜尋 */}
            <div className="relative flex-1">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋維修單號 (如 REP-2026-001)..."
                value={searchRepairId}
                onChange={(e) => {
                  setSearchRepairId(e.target.value);
                  if (e.target.value.trim()) setShowAllRecords(false);
                }}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
              />
            </div>

            {/* 查詢按鈕 */}
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>查詢</span>
            </button>

            {isSearchActive && (
              <button
                type="button"
                onClick={() => {
                  setSearchName('');
                  setSearchRepairId('');
                  setShowAllRecords(false);
                  setStatusFilter('all');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition shrink-0 cursor-pointer"
              >
                重置
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="卡片檢視"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">卡片</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="表格檢視"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">表格</span>
            </button>
          </div>
        </form>
      </div>

      {/* 1. Initial State (尚未進行搜尋時，下方不先顯示資料) */}
      {!isSearchActive && (
        <div className="bg-slate-850/60 border border-slate-700/80 border-dashed rounded-2xl p-10 sm:p-14 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30 shadow-inner">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-100">請輸入客戶姓名或維修單號以查詢保固履歷</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
              在上方搜尋欄輸入客戶姓名（如：張家豪）或維修單號（如：REP-2026-003）後點擊「查詢」，即可顯示對應的零件保固資料。
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowAllRecords(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-cyan-300 bg-slate-900 border border-slate-600 hover:border-cyan-500/50 transition cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>瀏覽全部保固紀錄 ({computedWarranties.length} 筆)</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Empty State (已搜尋但查無符合紀錄) */}
      {isSearchActive && filteredList.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto border border-slate-700">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">查無符合的零件保固紀錄</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              請確認輸入的客戶姓名或維修單號是否正確，或點擊下方重置按鈕重新查詢。
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchName('');
              setSearchRepairId('');
              setShowAllRecords(false);
              setStatusFilter('all');
            }}
            className="px-4 py-1.5 text-xs rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition cursor-pointer"
          >
            重置搜尋條件
          </button>
        </div>
      )}

      {/* 3. View 1: Card Grid */}
      {isSearchActive && viewMode === 'cards' && filteredList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => {
            const Icon = getCategoryIcon(item.partCategory);

            // Badge styling
            const badgeConfig =
              item.statusType === 'active'
                ? {
                    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
                    text: `🟢 保固中 (剩餘 ${item.daysRemaining} 天)`,
                    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
                  }
                : item.statusType === 'expired'
                ? {
                    bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                    text: `🔴 已過保 (已逾期 ${Math.abs(item.daysRemaining)} 天)`,
                    bar: 'bg-rose-500/50',
                  }
                : {
                    bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
                    text: `⏳ 待取件起算 (共 ${item.warrantyDays} 天)`,
                    bar: 'bg-amber-500/40',
                  };

            return (
              <div
                key={item.id}
                className="bg-slate-850/95 border border-slate-700/80 rounded-xl p-4 shadow-lg hover:border-cyan-500/50 transition-all flex flex-col justify-between group"
              >
                {/* Top Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded-full border shadow-xs ${badgeConfig.bg}`}
                    >
                      {badgeConfig.text}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {item.partCategory}
                    </span>
                  </div>

                  {/* Part Name */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition line-clamp-2">
                        {item.partName}
                      </h3>
                      {item.supplier && (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          通路：{item.supplier}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* S/N Highlight Box with 1-click Copy */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700 my-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Barcode className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider truncate">
                        {item.serialNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopySn(item.serialNumber, item.id)}
                      className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition cursor-pointer shrink-0"
                      title="複製序號"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Countdown Progress Bar (if active) */}
                  {item.isPickedUp && item.statusType !== 'expired' && (
                    <div className="mb-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-medium">
                        <span>保固進度 ({item.progressPercent}%)</span>
                        <span>起: {item.effectiveStartDate} ➔ 訖: {item.endDateStr}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${badgeConfig.bar}`}
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* If not picked up */}
                  {!item.isPickedUp && (
                    <div className="mb-3 p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-center justify-between font-mono font-medium">
                      <span>⏳ 顧客尚未取件</span>
                      {item.repair && onTogglePickedUp && (
                        <button
                          onClick={() => onTogglePickedUp(item.customerId, item.repairId, true)}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-[10px] font-bold transition cursor-pointer"
                        >
                          立即打勾已取件
                        </button>
                      )}
                    </div>
                  )}

                  {/* Customer & Ticket Info */}
                  <div className="space-y-1 text-xs text-slate-300 font-mono pt-2 border-t border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-100 font-bold">{item.customerName}</strong>
                      </span>
                      <span className="text-slate-300 font-semibold">{item.customerPhone}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">工單單號：</span>
                      {item.customer && onSelectCustomer ? (
                        <button
                          onClick={() => onSelectCustomer(item.customer!)}
                          className="text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                        >
                          {item.repairId} <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <span className="text-cyan-400 font-bold">{item.repairId}</span>
                      )}
                    </div>

                    {item.note && (
                      <p className="text-[11px] text-slate-400 italic truncate pt-0.5">
                        備註：{item.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-700/60 gap-2">
                  <button
                    onClick={() => setPrintingRecord(item)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-700 text-slate-100 hover:bg-cyan-600 hover:text-white border border-slate-600 flex items-center gap-1 transition cursor-pointer shadow-xs"
                    title="列印零件保固卡憑證"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>列印保固卡</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingRecord(item);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                      title="編輯"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`確定要刪除「${item.partName}」保固資料？`)) {
                          onDeleteWarranty(item.id);
                        }
                      }}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                      title="刪除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Compact Table View */}
      {isSearchActive && viewMode === 'table' && filteredList.length > 0 && (
        <div className="bg-slate-850/95 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 border-b border-slate-700 text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">狀態 / 倒數</th>
                  <th className="py-3 px-4">零件名稱與規格</th>
                  <th className="py-3 px-4">原廠序號 (S/N)</th>
                  <th className="py-3 px-4">客戶 / 電話</th>
                  <th className="py-3 px-4">維修單號</th>
                  <th className="py-3 px-4">保固期限</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/60 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.statusType === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> 剩餘 {item.daysRemaining} 天
                        </span>
                      ) : item.statusType === 'expired' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-bold">
                          <XCircle className="w-3 h-3" /> 已過保
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-bold">
                          <Clock className="w-3 h-3" /> 待取件起算
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-sans font-bold text-slate-100">
                      <div>{item.partName}</div>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        [{item.partCategory}] {item.supplier ? `· ${item.supplier}` : ''}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-cyan-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{item.serialNumber}</span>
                        <button
                          onClick={() => handleCopySn(item.serialNumber, item.id)}
                          className="text-slate-400 hover:text-cyan-400 transition"
                          title="複製序號"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-100 whitespace-nowrap">
                      <div className="font-bold text-slate-100">{item.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono font-semibold">{item.customerPhone}</div>
                    </td>

                    <td className="py-3 px-4 text-cyan-400 font-bold whitespace-nowrap">
                      {item.customer && onSelectCustomer ? (
                        <button
                          onClick={() => onSelectCustomer(item.customer!)}
                          className="hover:underline flex items-center gap-0.5 text-cyan-400 font-bold"
                        >
                          {item.repairId} <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        item.repairId
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap text-[11px]">
                      <div className="font-bold text-slate-100">{item.warrantyDays} 天</div>
                      <div className="text-slate-400">訖: {item.endDateStr}</div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPrintingRecord(item)}
                          className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition cursor-pointer"
                          title="列印保固證明"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRecord(item);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                          title="編輯"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`確定要刪除「${item.partName}」保固資料？`)) {
                              onDeleteWarranty(item.id);
                            }
                          }}
                          className="p-1.5 rounded text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition cursor-pointer"
                          title="刪除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <AddWarrantyModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingRecord(null);
          }}
          onSave={onSaveWarranty}
          customers={customers}
          editRecord={editingRecord}
        />
      )}

      {/* Print Certificate Modal */}
      {printingRecord && (
        <WarrantyPrintModal
          warranty={printingRecord}
          shopInfo={shopInfo}
          onClose={() => setPrintingRecord(null)}
        />
      )}
    </div>
  );
};
