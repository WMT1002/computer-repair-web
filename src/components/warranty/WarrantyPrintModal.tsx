import React from 'react';
import { createPortal } from 'react-dom';
import { PartWarrantyRecord, ShopInfo } from '../../types';
import { X, Printer, ShieldCheck, Barcode, Phone, MapPin } from 'lucide-react';

interface WarrantyPrintModalProps {
  warranty: PartWarrantyRecord;
  shopInfo: ShopInfo;
  onClose: () => void;
}

export const WarrantyPrintModal: React.FC<WarrantyPrintModalProps> = ({
  warranty,
  shopInfo,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Calculate dates
  const today = new Date();
  const startDateStr = warranty.startDate || today.toISOString().split('T')[0];
  const startDateObj = new Date(startDateStr);
  const endDateObj = new Date(startDateObj);
  endDateObj.setDate(endDateObj.getDate() + (warranty.warrantyDays || 365));
  const endDateStr = endDateObj.toISOString().split('T')[0];

  return createPortal(
    <>
      {/* 1. Interactive On-Screen Modal (hidden when printing) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs no-print animate-fadeIn">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Sticky Toolbar Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
            <div className="flex items-center gap-2 text-slate-100 text-sm font-bold">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>列印零件保固憑證卡</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>立即列印</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                title="關閉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Silky Smooth Scrollable Preview Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/90 overscroll-contain">
            <div className="bg-white text-slate-900 p-5 sm:p-6 rounded-xl border-2 border-slate-900 shadow-xl font-sans relative">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h1 className="text-lg sm:text-xl font-black tracking-wider text-slate-950 uppercase">
                      {shopInfo.name}
                    </h1>
                  </div>
                  <div className="text-xs text-slate-600 font-mono mt-1 space-y-0.5">
                    <p className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" /> {shopInfo.phone}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {shopInfo.address}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold bg-cyan-50 border border-cyan-500 text-cyan-900 rounded">
                    零件保固憑證聯
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-500 mt-1">保固單號: {warranty.id}</p>
                  <p className="text-xs font-mono font-bold text-slate-900">
                    工單單號: {warranty.repairId || '—'}
                  </p>
                </div>
              </div>

              {/* Customer & Ticket Info */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-300 text-xs font-mono mb-4">
                <div>
                  <span className="text-slate-500">客戶姓名：</span>
                  <span className="font-bold text-slate-900 text-sm ml-1">{warranty.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500">聯絡電話：</span>
                  <span className="font-bold text-slate-900 ml-1">{warranty.customerPhone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500">保固起算日：</span>
                  <span className="font-bold text-emerald-700 ml-1">{startDateStr} (取件生效)</span>
                </div>
                <div>
                  <span className="text-slate-500">保固截止日：</span>
                  <span className="font-bold text-rose-700 text-sm ml-1">{endDateStr}</span>
                </div>
              </div>

              {/* Part Specification & S/N */}
              <div className="border border-slate-900 rounded-lg overflow-hidden mb-4">
                <div className="bg-slate-900 text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between font-mono">
                  <span>更換零件履歷明細</span>
                  <span>保固期限：{warranty.warrantyDays} 天</span>
                </div>
                <div className="p-3.5 space-y-2.5 bg-white text-xs">
                  <div>
                    <span className="text-slate-500 font-mono">零件名稱與規格：</span>
                    <p className="text-sm font-black text-slate-950 mt-0.5">{warranty.partName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-slate-500 font-mono">零件類別：</span>
                      <span className="font-bold text-slate-800 ml-1">{warranty.partCategory}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono">代理/原廠通路：</span>
                      <span className="font-bold text-slate-800 ml-1">{warranty.supplier || '原廠正品'}</span>
                    </div>
                  </div>

                  {/* S/N Highlight Box */}
                  <div className="p-2.5 rounded-lg bg-cyan-50/60 border border-cyan-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Barcode className="w-5 h-5 text-slate-700" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                          原廠零件序號 (S/N)
                        </span>
                        <p className="text-sm font-mono font-black text-slate-950 tracking-wider">
                          {warranty.serialNumber}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-800 font-bold px-2 py-0.5 bg-cyan-100/80 rounded border border-cyan-400">
                      ✓ 原廠條碼存檔
                    </span>
                  </div>

                  {warranty.note && (
                    <p className="text-[11px] text-slate-600 italic">備註：{warranty.note}</p>
                  )}
                </div>
              </div>

              {/* Terms & Stamp */}
              <div className="grid grid-cols-12 gap-3 items-end pt-3 text-[10px] text-slate-600 font-mono border-t border-slate-300">
                <div className="col-span-12 sm:col-span-8 space-y-1">
                  <p className="font-bold text-slate-800">保固條款須知：</p>
                  <p>1. 本保固自取件日起算，憑本證明或原序號條碼享有保固服務。</p>
                  <p>2. 人為損壞、天災受潮、自行拆解改裝或序號貼紙毀損，不在免費範圍內。</p>
                  <p>3. 若零件於保固期內發生原廠非人為故障，門市協助代送原廠修復或免費換新。</p>
                </div>

                <div className="col-span-12 sm:col-span-4 border-2 border-slate-400 border-dashed rounded h-16 flex flex-col items-center justify-center text-slate-400">
                  <span className="text-[9px]">【 店家蓋章處 】</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Print Only Sheet (Rendered cleanly on A4 paper during print) */}
      <div className="warranty-print-container bg-white text-black font-sans box-border">
        <div className="border-2 border-black p-6 rounded-lg">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-black pb-3 mb-3">
            <div>
              <h1 className="text-xl font-black tracking-wider text-black uppercase">{shopInfo.name}</h1>
              <div className="text-xs text-black font-mono mt-1 space-y-0.5">
                <p>電話：{shopInfo.phone}</p>
                <p>地址：{shopInfo.address}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs font-mono font-bold border-2 border-black rounded text-black">
                零件原廠保固憑證卡 (客戶存查聯)
              </span>
              <p className="text-xs font-mono font-bold mt-1">保固單號: {warranty.id}</p>
              <p className="text-xs font-mono font-bold">維修單號: {warranty.repairId || '—'}</p>
            </div>
          </div>

          {/* Customer & Ticket Info */}
          <div className="grid grid-cols-2 gap-2 p-2.5 border border-black text-xs font-mono mb-3">
            <div>
              <span>客戶姓名：</span>
              <span className="font-bold text-sm ml-1">{warranty.customerName}</span>
            </div>
            <div>
              <span>聯絡電話：</span>
              <span className="font-bold ml-1">{warranty.customerPhone || '—'}</span>
            </div>
            <div>
              <span>保固起算日：</span>
              <span className="font-bold ml-1">{startDateStr} (取件生效)</span>
            </div>
            <div>
              <span>保固截止日：</span>
              <span className="font-bold text-sm ml-1">{endDateStr}</span>
            </div>
          </div>

          {/* Part Specification & S/N */}
          <div className="border border-black rounded overflow-hidden mb-3">
            <div className="bg-black text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between font-mono">
              <span>更換零件履歷明細</span>
              <span>保固期限：{warranty.warrantyDays} 天</span>
            </div>
            <div className="p-3 space-y-2 text-xs">
              <div>
                <span className="font-mono text-slate-700">零件名稱與規格：</span>
                <p className="text-sm font-black text-black mt-0.5">{warranty.partName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-300">
                <div>
                  <span className="font-mono text-slate-700">零件類別：</span>
                  <span className="font-bold ml-1">{warranty.partCategory}</span>
                </div>
                <div>
                  <span className="font-mono text-slate-700">代理/原廠通路：</span>
                  <span className="font-bold ml-1">{warranty.supplier || '原廠正品'}</span>
                </div>
              </div>

              {/* S/N Highlight */}
              <div className="p-2 border-2 border-black flex items-center justify-between rounded">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-mono text-slate-700">
                    原廠零件序號 (S/N)
                  </span>
                  <p className="text-base font-mono font-black tracking-wider text-black">
                    {warranty.serialNumber}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 border border-black rounded">
                  ✓ 原廠條碼已建檔
                </span>
              </div>

              {warranty.note && (
                <p className="text-[11px] text-slate-700 italic">備註：{warranty.note}</p>
              )}
            </div>
          </div>

          {/* Terms & Stamp */}
          <div className="grid grid-cols-12 gap-3 items-end pt-2 text-[10px] font-mono border-t border-black">
            <div className="col-span-8 space-y-1">
              <p className="font-bold text-black">保固條款須知：</p>
              <p>1. 本保固自顧客到店取件日起算，憑本證明或原序號條碼享有保固服務。</p>
              <p>2. 人為損壞、天災受潮、自行拆解改裝或序號貼紙毀損，不在免費保固範圍內。</p>
              <p>3. 若零件於保固期內發生原廠非人為故障，門市協助代送原廠修復或免費換新。</p>
            </div>

            <div className="col-span-4 border-2 border-black border-dashed rounded h-16 flex flex-col items-center justify-center">
              <span className="text-[9px]">【 店家經手章 / 店章 】</span>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
