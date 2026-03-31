const Pagination = ({ page, totalCount, pageSize = 10, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize)

  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex items-center justify-between mt-4 px-1">

      {/* Showing X - Y of Z */}
      <p className="text-xs text-gray-500">
        Showing <span className="font-medium">{start}–{end}</span> of{' '}
        <span className="font-medium">{totalCount}</span>
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-1">

        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-300
            hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
            text-gray-600 font-medium transition"
        >
          ← Prev
        </button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-xs rounded-lg font-medium transition border ${
              p === page
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-300
            hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
            text-gray-600 font-medium transition"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default Pagination