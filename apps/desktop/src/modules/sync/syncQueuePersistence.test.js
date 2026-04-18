import test from "node:test";
import assert from "node:assert/strict";
import {
  syncQueueEnqueue,
  syncQueueList,
  syncQueueMarkProcessing,
  syncQueuePendingCount,
  syncQueueRecoverAfterRestart,
  syncQueueSummary,
} from "../../bridge/syncQueue.bridge.js";

test("T-1045: recuperación de cola tras reinicio regresa processing a pending", async () => {
  const marker = `restart-${Date.now()}`;
  const id = await syncQueueEnqueue({
    entity: "setting",
    operation: "update",
    payloadJson: JSON.stringify({ key: "ui.language", value: "es-MX", marker }),
    priority: 10,
  });

  const movedToProcessing = await syncQueueMarkProcessing(id);
  assert.equal(movedToProcessing, true);

  const processingBefore = await syncQueueList({ status: "processing", limit: 1000 });
  assert.equal(
    processingBefore.some((item) => item.id === id),
    true,
    "el item debe estar en processing antes de recover",
  );

  const recovered = await syncQueueRecoverAfterRestart();
  assert.ok(recovered >= 1, "debe recuperar al menos un item processing");

  const processingAfter = await syncQueueList({ status: "processing", limit: 1000 });
  assert.equal(
    processingAfter.some((item) => item.id === id),
    false,
    "el item ya no debe permanecer en processing",
  );

  const pendingAfter = await syncQueueList({ status: "pending", limit: 1000 });
  const recoveredItem = pendingAfter.find((item) => item.id === id);
  assert.ok(recoveredItem, "el item recuperado debe volver a pending");
  assert.ok(
    String(recoveredItem.lastError || "").length > 0,
    "el item recuperado conserva trazabilidad en lastError",
  );

  const pendingCount = await syncQueuePendingCount();
  assert.ok(pendingCount >= 1);

  const summary = await syncQueueSummary();
  assert.ok(summary.pending >= 1);
});

