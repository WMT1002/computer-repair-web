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
  Layers,
} from 'lucide-react';
import { RepairPhoto, getStatusStage, getStatusLabel } from '../types';
import { fetchPublicTrackingData, PublicTrackingResult } from '../utils/storage';
import { FixFlowLogo } from './common/FixFlowLogo';
import { ImageLightbox } from './common/ImageLightbox';

interface CustomerTrackingPageProps {
  initialOrderId?: string;
  onBackToDashboard?: () => void;
}

export const CustomerTrackingPage: React.FC<CustomerTrackingPageProps> = ({
  initialOrderId = '',
  onBackToDashboard,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100 text-slate-800 flex flex-col selection:bg-sky-500/20">
      {/* Top Navbar (Light Clean) */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FixFlowLogo size={36} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  FixFlow
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 font-bold">
                  顧客進度卡
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">智慧電腦維修進度即時追蹤</p>
            </div>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="text-xs text-slate-600 hover:text-sky-600 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-sky-400 bg-slate-50 hover:bg-white transition shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 返回維修後台
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Search Header Banner (Light Style) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xl shadow-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-sky-100/60 via-emerald-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" /> 4 階段即時動態追蹤 • 隨時掌握愛機現況
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              維修工單進度即時查詢
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              請輸入您的 <span className="text-sky-700 font-bold font-mono">維修單號 (如 REP-744757)</span> 或 <span className="text-sky-700 font-bold font-mono">送修聯絡電話</span> 進行查詢。
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="輸入維修單號或電話號碼 (例如 0987...)"
                  className="w-full bg-slate-50 hover:bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-3 focus:ring-sky-500/15 transition shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold text-sm hover:from-sky-600 hover:to-emerald-600 transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin text-white" />
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

        {/* Search Results Loading */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center border border-sky-200 animate-pulse shadow-sm">
              <RefreshCcw className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-sm text-slate-600 font-mono font-medium">正在調閱雲端維修資料庫…</p>
          </div>
        )}

        {/* No Results Alert */}
        {!isLoading && hasSearched && (!trackingResults || trackingResults.length === 0) && (
          <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-3 shadow-md">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-200">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">查無相關維修紀錄</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              找不到與「<span className="text-rose-600 font-mono font-bold">{searchInput}</span>」相符的工單。請確認單號格式或電話號碼是否正確，或直接撥打門市電話洽詢。
            </p>
          </div>
        )}

        {/* Tracking Order Results */}
        {!isLoading && trackingResults && trackingResults.length > 0 && (
          <div className="space-y-6">
            {trackingResults.map((res, index) => {
              const currentStage = getStatusStage(res.repair.status);
              const statusText = getStatusLabel(res.repair.status);
              const isCompleted = currentStage === 4;

              // Banner theme based on 4 stages
              const getBannerStyle = () => {
                if (currentStage === 4) {
                  return {
                    bg: 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200 text-emerald-900',
                    iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30',
                    title: res.repair.isPickedUp
                      ? '✨ 您的電腦已於門市順利完成取件，感謝您的支持！'
                      : '🎉 您的電腦已修復完工，歡迎於營業時間至門市取件！',
                    badge: res.repair.isPickedUp ? '【4. 完工待取】(已取件)' : '【4. 完工待取】',
                  };
                }
                if (currentStage === 3) {
                  return {
                    bg: 'bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-purple-200 text-purple-900',
                    iconBg: 'bg-purple-500 text-white shadow-purple-500/30',
                    title: '⚙️ 工程師正在為您的電腦進行零件更換與燒機測試',
                    badge: '【3. 維修更換】',
                  };
                }
                if (currentStage === 2) {
                  return {
                    bg: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-amber-200 text-amber-900',
                    iconBg: 'bg-amber-500 text-white shadow-amber-500/30',
                    title: '🔍 工程師正在進行硬體深度排查與故障檢測中',
                    badge: '【2. 故障檢測】',
                  };
                }
                return {
                  bg: 'bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 border-sky-200 text-sky-900',
                  iconBg: 'bg-sky-500 text-white shadow-sky-500/30',
                  title: '📥 門市已完成收件登記，排程準備進入檢測階段',
                  badge: '【1. 收件建檔】',
                };
              };

              const banner = getBannerStyle();

              // Progress percentage calculation
              const progressPercentage = currentStage === 4 ? 100 : currentStage === 3 ? 75 : currentStage === 2 ? 50 : 25;

              return (
                <div
                  key={res.repair.id || index}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/70 transition-all"
                >
                  {/* Status Banner */}
                  <div className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b ${banner.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md shrink-0 ${banner.iconBg}`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-medium text-slate-500">工單編號:</span>
                          <span className="text-sm font-bold font-mono text-slate-900">
                            {res.repair.id}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700 shadow-2xs font-mono">
                            {statusText}
                          </span>
                        </div>
                        <h2 className="text-sm sm:text-base font-black tracking-tight mt-1 text-slate-900">
                          {banner.title}
                        </h2>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyShareLink(res.repair.id)}
                      className="text-xs font-mono font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:text-sky-600 border border-slate-300 hover:border-sky-400 transition shadow-2xs cursor-pointer shrink-0"
                      title="複製此工單查詢連結"
                    >
                      <Share2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>{copiedLink ? '已複製連結！' : '分享查詢進度'}</span>
                    </button>
                  </div>

                  {/* 4-Stage Progress Stepper with Progress Bar */}
                  <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono font-bold tracking-wider text-slate-600 uppercase flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-sky-600" /> 4 階段維修處理進度
                      </h3>
                      <span className="text-xs font-bold font-mono text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                        進度：{progressPercentage}%
                      </span>
                    </div>

                    {/* Progress Fill Track */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    {/* 4 Step Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                      {/* Step 1: 收件建檔 */}
                      <div
                        className={`p-3.5 rounded-xl border transition shadow-2xs ${
                          currentStage >= 1
                            ? currentStage === 1
                              ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-400/30'
                              : 'bg-white border-emerald-300'
                            : 'bg-slate-100/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold font-mono mb-1 text-slate-900">
                          {currentStage > 1 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-black">
                              1
                            </span>
                          )}
                          <span>1. 收件建檔</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-mono">{res.repair.date}</p>
                        <p className={`text-[10px] font-medium mt-0.5 ${currentStage >= 1 ? 'text-sky-700' : 'text-slate-400'}`}>
                          {currentStage > 1 ? '已建檔完成' : '門市收件中'}
                        </p>
                      </div>

                      {/* Step 2: 故障檢測 */}
                      <div
                        className={`p-3.5 rounded-xl border transition shadow-2xs ${
                          currentStage >= 2
                            ? currentStage === 2
                              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                              : 'bg-white border-emerald-300'
                            : 'bg-slate-100/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold font-mono mb-1 text-slate-900">
                          {currentStage > 2 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : currentStage === 2 ? (
                            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-black">
                              2
                            </span>
                          )}
                          <span>2. 故障檢測</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-mono">軟硬體深度排查</p>
                        <p className={`text-[10px] font-medium mt-0.5 ${currentStage >= 2 ? (currentStage === 2 ? 'text-amber-700 font-bold' : 'text-emerald-700') : 'text-slate-400'}`}>
                          {currentStage > 2 ? '檢測完成' : currentStage === 2 ? '檢測分析中' : '等待檢測'}
                        </p>
                      </div>

                      {/* Step 3: 維修更換 */}
                      <div
                        className={`p-3.5 rounded-xl border transition shadow-2xs ${
                          currentStage >= 3
                            ? currentStage === 3
                              ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400/30'
                              : 'bg-white border-emerald-300'
                            : 'bg-slate-100/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold font-mono mb-1 text-slate-900">
                          {currentStage > 3 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : currentStage === 3 ? (
                            <Wrench className="w-4 h-4 text-purple-600 animate-pulse" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-black">
                              3
                            </span>
                          )}
                          <span>3. 維修更換</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-mono">更換/燒機測試</p>
                        <p className={`text-[10px] font-medium mt-0.5 ${currentStage >= 3 ? (currentStage === 3 ? 'text-purple-700 font-bold' : 'text-emerald-700') : 'text-slate-400'}`}>
                          {currentStage > 3 ? '測試通過' : currentStage === 3 ? '進行維修與燒機' : '尚未開始'}
                        </p>
                      </div>

                      {/* Step 4: 完工待取 */}
                      <div
                        className={`p-3.5 rounded-xl border transition shadow-2xs ${
                          currentStage === 4
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                            : 'bg-slate-100/60 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold font-mono mb-1 text-slate-900">
                          {currentStage === 4 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-black">
                              4
                            </span>
                          )}
                          <span>4. 完工待取</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-mono">
                          {isCompleted ? '可至門市取件' : '等待修復'}
                        </p>
                        <p className={`text-[10px] font-medium mt-0.5 ${currentStage === 4 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          預計: {res.repair.dueDate || '現場通知'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Case Content Details (Light Theme) */}
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Info Column */}
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                          <h4 className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" /> 工單基本資訊
                          </h4>
                          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                            <div>
                              <span className="text-slate-500">客戶姓名：</span>
                              <span className="text-slate-900 font-bold ml-1">
                                {maskName(res.customer.name)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">收件日期：</span>
                              <span className="text-slate-800 ml-1">{res.repair.date}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">預計取件：</span>
                              <span className="text-slate-800 ml-1">
                                {res.repair.dueDate || '現場或電話確認'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">當前狀態：</span>
                              <span className="ml-1 font-bold text-slate-900">
                                {statusText}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Side Panel Confirmation Badges */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                          <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-500" /> 主機側板配件確認
                          </h4>
                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span
                              className={`px-3 py-1.5 rounded-lg border font-semibold ${
                                res.repair.hasLeftPanel
                                  ? 'bg-white text-slate-900 border-slate-300 shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                              }`}
                            >
                              {res.repair.hasLeftPanel ? '✓ 左側板 (有留存)' : '✕ 左側板 (無配件)'}
                            </span>
                            <span
                              className={`px-3 py-1.5 rounded-lg border font-semibold ${
                                res.repair.hasRightPanel
                                  ? 'bg-white text-slate-900 border-slate-300 shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                              }`}
                            >
                              {res.repair.hasRightPanel ? '✓ 右側板 (有留存)' : '✕ 右側板 (無配件)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Info Column */}
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                          <h4 className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5" /> 維修項目與費用
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-slate-900 leading-snug">
                              {res.repair.item}
                            </p>
                            {res.repair.note && (
                              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                                <span className="font-bold text-slate-700">工程師備註：</span>
                                {res.repair.note}
                              </p>
                            )}
                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                              <span className="text-xs font-mono font-medium text-slate-500">預估費用 (NT$)</span>
                              <span className="text-2xl font-black font-mono text-emerald-600">
                                NT$ {res.repair.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Photo Evidence Gallery */}
                    {res.repair.photos && res.repair.photos.length > 0 && (
                      <div className="space-y-3 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-sky-600" />
                            <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                              門市收件與維修存證照片 ({res.repair.photos.length} 張)
                            </h4>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">點擊照片可放大檢視</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                          {res.repair.photos.map((photo) => (
                            <div
                              key={photo.id}
                              onClick={() => setLightboxPhoto(photo)}
                              className="group relative rounded-xl overflow-hidden border border-slate-300 bg-white aspect-square cursor-pointer transition hover:border-sky-500 hover:shadow-md shadow-2xs"
                            >
                              <img
                                src={photo.url}
                                alt={photo.caption || '存證照片'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-2 text-[11px] font-medium text-white truncate">
                                {photo.caption || '存證照片'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Store Contact & Navigation Card */}
                    <div className="bg-gradient-to-r from-slate-50 via-sky-50/50 to-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{res.shopInfo.name || 'FixFlow 智慧電腦維修'}</span>
                        </h4>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{res.shopInfo.address || '門市地址'}</span>
                        </p>
                        {res.shopInfo.notice && (
                          <p className="text-[11px] text-slate-500 mt-1 max-w-xl">
                            ℹ️ 取件須知：{res.shopInfo.notice}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        {res.shopInfo.phone && (
                          <a
                            href={`tel:${res.shopInfo.phone}`}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
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
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
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

      {/* Footer (Light Clean) */}
      <footer className="border-t border-slate-200 bg-white/80 py-6 text-center text-xs text-slate-500 font-mono mt-auto">
        <p>© 2026 FixFlow 智慧電腦維修管理系統 • 全方位專業維修保障</p>
      </footer>

      {/* Photo Lightbox */}
      <ImageLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  );
};
