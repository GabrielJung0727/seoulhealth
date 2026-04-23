import { useState, useRef, useCallback, useEffect } from 'react'
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldValues, Path } from 'react-hook-form'
import { EMAIL_DOMAINS } from '@/data/countries'

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface EmailInputProps<T extends FieldValues> {
  /** react-hook-form register function */
  register: UseFormRegister<T>
  /** field name in the form (must be a string field) */
  name: Path<T>
  /** watch function to observe the email value */
  watch: UseFormWatch<T>
  /** setValue to inject selected suggestion */
  setValue: UseFormSetValue<T>
  /** Validation error message */
  error?: string
  /** Label text */
  label?: string
  /** Whether the field is required (shows asterisk) */
  required?: boolean
  /** Input placeholder */
  placeholder?: string
  /** Extra CSS classes on the wrapper div */
  className?: string
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function EmailInput<T extends FieldValues>({
  register,
  name,
  watch,
  setValue,
  error,
  label = 'Email Address',
  required = false,
  placeholder = 'you@example.com',
  className = '',
}: EmailInputProps<T>) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const emailValue: string = (watch(name) as string) ?? ''
  const atIndex = emailValue.indexOf('@')
  const localPart = atIndex >= 0 ? emailValue.slice(0, atIndex + 1) : emailValue
  const typedDomain = atIndex >= 0 ? emailValue.slice(atIndex + 1) : ''

  const suggestions = atIndex >= 0
    ? EMAIL_DOMAINS.filter(
        (d) => d.startsWith(typedDomain) && d !== typedDomain
      )
    : []

  const showDropdown = open && suggestions.length > 0

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1)
  }, [suggestions.length, emailValue])

  const selectSuggestion = useCallback(
    (domain: string) => {
      setValue(name, `${localPart}${domain}` as never, { shouldValidate: true })
      setOpen(false)
      setActiveIndex(-1)
      inputRef.current?.focus()
    },
    [localPart, name, setValue]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, -1))
        break
      case 'Enter':
        if (activeIndex >= 0) {
          e.preventDefault()
          selectSuggestion(suggestions[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        setActiveIndex(-1)
        break
      case 'Tab':
        if (activeIndex >= 0) {
          e.preventDefault()
          selectSuggestion(suggestions[activeIndex])
        } else {
          setOpen(false)
        }
        break
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const { ref: rhfRef, ...restRegister } = register(name)

  return (
    <div className={className}>
      {/* Label */}
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>

      {/* Input + dropdown wrapper */}
      <div className="relative">
        <input
          {...restRegister}
          ref={(el) => {
            rhfRef(el)
            inputRef.current = el
          }}
          type="email"
          className={`form-input${error ? ' border-red-400 focus:border-red-500' : ''}`}
          placeholder={placeholder}
          autoComplete="email"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? `${String(name)}-suggestions` : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${String(name)}-opt-${activeIndex}` : undefined}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
        />

        {/* Suggestion dropdown */}
        {showDropdown && (
          <ul
            id={`${String(name)}-suggestions`}
            ref={listRef}
            role="listbox"
            aria-label="Email domain suggestions"
            className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-brand-border
                       rounded-xl shadow-premium overflow-hidden text-sm max-h-48 overflow-y-auto"
          >
            {suggestions.map((domain, i) => (
              <li key={domain} role="option" aria-selected={i === activeIndex} id={`${String(name)}-opt-${i}`}>
                <button
                  type="button"
                  className={`w-full text-left px-4 py-2.5 transition-colors duration-100 font-medium
                    ${i === activeIndex
                      ? 'bg-brand-cream text-brand-navy'
                      : 'text-brand-navy hover:bg-brand-cream/60'
                    }`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectSuggestion(domain)
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <span className="text-brand-muted">{localPart}</span>
                  <span className="text-brand-teal">{domain}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0V5zm-.75 6.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
