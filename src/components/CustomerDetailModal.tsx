import React, { useState } from 'react';
import { Customer, RepairRecord, RepairStatus, PriceItem } from '../types';
import { X, Plus, Printer, Trash2, Calendar, Phone, Clock, CheckCircle2, DollarSign, Tag } from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onAddRepair: (customerId: string, repair: Omit<RepairRecord, 'id'>) => void;
  onToggleStatus: (customerId: string, repairId: string) => void;
  onDeleteRepair: (customerId: string, repairId: string) => void;
  onPrintRepair: (customer: Customer, repair: RepairRecord) => void;
  priceItems?: PriceItem[];
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onAddRepair,
  onToggleStatus,
  onDeleteRepair,
  onPrintRepair,
  priceItems,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [item, setItem] = useState('');
  const [price, setPrice] = useState<number | ''>(1000);
  const [date, setDate] = useState(getTodayStr());
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<RepairStatus>('pending');
  const [note, setNote] = useState('');
  const [hasLeftPanel, setHasLeftPanel] = useState(false);
  const [hasRightPanel, setHasRightPanel] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim()) {
      alert('請填寫維修項目！');
      return;
    }

    onAddRepair(customer.id, {
      date,
      item: item.trim(),
      dueDate,
      price: Number(price) || 0,
      status,
      note: note.trim(),
      hasLeftPanel,
      hasRightPanel,
    });

    setItem('');
    setNote('');
    setHasLeftPanel(false);
    setHasRightPanel(false);
    setShowAddForm(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800/90 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold font-mono">
              {customer.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">{customer.name}</h2>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  {customer.id}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>{customer.phone}</span>
                <span className="text-slate-600">•</span>
                <span>建立於 {customer.createdAt}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold tracking-wider text-sky-400 uppercase">
              維修歷史紀錄 ({customer.repairs.length} 筆)
            </h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> 新增此客戶紀錄
              </button>
            )}
          </div>

          {/* New Repair Form inline */}
          {showAddForm && (
            <form
              onSubmit={handleAddSubmit}
              className="bg-slate-900/90 border border-sky-500/40 rounded-xl p-4 space-y-4 fade-in shadow-inner"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-sky-400 border-b border-slate-800 pb-2">
                <span>新增維修單紀錄</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">維修項目描述 *</label>
                  {priceItems && priceItems.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      <select
                        onChange={(e) => {
                          const selected = priceItems.find((p) => p.id === e.target.value);
                          if (selected) {
                            setItem(selected.name);
                            setPrice(selected.price);
                          }
                        }}
                        defaultValue=""
                        className="bg-slate-800 border border-emerald-500/40 rounded px-2 py-0.5 text-xs text-emerald-400 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>💡 帶入常用維修價目...</option>
                        {priceItems.map((pi) => (
                          <option key={pi.id} value={pi.id}>
                            {pi.name} (NT$ {pi.price.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <textarea
                  required
                  rows={2}
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="例如：替換固態硬碟 1TB 並轉移資料"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">費用 (NT$)</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">收件日期</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">預計取件 (選填)</label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="可留空手寫"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">維修狀態</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RepairStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                  >
                    <option value="pending">⏳ 待取件</option>
                    <option value="completed">✅ 已完成</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">備註說明</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="可空"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* 側板勾選 (左側板 / 右側板) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition ${
                  hasLeftPanel ? 'bg-slate-700/80 border-slate-500 text-slate-100' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={hasLeftPanel}
                    onChange={(e) => setHasLeftPanel(e.target.checked)}
                    className="rounded accent-slate-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between flex-1">
                    <span>左側板</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded border ${
                      hasLeftPanel ? 'bg-slate-800 text-slate-200 border-slate-600 font-bold' : 'text-slate-500 border-slate-800'
                    }`}>
                      {hasLeftPanel ? '✓ 有' : '無'}
                    </span>
                  </div>
                </label>

                <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition ${
                  hasRightPanel ? 'bg-slate-700/80 border-slate-500 text-slate-100' : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={hasRightPanel}
                    onChange={(e) => setHasRightPanel(e.target.checked)}
                    className="rounded accent-slate-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between flex-1">
                    <span>右側板</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded border ${
                      hasRightPanel ? 'bg-slate-800 text-slate-200 border-slate-600 font-bold' : 'text-slate-500 border-slate-800'
                    }`}>
                      {hasRightPanel ? '✓ 有' : '無'}
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-sky-500 text-slate-950 rounded-lg hover:bg-sky-400"
                >
                  確認新增紀錄
                </button>
              </div>
            </form>
          )}

          {/* Repair Records List */}
          <div className="space-y-4">
            {customer.repairs.map((repair, idx) => (
              <div
                key={repair.id}
                className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 space-y-3 relative group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 font-bold">
                      #{customer.repairs.length - idx}
                    </span>
                    <span className="text-xs font-mono text-slate-500">[{repair.id}]</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {repair.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleStatus(customer.id, repair.id)}
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 border ${
                        repair.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {repair.status === 'pending' ? (
                        <>
                          <Clock className="w-3 h-3 animate-pulse" /> 待取件
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> 已完成
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{repair.item}</h4>
                  
                  {/* Side panels badges */}
                  {(repair.hasLeftPanel || repair.hasRightPanel) && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                      {repair.hasLeftPanel && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-600 font-mono">
                          ✓ 左側板
                        </span>
                      )}
                      {repair.hasRightPanel && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-600 font-mono">
                          ✓ 右側板
                        </span>
                      )}
                    </div>
                  )}

                  {repair.note && (
                    <p className="text-xs text-slate-400 italic mt-1.5">備註：{repair.note}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-4 text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      預計取件: <span className="text-slate-200">{repair.dueDate?.trim() ? repair.dueDate : '未指定 (列印可手寫)'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-sky-400 font-bold text-sm">
                      <DollarSign className="w-4 h-4" /> NT$ {repair.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {customer.repairs.length > 1 && (
                      <button
                        onClick={() => onDeleteRepair(customer.id, repair.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                        title="刪除此筆紀錄"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onPrintRepair(customer, repair)}
                      className="px-3 py-1 text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 transition"
                    >
                      <Printer className="w-3.5 h-3.5" /> 列印此單據
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
