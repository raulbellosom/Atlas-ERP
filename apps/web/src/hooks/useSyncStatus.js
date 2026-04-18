import useSyncStore from "@/store/sync.store";
import { useOnlineStatus } from "./useOnlineStatus";

/**
 * Hook combinado que expone el estado de sync y la conectividad.
 *
 * @returns {{
 *   isOnline: boolean,
 *   pendingCount: number,
 *   lastSyncAt: string | null,
 *   hasPending: boolean,
 *   addPending: (n?: number) => void,
 *   removePending: (n?: number) => void,
 *   clearPending: () => void,
 * }}
 */
export function useSyncStatus() {
  const isOnline = useOnlineStatus();
  const { pendingCount, lastSyncAt, addPending, removePending, clearPending } =
    useSyncStore();

  return {
    isOnline,
    pendingCount,
    lastSyncAt,
    hasPending: pendingCount > 0,
    addPending,
    removePending,
    clearPending,
  };
}
