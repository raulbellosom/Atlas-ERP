import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Store de estado de sincronizacion pendiente.
 * Mantiene un contador de operaciones locales que aun no se han sincronizado
 * con el servidor (para modo offline-first futuro).
 */
const useSyncStore = create(
  persist(
    (set, get) => ({
      pendingCount: 0,
      lastSyncAt: null,

      /** Incrementa el contador de pendientes */
      addPending: (count = 1) =>
        set((s) => ({ pendingCount: s.pendingCount + count })),

      /** Decrementa el contador (sin bajar de 0) */
      removePending: (count = 1) =>
        set((s) => ({ pendingCount: Math.max(0, s.pendingCount - count) })),

      /** Marca sincronizacion completa */
      clearPending: () =>
        set({ pendingCount: 0, lastSyncAt: new Date().toISOString() }),

      /** Devuelve si hay pendientes */
      hasPending: () => get().pendingCount > 0,
    }),
    {
      name: "atlas-sync",
      partialize: (s) => ({
        pendingCount: s.pendingCount,
        lastSyncAt: s.lastSyncAt,
      }),
    },
  ),
);

export default useSyncStore;
