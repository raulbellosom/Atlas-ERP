/**
 * Pagination — client-side page controls
 *
 * Usage:
 *   const { page, setPage, pageSize, paginate } = usePagination(data, 25);
 *   <Pagination page={page} pageSize={pageSize} total={data.length} onPageChange={setPage} />
 *   <Table data={paginate(filteredData)} ... />
 */
import { useMemo, useState } from 'react';

export function usePagination(pageSize = 25) {
  const [page, setPage] = useState(1);

  function paginate(items) {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }

  function resetPage() {
    setPage(1);
  }

  return { page, setPage, pageSize, paginate, resetPage };
}

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const delta = 1;
    const left = page - delta;
    const right = page + delta;
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) range.push(i);
    }
    const withEllipsis = [];
    let prev = null;
    for (const p of range) {
      if (prev !== null && p - prev > 1) withEllipsis.push('…');
      withEllipsis.push(p);
      prev = p;
    }
    return withEllipsis;
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-2">
      <span className="text-xs text-text-secondary">
        {start}–{end} de {total}
      </span>

      <div className="flex items-center gap-1">
        <PageBtn
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </PageBtn>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-text-disabled select-none">
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              onClick={() => onPageChange(p)}
              active={p === page}
              aria-label={`Página ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </PageBtn>
          ),
        )}

        <PageBtn
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Página siguiente"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'min-w-7 h-7 px-1.5 rounded-md text-xs font-medium transition-colors',
        active
          ? 'bg-brand-500 text-white'
          : disabled
            ? 'text-text-disabled cursor-not-allowed'
            : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
