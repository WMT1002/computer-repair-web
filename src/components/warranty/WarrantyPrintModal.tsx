import React from 'react';
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8 print:border-none print:shadow-none print:bg-white print:max-w-none print:w-full">
        {/* Modal Toolbar (hidden on print) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 print:hidden">
          <div className="flex items-center gap-2 text-slate-200 text-sm font-bold">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>列印零件保固憑證卡</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>立即列印</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Sheet */}
        <div className="p-6 bg-slate-900 print:p-0 print:bg-white">
          <div className="bg-white text-slate-900 p-6 rounded-xl border-2 border-slate-900 shadow-xl print:border-2 print:shadow-none font-sans relative">
            {/* Top Store Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h1 className="text-xl font-black tracking-wider text-slate-950 uppercase">{shopInfo.name}</h1>
                </div>
                <div className="text-xs text-slate-600 font-mono mt-1 space-y-0.5">
                  <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {shopInfo.phone}</p>
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> {shopInfo.address}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 text-xs font-mono font-bold bg-cyan-50 border border-cyan-500 text-cyan-900 rounded">
                  零件保固憑證聯
                </span>
                <p className="text-xs font-mono font-bold text-slate-500 mt-1">保固單號: {warranty.id}</p>
                <p className="text-xs font-mono font-bold text-slate-900">工單單號: {warranty.repairId}</p>
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
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">原廠零件序號 (S/N)</span>
                      <p className="text-sm font-mono font-black text-slate-950 tracking-wider">{warranty.serialNumber}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-800 font-bold px-2 py-0.5 bg-cyan-100/80 rounded border border-cyan-400">
                    ✓ 原廠條碼存檔
                  </span>
                </div>

                {warranty.note && (
                  <p className="text-[11px] text-slate-600 italic">
                    備註：{warranty.note}
                  </p>
                )}
              </div>
            </div>

            {/* Terms & Stamp */}
            <div className="grid grid-cols-3 gap-3 items-end pt-2 text-[10px] text-slate-600 font-mono border-t border-slate-300">
              <div className="col-span-2 space-y-1">
                <p className="font-bold text-slate-800">保固條款須知：</p>
                <p>1. 本保固自顧客到店取件日起算，憑本證明或原序號條碼享有保固服務。</p>
                <p>2. 人為損壞、天災受潮、自行拆解改裝或序號貼紙毀損，不在免費保固範圍內。</p>
                <p>3. 若零件於保固期內發生原廠非人為故障，門市協助代送原廠修復或免費換新。</p>
              </div>

              <div className="border border-slate-400 border-dashed rounded h-16 flex flex-col items-center justify-center text-slate-400">
                <span className="text-[9px]">門市經手章 / 店章</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
