import React, { useState, useEffect } from 'react';
import {
  Search,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Camera,
  Share2,
  RefreshCcw,
  Sparkles,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { RepairPhoto } from '../types';
import { fetchPublicTrackingData, PublicTrackingResult } from '../utils/storage';
import { FixFlowLogo } from './common/FixFlowLogo';
import { ImageLightbox } from './common/ImageLightbox';

interface CustomerTrackingPageProps {
  initialOrderId?: string;
  onBackToLogin?: () => void;
}

export const CustomerTrackingPage: React.FC<CustomerTrackingPageProps> = ({
  initialOrderId = '',
  onBackToLogin,
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderId);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResults, setTrackingResults] = useState<PublicTrackingResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<RepairPhoto | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const executeSearch = async (queryStr: string) => {
    if (!queryStr.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    const results = await fetchPublicTrackingData(queryStr);
    setTrackingResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    if (initialOrderId) {
      executeSearch(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchInput);
  };

  const handleCopyShareLink = (orderId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?track=${orderId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const maskName = (name: string) => {
    if (name.length <= 1) return name;
    if (name.length === 2) return `${name[0]}*`;
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col selection:bg-sky-500/30">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FixFlowLogo size={36} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  FixFlow
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  顧客進度卡
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">智慧電腦維修即時追蹤</p>
            </div>
          </div>

          {onBackToLogin && (
            <button
              onClick={onBackToLogin}
              className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-sky-500/40 bg-slate-800/60 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 系統登入
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Search Header Banner */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-2xl p-6 border border-slate-700/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" /> 隨時掌握您的電腦維修現況與存證照片
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              維修工單進度即時查詢
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              請輸入您的 <span className="text-sky-300 font-semibold font-mono">維修單號 (如 REP-744757)</span> 或 <span className="text-sky-300 font-semibold font-mono">送修聯絡電話</span> 進行查詢。
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="輸入維修單號或電話號碼 (例如 0987...)"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 font-bold text-sm hover:from-sky-400 hover:to-emerald-400 transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    <span>查詢中…</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>立即查詢</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Search Results Display */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 animate-pulse">
              <RefreshCcw className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-sm text-slate-400 font-mono">正在調閱雲端維修資料庫…</p>
          </div>
        )}

        {!isLoading && hasSearched && (!trackingResults || trackingResults.length === 0) && (
          <div className="bg-slate-900/60 border border-rose-500/30 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">查無相關維修紀錄</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              找不到與「<span className="text-rose-400 font-mono">{searchInput}</span>」相符的工單。請確認單號格式或電話號碼是否正確，或直接撥打門市電話洽詢。
            </p>
          </div>
        )}

        {!isLoading && trackingResults && trackingResults.length > 0 && (
          <div className="space-y-6">
            {trackingResults.map((res, index) => {
              const isCompleted = res.repair.status === 'completed';

              return (
                <div
                  key={res.repair.id || index}
                  className="bg-slate-900/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl transition-all"
                >
                  {/* Status Banner */}
                  <div
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b ${
                      isCompleted
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-sky-950/40 border-sky-500/30 text-sky-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30 animate-pulse'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">工單編號</span>
                          <span className="text-sm font-bold font-mono text-slate-100">
                            {res.repair.id}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                          {isCompleted ? '🎉 您的電腦已完成維修，歡迎取件！' : '🔧 工程師正為您的電腦進行維修檢測'}
                        </h2>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyShareLink(res.repair.id)}
                      className="text-xs font-mono flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition cursor-pointer"
                      title="複製此工單查詢連結"
                    >
                      <Share2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{copiedLink ? '已複製連結！' : '分享此進度'}</span>
                    </button>
                  </div>

                  {/* 4-Stage Progress Stepper */}
                  <div className="p-6 bg-slate-950/50 border-b border-slate-800">
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-400" /> 維修處理進度條
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Step 1 */}
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-500/40 relative">
                        <div className="flex items-center gap-2 text-emerald-400 mb-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-bold font-mono">1. 收件建檔</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-mono">{res.repair.date}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">門市確認收件</p>
                      </div>

                      {/* Step 2 */}
                      <div
                        className={`p-3 rounded-xl border relative transition ${
                          isCompleted
                            ? 'bg-slate-900/80 border-emerald-500/40 text-emerald-400'
                            : 'bg-sky-950/40 border-sky-500/50 text-sky-300 ring-1 ring-sky-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-sky-400 animate-spin" />
                          )}
                          <span className="text-xs font-bold font-mono">2. 故障檢測</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-mono">硬體/軟體排查</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isCompleted ? '檢測完成' : '進行中'}
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div
                        className={`p-3 rounded-xl border relative transition ${
                          isCompleted
                            ? 'bg-slate-900/80 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Wrench className="w-4 h-4 text-slate-500" />
                          )}
                          <span className="text-xs font-bold font-mono">3. 維修更換</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">更換/燒機測試</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {isCompleted ? '測試通過' : '等待排程'}
                        </p>
                      </div>

                      {/* Step 4 */}
                      <div
                        className={`p-3 rounded-xl border relative transition ${
                          isCompleted
                            ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-500" />
                          )}
                          <span className="text-xs font-bold font-mono">4. 完工待取</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-mono">
                          {isCompleted ? '可至門市取件' : '尚未完工'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          預計: {res.repair.dueDate || '工程師通知'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Case Content Details */}
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Info Column */}
                      <div className="space-y-4">
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
                          <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                            工單與客戶資訊
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div>
                              <span className="text-slate-500">客戶姓名：</span>
                              <span className="text-slate-200 font-bold ml-1">
                                {maskName(res.customer.name)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">收件日期：</span>
                              <span className="text-slate-200 ml-1">{res.repair.date}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">預計取件：</span>
                              <span className="text-slate-200 ml-1">
                                {res.repair.dueDate || '現場或電話確認'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">目前狀態：</span>
                              <span
                                className={`ml-1 font-bold ${
                                  isCompleted ? 'text-emerald-400' : 'text-amber-400'
                                }`}
                              >
                                {isCompleted ? '已完成 (可取件)' : '處理中 (待取)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Side Panel Badges */}
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                            主機側板配件確認
                          </h4>
                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span
                              className={`px-2.5 py-1 rounded-lg border ${
                                res.repair.hasLeftPanel
                                  ? 'bg-slate-800 text-slate-200 border-slate-600'
                                  : 'bg-slate-900/60 text-slate-500 border-slate-800 line-through'
                              }`}
                            >
                              {res.repair.hasLeftPanel ? '✓ 左側板 (有)' : '✕ 左側板 (無)'}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-lg border ${
                                res.repair.hasRightPanel
                                  ? 'bg-slate-800 text-slate-200 border-slate-600'
                                  : 'bg-slate-900/60 text-slate-500 border-slate-800 line-through'
                              }`}
                            >
                              {res.repair.hasRightPanel ? '✓ 右側板 (有)' : '✕ 右側板 (無)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Info Column */}
                      <div className="space-y-4">
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
                          <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                            維修項目與預估費用
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-100">
                              {res.repair.item}
                            </p>
                            {res.repair.note && (
                              <p className="text-xs text-slate-400 italic bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                                備註說明：{res.repair.note}
                              </p>
                            )}
                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                              <span className="text-xs font-mono text-slate-400">總計費用 (NT$)</span>
                              <span className="text-xl font-black font-mono text-emerald-400">
                                NT$ {res.repair.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Photo Evidence Gallery */}
                    {res.repair.photos && res.repair.photos.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-sky-400" />
                          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                            門市收件與維修存證照片 ({res.repair.photos.length} 張)
                          </h4>
                          <span className="text-[10px] text-slate-400">點擊可放大檢視高畫質照片</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {res.repair.photos.map((photo) => (
                            <div
                              key={photo.id}
                              onClick={() => setLightboxPhoto(photo)}
                              className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square cursor-pointer transition hover:border-sky-500/60 shadow-lg"
                            >
                              <img
                                src={photo.url}
                                alt={photo.caption || '存證照片'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-[11px] font-medium text-slate-200 truncate">
                                {photo.caption || '存證照片'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Store Contact & Navigation Card */}
                    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                          <span>{res.shopInfo.name || 'FixFlow 智慧電腦維修'}</span>
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{res.shopInfo.address || '門市地址'}</span>
                        </p>
                        {res.shopInfo.notice && (
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xl">
                            ℹ️ 取件須知：{res.shopInfo.notice}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {res.shopInfo.phone && (
                          <a
                            href={`tel:${res.shopInfo.phone}`}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                          >
                            <Phone className="w-3.5 h-3.5" /> 撥打門市電話
                          </a>
                        )}
                        {res.shopInfo.address && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              res.shopInfo.address
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                          >
                            <MapPin className="w-3.5 h-3.5" /> 地圖導航
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono mt-auto">
        <p>© 2026 FixFlow 智慧電腦維修管理系統 • 全方位專業維修保障</p>
      </footer>

      {/* Photo Lightbox */}
      <ImageLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  );
};
