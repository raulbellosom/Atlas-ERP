import { apiClient } from '@/api/client.js';

export const moduleStoreApi = {
  getCatalog: (params = {}) =>
    apiClient.get('/v1/module-store/catalog', { params }).then((r) => r.data),

  getInstalled: (organizationId) =>
    apiClient
      .get('/v1/module-store/installed', {
        headers: { 'x-organization-id': organizationId },
      })
      .then((r) => r.data),

  install: (payload, organizationId) =>
    apiClient
      .post('/v1/module-store/install', payload, {
        headers: { 'x-organization-id': organizationId },
      })
      .then((r) => r.data),

  uninstall: (payload, organizationId) =>
    apiClient
      .post('/v1/module-store/uninstall', payload, {
        headers: { 'x-organization-id': organizationId },
      })
      .then((r) => r.data),

  upgrade: (payload, organizationId) =>
    apiClient
      .post('/v1/module-store/upgrade', payload, {
        headers: { 'x-organization-id': organizationId },
      })
      .then((r) => r.data),

  getJob: (jobId, organizationId) =>
    apiClient
      .get(`/v1/module-store/jobs/${jobId}`, {
        headers: { 'x-organization-id': organizationId },
      })
      .then((r) => r.data),
};
