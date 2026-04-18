/**
 * Hook de persistencia local de borradores de formulario.
 *
 * Guarda automáticamente el estado del formulario en SQLite con debounce de 1s.
 * Al montar recupera el borrador existente. Al submit exitoso lo elimina.
 * Un solo borrador activo por formType.
 *
 * TTL de borrador: 7 días — borradores más antiguos se eliminan al montar.
 *
 * Task origen: T-1506 (Fase 15 Bloque 2)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { sqliteExecute, sqliteQuery } from "../../../bridge/sqlite.bridge.js";

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
const DEBOUNCE_MS = 1000;

async function loadDraft(formType) {
  const rows = await sqliteQuery(
    `SELECT payload, created_at AS createdAt, updated_at AS updatedAt
       FROM finops_form_drafts
      WHERE form_type = ?1
      LIMIT 1`,
    [formType],
  );
  return rows[0] ?? null;
}

async function saveDraft(formType, payload) {
  const now = new Date().toISOString();
  await sqliteExecute(
    `INSERT INTO finops_form_drafts (form_type, payload, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?3)
     ON CONFLICT(form_type) DO UPDATE SET
       payload    = excluded.payload,
       updated_at = excluded.updated_at`,
    [formType, JSON.stringify(payload), now],
  );
}

async function deleteDraft(formType) {
  await sqliteExecute(
    `DELETE FROM finops_form_drafts WHERE form_type = ?1`,
    [formType],
  );
}

async function purgeExpiredDrafts() {
  const cutoff = new Date(Date.now() - DRAFT_TTL_MS).toISOString();
  await sqliteExecute(
    `DELETE FROM finops_form_drafts WHERE updated_at < ?1`,
    [cutoff],
  );
}

/**
 * @param {string} formType  — 'movement' | 'transfer' | 'receivable' | 'payable'
 * @param {object} initialValues  — valores iniciales del formulario
 */
export function useFormDraft(formType, initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const debounceRef = useRef(null);

  // Carga el borrador al montar
  useEffect(() => {
    async function init() {
      await purgeExpiredDrafts();
      const draft = await loadDraft(formType);
      if (draft) {
        try {
          const parsed = JSON.parse(draft.payload);
          setValues(parsed);
          setHasDraft(true);
        } catch {
          await deleteDraft(formType);
        }
      }

      setDraftLoaded(true);
    }

    init();
  }, [formType]);

  // Guarda el borrador con debounce cuando cambian los valores (post-carga)
  useEffect(() => {
    if (!draftLoaded) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveDraft(formType, values).catch(() => {});
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [values, formType, draftLoaded]);

  const updateField = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setHasDraft(false);
  }, []);

  const updateValues = useCallback((patch) => {
    setValues((prev) => ({ ...prev, ...patch }));
    setHasDraft(false);
  }, []);

  const discardDraft = useCallback(async () => {
    await deleteDraft(formType);
    setValues(initialValues);
    setHasDraft(false);
  }, [formType, initialValues]);

  const clearDraftOnSuccess = useCallback(async () => {
    await deleteDraft(formType);
    setHasDraft(false);
  }, [formType]);

  return {
    values,
    hasDraft,
    draftLoaded,
    updateField,
    updateValues,
    discardDraft,
    clearDraftOnSuccess,
  };
}
