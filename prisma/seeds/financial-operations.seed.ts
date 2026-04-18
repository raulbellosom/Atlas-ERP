import {
  BalanceSnapshotSource,
  CounterpartyStatus,
  CounterpartyType,
  FinancialMovementStatus,
  FinancialMovementType,
  PayableStatus,
  PrismaClient,
  ReceivableStatus,
  ReconciliationItemStatus,
  ReconciliationSessionStatus,
  TransferStatus,
} from '@prisma/client';

type SeedFinancialOperationsContext = {
  organizationId: string;
  actorUserId: string | null;
  branchId: string | null;
};

const DEMO_BRANCH_NAME = 'Sucursal Centro Demo';
const DEMO_BANK_ACCOUNT_TYPE = {
  code: 'OPERATIVE',
  name: 'Cuenta Operativa',
  description: 'Cuenta operativa para movimientos de tesorería demo.',
};

const DEMO_DATE = {
  income: new Date('2026-04-01T10:00:00.000Z'),
  expense: new Date('2026-04-02T15:30:00.000Z'),
  transfer: new Date('2026-04-03T12:15:00.000Z'),
  reconciliationStart: new Date('2026-04-04T09:00:00.000Z'),
  reconciliationClose: new Date('2026-04-04T09:30:00.000Z'),
  snapshot: new Date('2026-04-04T10:00:00.000Z'),
  receivableIssue: new Date('2026-04-05T11:00:00.000Z'),
  receivableDue: new Date('2026-04-20T23:59:59.000Z'),
  payableIssue: new Date('2026-04-06T11:30:00.000Z'),
  payableDue: new Date('2026-04-18T23:59:59.000Z'),
};

const DEMO_REFS = {
  movementIncome: 'DEMO-MOV-ING-001',
  movementExpense: 'DEMO-MOV-EGR-001',
  movementTransferOut: 'DEMO-MOV-TRF-OUT-001',
  movementTransferIn: 'DEMO-MOV-TRF-IN-001',
  transfer: 'DEMO-TRF-001',
  reconciliationNotes: 'DEMO-RECON-SESSION-001',
  receivable: 'DEMO-CXC-001',
  payable: 'DEMO-CXP-001',
  receiptAttachmentPath: 'demo/financial/movements/DEMO-MOV-ING-001-comprobante.pdf',
};

async function getActorUserId(prisma: PrismaClient, organizationId: string): Promise<string | null> {
  const users = await prisma.user.findMany({
    where: {
      organizationId,
      email: {
        in: ['tesoreria@atlaserp.local', 'admin@atlaserp.local', 'auditoria@atlaserp.local'],
      },
    },
    select: { id: true, email: true },
  });

  const preferredOrder = ['tesoreria@atlaserp.local', 'admin@atlaserp.local', 'auditoria@atlaserp.local'];
  for (const email of preferredOrder) {
    const user = users.find((candidate) => candidate.email === email);
    if (user) {
      return user.id;
    }
  }

  return null;
}

async function upsertDemoBranch(
  prisma: PrismaClient,
  organizationId: string,
): Promise<{ id: string } | null> {
  const branch = await prisma.branch.upsert({
    where: {
      organizationId_name: {
        organizationId,
        name: DEMO_BRANCH_NAME,
      },
    },
    update: {
      isActive: true,
      deletedAt: null,
    },
    create: {
      organizationId,
      name: DEMO_BRANCH_NAME,
      isActive: true,
    },
    select: { id: true },
  });

  return branch;
}

async function upsertBankAccountType(prisma: PrismaClient, organizationId: string): Promise<{ id: string }> {
  return prisma.bankAccountType.upsert({
    where: {
      organizationId_code: {
        organizationId,
        code: DEMO_BANK_ACCOUNT_TYPE.code,
      },
    },
    update: {
      name: DEMO_BANK_ACCOUNT_TYPE.name,
      description: DEMO_BANK_ACCOUNT_TYPE.description,
      isActive: true,
    },
    create: {
      organizationId,
      code: DEMO_BANK_ACCOUNT_TYPE.code,
      name: DEMO_BANK_ACCOUNT_TYPE.name,
      description: DEMO_BANK_ACCOUNT_TYPE.description,
      isActive: true,
    },
    select: { id: true },
  });
}

async function upsertBankAccountByMask(
  prisma: PrismaClient,
  input: {
    organizationId: string;
    branchId: string | null;
    bankAccountTypeId: string;
    createdById: string | null;
    name: string;
    bankName: string;
    accountHolder: string;
    accountNumberMask: string;
    currentBalance: string;
  },
): Promise<{ id: string }> {
  const existing = await prisma.bankAccount.findFirst({
    where: {
      organizationId: input.organizationId,
      accountNumberMask: input.accountNumberMask,
    },
    select: { id: true },
  });

  if (existing) {
    return prisma.bankAccount.update({
      where: { id: existing.id },
      data: {
        branchId: input.branchId,
        bankAccountTypeId: input.bankAccountTypeId,
        createdById: input.createdById,
        name: input.name,
        bankName: input.bankName,
        accountHolder: input.accountHolder,
        currencyCode: 'MXN',
        currentBalance: input.currentBalance,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });
  }

  return prisma.bankAccount.create({
    data: {
      organizationId: input.organizationId,
      branchId: input.branchId,
      bankAccountTypeId: input.bankAccountTypeId,
      createdById: input.createdById,
      name: input.name,
      bankName: input.bankName,
      accountHolder: input.accountHolder,
      accountNumberMask: input.accountNumberMask,
      currencyCode: 'MXN',
      currentBalance: input.currentBalance,
      isActive: true,
    },
    select: { id: true },
  });
}

async function upsertFinancialMovementByReference(
  prisma: PrismaClient,
  input: {
    organizationId: string;
    bankAccountId: string;
    branchId: string | null;
    createdById: string | null;
    movementType: FinancialMovementType;
    status: FinancialMovementStatus;
    amount: string;
    occurredAt: Date;
    description: string;
    reference: string;
    isReconciled: boolean;
  },
): Promise<{ id: string }> {
  const existing = await prisma.financialMovement.findFirst({
    where: {
      organizationId: input.organizationId,
      reference: input.reference,
    },
    select: { id: true },
  });

  if (existing) {
    return prisma.financialMovement.update({
      where: { id: existing.id },
      data: {
        bankAccountId: input.bankAccountId,
        branchId: input.branchId,
        createdById: input.createdById,
        movementType: input.movementType,
        status: input.status,
        amount: input.amount,
        currencyCode: 'MXN',
        occurredAt: input.occurredAt,
        description: input.description,
        isReconciled: input.isReconciled,
        deletedAt: null,
      },
      select: { id: true },
    });
  }

  return prisma.financialMovement.create({
    data: {
      organizationId: input.organizationId,
      bankAccountId: input.bankAccountId,
      branchId: input.branchId,
      createdById: input.createdById,
      movementType: input.movementType,
      status: input.status,
      amount: input.amount,
      currencyCode: 'MXN',
      occurredAt: input.occurredAt,
      description: input.description,
      reference: input.reference,
      isReconciled: input.isReconciled,
    },
    select: { id: true },
  });
}

export async function seedFinancialOperationsCore(
  prisma: PrismaClient,
  organizationId: string,
): Promise<void> {
  console.log('[seeds][financial] Iniciando seeds demo de Financial Operations Core...');

  const actorUserId = await getActorUserId(prisma, organizationId);
  const branch = await upsertDemoBranch(prisma, organizationId);
  const context: SeedFinancialOperationsContext = {
    organizationId,
    actorUserId,
    branchId: branch?.id ?? null,
  };

  const bankAccountType = await upsertBankAccountType(prisma, context.organizationId);

  const ingresosAccount = await upsertBankAccountByMask(prisma, {
    organizationId: context.organizationId,
    branchId: context.branchId,
    bankAccountTypeId: bankAccountType.id,
    createdById: context.actorUserId,
    name: 'Cuenta Operativa Ingresos',
    bankName: 'Banco Uno',
    accountHolder: 'AtlasERP Demo',
    accountNumberMask: '****5678',
    currentBalance: '25000.00',
  });

  const egresosAccount = await upsertBankAccountByMask(prisma, {
    organizationId: context.organizationId,
    branchId: context.branchId,
    bankAccountTypeId: bankAccountType.id,
    createdById: context.actorUserId,
    name: 'Cuenta Operativa Egresos',
    bankName: 'Banco Dos',
    accountHolder: 'AtlasERP Demo',
    accountNumberMask: '****1234',
    currentBalance: '18000.00',
  });

  const incomeMovement = await upsertFinancialMovementByReference(prisma, {
    organizationId: context.organizationId,
    bankAccountId: ingresosAccount.id,
    branchId: context.branchId,
    createdById: context.actorUserId,
    movementType: FinancialMovementType.INCOME,
    status: FinancialMovementStatus.POSTED,
    amount: '15000.00',
    occurredAt: DEMO_DATE.income,
    description: 'Ingreso demo por cobranza de cliente.',
    reference: DEMO_REFS.movementIncome,
    isReconciled: true,
  });

  await upsertFinancialMovementByReference(prisma, {
    organizationId: context.organizationId,
    bankAccountId: egresosAccount.id,
    branchId: context.branchId,
    createdById: context.actorUserId,
    movementType: FinancialMovementType.EXPENSE,
    status: FinancialMovementStatus.POSTED,
    amount: '4200.00',
    occurredAt: DEMO_DATE.expense,
    description: 'Egreso demo por pago de proveedor.',
    reference: DEMO_REFS.movementExpense,
    isReconciled: false,
  });

  const transferOutgoing = await upsertFinancialMovementByReference(prisma, {
    organizationId: context.organizationId,
    bankAccountId: ingresosAccount.id,
    branchId: context.branchId,
    createdById: context.actorUserId,
    movementType: FinancialMovementType.TRANSFER_OUT,
    status: FinancialMovementStatus.POSTED,
    amount: '3000.00',
    occurredAt: DEMO_DATE.transfer,
    description: 'Salida de transferencia demo entre cuentas internas.',
    reference: DEMO_REFS.movementTransferOut,
    isReconciled: false,
  });

  const transferIncoming = await upsertFinancialMovementByReference(prisma, {
    organizationId: context.organizationId,
    bankAccountId: egresosAccount.id,
    branchId: context.branchId,
    createdById: context.actorUserId,
    movementType: FinancialMovementType.TRANSFER_IN,
    status: FinancialMovementStatus.POSTED,
    amount: '3000.00',
    occurredAt: DEMO_DATE.transfer,
    description: 'Entrada de transferencia demo entre cuentas internas.',
    reference: DEMO_REFS.movementTransferIn,
    isReconciled: false,
  });

  await prisma.transfer.upsert({
    where: { outgoingMovementId: transferOutgoing.id },
    update: {
      organizationId: context.organizationId,
      fromBankAccountId: ingresosAccount.id,
      toBankAccountId: egresosAccount.id,
      branchId: context.branchId,
      incomingMovementId: transferIncoming.id,
      initiatedById: context.actorUserId,
      approvedById: context.actorUserId,
      status: TransferStatus.POSTED,
      amount: '3000.00',
      currencyCode: 'MXN',
      occurredAt: DEMO_DATE.transfer,
      description: 'Transferencia demo para pruebas funcionales.',
      reference: DEMO_REFS.transfer,
      deletedAt: null,
    },
    create: {
      organizationId: context.organizationId,
      fromBankAccountId: ingresosAccount.id,
      toBankAccountId: egresosAccount.id,
      branchId: context.branchId,
      outgoingMovementId: transferOutgoing.id,
      incomingMovementId: transferIncoming.id,
      initiatedById: context.actorUserId,
      approvedById: context.actorUserId,
      status: TransferStatus.POSTED,
      amount: '3000.00',
      currencyCode: 'MXN',
      occurredAt: DEMO_DATE.transfer,
      description: 'Transferencia demo para pruebas funcionales.',
      reference: DEMO_REFS.transfer,
    },
  });

  const receiptAttachment =
    (await prisma.attachment.findFirst({
      where: {
        organizationId: context.organizationId,
        storagePath: DEMO_REFS.receiptAttachmentPath,
      },
      select: { id: true },
    })) ??
    (await prisma.attachment.create({
      data: {
        organizationId: context.organizationId,
        filename: 'comprobante-movimiento-demo.pdf',
        storagePath: DEMO_REFS.receiptAttachmentPath,
        mimeType: 'application/pdf',
        sizeBytes: 243_210,
        entityType: 'financial_movement',
        entityId: incomeMovement.id,
        uploadedById: context.actorUserId,
      },
      select: { id: true },
    }));

  const movementAttachment = await prisma.financialMovementAttachment.findFirst({
    where: {
      organizationId: context.organizationId,
      financialMovementId: incomeMovement.id,
      attachmentId: receiptAttachment.id,
    },
    select: { id: true },
  });

  if (movementAttachment) {
    await prisma.financialMovementAttachment.update({
      where: { id: movementAttachment.id },
      data: {
        note: 'Comprobante demo de ingreso.',
        createdById: context.actorUserId,
      },
    });
  } else {
    await prisma.financialMovementAttachment.create({
      data: {
        organizationId: context.organizationId,
        financialMovementId: incomeMovement.id,
        attachmentId: receiptAttachment.id,
        createdById: context.actorUserId,
        note: 'Comprobante demo de ingreso.',
      },
    });
  }

  const reconciliationSession =
    (await prisma.reconciliationSession.findFirst({
      where: {
        organizationId: context.organizationId,
        notes: DEMO_REFS.reconciliationNotes,
      },
      select: { id: true },
    })) ??
    (await prisma.reconciliationSession.create({
      data: {
        organizationId: context.organizationId,
        bankAccountId: ingresosAccount.id,
        branchId: context.branchId,
        openedById: context.actorUserId,
        closedById: context.actorUserId,
        status: ReconciliationSessionStatus.CLOSED,
        startedAt: DEMO_DATE.reconciliationStart,
        closedAt: DEMO_DATE.reconciliationClose,
        notes: DEMO_REFS.reconciliationNotes,
      },
      select: { id: true },
    }));

  const reconciliationItem = await prisma.reconciliationItem.findFirst({
    where: {
      organizationId: context.organizationId,
      reconciliationSessionId: reconciliationSession.id,
      financialMovementId: incomeMovement.id,
    },
    select: { id: true },
  });

  if (reconciliationItem) {
    await prisma.reconciliationItem.update({
      where: { id: reconciliationItem.id },
      data: {
        branchId: context.branchId,
        status: ReconciliationItemStatus.MATCHED,
        expectedAmount: '15000.00',
        actualAmount: '15000.00',
        discrepancyAmount: '0.00',
        reason: 'Partida demo conciliada automáticamente.',
        resolvedById: context.actorUserId,
        resolvedAt: DEMO_DATE.reconciliationClose,
      },
    });
  } else {
    await prisma.reconciliationItem.create({
      data: {
        organizationId: context.organizationId,
        reconciliationSessionId: reconciliationSession.id,
        financialMovementId: incomeMovement.id,
        branchId: context.branchId,
        status: ReconciliationItemStatus.MATCHED,
        expectedAmount: '15000.00',
        actualAmount: '15000.00',
        discrepancyAmount: '0.00',
        reason: 'Partida demo conciliada automáticamente.',
        resolvedById: context.actorUserId,
        resolvedAt: DEMO_DATE.reconciliationClose,
      },
    });
  }

  const existingSnapshot = await prisma.balanceSnapshot.findFirst({
    where: {
      organizationId: context.organizationId,
      bankAccountId: ingresosAccount.id,
      snapshotAt: DEMO_DATE.snapshot,
    },
    select: { id: true },
  });

  if (existingSnapshot) {
    await prisma.balanceSnapshot.update({
      where: { id: existingSnapshot.id },
      data: {
        branchId: context.branchId,
        capturedById: context.actorUserId,
        balance: '25000.00',
        currencyCode: 'MXN',
        source: BalanceSnapshotSource.RECONCILIATION,
      },
    });
  } else {
    await prisma.balanceSnapshot.create({
      data: {
        organizationId: context.organizationId,
        bankAccountId: ingresosAccount.id,
        branchId: context.branchId,
        capturedById: context.actorUserId,
        snapshotAt: DEMO_DATE.snapshot,
        balance: '25000.00',
        currencyCode: 'MXN',
        source: BalanceSnapshotSource.RECONCILIATION,
      },
    });
  }

  const customerCounterparty =
    (await prisma.counterpartyLite.findFirst({
      where: {
        organizationId: context.organizationId,
        taxId: 'XAXX010101000',
      },
      select: { id: true },
    })) ??
    (await prisma.counterpartyLite.create({
      data: {
        organizationId: context.organizationId,
        branchId: context.branchId,
        createdById: context.actorUserId,
        type: CounterpartyType.CUSTOMER,
        status: CounterpartyStatus.ACTIVE,
        name: 'Cliente Demo SA de CV',
        displayName: 'Cliente Demo',
        taxId: 'XAXX010101000',
        email: 'cliente.demo@atlaserp.local',
        phone: '+52-55-0000-0001',
      },
      select: { id: true },
    }));

  const supplierCounterparty =
    (await prisma.counterpartyLite.findFirst({
      where: {
        organizationId: context.organizationId,
        taxId: 'XEXX010101000',
      },
      select: { id: true },
    })) ??
    (await prisma.counterpartyLite.create({
      data: {
        organizationId: context.organizationId,
        branchId: context.branchId,
        createdById: context.actorUserId,
        type: CounterpartyType.SUPPLIER,
        status: CounterpartyStatus.ACTIVE,
        name: 'Proveedor Demo SA de CV',
        displayName: 'Proveedor Demo',
        taxId: 'XEXX010101000',
        email: 'proveedor.demo@atlaserp.local',
        phone: '+52-55-0000-0002',
      },
      select: { id: true },
    }));

  const receivable = await prisma.receivableLite.findFirst({
    where: {
      organizationId: context.organizationId,
      reference: DEMO_REFS.receivable,
    },
    select: { id: true },
  });

  if (receivable) {
    await prisma.receivableLite.update({
      where: { id: receivable.id },
      data: {
        branchId: context.branchId,
        counterpartyId: customerCounterparty.id,
        bankAccountId: ingresosAccount.id,
        createdById: context.actorUserId,
        status: ReceivableStatus.OPEN,
        amount: '9800.00',
        amountPaid: '0.00',
        currencyCode: 'MXN',
        issuedAt: DEMO_DATE.receivableIssue,
        dueAt: DEMO_DATE.receivableDue,
        paidAt: null,
        description: 'Cuenta por cobrar demo por servicio mensual.',
      },
    });
  } else {
    await prisma.receivableLite.create({
      data: {
        organizationId: context.organizationId,
        branchId: context.branchId,
        counterpartyId: customerCounterparty.id,
        bankAccountId: ingresosAccount.id,
        createdById: context.actorUserId,
        status: ReceivableStatus.OPEN,
        reference: DEMO_REFS.receivable,
        amount: '9800.00',
        amountPaid: '0.00',
        currencyCode: 'MXN',
        issuedAt: DEMO_DATE.receivableIssue,
        dueAt: DEMO_DATE.receivableDue,
        description: 'Cuenta por cobrar demo por servicio mensual.',
      },
    });
  }

  const payable = await prisma.payableLite.findFirst({
    where: {
      organizationId: context.organizationId,
      reference: DEMO_REFS.payable,
    },
    select: { id: true },
  });

  if (payable) {
    await prisma.payableLite.update({
      where: { id: payable.id },
      data: {
        branchId: context.branchId,
        counterpartyId: supplierCounterparty.id,
        bankAccountId: egresosAccount.id,
        createdById: context.actorUserId,
        status: PayableStatus.OPEN,
        amount: '6100.00',
        amountPaid: '0.00',
        currencyCode: 'MXN',
        issuedAt: DEMO_DATE.payableIssue,
        dueAt: DEMO_DATE.payableDue,
        paidAt: null,
        description: 'Cuenta por pagar demo por compra de insumos.',
      },
    });
  } else {
    await prisma.payableLite.create({
      data: {
        organizationId: context.organizationId,
        branchId: context.branchId,
        counterpartyId: supplierCounterparty.id,
        bankAccountId: egresosAccount.id,
        createdById: context.actorUserId,
        status: PayableStatus.OPEN,
        reference: DEMO_REFS.payable,
        amount: '6100.00',
        amountPaid: '0.00',
        currencyCode: 'MXN',
        issuedAt: DEMO_DATE.payableIssue,
        dueAt: DEMO_DATE.payableDue,
        description: 'Cuenta por pagar demo por compra de insumos.',
      },
    });
  }

  console.log('[seeds][financial] OK (cuentas, movimientos, transferencias, conciliación, snapshots, CxC/CxP).');
}
