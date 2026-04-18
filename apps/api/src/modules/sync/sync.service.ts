import {
  ConflictResolutionAction,
  ConflictStatus,
  Prisma,
  SourceType,
  SyncItemStatus,
  SyncLogLevel,
  SyncLogStatus,
  SyncSessionStatus,
} from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCode } from '../../common/errors';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { resolvePaginationQuery } from '../../common/pagination';
import { AuditService } from '../audit/audit.service';
import { ListConflictsQueryDto } from './dto/list-conflicts.query.dto';
import { ListSyncSessionsQueryDto } from './dto/list-sync-sessions.query.dto';
import { SyncBatchItemDto } from './dto/sync-batch-item.dto';
import { SyncBatchRequestDto } from './dto/sync-batch-request.dto';

// ─── Selectores de proyección ──────────────────────────────────────────────

const SYNC_SESSION_SELECT = {
  id: true,
  organizationId: true,
  deviceRegistryId: true,
  status: true,
  itemsTotal: true,
  itemsSynced: true,
  itemsConflicted: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SyncSessionSelect;

const CONFLICT_RECORD_SELECT = {
  id: true,
  syncItemId: true,
  organizationId: true,
  entityType: true,
  entityId: true,
  status: true,
  resolution: true,
  resolvedById: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ConflictRecordSelect;

const CONFLICT_RECORD_DETAIL_SELECT = {
  id: true,
  syncItemId: true,
  organizationId: true,
  entityType: true,
  entityId: true,
  localPayload: true,
  serverPayload: true,
  status: true,
  resolution: true,
  resolvedById: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ConflictRecordSelect;

type SyncSessionSummary = Prisma.SyncSessionGetPayload<{
  select: typeof SYNC_SESSION_SELECT;
}>;

type ConflictSummary = Prisma.ConflictRecordGetPayload<{
  select: typeof CONFLICT_RECORD_SELECT;
}>;

type ConflictDetail = Prisma.ConflictRecordGetPayload<{
  select: typeof CONFLICT_RECORD_DETAIL_SELECT;
}>;

// ─── T-1024: Comparador de versiones ──────────────────────────────────────

/**
 * Calcula un hash FNV-1a de 32 bits del payload serializado de forma estable.
 * No es criptográfico — es sólo para detectar cambios de contenido.
 */
function computePayloadHash(payload: Record<string, unknown>): string {
  const stable = JSON.stringify(payload, Object.keys(payload).sort());
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < stable.length; i++) {
    hash ^= stable.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
    hash >>>= 0; // unsigned 32-bit
  }
  return hash.toString(16).padStart(8, '0');
}

export interface PayloadDiff {
  hasConflict: boolean;
  localHash: string;
  serverHash: string;
  changedKeys: string[];
}

/**
 * Compara dos payloads y detecta si hay diferencias de contenido.
 * Retorna los campos que difieren para facilitar la revisión manual.
 */
export function comparePayloads(
  local: Record<string, unknown>,
  server: Record<string, unknown>,
): PayloadDiff {
  const localHash = computePayloadHash(local);
  const serverHash = computePayloadHash(server);
  const hasConflict = localHash !== serverHash;

  const changedKeys = hasConflict
    ? Array.from(
        new Set([...Object.keys(local), ...Object.keys(server)]),
      ).filter(
        (k) => JSON.stringify(local[k]) !== JSON.stringify(server[k]),
      )
    : [];

  return { hasConflict, localHash, serverHash, changedKeys };
}

// ─── T-1025: Estrategias formales de auto-resolución ──────────────────────

export type AutoResolveStrategy = 'APPROVE_LOCAL' | 'KEEP_SERVER' | 'none';

/**
 * Mapa de estrategia de auto-resolución por entidad.
 * 'APPROVE_LOCAL': el cambio local gana (LWW — last write wins).
 * 'KEEP_SERVER':   el estado del servidor gana (reset local).
 * 'none':          requiere revisión manual; no se auto-resuelve.
 *
 * Nota: las operaciones 'delete' NUNCA se auto-resuelven
 * independientemente de la estrategia aquí configurada.
 */
const ENTITY_RESOLVE_STRATEGIES: Record<string, AutoResolveStrategy> = {
  setting: 'APPROVE_LOCAL',
  feature_flag: 'APPROVE_LOCAL',
  device_registry: 'APPROVE_LOCAL',
  attachment: 'none',
  bank_account: 'none',
  financial_movement: 'none',
  financial_transfer: 'none',
  receivable: 'none',
  payable: 'none',
  reconciliation_session: 'none',
  financial_account: 'none',
};

/**
 * T-1025: Retorna la estrategia de auto-resolución efectiva.
 * Operaciones 'delete' retornan siempre 'none' para evitar pérdida silenciosa.
 */
export function getAutoResolveStrategy(
  entity: string,
  operation: string,
): AutoResolveStrategy {
  if (operation === 'delete') return 'none';
  return ENTITY_RESOLVE_STRATEGIES[entity] ?? 'none';
}

// ─── T-1026: Entidades con conflictos peligrosos ───────────────────────────

/**
 * Entidades cuyas modificaciones tienen implicaciones financieras directas.
 * Sus conflictos se marcan IN_REVIEW en lugar de OPEN, indicando que
 * requieren revisión activa por un actor humano antes de cualquier acción.
 */
const DANGEROUS_ENTITIES = new Set<string>([
  'bank_account',
  'financial_movement',
  'financial_transfer',
  'receivable',
  'payable',
  'reconciliation_session',
  'financial_account',
]);

/**
 * T-1026: Determina si un conflicto es peligroso (implica riesgo financiero).
 * Las operaciones 'delete' en entidades peligrosas no aplican — ya que
 * getAutoResolveStrategy retorna 'none' antes de llegar aquí.
 */
export function isDangerousMerge(entity: string, operation: string): boolean {
  return DANGEROUS_ENTITIES.has(entity) && operation !== 'delete';
}

// ─── T-1027: Diff mínimo entre registros ─────────────────────────────────

export interface MinimalDiff {
  added: string[];
  removed: string[];
  changed: Record<string, { from: unknown; to: unknown }>;
}

/**
 * T-1027: Calcula el diff mínimo campo a campo entre dos payloads.
 * - added:   campos presentes en local pero no en server.
 * - removed: campos presentes en server pero no en local.
 * - changed: campos en ambos con valores distintos ({from: server, to: local}).
 */
export function computeMinimalDiff(
  local: Record<string, unknown>,
  server: Record<string, unknown>,
): MinimalDiff {
  const allKeys = new Set([...Object.keys(local), ...Object.keys(server)]);
  const added: string[] = [];
  const removed: string[] = [];
  const changed: Record<string, { from: unknown; to: unknown }> = {};

  for (const key of allKeys) {
    const inLocal = Object.prototype.hasOwnProperty.call(local, key);
    const inServer = Object.prototype.hasOwnProperty.call(server, key);

    if (inLocal && !inServer) {
      added.push(key);
    } else if (!inLocal && inServer) {
      removed.push(key);
    } else if (JSON.stringify(local[key]) !== JSON.stringify(server[key])) {
      changed[key] = { from: server[key], to: local[key] };
    }
  }

  return { added, removed, changed };
}

// ─── Interfaces públicas ───────────────────────────────────────────────────

export interface SyncSummaryResponse {
  activeSessions: number;
  openConflicts: number;
}

export interface SyncBatchItemResult {
  itemId: string;
  status: 'synced' | 'idempotent' | 'conflict' | 'invalid' | 'error';
  message?: string;
  conflictId?: string;
}

export interface SyncBatchResult {
  sessionId: string;
  results: SyncBatchItemResult[];
  synced: number;
  conflicted: number;
  errors: number;
}

export interface ProcessBatchInput {
  dto: SyncBatchRequestDto;
  organizationId: string;
  actorId: string;
}

export interface ResolveConflictInput {
  action: ConflictResolutionAction;
  reason?: string;
  resolvedById: string;
  organizationId: string;
  source?: SourceType;
}

// ─── Servicio ──────────────────────────────────────────────────────────────

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ── Consultas generales ─────────────────────────────────────────────────

  async findSessions(
    query: ListSyncSessionsQueryDto,
  ): Promise<SyncSessionSummary[]> {
    const pagination = resolvePaginationQuery(query, { limit: 50, maxLimit: 100 });

    return this.prisma.syncSession.findMany({
      where: {
        ...(query.organizationId ? { organizationId: query.organizationId } : {}),
        ...(query.deviceRegistryId
          ? { deviceRegistryId: query.deviceRegistryId }
          : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      skip: pagination.skip,
      take: pagination.limit,
      select: SYNC_SESSION_SELECT,
      orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
    });
  }

  async findSessionById(id: string): Promise<SyncSessionSummary | null> {
    return this.prisma.syncSession.findUnique({
      where: { id },
      select: SYNC_SESSION_SELECT,
    });
  }

  async findOpenConflicts(organizationId?: string): Promise<ConflictSummary[]> {
    return this.prisma.conflictRecord.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        status: ConflictStatus.OPEN,
      },
      select: CONFLICT_RECORD_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  /**
   * T-1028: Lista conflictos con paginación y filtros por entityType y status.
   * Permite explorar el historial completo del centro de conflictos.
   */
  async findConflicts(
    query: ListConflictsQueryDto,
  ): Promise<ConflictSummary[]> {
    const pagination = resolvePaginationQuery(query, { limit: 50, maxLimit: 200 });

    return this.prisma.conflictRecord.findMany({
      where: {
        ...(query.organizationId ? { organizationId: query.organizationId } : {}),
        ...(query.entityType ? { entityType: query.entityType } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      skip: pagination.skip,
      take: pagination.limit,
      select: CONFLICT_RECORD_SELECT,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  /**
   * T-1028: Retorna un conflicto por ID incluyendo payloads completos
   * (localPayload y serverPayload) para facilitar la revisión del diff.
   */
  async findConflictById(id: string): Promise<ConflictDetail | null> {
    return this.prisma.conflictRecord.findUnique({
      where: { id },
      select: CONFLICT_RECORD_DETAIL_SELECT,
    });
  }

  async getSummary(organizationId?: string): Promise<SyncSummaryResponse> {
    const activeSessions = await this.prisma.syncSession.count({
      where: {
        ...(organizationId ? { organizationId } : {}),
        status: {
          in: [SyncSessionStatus.QUEUED, SyncSessionStatus.IN_PROGRESS],
        },
      },
    });

    const openConflicts = await this.prisma.conflictRecord.count({
      where: {
        ...(organizationId ? { organizationId } : {}),
        status: ConflictStatus.OPEN,
      },
    });

    return { activeSessions, openConflicts };
  }

  // ── T-1019/T-1020/T-1021/T-1022/T-1023: Procesamiento de batch ─────────

  /**
   * Procesa un batch de items de sincronización enviados por un cliente desktop.
   * Crea/cierra SyncSession, procesa cada item con detección de conflictos,
   * auto-resolución segura y SyncLogs en cada paso.
   */
  async processBatch(input: ProcessBatchInput): Promise<SyncBatchResult> {
    const { dto, organizationId, actorId } = input;
    const deviceRegistryId = dto.deviceRegistryId ?? actorId;

    // T-1019: Crear SyncSession
    const session = await this.prisma.syncSession.create({
      data: {
        organizationId,
        deviceRegistryId,
        status: SyncSessionStatus.IN_PROGRESS,
        itemsTotal: dto.items.length,
        itemsSynced: 0,
        itemsConflicted: 0,
      },
      select: { id: true },
    });

    // T-1023: Log de inicio de sesión
    await this.writeSyncLog({
      organizationId,
      sessionId: session.id,
      deviceRegistryId,
      level: SyncLogLevel.INFO,
      status: SyncLogStatus.PENDING,
      event: 'SESSION_STARTED',
      message: `Sesión de sync iniciada con ${dto.items.length} item(s).`,
      metadata: { itemsTotal: dto.items.length, actorId },
    });

    const results: SyncBatchItemResult[] = [];
    let synced = 0;
    let conflicted = 0;
    let errors = 0;

    for (const item of dto.items) {
      const result = await this.processSingleItem(
        item,
        organizationId,
        session.id,
        deviceRegistryId,
        actorId,
      );
      results.push(result);

      if (result.status === 'synced' || result.status === 'idempotent') {
        synced += 1;
      } else if (result.status === 'conflict') {
        conflicted += 1;
      } else {
        errors += 1;
      }
    }

    // T-1019: Cerrar SyncSession con estado diferenciado
    const finalStatus =
      conflicted > 0
        ? SyncSessionStatus.COMPLETED_WITH_CONFLICTS
        : SyncSessionStatus.COMPLETED;

    await this.prisma.syncSession.update({
      where: { id: session.id },
      data: {
        status: finalStatus,
        itemsSynced: synced,
        itemsConflicted: conflicted,
        completedAt: new Date(),
      },
    });

    // T-1023: Log de cierre de sesión
    await this.writeSyncLog({
      organizationId,
      sessionId: session.id,
      deviceRegistryId,
      level: errors > 0 ? SyncLogLevel.WARN : SyncLogLevel.INFO,
      status: errors > 0 ? SyncLogStatus.WARNING : SyncLogStatus.SUCCESS,
      event: 'SESSION_COMPLETED',
      message: `Sesión de sync completada. Sync: ${synced}, Conflictos: ${conflicted}, Errores: ${errors}.`,
      metadata: { synced, conflicted, errors, finalStatus },
    });

    await this.auditService.auditAction({
      organizationId,
      actorId,
      action: 'SYNC_BATCH_PROCESSED',
      entityType: 'sync_session',
      entityId: session.id,
      origin: 'DESKTOP',
      result: 'SUCCESS',
      metadata: { itemsTotal: dto.items.length, synced, conflicted, errors },
    });

    return { sessionId: session.id, results, synced, conflicted, errors };
  }

  /**
   * Procesa un único item del batch.
   * T-1020: persistencia correcta de SyncItem con status semántico.
   * T-1021: detección de conflictos y creación de ConflictRecord.
   * T-1022: auto-resolución de conflictos seguros.
   * T-1023: SyncLog por item.
   */
  private async processSingleItem(
    item: SyncBatchItemDto,
    organizationId: string,
    sessionId: string,
    deviceRegistryId: string,
    actorId: string,
  ): Promise<SyncBatchItemResult> {
    let syncItemId: string | null = null;

    try {
      // T-1020: Idempotencia — un item ya SYNCED/APPLIED para mismo entity+operation
      const existing = await this.prisma.syncItem.findFirst({
        where: {
          organizationId,
          entityType: item.entity,
          entityId: item.entityId,
          operation: item.operation,
          status: { in: [SyncItemStatus.SYNCED, SyncItemStatus.APPLIED] },
        },
        select: { id: true, payload: true },
        orderBy: { processedAt: 'desc' },
      });

      if (existing) {
        const serverPayload = (existing.payload as Record<string, unknown>) ?? {};
        const diff = comparePayloads(item.payload, serverPayload);

        if (!diff.hasConflict) {
          // Mismo contenido — idempotente, no crear duplicado
          await this.writeSyncLog({
            organizationId,
            sessionId,
            deviceRegistryId,
            level: SyncLogLevel.DEBUG,
            status: SyncLogStatus.SUCCESS,
            event: 'ITEM_IDEMPOTENT',
            message: `Item idempotente: ${item.entity}/${item.entityId} [${item.operation}]`,
            metadata: { itemId: item.itemId, idempotencyKey: item.idempotencyKey },
          });

          return {
            itemId: item.itemId,
            status: 'idempotent',
            message: 'Item ya procesado con el mismo contenido.',
          };
        }

        // T-1021: Contenido diferente → conflicto real
        const syncItem = await this.prisma.syncItem.create({
          data: {
            sessionId,
            organizationId,
            operation: item.operation,
            entityType: item.entity,
            entityId: item.entityId,
            payload: item.payload as Prisma.InputJsonValue,
            status: SyncItemStatus.CONFLICT_DETECTED,
            processedAt: new Date(),
          },
          select: { id: true },
        });
        syncItemId = syncItem.id;

        // T-1027: Calcular diff mínimo para metadatos del conflicto
        const minDiff = computeMinimalDiff(item.payload, serverPayload);

        // T-1025: Determinar estrategia de auto-resolución
        const strategy = getAutoResolveStrategy(item.entity, item.operation);

        // T-1026: Detectar si el merge es peligroso → IN_REVIEW
        const dangerous = isDangerousMerge(item.entity, item.operation);
        const conflictStatus = dangerous
          ? ConflictStatus.IN_REVIEW
          : ConflictStatus.OPEN;

        const conflictRecord = await this.prisma.conflictRecord.create({
          data: {
            syncItemId: syncItem.id,
            organizationId,
            entityType: item.entity,
            entityId: item.entityId,
            localPayload: item.payload as Prisma.InputJsonValue,
            serverPayload: serverPayload as Prisma.InputJsonValue,
            status: conflictStatus,
          },
          select: { id: true },
        });

        // T-1025: Auto-resolver si la estrategia lo permite y no es peligroso
        if (!dangerous && strategy !== 'none') {
          await this.autoResolveConflict(
            conflictRecord.id,
            syncItem.id,
            organizationId,
            actorId,
          );

          await this.writeSyncLog({
            organizationId,
            sessionId,
            syncItemId: syncItem.id,
            conflictRecordId: conflictRecord.id,
            deviceRegistryId,
            level: SyncLogLevel.INFO,
            status: SyncLogStatus.SUCCESS,
            event: 'ITEM_CONFLICT_AUTO_RESOLVED',
            message: `Conflicto auto-resuelto (${strategy}): ${item.entity}/${item.entityId}`,
            metadata: {
              itemId: item.itemId,
              strategy,
              changedKeys: diff.changedKeys,
              minDiff,
            },
          });

          return {
            itemId: item.itemId,
            status: 'synced',
            message: `Conflicto resuelto automáticamente (${strategy === 'APPROVE_LOCAL' ? 'local gana' : 'servidor gana'}).`,
            conflictId: conflictRecord.id,
          };
        }

        // T-1026: Log diferenciado para conflictos peligrosos vs normales
        await this.writeSyncLog({
          organizationId,
          sessionId,
          syncItemId: syncItem.id,
          conflictRecordId: conflictRecord.id,
          deviceRegistryId,
          level: dangerous ? SyncLogLevel.ERROR : SyncLogLevel.WARN,
          status: SyncLogStatus.WARNING,
          event: dangerous ? 'ITEM_CONFLICT_DANGEROUS' : 'ITEM_CONFLICT',
          message: dangerous
            ? `Conflicto peligroso en ${item.entity}/${item.entityId} [${item.operation}] — IN_REVIEW, requiere autorización humana.`
            : `Conflicto detectado en ${item.entity}/${item.entityId} [${item.operation}] — requiere revisión manual.`,
          metadata: {
            itemId: item.itemId,
            changedKeys: diff.changedKeys,
            minDiff,
            dangerous,
          },
        });

        return {
          itemId: item.itemId,
          status: 'conflict',
          message: dangerous
            ? `Conflicto peligroso (requiere autorización): ${diff.changedKeys.join(', ') || '(sin detalles)'}`
            : `Conflicto en campos: ${diff.changedKeys.join(', ') || '(sin detalles)'}`,
          conflictId: conflictRecord.id,
        };
      }

      // T-1020: Sin conflicto — crear SyncItem con status=APPLIED
      const syncItem = await this.prisma.syncItem.create({
        data: {
          sessionId,
          organizationId,
          operation: item.operation,
          entityType: item.entity,
          entityId: item.entityId,
          payload: item.payload as Prisma.InputJsonValue,
          status: SyncItemStatus.APPLIED,
          processedAt: new Date(),
        },
        select: { id: true },
      });
      syncItemId = syncItem.id;

      // T-1023: Log de item aplicado
      await this.writeSyncLog({
        organizationId,
        sessionId,
        syncItemId: syncItem.id,
        deviceRegistryId,
        level: SyncLogLevel.INFO,
        status: SyncLogStatus.SUCCESS,
        event: 'ITEM_APPLIED',
        message: `Item aplicado: ${item.entity}/${item.entityId} [${item.operation}]`,
        metadata: { itemId: item.itemId, idempotencyKey: item.idempotencyKey },
      });

      return { itemId: item.itemId, status: 'synced' };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido al procesar item.';

      // T-1020: Marcar SyncItem como FAILED si ya fue creado
      if (syncItemId) {
        await this.prisma.syncItem
          .update({
            where: { id: syncItemId },
            data: { status: SyncItemStatus.FAILED, errorMessage: message },
          })
          .catch(() => {});
      }

      // T-1023: Log de error
      await this.writeSyncLog({
        organizationId,
        sessionId,
        syncItemId: syncItemId ?? undefined,
        deviceRegistryId,
        level: SyncLogLevel.ERROR,
        status: SyncLogStatus.ERROR,
        event: 'ITEM_FAILED',
        message: `Error al procesar ${item.entity}/${item.entityId}: ${message}`,
        metadata: { itemId: item.itemId, error: message },
      });

      return { itemId: item.itemId, status: 'error', message };
    }
  }

  /**
   * T-1022: Auto-resolución de conflicto seguro con estrategia APPROVE_LOCAL.
   * Actualiza ConflictRecord → RESOLVED, SyncItem → APPLIED,
   * y crea ConflictResolution.
   */
  private async autoResolveConflict(
    conflictRecordId: string,
    syncItemId: string,
    organizationId: string,
    resolvedById: string,
  ): Promise<void> {
    const SYSTEM_ACTOR = resolvedById;

    await this.prisma.$transaction([
      this.prisma.conflictRecord.update({
        where: { id: conflictRecordId },
        data: {
          status: ConflictStatus.RESOLVED,
          resolution: ConflictResolutionAction.AUTO_RESOLVED,
          resolvedById: SYSTEM_ACTOR,
          resolvedAt: new Date(),
        },
      }),
      this.prisma.conflictResolution.create({
        data: {
          conflictRecordId,
          organizationId,
          action: ConflictResolutionAction.AUTO_RESOLVED,
          resolvedById: SYSTEM_ACTOR,
          source: SourceType.SYNC_ENGINE,
          reason: 'Auto-resolved: entidad de bajo riesgo (LWW — local wins).',
        },
      }),
      this.prisma.syncItem.update({
        where: { id: syncItemId },
        data: { status: SyncItemStatus.APPLIED },
      }),
    ]);
  }

  /**
   * T-1023: Helper no-blocking para escribir SyncLog.
   * Los fallos de logging no deben interrumpir el procesamiento.
   */
  private async writeSyncLog(params: {
    organizationId: string;
    sessionId?: string;
    syncItemId?: string;
    conflictRecordId?: string;
    deviceRegistryId?: string;
    level: SyncLogLevel;
    status?: SyncLogStatus;
    event: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.prisma.syncLog
      .create({
        data: {
          organizationId: params.organizationId,
          sessionId: params.sessionId ?? null,
          syncItemId: params.syncItemId ?? null,
          conflictRecordId: params.conflictRecordId ?? null,
          deviceRegistryId: params.deviceRegistryId ?? null,
          source: SourceType.SYNC_ENGINE,
          level: params.level,
          status: params.status ?? null,
          event: params.event,
          message: params.message,
          metadata: (params.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        },
      })
      .catch(() => {
        // Logging nunca interrumpe el flujo principal
      });
  }

  // ── Resolución manual de conflictos ────────────────────────────────────

  async resolveConflict(
    conflictId: string,
    input: ResolveConflictInput,
  ): Promise<ConflictSummary> {
    const resolutionSource = input.source ?? SourceType.WEB;
    const conflict = await this.prisma.conflictRecord.findUnique({
      where: { id: conflictId },
      select: {
        id: true,
        organizationId: true,
        entityType: true,
        entityId: true,
        status: true,
      },
    });

    if (!conflict) {
      throw new NotFoundException({
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        message: 'Conflicto no encontrado.',
        error: 'Not Found',
      });
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.conflictRecord.update({
        where: { id: conflictId },
        data: {
          status: ConflictStatus.RESOLVED,
          resolution: input.action,
          resolvedById: input.resolvedById,
          resolvedAt: new Date(),
        },
        select: CONFLICT_RECORD_SELECT,
      }),
      this.prisma.conflictResolution.create({
        data: {
          conflictRecordId: conflictId,
          organizationId: input.organizationId,
          action: input.action,
          resolvedById: input.resolvedById,
          source: resolutionSource,
          reason: input.reason ?? null,
        },
      }),
    ]);

    await this.writeSyncLog({
      organizationId: input.organizationId,
      conflictRecordId: conflictId,
      level: SyncLogLevel.INFO,
      status: SyncLogStatus.SUCCESS,
      event: 'CONFLICT_RESOLVED_MANUAL',
      message: `Conflicto ${conflictId} resuelto manualmente con acción ${input.action}.`,
      metadata: {
        source: resolutionSource,
        reason: input.reason ?? null,
        resolvedById: input.resolvedById,
      },
    });

    await this.auditService.auditAction({
      organizationId: input.organizationId,
      actorId: input.resolvedById,
      action: 'CONFLICT_RESOLVED',
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      origin: resolutionSource,
      result: 'SUCCESS',
      before: { status: conflict.status },
      after: { status: ConflictStatus.RESOLVED, resolution: input.action },
      metadata: { conflictId, reason: input.reason, source: resolutionSource },
    });

    return updated;
  }
}
