import Button from './Button.jsx';

export default function Pagination({ pagination, onPageChange }) {
  const { page, pages, total, limit } = pagination;
  if (pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E8E8E8]">
      <p className="text-sm text-[#999999] font-mono">
        {start}–{end} <span className="text-[#CCCCCC]">de</span> {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Anterior
        </Button>
        <span className="text-sm font-mono text-[#666666] px-2">
          {page} / {pages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente →
        </Button>
      </div>
    </div>
  );
}
