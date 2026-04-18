/**
 * Validaciones centralizadas del módulo Financial Operations.
 *
 * Cada función recibe un objeto form y retorna un objeto de errores.
 * Si el objeto retornado está vacío => formulario válido.
 *
 * Usados por: BankAccountFormPage, MovementFormPage, TransferFormPage.
 */

export function validateBankAccountForm(form) {
  const errors = {};
  if (!form.name || form.name.length < 3)
    errors.name = "El nombre debe tener al menos 3 caracteres";
  if (form.name && form.name.length > 120)
    errors.name = "El nombre no puede exceder 120 caracteres";
  if (!form.bankName || form.bankName.length < 2)
    errors.bankName = "El banco debe tener al menos 2 caracteres";
  if (!form.accountNumberMask || form.accountNumberMask.length < 4)
    errors.accountNumberMask = "La cuenta debe tener al menos 4 caracteres";
  if (form.accountNumberMask && form.accountNumberMask.length > 40)
    errors.accountNumberMask = "Máximo 40 caracteres";
  if (form.currencyCode && !/^[A-Z]{3}$/.test(form.currencyCode))
    errors.currencyCode = "Código de moneda inválido (3 letras mayúsculas)";
  if (form.accountHolder && form.accountHolder.length < 2)
    errors.accountHolder = "El titular debe tener al menos 2 caracteres";
  return errors;
}

export function validateMovementForm(form) {
  const errors = {};
  if (!form.bankAccountId)
    errors.bankAccountId = "Selecciona una cuenta bancaria";
  if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0)
    errors.amount = "Ingresa un monto válido mayor a 0";
  if (!form.occurredAt)
    errors.occurredAt = "La fecha es requerida";
  if (form.description && form.description.length > 500)
    errors.description = "Máximo 500 caracteres";
  if (form.reference && form.reference.length > 120)
    errors.reference = "Máximo 120 caracteres";
  return errors;
}

export function validateTransferForm(form) {
  const errors = {};
  if (!form.fromBankAccountId)
    errors.fromBankAccountId = "Selecciona la cuenta origen";
  if (!form.toBankAccountId)
    errors.toBankAccountId = "Selecciona la cuenta destino";
  if (form.fromBankAccountId && form.fromBankAccountId === form.toBankAccountId)
    errors.toBankAccountId = "La cuenta destino debe ser diferente a la origen";
  if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0)
    errors.amount = "Ingresa un monto válido mayor a 0";
  if (!form.occurredAt)
    errors.occurredAt = "La fecha es requerida";
  if (form.description && form.description.length > 500)
    errors.description = "Máximo 500 caracteres";
  if (form.reference && form.reference.length > 120)
    errors.reference = "Máximo 120 caracteres";
  return errors;
}

/**
 * Validar que un objeto no tenga errores.
 * @param {object} errors
 * @returns {boolean}
 */
export function isValid(errors) {
  return Object.keys(errors).length === 0;
}
