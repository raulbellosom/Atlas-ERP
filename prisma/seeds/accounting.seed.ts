import { AccountType, PostingMovementType, PrismaClient } from '@prisma/client';

const accounts = [
  { code: '1000', name: 'Activos', accountType: AccountType.ASSET },
  { code: '1100', name: 'Bancos y Caja', accountType: AccountType.ASSET },
  { code: '1200', name: 'Cuentas por Cobrar', accountType: AccountType.ASSET },
  { code: '2000', name: 'Pasivos', accountType: AccountType.LIABILITY },
  { code: '2100', name: 'Cuentas por Pagar', accountType: AccountType.LIABILITY },
  { code: '3000', name: 'Capital', accountType: AccountType.EQUITY },
  { code: '4000', name: 'Ingresos', accountType: AccountType.INCOME },
  { code: '4100', name: 'Ingresos por Ventas', accountType: AccountType.INCOME },
  { code: '5000', name: 'Gastos', accountType: AccountType.EXPENSE },
  { code: '5100', name: 'Gastos de Nómina', accountType: AccountType.EXPENSE },
  { code: '5200', name: 'Gastos Operativos', accountType: AccountType.EXPENSE },
];

const postingRuleDefinitions = [
  {
    categoryCode: 'SALE_INCOME',
    movementType: PostingMovementType.INCOME,
    debitCode: '1100',
    creditCode: '4100',
    description: 'Ingreso por venta',
  },
  {
    categoryCode: 'SUPPLIER_PAYMENT',
    movementType: PostingMovementType.EXPENSE,
    debitCode: '2100',
    creditCode: '1100',
    description: 'Pago a proveedor',
  },
  {
    categoryCode: 'PAYROLL_EXPENSE',
    movementType: PostingMovementType.EXPENSE,
    debitCode: '5100',
    creditCode: '1100',
    description: 'Gasto de nómina',
  },
  {
    categoryCode: 'OPERATING_EXPENSE',
    movementType: PostingMovementType.EXPENSE,
    debitCode: '5200',
    creditCode: '1100',
    description: 'Gasto operativo',
  },
  {
    categoryCode: 'INTERNAL_TRANSFER',
    movementType: PostingMovementType.TRANSFER,
    debitCode: '1100',
    creditCode: '1100',
    description: 'Transferencia interna entre cuentas',
  },
];

export async function seedAccounting(prisma: PrismaClient, organizationId: string): Promise<void> {
  console.log('[accounting-seed] Seeding chart of accounts...');

  const accountMap: Record<string, string> = {};

  for (const account of accounts) {
    const upserted = await prisma.chartOfAccount.upsert({
      where: { organizationId_code: { organizationId, code: account.code } },
      update: { name: account.name },
      create: { organizationId, ...account },
    });
    accountMap[account.code] = upserted.id;
    console.log(`  ✓ ${account.code} — ${account.name}`);
  }

  console.log('[accounting-seed] Seeding posting rules...');

  for (const rule of postingRuleDefinitions) {
    await prisma.postingRule.upsert({
      where: { organizationId_categoryCode: { organizationId, categoryCode: rule.categoryCode } },
      update: {},
      create: {
        organizationId,
        categoryCode: rule.categoryCode,
        movementType: rule.movementType,
        debitAccountId: accountMap[rule.debitCode]!,
        creditAccountId: accountMap[rule.creditCode]!,
        description: rule.description,
      },
    });
    console.log(`  ✓ ${rule.categoryCode}`);
  }

  console.log('[accounting-seed] Done.');
}
