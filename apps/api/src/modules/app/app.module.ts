import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { RequestAuditInterceptor } from '../../common/interceptors/request-audit.interceptor';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ModuleInstallGuard } from '../../common/guards/module-install.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ScopeGuard } from '../../common/guards/scope.guard';
import { SecurityModule } from '../../common/security/security.module';
import { ApiConfigModule } from '../../config/config.module';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { BalanceSnapshotsModule } from '../balance-snapshots/balance-snapshots.module';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';
import { BranchesModule } from '../branches/branches.module';
import { FeatureFlagsModule } from '../feature-flags/feature-flags.module';
import { FinancialMovementsModule } from '../financial-movements/financial-movements.module';
import { HealthModule } from '../health/health.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PayablesLiteModule } from '../payables-lite/payables-lite.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { ReconciliationModule } from '../reconciliation/reconciliation.module';
import { ReceivablesLiteModule } from '../receivables-lite/receivables-lite.module';
import { RolesModule } from '../roles/roles.module';
import { SettingsModule } from '../settings/settings.module';
import { SessionsModule } from '../sessions/sessions.module';
import { MetricsModule } from '../metrics/metrics.module';
import { SyncModule } from '../sync/sync.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { TransfersModule } from '../transfers/transfers.module';
import { UsersModule } from '../users/users.module';
import { AccountingModule } from '../accounting/accounting.module';
import { HrModule } from '../hr/hr.module';
import { ModuleStoreModule } from '../module-store/module-store.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['LOG_LEVEL'] ?? 'info',
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        serializers: {
          req(req: Record<string, unknown>) {
            const { authorization: _auth, ...safeHeaders } =
              (req['headers'] as Record<string, unknown>) ?? {};
            return { ...req, headers: safeHeaders };
          },
        },
        customProps: (req, _res) => {
          const request = req as unknown as Record<string, unknown>;
          const user = request['user'] as Record<string, unknown> | undefined;
          return {
            traceId:
              (request['headers'] as Record<string, string>)?.['x-trace-id'] ?? crypto.randomUUID(),
            userId: user?.['sub'],
            organizationId: user?.['organizationId'],
          };
        },
      },
    }),
    ApiConfigModule,
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    PrismaModule,
    SecurityModule,
    StorageModule,
    HealthModule,
    AuthModule,
    AttachmentsModule,
    AuditModule,
    BankAccountsModule,
    FinancialMovementsModule,
    TransfersModule,
    ReconciliationModule,
    BalanceSnapshotsModule,
    ReceivablesLiteModule,
    PayablesLiteModule,
    BranchesModule,
    FeatureFlagsModule,
    NotificationsModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    OrganizationsModule,
    SessionsModule,
    SettingsModule,
    SyncModule,
    TelemetryModule,
    MetricsModule,
    AccountingModule,
    HrModule,
    ModuleStoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ScopeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ModuleInstallGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestAuditInterceptor,
    },
  ],
})
export class AppModule {}
