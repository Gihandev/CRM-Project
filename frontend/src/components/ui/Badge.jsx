const COLORS = {
  gray:   'bg-gray-100    text-gray-700   border-gray-200',
  blue:   'bg-blue-100    text-blue-700   border-blue-200',
  green:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-100   text-amber-700  border-amber-200',
  red:    'bg-red-100     text-red-700    border-red-200',
  purple: 'bg-purple-100  text-purple-700 border-purple-200',
  indigo: 'bg-indigo-100  text-indigo-700 border-indigo-200',
}

const Badge = ({ children, color = 'gray' }) => (
  <span className={`
    inline-flex items-center px-2.5 py-0.5 rounded-full
    text-xs font-medium border
    ${COLORS[color] || COLORS.gray}
  `}>
    {children}
  </span>
)

export default Badge