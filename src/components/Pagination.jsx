export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i).filter(
    (p) => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1
  )

  let lastRendered = -1
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap mt-6">
      <button
        className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        ← Anterior
      </button>
      {pages.map((p) => {
        const showEllipsis = p - lastRendered > 1
        lastRendered = p
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && <span className="px-1 text-gray-400">…</span>}
            <button
              onClick={() => onChange(p)}
              className={`h-8 w-8 rounded-lg text-sm ${
                p === page ? 'bg-primary-600 text-white font-semibold' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {p + 1}
            </button>
          </span>
        )
      })}
      <button
        className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        Siguiente →
      </button>
    </div>
  )
}
