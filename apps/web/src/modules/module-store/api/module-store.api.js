import { apiClient } from '@/api/client';

function unwrapPayload(response) {
  return response?.data?.data ?? response?.data;
}

export async function fetchModuleCatalog({ search, includeDeprecated = false } = {}) {
  const response = await apiClient.get('/v1/module-store/catalog', {
    params: { search, includeDeprecated },
  });
  const payload = unwrapPayload(response);
  return Array.isArray(payload) ? payload : [];
}

export async function fetchInstalledModules() {
  const response = await apiClient.get('/v1/module-store/installed');
  const payload = unwrapPayload(response);
  return Array.isArray(payload) ? payload : [];
}

export async function installModule(input) {
  const response = await apiClient.post('/v1/module-store/install', input);
  return unwrapPayload(response);
}

export async function uninstallModule(input) {
  const response = await apiClient.post('/v1/module-store/uninstall', input);
  return unwrapPayload(response);
}

export async function upgradeModule(input) {
  const response = await apiClient.post('/v1/module-store/upgrade', input);
  return unwrapPayload(response);
}

export async function fetchModuleJob(jobId) {
  const response = await apiClient.get(`/v1/module-store/jobs/${jobId}`);
  return unwrapPayload(response);
}

export async function setModuleLifecycle(moduleKey, payload) {
  const response = await apiClient.patch(
    `/v1/module-store/definitions/${moduleKey}/lifecycle`,
    payload,
  );
  return unwrapPayload(response);
}

export async function addModuleVersion(moduleKey, payload) {
  const response = await apiClient.post(
    `/v1/module-store/definitions/${moduleKey}/versions`,
    payload,
  );
  return unwrapPayload(response);
}
