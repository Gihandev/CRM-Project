const Input = ({
  label,
  name,
  type      = 'text',
  value,
  onChange,
  placeholder = '',
  error       = '',
  required    = false,
  className   = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>

      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Input */}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={[
          'w-full px-3 py-2 text-sm rounded-lg border bg-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'placeholder:text-gray-400 transition',
          error
            ? 'border-red-400 bg-red-50 focus:ring-red-400'
            : 'border-gray-300 hover:border-gray-400',
        ].join(' ')}
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          ⚠ {error}
        </p>
      )}
    </div>
  )
}

export default Input