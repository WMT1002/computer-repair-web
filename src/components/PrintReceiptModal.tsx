import React, { useState } from 'react';
import { Customer, RepairRecord, ShopInfo, getStatusLabel } from '../types';
import { X, Printer, Scissors, Building, Phone, MapPin, Share2, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PrintReceiptModalProps {
  customer: Customer;
  repair: RepairRecord;
  shopInfo: ShopInfo;
  onClose: () => void;
  onSaveShopInfo: (info: ShopInfo) => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  customer,
  repair,
  shopInfo,
  onClose,
  onSaveShopInfo,
}) => {
  const [editingShop, setEditingShop] = useState(false);
  const [tempShopInfo, setTempShopInfo] = useState<ShopInfo>(shopInfo);
  const [copied, setCopied] = useState(false);

  const handleTriggerPrint = () => {
    window.print();
  };

  const handleSaveShop = () => {
    onSaveShopInfo(tempShopInfo);
    setEditingShop(false);
  };

  const handleCopyTrackingLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?track=${repair.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div>
      {/* Interactive Modal (hidden during print) */}
      <div className="modal-overlay no-print">
        <div className="modal-content max-w-4xl fade-in">
          {/* Header */}
          <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800/90">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100">A4 雙聯維修單據列印預覽</h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyTrackingLink}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 flex items-center gap-1.5 transition cursor-pointer"
                title="複製此工單的顧客進度查詢網址，可貼在 LINE 給顧客"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-sky-400" />}
                {copied ? '已複製顧客查詢連結！' : '複製顧客追蹤連結'}
              </button>

              <button
                onClick={() => setEditingShop(!editingShop)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-700 text-slate-300 hover:text-slate-100 cursor-pointer"
              >
                {editingShop ? '關閉店家資訊編輯' : '設定店家資訊'}
              </button>
              <button
                onClick={handleTriggerPrint}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-sky-500/20 hover:brightness-110 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> 一鍵列印 A4 單據
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Shop Info Editor Drawer */}
          {editingShop && (
            <div className="p-4 bg-slate-900 border-b border-slate-700 space-y-3 text-xs fade-in">
              <div className="font-bold text-sky-400 flex items-center gap-1">
                <Building className="w-4 h-4" /> 編輯印章與抬頭店家資訊
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">店家名稱</label>
                  <input
                    type="text"
                    value={tempShopInfo.name}
                    onChange={(e) => setTempShopInfo({ ...tempShopInfo, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">聯絡電話</label>
                  <input
                    type="text"
                    value={tempShopInfo.phone}
                    onChange={(e) => setTempShopInfo({ ...tempShopInfo, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">門市地址</label>
                  <input
                    type="text"
                    value={tempShopInfo.address}
                    onChange={(e) => setTempShopInfo({ ...tempShopInfo, address: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">維修條款與注意事項</label>
                  <textarea
                    rows={2}
                    value={tempShopInfo.notice}
                    onChange={(e) => setTempShopInfo({ ...tempShopInfo, notice: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSaveShop}
                  className="px-3 py-1 bg-sky-500 text-slate-950 font-bold rounded"
                >
                  儲存店家設定
                </button>
              </div>
            </div>
          )}

      {/* Screen Preview Container */}
      <div className="p-6 bg-slate-900 overflow-y-auto max-h-[75vh]">
        <div className="bg-white text-slate-900 p-6 rounded-lg shadow-2xl font-sans border border-slate-200 min-h-[920px] flex flex-col justify-between">
          <ReceiptSlip
            title="維修工單 (公司存留聯)"
            customer={customer}
            repair={repair}
            shopInfo={shopInfo}
            badge="公司存留"
          />

          <div className="my-4 border-b-2 border-dashed border-slate-400 relative text-center shrink-0">
            <span className="bg-white px-3 text-slate-500 text-xs font-mono inline-flex items-center gap-1 absolute left-1/2 -translate-x-1/2 -top-2.5">
              <Scissors className="w-3.5 h-3.5" /> 沿此虛線裁剪 (撕剪線)
            </span>
          </div>

          <ReceiptSlip
            title="維修憑證 (客戶存留聯)"
            customer={customer}
            repair={repair}
            shopInfo={shopInfo}
            badge="客戶憑證"
          />
        </div>
      </div>
    </div>
  </div>

  {/* Actual Print Container (only active during window.print()) */}
  <div className="print-only-container bg-white text-black font-sans box-border flex flex-col justify-between h-[287mm]">
    <ReceiptSlip
      title="維修工單 (公司存留聯)"
      customer={customer}
      repair={repair}
      shopInfo={shopInfo}
      badge="公司存留"
    />

    <div className="my-2 border-b-2 border-dashed border-slate-900 relative text-center shrink-0">
      <span className="bg-white px-3 text-xs font-mono inline-block transform -translate-y-2.5 text-slate-800 font-bold">
        ✂ 沿此虛線裁剪 (撕剪線) ✂
      </span>
    </div>

    <ReceiptSlip
      title="維修憑證 (客戶存留聯)"
      customer={customer}
      repair={repair}
      shopInfo={shopInfo}
      badge="客戶憑證"
    />
  </div>
</div>
);
};

interface ReceiptSlipProps {
  title: string;
  customer: Customer;
  repair: RepairRecord;
  shopInfo: ShopInfo;
  badge: string;
}

const ReceiptSlip: React.FC<ReceiptSlipProps> = ({ title, customer, repair, shopInfo, badge }) => {
  return (
    <div className="border border-slate-900 p-4 rounded-lg flex-1 flex flex-col justify-between space-y-3.5 text-sm bg-white">
      {/* Header (Section 1 - Enlarged) */}
      <div className="flex items-start justify-between border-b border-slate-900 pb-3">
        <div>
          <h2 className="text-2xl font-black tracking-wide text-black">{shopInfo.name}</h2>
          <p className="text-sm text-slate-700 flex items-center gap-3 mt-1 font-medium">
            <span>
              <Phone className="w-4 h-4 inline text-slate-700" /> {shopInfo.phone}
            </span>
            <span>
              <MapPin className="w-4 h-4 inline text-slate-700" /> {shopInfo.address}
            </span>
          </p>
        </div>
        <div className="text-right">
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-900 border border-slate-500 text-xs font-mono font-bold rounded">
            {badge}
          </span>
          <h3 className="text-sm font-bold mt-1 text-slate-900">{title}</h3>
          <p className="text-sm font-mono font-bold text-slate-700">單號: {repair.id}</p>
        </div>
      </div>

      {/* Info Grid (Section 2 - Enlarged with Left/Right Panel Checkboxes) */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm border border-slate-400 p-3.5 bg-slate-50/80 rounded-lg">
        <div>
          <span className="text-slate-600 font-mono">客戶姓名：</span>
          <span className="font-bold text-slate-900 text-base ml-1">{customer.name}</span>
        </div>
        <div>
          <span className="text-slate-600 font-mono">聯絡電話：</span>
          <span className="font-bold text-slate-900 text-base font-mono ml-1">{customer.phone}</span>
        </div>
        <div>
          <span className="text-slate-600 font-mono">收件日期：</span>
          <span className="font-mono font-semibold text-slate-900 ml-1">{repair.date}</span>
        </div>
        <div>
          <span className="text-slate-600 font-mono">預計取件：</span>
          <span className="font-mono font-semibold text-slate-900 ml-1">
            {repair.dueDate?.trim() ? repair.dueDate : '______________'}
          </span>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 font-mono">
            <span className={`inline-flex items-center justify-center w-4 h-4 border border-slate-900 rounded-sm text-xs font-black ${repair.hasLeftPanel ? 'bg-slate-900 text-white' : 'bg-white text-transparent'}`}>
              ✓
            </span>
            <span className={`font-mono ${repair.hasLeftPanel ? 'text-slate-950 font-bold' : 'text-slate-500 font-normal'}`}>
              左側板 {repair.hasLeftPanel ? '【有】' : '【無】'}
            </span>
          </span>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 font-mono">
            <span className={`inline-flex items-center justify-center w-4 h-4 border border-slate-900 rounded-sm text-xs font-black ${repair.hasRightPanel ? 'bg-slate-900 text-white' : 'bg-white text-transparent'}`}>
              ✓
            </span>
            <span className={`font-mono ${repair.hasRightPanel ? 'text-slate-950 font-bold' : 'text-slate-500 font-normal'}`}>
              右側板 {repair.hasRightPanel ? '【有】' : '【無】'}
            </span>
          </span>
        </div>
      </div>

      {/* Repair Detail Table (Section 3 - Enlarged) */}
      <table className="w-full text-left text-sm border-collapse border border-slate-900">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-900 font-bold text-slate-900">
            <th className="p-3 border-r border-slate-900">維修項目</th>
            <th className="p-3 w-28 text-center border-r border-slate-900">狀態</th>
            <th className="p-3 w-36 text-right">金額 (NT$)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-3 border-r border-slate-900 font-semibold text-slate-900 align-middle">
              {repair.item}
            </td>
            <td className="p-3 w-32 text-center border-r border-slate-900 font-bold text-slate-900 align-middle">
              {getStatusLabel(repair.status)}
            </td>
            <td className="p-3 w-36 text-right font-mono font-bold text-base text-slate-900 align-middle">
              NT$ {repair.price.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 備註事項 Box (Reduced to half height as requested) */}
      <div className="border border-slate-300 rounded-lg p-2.5 bg-white min-h-[50px] text-xs">
        <p className="font-bold text-slate-900 mb-0.5">備註事項：</p>
        {repair.note?.trim() ? (
          <p className="text-slate-800 font-medium whitespace-pre-wrap">{repair.note}</p>
        ) : (
          <div className="h-4" />
        )}
      </div>

      {/* Footer Notice & Stamp area */}
      <div className="flex items-end justify-between pt-1 text-xs gap-3">
        <div className="flex-1 text-slate-600 text-xs">
          <p className="font-bold text-slate-800 mb-0.5">注意事項：</p>
          <p className="leading-tight">{shopInfo.notice}</p>
        </div>

        {/* Dynamic QR Code for Customer Copy */}
        {badge === '客戶憑證' && (
          <div className="flex items-center gap-2 p-1.5 border border-slate-300 rounded bg-white shrink-0">
            <QRCodeSVG
              value={`${window.location.origin}${window.location.pathname}?track=${repair.id}`}
              size={52}
              level="M"
            />
            <div className="text-[10px] leading-tight text-slate-700 font-mono flex flex-col justify-center">
              <span className="font-bold text-slate-950 flex items-center gap-0.5">📱 手機掃碼</span>
              <span className="font-semibold text-sky-700">即時追蹤進度</span>
              <span className="text-[9px] text-slate-500">免登入查詢</span>
            </div>
          </div>
        )}

        <div className="w-32 h-14 border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 text-xs font-mono rounded shrink-0">
          【 店家蓋章處 】
        </div>
      </div>
    </div>
  );
};
