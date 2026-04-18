/**
 * AttachmentViewerDesktop — visor de adjuntos para desktop.
 *
 * Muestra adjuntos sincronizados (URL MinIO) y adjuntos pendientes
 * (preview desde path local via convertFileSrc de Tauri).
 *
 * Task origen: T-1513 (Fase 15 Bloque 3)
 */

import { useEffect, useState } from "react";

function isPendingSync(attachment) {
  return attachment.status === "PENDING_SYNC" || Boolean(attachment.localPath);
}

function LocalPreview({ localPath, filename }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    import("@tauri-apps/api/core")
      .then(({ convertFileSrc }) => {
        setSrc(convertFileSrc(localPath));
      })
      .catch(() => setSrc(null));
  }, [localPath]);

  if (!src) {
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-2xl">
        📎
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={filename}
      className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}

function PendingSyncBadge() {
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
      Pendiente sync
    </span>
  );
}

/**
 * @param {{ attachments: Array<object>, isOffline: boolean }} props
 */
export function AttachmentViewerDesktop({ attachments = [], isOffline }) {
  if (attachments.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        {isOffline ? "Sin adjuntos sincronizados." : "Sin adjuntos."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {attachments.map((att, idx) => {
        const pending = isPendingSync(att);
        return (
          <div key={att.id ?? idx} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
            {pending ? (
              <LocalPreview localPath={att.localPath} filename={att.originalFilename ?? att.filename ?? "archivo"} />
            ) : (
              <a href={att.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={att.url}
                  alt={att.filename}
                  className="h-20 w-20 rounded-lg border border-slate-200 object-cover hover:opacity-90"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </a>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {att.filename ?? att.originalFilename ?? "Adjunto"}
              </p>
              {pending && <PendingSyncBadge />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
