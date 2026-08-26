import React, { useState } from 'react';
import { Customer, RepairStatus, RepairPhoto } from '../types';
import { X, Save, User, Phone, Wrench, Calendar, DollarSign, FileText } from 'lucide-react';
import { PhotoUploader } from './common/PhotoUploader';

interface EditCustomerModalProps {
  customer: Customer;
  targetRepairId?: string;
  onClose: () => void;
  onSaveCustomer: (updatedCustomer: Customer) => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  customer,
  targetRepairId,
  onClose,
  onSaveCustomer,
}) => {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);

  // Target repair record
  const targetRepair = targetRepairId
    ? customer.repairs.find((r) => r.id === targetRepairId) || null
    : customer.repairs.length > 0
    ? customer.repairs[customer.repairs.length - 1]
    : null;

  const [repairItem, setRepairItem] = useState(targetRepair?.item || '');
  const [price, setPrice] = useState<number | ''>(targetRepair?.price ?? 0);
  const [date, setDate] = useState(targetRepair?.date || '');
  const [dueDate, setDueDate] = useState(targetRepair?.dueDate || '');
  const [status, setStatus] = useState<RepairStatus>(targetRepair?.status || 'received');
  const [isPickedUp, setIsPickedUp] = useState(Boolean(targetRepair?.isPickedUp));
  const [note, setNote] = useState(targetRepair?.note || '');
  const [hasLeftPanel, setHasLeftPanel] = useState(Boolean(targetRepair?.hasLeftPanel));
  const [hasRightPanel, setHasRightPanel] = useState(Boolean(targetRepair?.hasRightPanel));
  const [photos, setPhotos] = useState<RepairPhoto[]>(targetRepair?.photos || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      alert('請填寫客戶姓名與電話！');
      return;
    }

    let updatedRepairs = [...customer.repairs];

    if (targetRepair) {
      updatedRepairs = updatedRepairs.map((r) => {
        if (r.id === targetRepair.id) {
          return {
            ...r,
            item: repairItem.trim() ? repairItem : r.item,
            price: price === '' ? 0 : price,
            date: date || r.date,
            dueDate,
            status,
            isPickedUp: status === 'completed' ? isPickedUp : false,
            pickedUpDate: status === 'completed' && isPickedUp ? (targetRepair.pickedUpDate || new Date().toISOString().split('T')[0]) : undefined,
            note,
            hasLeftPanel,
            hasRightPanel,
            photos,
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
      <div className="modal-content max-w-2xl fade-in flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800/90">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-slate-100">
              編輯客戶與維修資料
              <span className="text-xs text-slate-400 font-mono ml-2">({customer.id})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Customer info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 客戶基本資訊
              </h3>
              {targetRepair && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-300 whitespace-nowrap">
                    當前維修狀態：
                  </label>
                  {status === 'completed' && (
                    <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all ${
                      isPickedUp 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isPickedUp}
                        onChange={(e) => setIsPickedUp(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                      />
                      <span className="font-mono text-[11px]">{isPickedUp ? '✓ 已取件' : '已取件'}</span>
                    </label>
                  )}
                  <select
                    value={status === 'pending' ? 'received' : status}
                    onChange={(e) => {
                      const newStatus = e.target.value as RepairStatus;
                      setStatus(newStatus);
                      if (newStatus !== 'completed') setIsPickedUp(false);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-semibold cursor-pointer shadow-sm"
                  >
                    <option value="received">【1. 收件建檔】</option>
                    <option value="diagnosing">【2. 故障檢測】</option>
                    <option value="repairing">【3. 維修更換】</option>
                    <option value="completed">【4. 完工待取】</option>
                  </select>
                </div>
              )}
            </div>

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
          {targetRepair && (
            <div className="space-y-4 pt-4 border-t border-slate-700/60">
              <h3 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> 維修單內容 (單號: {targetRepair.id})
              </h3>

              {/* 1. 維修項目描述 */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">維修項目描述</label>
                <textarea
                  rows={2}
                  value={repairItem}
                  onChange={(e) => setRepairItem(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* 2. 側板勾選 (左側板 / 右側板) - 位於維修項目下方 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer select-none transition ${
                  hasLeftPanel ? 'bg-slate-700/80 border-slate-500 text-slate-100' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={hasLeftPanel}
                    onChange={(e) => setHasLeftPanel(e.target.checked)}
                    className="rounded accent-slate-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between flex-1 text-xs">
                    <span className="font-semibold">左側板</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded border ${
                      hasLeftPanel ? 'bg-slate-800 text-slate-200 border-slate-600 font-bold' : 'text-slate-500 border-slate-800'
                    }`}>
                      {hasLeftPanel ? '✓ 已勾選 (有留存)' : '未勾選 (無)'}
                    </span>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer select-none transition ${
                  hasRightPanel ? 'bg-slate-700/80 border-slate-500 text-slate-100' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={hasRightPanel}
                    onChange={(e) => setHasRightPanel(e.target.checked)}
                    className="rounded accent-slate-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between flex-1 text-xs">
                    <span className="font-semibold">右側板</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded border ${
                      hasRightPanel ? 'bg-slate-800 text-slate-200 border-slate-600 font-bold' : 'text-slate-500 border-slate-800'
                    }`}>
                      {hasRightPanel ? '✓ 已勾選 (有留存)' : '未勾選 (無)'}
                    </span>
                  </div>
                </label>
              </div>

              {/* 3. 費用與日期 */}
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

              {/* 4. 備註說明 */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">備註說明</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="例如：附隨身碟、變壓器"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* 5. 照片存證管理 */}
              <div className="pt-2">
                <PhotoUploader
                  photos={photos}
                  onChange={setPhotos}
                  maxPhotos={6}
                  title="主機外觀與零件照片存證 (選填)"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 text-slate-300 hover:text-slate-100 cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-sky-500/20 hover:brightness-110 cursor-pointer"
            >
              <Save className="w-4 h-4" /> 儲存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
