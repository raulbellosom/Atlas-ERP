# Plantilla Estándar para ADRs (Architecture Decision Records)

## ID de task origen

- `T-0138`
- Estado: `aprobada`
- Fecha: `2026-04-12`

## Instrucciones de uso

Copiar esta plantilla cuando se necesite documentar una decisión arquitectónica. Guardar en `docs/02-architecture/` con prefijo numérico y nombre en `kebab-case`.

---

# ADR-XXXX — [Título breve de la decisión]

## Metadatos

- ID: `ADR-XXXX`
- Estado: `propuesta | aprobada | rechazada | reemplazada`
- Nivel de decisión: `1 (trivial) | 2 (significativa) | 3 (estratégica) | 4 (irreversible)`
- Fecha: `YYYY-MM-DD`
- Autor: `nombre`
- Task relacionada: `T-XXXX`

## Contexto

Descripción del problema o situación que requiere una decisión. Incluir antecedentes relevantes y restricciones existentes.

## Decisión

Descripción clara de la decisión tomada.

## Opciones consideradas

### Opción A: [nombre]

- **Pros**: ventaja 1, ventaja 2.
- **Contras**: desventaja 1, desventaja 2.

### Opción B: [nombre]

- **Pros**: ventaja 1, ventaja 2.
- **Contras**: desventaja 1, desventaja 2.

### Opción C: [nombre] (si aplica)

- **Pros**: ventaja 1.
- **Contras**: desventaja 1.

## Justificación

Por qué la opción elegida es la mejor para el proyecto en este momento.

## Consecuencias

### Positivas

- Consecuencia positiva 1.
- Consecuencia positiva 2.

### Negativas

- Consecuencia negativa 1 (y mitigación si existe).
- Consecuencia negativa 2.

### Neutras

- Consecuencia neutra 1.

## Impacto

- Módulos afectados: lista.
- Archivos afectados: lista.
- Migraciones necesarias: sí/no.
- Breaking changes: sí/no.

## Reversibilidad

- ¿Es reversible? sí/no/parcialmente.
- Costo de reversión: bajo/medio/alto.

## Documentos relacionados

- `docs/ruta/al/documento-relacionado.md`

## Historial

| Fecha      | Cambio   | Autor  |
| ---------- | -------- | ------ |
| YYYY-MM-DD | Creación | nombre |
