export interface FinancialPostingPayload {
  eventType: 'financial.movement.created';
  tenantId: string;
  movementId: string;
  amount: number;
  currency: string;
  bankAccountId: string;
  categoryCode: string;
  movementDate: Date;
  description: string;
  userId: string;
}

export interface TransferPostingPayload {
  eventType: 'transfer.completed';
  tenantId: string;
  transferId: string;
  amount: number;
  currency: string;
  sourceAccountId: string;
  destinationAccountId: string;
  transferDate: Date;
  userId: string;
}

export const ACCOUNTING_EVENTS = {
  FINANCIAL_MOVEMENT_CREATED: 'financial.movement.created',
  TRANSFER_COMPLETED: 'transfer.completed',
} as const;
