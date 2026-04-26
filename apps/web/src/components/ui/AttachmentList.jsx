import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import FileViewer from '@/components/ui/FileViewer';
import { formatDate } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/api/client';
import Icon from '@/components/ui/Icon';

export function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function getFileIcon(mimeType) {
  if (!mimeType) return 'file';
  if (mimeType.startsWith('image/')) return 'file-image';
  if (mimeType.startsWith('video/')) return 'file-video';
  if (mimeType === 'application/pdf') return 'file-pdf';
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    mimeType.includes('gzip')
  )
    return 'file-archive';
  if (mimeType.includes('text') || mimeType.includes('csv')) return 'file-text';
  return 'file';
}

const MoreVerticalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default function AttachmentList({ attachments, onRename, onDelete, readOnly = false }) {
  const [viewFileIndex, setViewFileIndex] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [thumbnails, setThumbnails] = useState({});
  const { toast } = useToast();

  const getAttachmentUrl = async (attachmentId) => {
    try {
      const res = await apiClient.get(`/v1/attachments/${attachmentId}/download`);
      return res.data?.data?.downloadUrl || res.data?.downloadUrl;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleAction = async (item, fileData, actionType) => {
    let url = item.url || fileData.url;
    if (!url) {
      url = await getAttachmentUrl(fileData.id);
    }

    if (actionType === 'download') {
      if (!url) return toast.error('El enlace de descarga no está disponible');
      const a = document.createElement('a');
      a.href = url;
      const displayName = item.note || fileData.filename || 'archivo';
      a.download = displayName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (actionType === 'view') {
      const idx = attachments.findIndex((a) => a.id === item.id);
      if (idx !== -1) setViewFileIndex(idx);
    }
  };

  // Fetch thumbnails for images
  useEffect(() => {
    if (!attachments || attachments.length === 0) return;

    attachments.forEach(async (item) => {
      const isRelation = !!item.attachment;
      const fileData = isRelation ? item.attachment : item;

      if (
        fileData.mimeType?.startsWith('image/') &&
        !thumbnails[fileData.id] &&
        !item.url &&
        !fileData.url
      ) {
        try {
          const url = await getAttachmentUrl(fileData.id);
          if (url) {
            setThumbnails((prev) => ({ ...prev, [fileData.id]: url }));
          }
        } catch (e) {
          // ignore
        }
      }
    });
  }, [viewMode, attachments]);

  const handleRename = (file) => {
    const isRelation = !!file.attachment;
    const fileData = isRelation ? file.attachment : file;
    const currentName = file.note || fileData.filename || '';
    const newName = window.prompt('Nuevo nombre:', currentName);
    if (newName && newName !== currentName && onRename) {
      onRename(file.id, newName);
    }
  };

  const handleDelete = (file) => {
    if (
      window.confirm('¿Seguro que deseas eliminar este archivo? Esta acción no se puede deshacer.')
    ) {
      if (onDelete) onDelete(file.id);
    }
  };

  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary text-sm">Sin adjuntos</p>
        <p className="text-text-disabled text-xs mt-1">No hay archivos subidos.</p>
      </div>
    );
  }

  const viewableFiles =
    attachments?.map((item) => {
      const isRelation = !!item.attachment;
      const fileData = isRelation ? item.attachment : item;
      const displayName = item.note || fileData.filename || fileData.originalName || 'Archivo';
      return {
        id: fileData.id,
        url: item.url || fileData.url, // Might be empty, FileViewer handles fetching
        mimeType: fileData.mimeType,
        filename: displayName,
        sizeBytes: fileData.sizeBytes,
      };
    }) || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          {attachments.length} archivo(s)
        </span>
        <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
          <button
            className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-surface-subtle shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setViewMode('list')}
            title="Vista de lista"
          >
            <Icon name="list" size={16} />
          </button>
          <button
            className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-surface-subtle shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setViewMode('grid')}
            title="Vista de cuadrícula"
          >
            <Icon name="grid" size={16} />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <ul className="divide-y divide-border border-t border-border">
          {attachments.map((item) => {
            const isRelation = !!item.attachment;
            const fileData = isRelation ? item.attachment : item;
            const displayName =
              item.note || fileData.filename || fileData.originalName || 'Archivo';
            const iconName = getFileIcon(fileData.mimeType);
            const isImage = fileData.mimeType?.startsWith('image/');
            const thumbnailUrl = item.url || fileData.url || thumbnails[fileData.id];

            return (
              <li
                key={item.id}
                className="flex items-center justify-between py-3 gap-3 hover:bg-surface-subtle px-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1 flex items-center gap-3">
                  <div
                    className="w-10 h-10 shrink-0 rounded-lg bg-surface flex items-center justify-center border border-border text-ink-500 overflow-hidden cursor-pointer"
                    onClick={() => handleAction(item, fileData, 'view')}
                  >
                    {isImage && thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name={iconName} size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm text-text-primary font-medium truncate hover:text-ink-600 cursor-pointer hover:underline transition-colors"
                      title={displayName}
                      onClick={() => handleAction(item, fileData, 'view')}
                    >
                      {displayName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatBytes(fileData.sizeBytes)} · {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!readOnly ? (
                    <DropdownMenu
                      trigger={
                        <button className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent focus:outline-none focus:ring-2 focus:ring-ink-500">
                          <Icon name="more-vertical" size={16} />
                        </button>
                      }
                    >
                      <DropdownMenuItem
                        icon={<Icon name="eye" size={16} />}
                        onClick={() => handleAction(item, fileData, 'view')}
                      >
                        Ver / Abrir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Icon name="download" size={16} />}
                        onClick={() => handleAction(item, fileData, 'download')}
                      >
                        Descargar
                      </DropdownMenuItem>
                      {onRename && (
                        <DropdownMenuItem
                          icon={<Icon name="edit" size={16} />}
                          onClick={() => handleRename(item)}
                        >
                          Renombrar
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            icon={<Icon name="trash" size={16} />}
                            onClick={() => handleDelete(item)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenu>
                  ) : (
                    <button
                      onClick={() => handleAction(item, fileData, 'view')}
                      className="text-xs text-ink-600 hover:text-ink-800 font-medium whitespace-nowrap px-2 py-1"
                    >
                      Ver
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {attachments.map((item) => {
            const isRelation = !!item.attachment;
            const fileData = isRelation ? item.attachment : item;
            const displayName =
              item.note || fileData.filename || fileData.originalName || 'Archivo';
            const iconName = getFileIcon(fileData.mimeType);
            const isImage = fileData.mimeType?.startsWith('image/');
            const thumbnailUrl = item.url || fileData.url || thumbnails[fileData.id];

            return (
              <div
                key={item.id}
                className="group relative rounded-xl border border-border bg-surface overflow-hidden shadow-xs hover:shadow-sm transition-shadow flex flex-col h-40"
              >
                <div
                  className="flex-1 bg-surface-subtle flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => handleAction(item, fileData, 'view')}
                >
                  {isImage && thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={displayName}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <Icon name={iconName} size={40} className="text-ink-400 opacity-50" />
                  )}
                </div>
                <div className="p-2 border-t border-border flex flex-col justify-center bg-white h-14">
                  <p className="text-xs font-medium text-text-primary truncate" title={displayName}>
                    {displayName}
                  </p>
                  <p className="text-[10px] text-text-secondary truncate">
                    {formatBytes(fileData.sizeBytes)}
                  </p>
                </div>

                {/* Overlay actions on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {!readOnly && (
                    <DropdownMenu
                      trigger={
                        <button className="p-1.5 rounded-md text-text-secondary bg-surface/80 hover:text-text-primary hover:bg-surface border border-border backdrop-blur-sm shadow-sm focus:outline-none">
                          <Icon name="more-vertical" size={14} />
                        </button>
                      }
                    >
                      <DropdownMenuItem
                        icon={<Icon name="eye" size={16} />}
                        onClick={() => handleAction(item, fileData, 'view')}
                      >
                        Ver / Abrir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Icon name="download" size={16} />}
                        onClick={() => handleAction(item, fileData, 'download')}
                      >
                        Descargar
                      </DropdownMenuItem>
                      {onRename && (
                        <DropdownMenuItem
                          icon={<Icon name="edit" size={16} />}
                          onClick={() => handleRename(item)}
                        >
                          Renombrar
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            icon={<Icon name="trash" size={16} />}
                            onClick={() => handleDelete(item)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewFileIndex !== null && (
        <FileViewer
          isOpen={viewFileIndex !== null}
          onClose={() => setViewFileIndex(null)}
          files={viewableFiles}
          initialIndex={viewFileIndex}
        />
      )}
    </div>
  );
}
