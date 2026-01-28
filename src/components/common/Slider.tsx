interface SliderProps {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  className?: string
}

export default function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  className = '',
}: SliderProps) {
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <span className="text-sm font-mono text-gray-600">
            {value}{suffix}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  )
}
