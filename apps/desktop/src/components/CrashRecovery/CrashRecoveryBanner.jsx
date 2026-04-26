import { useState } from 'react';
import { desktopLogAppend } from '../../bridge/logs.bridge.js';

export function CrashRecoveryBanner({ onDismiss }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyPath() {
    try {
      const { appDataDir } = await import('@tauri-apps/api/path');
      const dir = await appDataDir();
      await navigator.clipboard.writeText(`${dir}logs`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  }

  function handleDismiss() {
    void desktopLogAppend({
      level: 'info',
      module: 'crash-recovery',
      message: 'CRASH_RECOVERY_BANNER_DISMISSED',
      contextJson: null,
    });
    onDismiss?.();
  }

  return (
    <div style={styles.banner} role="alert">
      <span style={styles.icon}>⚠️</span>
      <div style={styles.content}>
        <strong>La app se cerró inesperadamente en la sesión anterior.</strong>
        <p style={styles.message}>
          Los datos offline están intactos. Si el problema persiste, contacta a soporte
          y proporciona los logs de la aplicación.
        </p>
        <div style={styles.actions}>
          <button style={styles.copyBtn} onClick={handleCopyPath}>
            {copied ? '¡Copiado!' : 'Copiar ruta de logs'}
          </button>
          <button style={styles.dismissBtn} onClick={handleDismiss}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  banner: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: 8,
    padding: '0.875rem 1rem',
    margin: '0.75rem',
  },
  icon: { fontSize: '1.25rem', flexShrink: 0 },
  content: { flex: 1 },
  message: { margin: '0.25rem 0 0.75rem', color: '#78350f', fontSize: '0.85rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  copyBtn: {
    padding: '0.35rem 0.85rem',
    background: '#f59e0b',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  dismissBtn: {
    padding: '0.35rem 0.85rem',
    background: 'transparent',
    color: '#92400e',
    border: '1px solid #f59e0b',
    borderRadius: 5,
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};
