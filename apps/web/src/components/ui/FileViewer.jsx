import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '@/api/client';
import Icon from '@/components/ui/Icon';

export default function FileViewer({ isOpen, onClose, files = [], initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setScale(1);
      setFlipH(false);
      setFlipV(false);
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen || !files.length) return;
    const file = files[currentIndex];
    if (file?.url) {
      setCurrentUrl(file.url);
    } else if (file?.id) {
      setLoadingUrl(true);
      apiClient
        .get(`/v1/attachments/${file.id}/download`)
        .then((res) => {
          setCurrentUrl(res.data?.data?.downloadUrl || res.data?.downloadUrl);
        })
        .catch(console.error)
        .finally(() => setLoadingUrl(false));
    }

    // Reset view when changing files
    setRotation(0);
    setScale(1);
    setFlipH(false);
    setFlipV(false);
  }, [currentIndex, isOpen, files]);

  if (!isOpen || !files.length) return null;

  const file = files[currentIndex];
  if (!file) return null;

  const isImage = file.mimeType?.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';

  const handleNext = () => setCurrentIndex((i) => (i + 1) % files.length);
  const handlePrev = () => setCurrentIndex((i) => (i - 1 + files.length) % files.length);

  const handleDownload = () => {
    if (!currentUrl) return;
    const a = document.createElement('a');
    a.href = currentUrl;
    a.download = file.filename || file.originalName || 'download';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <div className="flex flex-col">
          <span className="font-medium">
            {file.filename || file.originalName || 'Archivo'}
            {files.length > 1 && (
              <span className="ml-2 text-white/50 font-normal">
                ({currentIndex + 1} de {files.length})
              </span>
            )}
          </span>
          <span className="text-xs text-white/70">
            {file.mimeType} {file.sizeBytes ? `· ${(file.sizeBytes / 1024).toFixed(1)} KB` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-white/10 rounded-lg text-white"
            title="Descargar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-white"
            title="Cerrar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toolbar for images */}
      {isImage && (
        <div className="flex items-center justify-center gap-4 p-2 bg-black/50 text-white">
          <button
            onClick={() => setScale((s) => Math.max(0.1, s - 0.25))}
            className="p-2 hover:bg-white/10 rounded-lg text-white"
            title="Alejar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3M8 11h6" />
            </svg>
          </button>
          <span className="text-sm min-w-[4ch] text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(5, s + 0.25))}
            className="p-2 hover:bg-white/10 rounded-lg text-white"
            title="Acercar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
            </svg>
          </button>
          <div className="w-px h-6 bg-white/20 mx-2"></div>
          <button
            onClick={() => setRotation((r) => r - 90)}
            className="p-2 hover:bg-white/10 rounded-lg text-white"
            title="Rotar Izquierda"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <button
            onClick={() => setRotation((r) => r + 90)}
            className="p-2 hover:bg-white/10 rounded-lg text-white"
            title="Rotar Derecha"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
          <div className="w-px h-6 bg-white/20 mx-2"></div>
          <button
            onClick={() => setFlipH((f) => !f)}
            className="p-2 hover:bg-white/10 rounded-lg text-white"
            title="Invertir Horizontalmente"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 20v-2M12 14v-2M12 8V6M17 22l5-10-5-10M7 2L2 12l5 10" />
            </svg>
          </button>
          <button
            onClick={() => setFlipV((f) => !f)}
            className="p-2 hover:bg-white/10 rounded-lg text-white"
            title="Invertir Verticalmente"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 12h2M10 12h2M16 12h2M2 7l10-5 10 5M22 17l-10 5-10-5" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation Arrows */}
      {files.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white z-10 transition-colors"
          >
            <Icon name="chevron-left" size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white z-10 transition-colors"
          >
            <Icon name="chevron-right" size={24} />
          </button>
        </>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-4 relative">
        {loadingUrl ? (
          <div className="text-white/70 animate-pulse">Cargando vista previa...</div>
        ) : isImage ? (
          <img
            src={currentUrl}
            alt={file.filename || file.originalName}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) scaleX(${
                flipH ? -1 : 1
              }) scaleY(${flipV ? -1 : 1})`,
            }}
          />
        ) : isPdf ? (
          <iframe
            src={currentUrl}
            title={file.filename || file.originalName}
            className="w-full h-full border-0 bg-white rounded-lg shadow-xl"
          />
        ) : (
          <div className="flex flex-col items-center text-white/50">
            <Icon name="file" size={64} className="mb-4 opacity-50" />
            <p>Vista previa no disponible para este tipo de archivo.</p>
            <p className="text-sm mt-2 text-center">
              Por favor descárgalo para verlo o utilizar el visor del sistema.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
