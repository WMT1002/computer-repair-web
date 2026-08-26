import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';
import { RepairPhoto } from '../../types';

interface ImageLightboxProps {
  photo: RepairPhoto | null;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ photo, onClose }) => {
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition cursor-pointer"
          title="關閉預覽"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Action Bar */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs text-slate-200 shadow-lg">
          {photo.caption && (
            <span className="font-semibold text-sky-400 mr-2 flex items-center gap-1">
              <ZoomIn className="w-3.5 h-3.5" /> {photo.caption}
            </span>
          )}
          <a
            href={photo.url}
            download={`repair_photo_${photo.id}.jpg`}
            className="hover:text-sky-400 p-1 flex items-center gap-1 transition"
            title="下載原圖"
          >
            <Download className="w-4 h-4" /> 下載
          </a>
        </div>

        {/* Image Content */}
        <img
          src={photo.url}
          alt={photo.caption || '維修存證照片'}
          className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl border border-slate-700/50"
        />

        {/* Caption bottom bar */}
        <div className="mt-3 text-center text-slate-300 text-sm font-mono flex items-center gap-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700">
          <span>{photo.caption || '未標註說明'}</span>
          {photo.createdAt && (
            <span className="text-slate-500 text-xs">• 拍攝/上傳於 {photo.createdAt}</span>
          )}
        </div>
      </div>
    </div>
  );
};
