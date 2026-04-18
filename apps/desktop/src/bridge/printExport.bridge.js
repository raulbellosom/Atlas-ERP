import { invokeDesktop } from "./desktopBridge.js";

export async function exportRowsToCsv(fileName, headers, rows) {
  return invokeDesktop("export_rows_to_csv", { fileName, headers, rows }, "");
}

export async function exportJsonDocument(fileName, payload) {
  return invokeDesktop("export_json_document", { fileName, payload }, "");
}

export async function requestPrint(documentName) {
  return invokeDesktop("print_request", { documentName }, () => {
    return {
      accepted: false,
      detail: "Modo web sin bridge nativo de impresión.",
    };
  });
}
