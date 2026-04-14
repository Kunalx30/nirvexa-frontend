import LoadingSpinner from './LoadingSpinner'

export default function Button({
  children, onClick, type = 'button',
  variant = 'primary', size = 'md',
  loading = false, disabled = false,
  className = '', fullWidth = false,
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-gray-200 border border-dark-600',
    ghost:     'hover:bg-dark-700 text-gray-400 hover:text-gray-200',
    danger:    'bg-red-600 hover:bg-red-700 text-white',
    success:   'bg-green-600 hover:bg-green-700 text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? <LoadingSpinner size="sm" /> : children}
    </button>
  )
}