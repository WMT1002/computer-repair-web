import React, { useState } from 'react';
import { Customer, RepairStatus, PriceItem } from '../types';
import { UserPlus, Save, DollarSign, Calendar, Wrench, Phone, User, FileText, Printer, ArrowLeft, Tag } from 'lucide-react';

interface AddCustomerFormProps {
  onAddCustomer: (newCustomer: Customer, shouldPrint?: boolean) => void;
  onCancel: () => void;
  priceItems?: PriceItem[];
}

export const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ onAddCustomer, onCancel, priceItems }) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [repairItem, setRepairItem] = useState('');
  const [price, setPrice] = useState<number | ''>(1000);
  const [date, setDate] = useState(getTodayStr());
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<RepairStatus>('pending');
  const [note, setNote] = useState('');
  const [hasLeftPanel, setHasLeftPanel] = useState(false);
  const [hasRightPanel, setHasRightPanel] = useState(false);

  const handleSave = (shouldPrint: boolean) => {
    if (!name.trim() || !phone.trim() || !repairItem.trim()) {
      alert('請填寫客戶姓名、電話與維修項目！');
      return;
    }

    const customerId = `CUST-${Date.now().toString().slice(-6)}`;
    const repairId = `REP-${Date.now().toString().slice(-6)}`;

    const newCustomer: Customer = {
      id: customerId,
      name: name.trim(),
      phone: phone.trim(),
      createdAt: date,
      repairs: [
        {
          id: repairId,
          date,
          item: repairItem.trim(),
          dueDate,
          price: Number(price) || 0,
          status,
          note: note.trim(),
          hasLeftPanel,
          hasRightPanel,
        },
      ],
    };

    onAddCustomer(newCustomer, shouldPrint);
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-xl max-w-3xl mx-auto fade-in">
      <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-700">
        <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">新增客戶與維修工單</h2>
          <p className="text-xs text-slate-400">填寫客戶基本資料與首筆維修服務內容</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> 客戶基本資料
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
                  placeholder="例如：王小明"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
                  placeholder="例如：0912-345-678"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Repair Information */}
        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <h3 className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" /> 維修單據詳情
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                維修項目 / 問題描述 <span className="text-rose-400">*</span>
              </label>
              {priceItems && priceItems.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <select
                    onChange={(e) => {
                      const selected = priceItems.find((p) => p.id === e.target.value);
                      if (selected) {
                        setRepairItem(selected.name);
                        setPrice(selected.price);
                      }
                    }}
                    defaultValue=""
                    className="bg-slate-900 border border-emerald-500/40 rounded px-2 py-0.5 text-xs text-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>💡 帶入常用維修價目...</option>
                    {priceItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (NT$ {item.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <textarea
              required
              rows={3}
              value={repairItem}
              onChange={(e) => setRepairItem(e.target.value)}
              placeholder="例如：ASUS 主機板檢測，無法開機且通電無反應；擬更換電源供應器 650W"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                預估費用 (NT$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                收件日期
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                預計取件日期 <span className="text-slate-400 font-normal">(選填，可留空手寫)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="可留空，或輸入例如：08/10"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                當前維修狀態
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RepairStatus)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="pending">⏳ 待取件 (進行中/測試中)</option>
                <option value="completed">✅ 已完成 (已取件修復完成)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                補充說明 / 備註
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="例如：附隨身碟、變壓器"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* 側板勾選 (左側板 / 右側板) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* 左側板 */}
            <label
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer select-none transition-all ${
                hasLeftPanel
                  ? 'bg-slate-700/90 border-slate-500 text-slate-100 shadow-sm'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={hasLeftPanel}
                onChange={(e) => setHasLeftPanel(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-slate-600 focus:ring-slate-500 focus:ring-offset-slate-900 cursor-pointer accent-slate-600"
              />
              <div className="flex items-center justify-between flex-1">
                <span className="text-sm font-semibold">左側板</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  hasLeftPanel 
                    ? 'bg-slate-800 text-slate-200 border-slate-600 font-bold' 
                    : 'bg-slate-950/40 text-slate-500 border-slate-800'
                }`}>
                  {hasLeftPanel ? '✓ 已勾選 (有)' : '未勾選 (無)'}
                </span>
              </div>
            </label>

            {/* 右側板 */}
            <label
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer select-none transition-all ${
                hasRightPanel
                  ? 'bg-slate-700/90 border-slate-500 text-slate-100 shadow-sm'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={hasRightPanel}
                onChange={(e) => setHasRightPanel(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-slate-600 focus:ring-slate-500 focus:ring-offset-slate-900 cursor-pointer accent-slate-600"
              />
              <div className="flex items-center justify-between flex-1">
                <span className="text-sm font-semibold">右側板</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  hasRightPanel 
                    ? 'bg-slate-800 text-slate-200 border-slate-600 font-bold' 
                    : 'bg-slate-950/40 text-slate-500 border-slate-800'
                }`}>
                  {hasRightPanel ? '✓ 已勾選 (有)' : '未勾選 (無)'}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> 取消返回首頁
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-sky-400" /> 單純儲存客戶
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 hover:brightness-110 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> 儲存並列印
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
