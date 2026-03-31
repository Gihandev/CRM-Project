const Spinner = ({ fullPage = false, text = 'Loading...' }) => {
  const inner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-9 h-9 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {inner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-20">
      {inner}
    </div>
  )
}

export default Spinner