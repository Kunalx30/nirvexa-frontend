export default function Input({
  label, type = 'text', value, onChange,
  placeholder = '', error = '', hint = '',
  disabled = false, required = false,
  className = '', icon = null,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full bg-dark-700 border text-gray-100 placeholder-gray-500
            rounded-lg px-4 py-3 focus:outline-none focus:ring-2
            focus:ring-primary-500 focus:border-transparent
            transition-all duration-200 disabled:opacity-50
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-dark-600'}
          `}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {hint && !error && <p className="text-gray-500 text-xs">{hint}</p>}
    </div>
  )
}