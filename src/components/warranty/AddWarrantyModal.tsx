import React, { useState, useEffect } from 'react';
import { Customer, PartWarrantyRecord } from '../../types';
import {
  X,
  ShieldCheck,
  Cpu,
  HardDrive,
  Zap,
  Monitor,
  Fan,
  Box,
  Save,
  Barcode,
  CheckCircle2,
  User,
  FileText,
  Building2,
  Link2,
  Phone,
} from 'lucide-react';

interface AddWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: PartWarrantyRecord) => void;
  customers: Customer[];
  initialCustomerId?: string;
  initialRepairId?: string;
  editRecord?: PartWarrantyRecord | null;
}

const CATEGORY_OPTIONS = [
  { label: '固態硬碟 (SSD)', icon: HardDrive, color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
  { label: '記憶體 (RAM)', icon: Zap, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { label: '電源供應器 (PSU)', icon: Zap, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { label: '顯示卡 (GPU)', icon: Cpu, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
  { label: '主機板 (MB)', icon: Cpu, color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
  { label: '處理器 (CPU)', icon: Cpu, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  { label: '螢幕面板', icon: Monitor, color: 'text-teal-400 border-teal-500/40 bg-teal-500/10' },
  { label: '散熱清潔', icon: Fan, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
  { label: '其他配件', icon: Box, color: 'text-slate-400 border-slate-500/40 bg-slate-500/10' },
];

const PRESET_DAYS = [
  { label: '30 天 (1個月)', days: 30 },
  { label: '90 天 (3個月)', days: 90 },
  { label: '180 天 (半年)', days: 180 },
  { label: '1 年 (365天)', days: 365 },
  { label: '2 年 (730天)', days: 730 },
  { label: '3 年 (1095天)', days: 1095 },
  { label: '5 年 (1825天)', days: 1825 },
  { label: '10 年 (3650天)', days: 3650 },
];

const SUPPLIER_PRESETS = [
  '捷元代理公司貨',
  '聯強國際代理',
  '威健實業代理',
  '展碁國際代理',
  '原廠正品/原裝備品',
  '原價屋/欣亞購買',
];

export const AddWarrantyModal: React.FC<AddWarrantyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  initialCustomerId,
  initialRepairId,
  editRecord,
}) => {
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');
  const [customRepairId, setCustomRepairId] = useState('');

  const [partCategory, setPartCategory] = useState('固態硬碟 (SSD)');
  const [partName, setPartName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [warrantyDays, setWarrantyDays] = useState<number | ''>(365);
  const [supplier, setSupplier] = useState('捷元代理公司貨');
  const [note, setNote] = useState('');

  // Matched repair ticket info for real-time live link feedback
  const [matchedRepair, setMatchedRepair] = useState<{
    customerId: string;
    customerName: string;
    customerPhone: string;
    repairId: string;
    isPickedUp: boolean;
    repairItem?: string;
  } | null>(null);

  // Automatic match function while typing
  const handleAutoMatch = (name: string, rId: string) => {
    const trimmedName = name.trim().toLowerCase();
    const trimmedId = rId.trim().toUpperCase();

    // 1. Try match by Repair ID first
    if (trimmedId) {
      for (const c of customers) {
        const found = c.repairs.find(
          (r) => r.id.toUpperCase() === trimmedId || r.id.toUpperCase().includes(trimmedId)
        );
        if (found) {
          if (!name.trim()) setCustomCustomerName(c.name);
          if (!customCustomerPhone) setCustomCustomerPhone(c.phone);
          setMatchedRepair({
            customerId: c.id,
            customerName: c.name,
            customerPhone: c.phone,
            repairId: found.id,
            isPickedUp: Boolean(found.isPickedUp),
            repairItem: found.item,
          });
          return;
        }
      }
    }

    // 2. Try match by Customer Name
    if (trimmedName) {
      const foundCust = customers.find(
        (c) => c.name.toLowerCase() === trimmedName || c.name.toLowerCase().includes(trimmedName)
      );
      if (foundCust && foundCust.repairs.length > 0) {
        const latest = foundCust.repairs[foundCust.repairs.length - 1];
        if (!rId.trim()) setCustomRepairId(latest.id);
        if (!customCustomerPhone) setCustomCustomerPhone(foundCust.phone);
        setMatchedRepair({
          customerId: foundCust.id,
          customerName: foundCust.name,
          customerPhone: foundCust.phone,
          repairId: latest.id,
          isPickedUp: Boolean(latest.isPickedUp),
          repairItem: latest.item,
        });
        return;
      }
    }

    setMatchedRepair(null);
  };

  // Explicit bind button click handler
  const handleTriggerBind = () => {
    if (!customCustomerName.trim() && !customRepairId.trim()) {
      alert('請先輸入客戶姓名或維修單號！');
      return;
    }

    const trimmedName = customCustomerName.trim().toLowerCase();
    const trimmedId = customRepairId.trim().toUpperCase();

    let found = false;
    for (const c of customers) {
      const repairMatch = c.repairs.find(
        (r) =>
          (trimmedId && r.id.toUpperCase() === trimmedId) ||
          (trimmedId && r.id.toUpperCase().includes(trimmedId)) ||
          (trimmedName && c.name.toLowerCase() === trimmedName)
      );

      if (repairMatch) {
        setCustomCustomerName(c.name);
        setCustomCustomerPhone(c.phone);
        setCustomRepairId(repairMatch.id);
        setMatchedRepair({
          customerId: c.id,
          customerName: c.name,
          customerPhone: c.phone,
          repairId: repairMatch.id,
          isPickedUp: Boolean(repairMatch.isPickedUp),
          repairItem: repairMatch.item,
        });
        found = true;
        break;
      }
    }

    if (!found) {
      if (!customRepairId.trim()) {
        const genId = `REP-${Date.now().toString().slice(-6)}`;
        setCustomRepairId(genId);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editRecord) {
      setCustomCustomerName(editRecord.customerName);
      setCustomCustomerPhone(editRecord.customerPhone || '');
      setCustomRepairId(editRecord.repairId);
      setPartCategory(editRecord.partCategory || '固態硬碟 (SSD)');
      setPartName(editRecord.partName || '');
      setSerialNumber(editRecord.serialNumber || '');
      setWarrantyDays(editRecord.warrantyDays || 365);
      setSupplier(editRecord.supplier || '');
      setNote(editRecord.note || '');

      // Check matching repair for picked up status
      const cust = customers.find(
        (c) => c.id === editRecord.customerId || c.name === editRecord.customerName
      );
      const rep = cust?.repairs.find((r) => r.id === editRecord.repairId);
      if (rep) {
        setMatchedRepair({
          customerId: cust?.id || editRecord.customerId,
          customerName: editRecord.customerName,
          customerPhone: editRecord.customerPhone || cust?.phone || '',
          repairId: editRecord.repairId,
          isPickedUp: Boolean(rep.isPickedUp),
          repairItem: rep.item,
        });
      }
    } else {
      // New record initialization
      if (initialCustomerId && initialRepairId) {
        const cust = customers.find((c) => c.id === initialCustomerId);
        const rep = cust?.repairs.find((r) => r.id === initialRepairId);
        if (cust && rep) {
          setCustomCustomerName(cust.name);
          setCustomCustomerPhone(cust.phone);
          setCustomRepairId(rep.id);
          setMatchedRepair({
            customerId: cust.id,
            customerName: cust.name,
            customerPhone: cust.phone,
            repairId: rep.id,
            isPickedUp: Boolean(rep.isPickedUp),
            repairItem: rep.item,
          });
        }
      } else {
        setCustomCustomerName('');
        setCustomCustomerPhone('');
        setCustomRepairId('');
        setMatchedRepair(null);
      }
      setPartCategory('固態硬碟 (SSD)');
      setPartName('');
      setSerialNumber('');
      setWarrantyDays(365);
      setSupplier('捷元代理公司貨');
      setNote('');
    }
  }, [isOpen, editRecord, initialCustomerId, initialRepairId, customers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCustName = customCustomerName.trim();
    const finalRepairId = customRepairId.trim().toUpperCase();
    const finalCustPhone = customCustomerPhone.trim();

    if (!finalCustName || !finalRepairId) {
      alert('請填寫客戶姓名與維修單號！');
      return;
    }

    if (!partName.trim() || !serialNumber.trim()) {
      alert('請填寫更換零件名稱與原廠零件序號 (S/N)！');
      return;
    }

    // Match or create customer ID
    const matchCust = customers.find(
      (c) => c.name === finalCustName || (finalCustPhone && c.phone === finalCustPhone)
    );
    const finalCustId = matchedRepair?.customerId || matchCust?.id || `CUST-${Date.now().toString().slice(-4)}`;

    const targetRepair = matchCust?.repairs.find((r) => r.id === finalRepairId);
    const isPickedUp = targetRepair ? Boolean(targetRepair.isPickedUp) : Boolean(matchedRepair?.isPickedUp);
    const startDate = isPickedUp
      ? targetRepair?.pickedUpDate || new Date().toISOString().split('T')[0]
      : editRecord?.startDate;

    const numDays = Number(warrantyDays) > 0 ? Number(warrantyDays) : 365;

    const record: PartWarrantyRecord = {
      id: editRecord ? editRecord.id : `WAR-${Date.now().toString().slice(-6)}`,
      customerId: finalCustId,
      customerName: finalCustName,
      customerPhone: finalCustPhone,
      repairId: finalRepairId,
      partName: partName.trim(),
      partCategory,
      serialNumber: serialNumber.trim().toUpperCase(),
      warrantyDays: numDays,
      startDate,
      supplier: supplier.trim(),
      note: note.trim(),
      createdAt: editRecord?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {editRecord ? '編輯零件保固' : '新增零件保固'}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                  同單號取件連動
                </span>
              </h2>
              <p className="text-xs text-slate-400">記錄更換零件之原廠序號與保固天數，取件後自動開始倒數</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="warranty-form"
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain"
        >
          {/* Section 1: Customer & Ticket Binding (Direct Input + Bind Button) */}
          <div className="bg-slate-850/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 綁定客戶與維修單號 *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              {/* 客戶姓名 */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                  客戶姓名 <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customCustomerName}
                    onChange={(e) => {
                      setCustomCustomerName(e.target.value);
                      handleAutoMatch(e.target.value, customRepairId);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* 維修單號 */}
              <div className="sm:col-span-5">
                <label className="block text-[11px] text-slate-300 mb-1 font-medium">
                  維修單號 <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customRepairId}
                    onChange={(e) => {
                      setCustomRepairId(e.target.value);
                      handleAutoMatch(customCustomerName, e.target.value);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* 綁定連動按鈕 */}
              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={handleTriggerBind}
                  className="w-full py-2 px-3 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>綁定連動</span>
                </button>
              </div>
            </div>

            {/* 聯絡電話與連動狀態 */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-center">
              <div className={matchedRepair ? "sm:col-span-5" : "sm:col-span-12"}>
                <label className="block text-[11px] text-slate-400 mb-1">
                  聯絡電話 (可自動帶出或填寫)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={customCustomerPhone}
                    onChange={(e) => setCustomCustomerPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {matchedRepair && (
                <div className="sm:col-span-7 mt-2 sm:mt-0">
                  <div className="w-full p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-emerald-300 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold truncate">已連動 [{matchedRepair.repairId}] {matchedRepair.customerName}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] shrink-0 font-bold ${
                        matchedRepair.isPickedUp
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {matchedRepair.isPickedUp ? '✓ 已取件 (保固生效中)' : '⏳ 待取件 (取件後自動起算)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Part Category Pills */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">零件分類標籤</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = partCategory === cat.label;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setPartCategory(cat.label)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer select-none ${
                      isSelected
                        ? cat.color + ' ring-1 ring-cyan-400 font-bold shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Part Name & Serial Number (S/N) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                更換零件名稱與型號規格 <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="例: Micron Crucial T500 1TB NVMe M.2 SSD"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>原廠零件序號 (S/N) <span className="text-rose-400">*</span></span>
                <span className="text-[10px] text-cyan-400 font-mono">支援掃描槍或貼上</span>
              </label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  required
                  placeholder="例: SN24080911893X"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Warranty Days & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                保固天數 (起算後倒數) <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                目前設定：<strong className="text-cyan-400">{warrantyDays || 0}</strong> 天
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_DAYS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setWarrantyDays(p.days)}
                  className={`px-2 py-1 text-[11px] font-mono rounded-md border transition cursor-pointer ${
                    warrantyDays === p.days
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-xs'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="自訂天數 (如: 365)"
              />
            </div>
          </div>

          {/* Section 5: Supplier & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                代理商 / 原廠通路
              </label>
              <div className="relative mb-1.5">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="例: 捷元代理公司貨"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {SUPPLIER_PRESETS.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSupplier(s)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">備註說明 (選填)</label>
              <textarea
                rows={2}
                placeholder="例: 附原廠外盒與購買發票影本，提供原廠 3 年免費保固..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>保固將於維修單勾選「已取件」日起算倒數</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              form="warranty-form"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editRecord ? '儲存變更' : '新增零件保固'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
