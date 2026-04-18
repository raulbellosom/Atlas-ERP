import { useEffect, useMemo, useState } from "react";
import { getDesktopNetworkStatus } from "../bridge/network.bridge.js";
import { getDesktopPaths, prepareDesktopDataDirs } from "../bridge/paths.bridge.js";
import { sqliteApplyMigrations, sqliteInit, sqliteListMigrations } from "../bridge/sqlite.bridge.js";
import { checkForUpdates, getUpdaterStatus } from "../bridge/updater.bridge.js";
import {
  listRecentLogs,
  logError,
  logInfo,
  rotateLogs,
} from "../modules/logs/localDesktopLogRepository.js";
import {
  countPendingSyncChanges,
  recoverSyncQueueAfterRestart,
  summarizeSyncQueue,
} from "../modules/sync/localSyncQueueRepository.js";
import { countPendingConflicts } from "../modules/sync/localConflictRepository.js";
import { enqueueLocalSyncItem } from "../modules/sync/localSyncEnqueueService.js";
import { countPendingSyncItems } from "../modules/sync/localSyncItemsRepository.js";
import {
  canBootOffline,
  clearDesktopSession,
  hasActiveSession,
  loadCachedProfile,
  loadDesktopSession,
  saveCachedProfile,
  saveDesktopSession,
} from "../modules/session/localDesktopSessionRepository.js";

function resolveBootMode({ session, cachedProfile, networkOnline }) {
  if (hasActiveSession(session)) {
    return "authenticated";
  }

  if (!networkOnline && canBootOffline(session, cachedProfile)) {
    return "offline";
  }

  return "guest";
}

export function useDesktopBootstrap() {
  const [state, setState] = useState({
    bootMode: "initializing",
    error: null,
    paths: null,
    migrations: [],
    appliedMigrations: [],
    queueRecovered: 0,
    queueSummary: null,
    queuePendingCount: 0,
    syncItemsPendingCount: 0,
    network: null,
    updaterStatus: null,
    updaterCheck: null,
    session: null,
    cachedProfile: null,
    pendingConflicts: 0,
    recentLogs: [],
  });

  useEffect(() => {
    let active = true;

    async function bootstrapDesktop() {
      try {
        await logInfo("Inicio de bootstrap desktop.");
        await prepareDesktopDataDirs();
        const paths = await getDesktopPaths();

        await sqliteInit();
        const appliedMigrations = await sqliteApplyMigrations();
        const migrations = await sqliteListMigrations();

        const queueRecovered = await recoverSyncQueueAfterRestart();
        const queueSummary = await summarizeSyncQueue();
        const queuePendingCount = await countPendingSyncChanges();
        const syncItemsPendingCount = await countPendingSyncItems();
        const pendingConflicts = await countPendingConflicts();

        const network = await getDesktopNetworkStatus();
        const updaterStatus = await getUpdaterStatus();
        const updaterCheck = await checkForUpdates();

        const session = await loadDesktopSession();
        const cachedProfile = await loadCachedProfile();
        const bootMode = resolveBootMode({
          session,
          cachedProfile,
          networkOnline: Boolean(network?.online),
        });
        await logInfo("Bootstrap desktop completado.", {
          bootMode,
          queueRecovered,
          queuePendingCount,
          syncItemsPendingCount,
          pendingConflicts,
          online: Boolean(network?.online),
        });

        await rotateLogs(2000);
        const recentLogs = await listRecentLogs(20);

        if (!active) {
          return;
        }

        setState({
          bootMode,
          error: null,
          paths,
          migrations,
          appliedMigrations,
          queueRecovered,
          queueSummary,
          queuePendingCount,
          syncItemsPendingCount,
          network,
          updaterStatus,
          updaterCheck,
          session,
          cachedProfile,
          pendingConflicts,
          recentLogs,
        });
      } catch (error) {
        await logError("Error durante bootstrap desktop.", {
          message: error instanceof Error ? error.message : String(error),
        });
        if (!active) {
          return;
        }

        setState((prev) => ({
          ...prev,
          bootMode: "error",
          error: error instanceof Error ? error.message : String(error),
          recentLogs: prev.recentLogs,
        }));
      }
    }

    bootstrapDesktop();
    return () => {
      active = false;
    };
  }, []);

  const actions = useMemo(
    () => ({
      async persistSession(sessionPayload) {
        const storedSession = await saveDesktopSession(sessionPayload);
        if (sessionPayload?.user) {
          await saveCachedProfile(sessionPayload.user);
        }

        setState((prev) => ({
          ...prev,
          session: storedSession,
          cachedProfile: sessionPayload?.user ?? prev.cachedProfile,
          bootMode: hasActiveSession(storedSession) ? "authenticated" : prev.bootMode,
        }));
      },

      async clearSession() {
        await clearDesktopSession();
        setState((prev) => ({
          ...prev,
          session: null,
          cachedProfile: null,
          bootMode: prev.network?.online ? "guest" : "offline",
        }));
      },

      async enqueueSyncItemDraft(draft) {
        const result = await enqueueLocalSyncItem(draft);
        const syncItemsPendingCount = await countPendingSyncItems();
        setState((prev) => ({
          ...prev,
          syncItemsPendingCount,
        }));
        return result;
      },
    }),
    [],
  );

  return { state, actions };
}
