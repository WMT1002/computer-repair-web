import React, { useState, useRef } from 'react';
import { Camera, ImagePlus, Trash2, Eye, Loader2 } from 'lucide-react';
import { RepairPhoto } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { ImageLightbox } from './ImageLightbox';

interface PhotoUploaderProps {
  photos: RepairPhoto[];
  onChange: (photos: RepairPhoto[]) => void;
  maxPhotos?: number;
  title?: string;
}

const PRESET_TAGS = [
  '機身外觀正面',
  '左側板狀態',
  '右側板狀態',
  '原有外觀刮損',
  '主機內部零件',
  '故障藍屏/畫面',
  '完修測試正常',
];

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos = [],
  onChange,
  maxPhotos = 6,
  title = '機身照片與外觀存證',
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedTag, setSelectedTag] = useState(PRESET_TAGS[0]);
  const [customCaption, setCustomCaption] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState<RepairPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      alert(`最多只能上傳 ${maxPhotos} 張存證照片喔！`);
    }

    setIsCompressing(true);
    const newPhotos: RepairPhoto[] = [];
    const remainingSlots = Math.max(0, maxPhotos - photos.length);
    const targetFiles = Array.from(files).slice(0, remainingSlots);

    for (let i = 0; i < targetFiles.length; i++) {
      const file = targetFiles[i];
      try {
        const compressedBase64 = await compressImage(file, 1280, 0.78);
        const captionText = customCaption.trim() || selectedTag;
        newPhotos.push({
          id: `PHOTO-${Date.now()}-${i}`,
          url: compressedBase64,
          caption: captionText,
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        });
      } catch (err) {
        console.error('Image compression failed:', err);
      }
    }

    onChange([...photos, ...newPhotos]);
    setIsCompressing(false);
    setCustomCaption('');

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  const handleUpdateCaption = (id: string, newCaption: string) => {
    onChange(
      photos.map((p) => (p.id === id ? { ...p, caption: newCaption } : p))
    );
  };

  return (
    <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            {title} ({photos.length}/{maxPhotos})
          </span>
          <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            選填 • 自動智慧壓縮
          </span>
        </div>

        {/* Quick Tag Selector */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 text-[11px] font-mono">預設標籤:</span>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-slate-800 text-sky-300 text-xs px-2 py-1 rounded border border-slate-600 focus:outline-none"
          >
            {PRESET_TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Photo Grid Preview */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950/60 aspect-square flex flex-col justify-between transition hover:border-sky-500/50 shadow-md"
            >
              <img
                src={photo.url}
                alt={photo.caption || '存證照片'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Tag overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1.5 pt-4">
                <input
                  type="text"
                  value={photo.caption || ''}
                  onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                  placeholder="標註說明"
                  className="w-full bg-transparent text-[11px] font-medium text-slate-200 hover:text-white focus:outline-none focus:bg-black/60 px-1 rounded truncate"
                  title="點擊修改照片標註"
                />
              </div>

              {/* Action Buttons overlay */}
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(photo)}
                  className="p-1 rounded bg-black/70 text-slate-200 hover:text-sky-400 hover:bg-black transition"
                  title="放大查看"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="p-1 rounded bg-black/70 text-slate-200 hover:text-rose-400 hover:bg-black transition"
                  title="刪除照片"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button area */}
      {photos.length < maxPhotos && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            accept="image/*"
            multiple
            className="hidden"
          />

          <button
            type="button"
            disabled={isCompressing}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 border border-sky-500/30 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {isCompressing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>處理壓縮中…</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-4 h-4" />
                <span>選擇照片 / 手機拍照上傳</span>
              </>
            )}
          </button>

          <input
            type="text"
            value={customCaption}
            onChange={(e) => setCustomCaption(e.target.value)}
            placeholder="自訂此張照片說明 (選填)"
            className="flex-1 min-w-[180px] bg-slate-800/80 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-sky-500"
          />
        </div>
      )}

      {/* Lightbox Preview */}
      <ImageLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  );
};
