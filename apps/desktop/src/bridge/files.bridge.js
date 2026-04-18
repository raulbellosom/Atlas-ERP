import { invokeDesktop } from "./desktopBridge.js";

export async function filesWriteText(relativePath, content) {
  return invokeDesktop("files_write_text", { relativePath, content }, true);
}

export async function filesReadText(relativePath) {
  return invokeDesktop("files_read_text", { relativePath }, "");
}

export async function filesDelete(relativePath) {
  return invokeDesktop("files_delete", { relativePath }, true);
}

export async function filesExists(relativePath) {
  return invokeDesktop("files_exists", { relativePath }, false);
}
