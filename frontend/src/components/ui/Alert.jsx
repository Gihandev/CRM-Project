const Alert = ({ type = 'error', message }) => {
  if (!message) return null

  const styles = {
    error:   'bg-red-50    border-red-200   text-red-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'bg-amber-50  border-amber-200 text-amber-700',
    info:    'bg-blue-50   border-blue-200  text-blue-700',
  }

  const icons = {
    error:   '⚠',
    success: '✓',
    warning: '⚠',
    info:    'ℹ',
  }

  return (
    <div className={`flex items-start gap-2 px-4 py-3 rounded-lg border text-sm ${styles[type]}`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  )
}

export default Alert