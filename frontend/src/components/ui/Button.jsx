const Button = ({
  children,
  onClick,
  type     = 'button',
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  className = '',
}) => {
  const base = [
    'inline-flex items-center justify-center font-medium rounded-lg',
    'transition-all duration-150 focus:outline-none focus:ring-2',
    'focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
    'cursor-pointer select-none',
  ].join(' ')

  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300 shadow-sm',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    ghost:     'text-blue-600 hover:bg-blue-50 focus:ring-blue-300',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1',
    md: 'text-sm px-4 py-2   gap-1.5',
    lg: 'text-sm px-5 py-2.5 gap-2',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button