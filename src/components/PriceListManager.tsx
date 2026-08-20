import React, { useState } from 'react';
import { PriceItem } from '../types';
import { Tag, Plus, Search, Edit3, Trash2, Copy, Check, DollarSign, FileText, X } from 'lucide-react';

interface PriceListManagerProps {
  priceItems: PriceItem[];
  onAddPriceItem: (newItem: PriceItem) => void;
  onUpdatePriceItem: (updatedItem: PriceItem) => void;
  onDeletePriceItem: (id: string) => void;
}

export const PriceListManager: React.FC<PriceListManagerProps> = ({
  priceItems,
  onAddPriceItem,
  onUpdatePriceItem,
  onDeletePriceItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('系統軟體');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState<number | ''>(1000);
  const [note, setNote] = useState('');

  // Extract unique categories
  const categories = Array.from(new Set(priceItems.map((item) => item.category))).filter(Boolean);

  const filteredItems = priceItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory(categories[0] || '系統軟體');
    setCustomCategory('');
    setPrice(1000);
    setNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PriceItem) => {
    setEditingItem(item);
    setName(item.name);
    if (categories.includes(item.category)) {
      setCategory(item.category);
      setCustomCategory('');
    } else {
      setCategory('自訂');
      setCustomCategory(item.category);
    }
    setPrice(item.price);
    setNote(item.note || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('請填寫維修項目名稱！');
      return;
    }

    const finalCategory = category === '自訂' ? customCategory.trim() || '其他' : category;

    if (editingItem) {
      onUpdatePriceItem({
        ...editingItem,
        name: name.trim(),
        category: finalCategory,
        price: Number(price) || 0,
        note: note.trim(),
      });
    } else {
      const newItem: PriceItem = {
        id: `PRICE-${Date.now().toString().slice(-5)}`,
        name: name.trim(),
        category: finalCategory,
        price: Number(price) || 0,
        note: note.trim(),
      };
      onAddPriceItem(newItem);
    }

    setIsModalOpen(false);
  };

  const handleCopyQuote = (item: PriceItem) => {
    const quoteText = `【${item.name}】 參考報價：NT$ ${item.price.toLocaleString()}${
      item.note ? ` (${item.note})` : ''
    }`;

    navigator.clipboard.writeText(quoteText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Top Header & Search Toolbar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">維修項目參考價目表</h2>
            <p className="text-xs text-slate-400">方便隨時查閱常用維修項目參考報價，給客戶準確報價</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 font-semibold text-sm rounded-lg hover:brightness-110 flex items-center justify-center gap-2 shadow-lg transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> 新增價目項目
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋價目名稱、分類或備註說明..."
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
          >
            全部 ({priceItems.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Catalog Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-12 text-center fade-in">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Tag className="w-8 h-8" />
          </div>
          <p className="text-slate-300 font-medium text-lg">查無符合條件的維修價目</p>
          <p className="text-slate-500 text-xs mt-1">請嘗試輸入不同關鍵字，或點擊右上角「新增價目項目」</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Category & Actions Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded transition"
                      title="編輯此項報價"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePriceItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      title="刪除此項報價"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Item Title */}
                <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition mb-3 line-clamp-2">
                  {item.name}
                </h3>

                {/* Price Display */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60 mb-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">參考報價</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    NT$ {item.price.toLocaleString()}
                  </span>
                </div>

                {/* Note */}
                {item.note && (
                  <p className="text-xs text-slate-400 bg-slate-900/40 p-2 rounded border border-slate-800 italic">
                    備註：{item.note}
                  </p>
                )}
              </div>

              {/* Bottom Quick Copy Button */}
              <div className="pt-3 mt-3 border-t border-slate-700/50 flex justify-end">
                <button
                  onClick={() => handleCopyQuote(item)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
                    copiedId === item.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'
                  }`}
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> 已複製報價文字
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> 複製報價文字
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in max-w-lg">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-700 flex items-center justify-between bg-slate-800/90">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-slate-100">
                  {editingItem ? '編輯維修價目項目' : '新增維修價目項目'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  維修項目名稱 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：重裝 Windows 11 系統 + 資料轉移"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">項目類別</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="系統軟體">系統軟體</option>
                    <option value="硬體維修">硬體維修</option>
                    <option value="硬體升級">硬體升級</option>
                    <option value="清潔保養">清潔保養</option>
                    <option value="檢測診斷">檢測診斷</option>
                    <option value="筆電維修">筆電維修</option>
                    <option value="自訂">+ 新增自訂類別</option>
                  </select>
                </div>

                {category === '自訂' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      自訂類別名稱 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="例如：網路周邊"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    參考價格 (NT$) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">備註說明 (選填)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="例如：含零件保固三年、工資可拆算"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md transition"
                >
                  {editingItem ? '儲存變更' : '確認新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
