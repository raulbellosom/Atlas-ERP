import {
  PrismaClient,
  FinancialMovementStatus,
  FinancialMovementType,
  Prisma,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando recálculo de saldos de cuentas bancarias...');

  const bankAccounts = await prisma.bankAccount.findMany({
    select: { id: true, name: true, bankName: true, currentBalance: true },
  });

  console.log(`Encontradas ${bankAccounts.length} cuentas bancarias.`);

  for (const account of bankAccounts) {
    console.log(`\nProcesando cuenta: ${account.name} (${account.bankName})`);

    const movements = await prisma.financialMovement.findMany({
      where: {
        bankAccountId: account.id,
        deletedAt: null,
        status: FinancialMovementStatus.POSTED,
      },
      select: {
        id: true,
        movementType: true,
        amount: true,
      },
      orderBy: { occurredAt: 'asc' },
    });

    let calculatedBalance = new Prisma.Decimal(0);

    for (const mov of movements) {
      const amount = new Prisma.Decimal(mov.amount);
      switch (mov.movementType) {
        case FinancialMovementType.INCOME:
        case FinancialMovementType.TRANSFER_IN:
        case FinancialMovementType.OPENING_BALANCE:
          calculatedBalance = calculatedBalance.add(amount);
          break;
        case FinancialMovementType.EXPENSE:
        case FinancialMovementType.TRANSFER_OUT:
          calculatedBalance = calculatedBalance.sub(amount);
          break;
        case FinancialMovementType.ADJUSTMENT:
          calculatedBalance = calculatedBalance.add(amount);
          break;
      }
    }

    console.log(`- Saldo actual en BD: ${account.currentBalance.toString()}`);
    console.log(`- Saldo calculado:    ${calculatedBalance.toString()}`);

    if (!calculatedBalance.equals(account.currentBalance)) {
      console.log('-> Actualizando saldo...');
      await prisma.bankAccount.update({
        where: { id: account.id },
        data: { currentBalance: calculatedBalance },
      });
      console.log('-> OK');
    } else {
      console.log('-> El saldo es correcto. No requiere actualización.');
    }
  }

  console.log('\nRecálculo finalizado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el recálculo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
