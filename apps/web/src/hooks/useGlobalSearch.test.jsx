import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { useGlobalSearch } from './useGlobalSearch';

const matcher = (item, q) => item.name.toLowerCase().includes(q);

describe('useGlobalSearch', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('sincroniza resultados cuando cambia la lista aunque no cambie el query', () => {
    const { result, rerender } = renderHook(
      ({ items }) => useGlobalSearch(items, matcher),
      { initialProps: { items: [] } },
    );

    expect(result.current.results).toEqual([]);

    rerender({ items: [{ id: '1', name: 'Cuenta Principal' }] });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].name).toBe('Cuenta Principal');
  });

  it('aplica debounce al filtrar por query', () => {
    vi.useFakeTimers();

    const items = [
      { id: '1', name: 'Cuenta Principal' },
      { id: '2', name: 'Caja Chica' },
    ];

    const { result } = renderHook(() =>
      useGlobalSearch(items, matcher, { debounceMs: 200 }),
    );

    act(() => {
      result.current.setQuery('caja');
    });

    expect(result.current.results).toHaveLength(2);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].name).toBe('Caja Chica');
  });

  it('evita bucle de render cuando items mantiene contenido pero cambia de referencia', () => {
    const matcherAny = () => true;

    function useHarness() {
      const [ready, setReady] = useState(false);
      useEffect(() => {
        setReady(true);
      }, []);

      const search = useGlobalSearch([], matcherAny);
      return { ready, ...search };
    }

    expect(() => renderHook(() => useHarness())).not.toThrow();
  });
});
