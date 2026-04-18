# Data Ownership

## Regla
Cada entidad debe declarar:
- módulo dueño
- quién la puede leer
- quién la puede editar
- si puede existir offline
- cómo se sincroniza
- cómo se audita

## Ejemplos
- BankAccount -> Financial Operations Core
- FinancialMovement -> Financial Operations Core
- AccountingEntry -> Accounting Core
- Employee -> HR Core

## Referencia de política
- `docs/04-modules/00-politica-ownership-datos.md`

