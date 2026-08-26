import React, { useState } from 'react';
import { Customer, RepairRecord, RepairStatus, PriceItem, RepairPhoto } from '../types';
import { X, Plus, Printer, Trash2, Calendar, Phone, DollarSign, Tag, Edit3, Camera } from 'lucide-react';
import { PhotoUploader } from './common/PhotoUploader';
import { ImageLightbox } from './common/ImageLightbox';

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onEditCustomer: (customer: Customer, repairId?: string) => void;
  onAddRepair: (customerId: string, repair: Omit<RepairRecord, 'id'>) => void;
  onToggleStatus: (customerId: string, repairId: string, newStatus?: RepairStatus) => void;
  onDeleteRepair: (customerId: string, repairId: string) => void;
  onPrintRepair: (customer: Customer, repair: RepairRecord) => void;
  priceItems?: PriceItem[];
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onEditCustomer,
  onAddRepair,
  onToggleStatus,
  onDeleteRepair,
  onPrintRepair,
  priceItems,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<RepairPhoto | null>(null);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [item, setItem] = useState('');
  const [price, setPrice] = useState<number | ''>(1000);
  const [date, setDate] = useState(getTodayStr());
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<RepairStatus>('received');
  const [note, setNote] = useState('');
  const [hasLeftPanel, setHasLeftPanel] = useState(false);
  const [hasRightPanel, setHasRightPanel] = useState(false);
  const [newPhotos, setNewPhotos] = useState<RepairPhoto[]>([]);

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
      photos: newPhotos,
    });

    setItem('');
    setNote('');
    setHasLeftPanel(false);
    setHasRightPanel(false);
    setNewPhotos([]);
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditCustomer(customer)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 flex items-center gap-1.5 transition cursor-pointer"
              title="編輯客戶姓名、電話與最新維修紀錄"
            >
              <Edit3 className="w-3.5 h-3.5" /> 編輯資料
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-300 font-normal">狀態:</span>
                    <select
                      value={status === 'pending' ? 'received' : status}
                      onChange={(e) => setStatus(e.target.value as RepairStatus)}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-100 font-medium"
                    >
                      <option value="received">【1. 收件建檔】</option>
                      <option value="diagnosing">【2. 故障檢測】</option>
                      <option value="repairing">【3. 維修更換】</option>
                      <option value="completed">【4. 完工待取】</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
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

              {/* 側板勾選 (左側板 / 右側板) - 位於維修項目描述下方 */}
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
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      hasLeftPanel ? 'bg-slate-800 text-slate-200 border-slate-600 font-bold' : 'text-slate-500 border-slate-800'
                    }`}>
                      {hasLeftPanel ? '✓ 已留存' : '無'}
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
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      hasRightPanel ? 'bg-slate-800 text-slate-200 border-slate-600 font-bold' : 'text-slate-500 border-slate-800'
                    }`}>
                      {hasRightPanel ? '✓ 已留存' : '無'}
                    </span>
                  </div>
                </label>
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

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">備註說明</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="例如：附隨身碟、變壓器"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                />
              </div>

              {/* Photo Evidence Uploader in Add Form */}
              <PhotoUploader photos={newPhotos} onChange={setNewPhotos} maxPhotos={6} />

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
                    <select
                      value={repair.status === 'pending' ? 'received' : repair.status}
                      onChange={(e) => onToggleStatus(customer.id, repair.id, e.target.value as RepairStatus)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none transition shadow-sm ${
                        repair.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : repair.status === 'repairing'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                          : repair.status === 'diagnosing'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                      }`}
                      title="點擊切換當前維修進度狀態"
                    >
                      <option value="received" className="bg-slate-900 text-slate-100">【1. 收件建檔】</option>
                      <option value="diagnosing" className="bg-slate-900 text-slate-100">【2. 故障檢測】</option>
                      <option value="repairing" className="bg-slate-900 text-slate-100">【3. 維修更換】</option>
                      <option value="completed" className="bg-slate-900 text-slate-100">【4. 完工待取】</option>
                    </select>
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

                  {/* Photo Evidence Gallery */}
                  {repair.photos && repair.photos.length > 0 && (
                    <div className="pt-2.5 mt-2.5 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-2">
                        <Camera className="w-3.5 h-3.5 text-sky-400" />
                        <span>存證照片 ({repair.photos.length} 張)：</span>
                        <span className="text-[10px] text-slate-500">(點擊放大)</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {repair.photos.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setLightboxPhoto(p)}
                            className="relative group/photo w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer hover:border-sky-500 transition shadow"
                            title={p.caption || '點擊放大'}
                          >
                            <img src={p.url} alt={p.caption || '存證照片'} className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-300" />
                            {p.caption && (
                              <div className="absolute inset-x-0 bottom-0 bg-black/85 text-[9px] text-slate-300 text-center truncate px-0.5 font-sans">
                                {p.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
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
                    <button
                      onClick={() => onEditCustomer(customer, repair.id)}
                      className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 flex items-center gap-1 transition cursor-pointer"
                      title="編輯此筆維修單項目、金額與側板設定"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> 編輯
                    </button>
                    {customer.repairs.length > 1 && (
                      <button
                        onClick={() => onDeleteRepair(customer.id, repair.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                        title="刪除此筆紀錄"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onPrintRepair(customer, repair)}
                      className="px-3 py-1 text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/30 flex items-center gap-1 transition cursor-pointer"
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

      {/* Lightbox Zoom */}
      <ImageLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  );
};
