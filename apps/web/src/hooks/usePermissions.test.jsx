import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { FINOPS_PERMISSIONS } from '@/modules/financial-operations/routes';
import useAuthStore from '@/store/auth.store';
import { usePermissions } from './usePermissions';

describe('usePermissions', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });

  it('treats lowercase owner/admin roles as admin users', () => {
    useAuthStore.setState({
      user: {
        role: 'owner',
        permissions: [],
      },
      isAuthenticated: true,
    });

    const { result } = renderHook(() => usePermissions());
    expect(result.current.isAdmin).toBe(true);
  });

  it('keeps backward compatibility for uppercase OWNER/ADMIN roles', () => {
    useAuthStore.setState({
      user: {
        role: 'ADMIN',
        permissions: [],
      },
      isAuthenticated: true,
    });

    const { result } = renderHook(() => usePermissions());
    expect(result.current.isAdmin).toBe(true);
  });

  it('checks granular permissions from auth payload', () => {
    useAuthStore.setState({
      user: {
        role: 'tesorero',
        permissions: ['finops:receivable:write'],
      },
      isAuthenticated: true,
    });

    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasAny(FINOPS_PERMISSIONS.RECEIVABLE_WRITE)).toBe(true);
    expect(result.current.hasAny(FINOPS_PERMISSIONS.PAYABLE_WRITE)).toBe(false);
  });

  it('uses backend-aligned finops receivable/payable permission keys', () => {
    expect(FINOPS_PERMISSIONS.RECEIVABLE_READ).toBe('finops:receivable:read');
    expect(FINOPS_PERMISSIONS.RECEIVABLE_WRITE).toBe('finops:receivable:write');
    expect(FINOPS_PERMISSIONS.PAYABLE_READ).toBe('finops:payable:read');
    expect(FINOPS_PERMISSIONS.PAYABLE_WRITE).toBe('finops:payable:write');
  });
});
