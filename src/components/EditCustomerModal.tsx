import React, { useState } from 'react';
import { Customer, RepairStatus } from '../types';
import { X, Save, User, Phone, Wrench, DollarSign, Calendar, FileText, Edit3 } from 'lucide-react';

interface EditCustomerModalProps {
  customer: Customer;
  onClose: () => void;
  onSaveCustomer: (updatedCustomer: Customer) => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  customer,
  onClose,
  onSaveCustomer,
}) => {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);

  // Latest repair editing state
  const latestRepair = customer.repairs.length > 0 ? customer.repairs[customer.repairs.length - 1] : null;

  const [repairItem, setRepairItem] = useState(latestRepair?.item || '');
  const [price, setPrice] = useState<number | ''>(latestRepair?.price ?? 0);
  const [date, setDate] = useState(latestRepair?.date || '');
  const [dueDate, setDueDate] = useState(latestRepair?.dueDate || '');
  const [status, setStatus] = useState<RepairStatus>(latestRepair?.status || 'pending');
  const [note, setNote] = useState(latestRepair?.note || '');
  const [hasLeftPanel, setHasLeftPanel] = useState(Boolean(latestRepair?.hasLeftPanel));
  const [hasRightPanel, setHasRightPanel] = useState(Boolean(latestRepair?.hasRightPanel));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      alert('請填寫客戶姓名與電話！');
      return;
    }

    let updatedRepairs = [...customer.repairs];
    if (latestRepair) {
      updatedRepairs = updatedRepairs.map((r) => {
        if (r.id === latestRepair.id) {
          return {
            ...r,
            item: repairItem.trim(),
            price: Number(price) || 0,
            date,
            dueDate,
            status,
            note: note.trim(),
            hasLeftPanel,
            hasRightPanel,
          };
        }
        return r;
      });
    }

    const updatedCustomer: Customer = {
      ...customer,
      name: name.trim(),
      phone: phone.trim(),
      repairs: updatedRepairs,
    };

    onSaveCustomer(updatedCustomer);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in max-w-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex items-center justify-between bg-slate-800/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">編輯客戶與維修資料</h2>
              <p className="text-xs text-slate-400 font-mono">編號：{customer.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Customer info */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 客戶基本資訊
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  客戶姓名 <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  聯絡電話 <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Repair info */}
          {latestRepair && (
            <div className="space-y-4 pt-4 border-t border-slate-700/60">
              <h3 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> 最新維修單內容 (單號: {latestRepair.id})
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">維修項目描述</label>
                <textarea
                  rows={2}
                  value={repairItem}
                  onChange={(e) => setRepairItem(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">費用 (NT$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">收件日期</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">預計取件 (選填)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      placeholder="可留空，印出後手寫"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">當前維修狀態</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RepairStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="pending">⏳ 待取件 (進行中)</option>
                    <option value="completed">✅ 已完成</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">備註說明</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* 機殼側板勾選 (左側板 / 右側板) */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>機殼側板狀態（隨機附帶配件）：</span>
                  <span className="text-[11px] text-slate-400 font-normal">可勾選/可不勾選</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                    hasLeftPanel ? 'bg-sky-500/20 border-sky-500/50 text-sky-200' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={hasLeftPanel}
                      onChange={(e) => setHasLeftPanel(e.target.checked)}
                      className="rounded accent-sky-500 cursor-pointer"
                    />
                    <span className="font-semibold">左側板 {hasLeftPanel ? '(✓已附帶)' : '(無)'}</span>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                    hasRightPanel ? 'bg-teal-500/20 border-teal-500/50 text-teal-200' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={hasRightPanel}
                      onChange={(e) => setHasRightPanel(e.target.checked)}
                      className="rounded accent-teal-500 cursor-pointer"
                    />
                    <span className="font-semibold">右側板 {hasRightPanel ? '(✓已附帶)' : '(無)'}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-sky-500 text-slate-950 hover:bg-sky-400 flex items-center gap-2 shadow-lg transition"
            >
              <Save className="w-4 h-4" /> 儲存變更
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
