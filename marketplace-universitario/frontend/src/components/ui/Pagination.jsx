import Button from './Button.jsx';

export default function Pagination({ pagination, onPageChange }) {
  const { page, pages, total, limit } = pagination;
  if (pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-gray-500">
        Mostrando {start}–{end} de {total} resultados
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
        <span className="text-sm font-medium text-gray-700">
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
