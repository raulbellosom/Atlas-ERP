/**
 * Seed de datos de prueba realistas para el mÃ³dulo FinOps.
 *
 * Simula 3 meses de actividad (eneroâ€“marzo 2026) de la empresa ficticia
 * "Distribuidora Alfa S.A. de C.V." con 5 cuentas, 150 movimientos y 15 transferencias.
 *
 * Uso: incluir en el seed de test o ejecutar de forma aislada contra `atlaserp_test`.
 * Task origen: T-1708 (Fase 17 Bloque 2)
 */

import type { PrismaClient } from '@prisma/client';

const ORG_SLUG = 'distribuidora-alfa-test';
const ORG_NAME = 'Distribuidora Alfa S.A. de C.V.';

const BANK_ACCOUNTS = [
  {
    slug: 'cta-001',
    name: 'Cuenta Principal BBVA',
    bankName: 'BBVA',
    mask: '****0011',
    currency: 'MXN',
    balance: '500000.00',
  },
  {
    slug: 'cta-002',
    name: 'Cuenta NÃ³mina HSBC',
    bankName: 'HSBC',
    mask: '****0022',
    currency: 'MXN',
    balance: '150000.00',
  },
  {
    slug: 'cta-003',
    name: 'Cuenta Operativa Santander',
    bankName: 'Santander',
    mask: '****0033',
    currency: 'MXN',
    balance: '75000.00',
  },
  {
    slug: 'cta-004',
    name: 'Cuenta USD Chase',
    bankName: 'Chase',
    mask: '****0044',
    currency: 'USD',
    balance: '25000.00',
  },
  {
    slug: 'cta-005',
    name: 'Cuenta InversiÃ³n Banamex',
    bankName: 'Banamex',
    mask: '****0055',
    currency: 'MXN',
    balance: '1200000.00',
  },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomAmount(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CREDIT_DESCRIPTIONS = [
  'Pago de cliente Empresa Gamma',
  'Ingreso por venta contado',
  'Transferencia recibida de cliente Delta',
  'Intereses bancarios generados',
  'Pago anticipado factura F-2026-001',
  'Cobro de cheque #4481',
  'DepÃ³sito en efectivo sucursal',
  'LiquidaciÃ³n de adeudo cliente Sigma',
];

const DEBIT_DESCRIPTIONS = [
  'Pago a proveedor Materiales Omega',
  'NÃ³mina quincenal enero',
  'Pago de renta oficinas',
  'Servicio de mensajerÃ­a DHL',
  'Pago impuesto ISR enero',
  'ComisiÃ³n bancaria mensual',
  'Pago de servicios TELMEX',
  'Compra de insumos de oficina',
  'Pago proveedor LogÃ­stica Beta',
  'Cuota IMSS mensual',
];

export async function seedTestFinopsData(prisma: PrismaClient): Promise<void> {
  console.log('[test-seed][finops] Iniciando seed de datos de prueba realistas...');

  const org = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    update: { name: ORG_NAME, isActive: true, deletedAt: null },
    create: { name: ORG_NAME, slug: ORG_SLUG, isActive: true },
    select: { id: true },
  });
  const orgId = org.id;
  console.log(`[test-seed][finops] OrganizaciÃ³n: ${orgId}`);

  const accountIds: Record<string, string> = {};
  for (const acct of BANK_ACCOUNTS) {
    const ba = await prisma.bankAccount.upsert({
      where: { id: `ba-test-${acct.slug}` },
      update: {},
      create: {
        id: `ba-test-${acct.slug}`,
        organizationId: orgId,
        name: acct.name,
        bankName: acct.bankName,
        accountNumberMask: acct.mask,
        currencyCode: acct.currency,
        currentBalance: acct.balance,
        isActive: true,
      },
      select: { id: true },
    });
    accountIds[acct.slug] = ba.id;
  }
  console.log('[test-seed][finops] 5 cuentas bancarias creadas.');

  let credits = 0;
  let debits = 0;
  let voids = 0;

  for (let i = 0; i < 140; i++) {
    const isCredit = i < 60;
    const isVoid = i >= 120 && i < 140;
    const accountId = pickRandom(Object.values(accountIds));
    const daysBack = Math.floor(Math.random() * 90);
    const amount = isCredit ? randomAmount(500, 100000) : randomAmount(300, 50000);
    const description = isCredit ? pickRandom(CREDIT_DESCRIPTIONS) : pickRandom(DEBIT_DESCRIPTIONS);

    await prisma.financialMovement.create({
      data: {
        organizationId: orgId,
        bankAccountId: accountId,
        movementType: isCredit ? 'CREDIT' : 'DEBIT',
        status: isVoid ? 'VOID' : 'POSTED',
        amount,
        currencyCode: 'MXN',
        occurredAt: daysAgo(daysBack),
        description: isVoid ? `[ANULADO] ${description}` : description,
        reference: `REF-${String(i + 1).padStart(4, '0')}`,
      },
    });

    if (isCredit) credits++;
    else if (isVoid) voids++;
    else debits++;
  }

  // 10 movimientos programados a futuro (PENDING)
  for (let i = 0; i < 10; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
    await prisma.financialMovement.create({
      data: {
        organizationId: orgId,
        bankAccountId: pickRandom(Object.values(accountIds)),
        movementType: 'DEBIT',
        status: 'PENDING',
        amount: randomAmount(1000, 30000),
        currencyCode: 'MXN',
        occurredAt: futureDate,
        description: 'Pago programado a proveedor',
        reference: `PROG-${String(i + 1).padStart(3, '0')}`,
      },
    });
  }
  console.log(
    `[test-seed][finops] Movimientos: ${credits} crÃ©ditos, ${debits} dÃ©bitos, ${voids} anulados, 10 programados.`,
  );

  // 15 transferencias entre cuentas
  const transferPairs = [
    ['cta-001', 'cta-002'],
    ['cta-001', 'cta-003'],
    ['cta-005', 'cta-001'],
    ['cta-002', 'cta-003'],
    ['cta-001', 'cta-005'],
  ];

  for (let i = 0; i < 15; i++) {
    const [fromSlug, toSlug] = transferPairs[i % transferPairs.length];
    const daysBack = Math.floor(Math.random() * 90);
    await prisma.transfer.create({
      data: {
        organizationId: orgId,
        fromBankAccountId: accountIds[fromSlug],
        toBankAccountId: accountIds[toSlug],
        status: i < 10 ? 'POSTED' : 'PENDING',
        amount: randomAmount(5000, 200000),
        currencyCode: 'MXN',
        occurredAt: daysAgo(daysBack),
        description: `Transferencia interna ${i + 1} â€” seed de prueba`,
        reference: `TRF-${String(i + 1).padStart(3, '0')}`,
      },
    });
  }
  console.log('[test-seed][finops] 15 transferencias creadas (10 POSTED, 5 PENDING).');
  console.log('[test-seed][finops] Seed de datos de prueba completado.');
}
