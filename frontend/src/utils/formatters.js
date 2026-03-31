// Format ISO date string to readable format
// "2026-03-31T10:00:00Z"  →  "Mar 31, 2026"
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  })
}

// Capitalize first letter
// "admin"  →  "Admin"
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Tailwind color classes for action badges in activity log
export const getActionColor = (action) => {
  const map = {
    CREATE: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    UPDATE: 'bg-amber-100  text-amber-700  border border-amber-200',
    DELETE: 'bg-red-100    text-red-700    border border-red-200',
  }
  return map[action] || 'bg-gray-100 text-gray-600'
}

// Tailwind color classes for role badges
export const getRoleColor = (role) => {
  const map = {
    admin:   'bg-purple-100 text-purple-700 border border-purple-200',
    manager: 'bg-blue-100   text-blue-700   border border-blue-200',
    staff:   'bg-gray-100   text-gray-600   border border-gray-200',
  }
  return map[role] || 'bg-gray-100 text-gray-600'
}