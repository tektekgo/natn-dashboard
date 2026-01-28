interface ToggleProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  description?: string
}

export default function Toggle({ label, checked, onChange, disabled = false, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
