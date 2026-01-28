interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200',
  ghost: 'px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200',
}

const sizeClasses = {
  sm: 'text-sm px-3 py-1.5',
  md: '',
  lg: 'text-lg px-6 py-3',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
