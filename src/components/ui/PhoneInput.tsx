import { useState, useRef, useEffect } from 'react'
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldValues, Path } from 'react-hook-form'
import { COUNTRIES, PRIORITY_COUNTRIES } from '@/data/countries'

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface PhoneInputProps<T extends FieldValues> {
  /** react-hook-form register for the phone number text field */
  register: UseFormRegister<T>
  /** Field name for the phone number string */
  phoneName: Path<T>
  /** Field name for the dial code string (e.g. "+82") */
  dialCodeName: Path<T>
  /** watch() to read current values */
  watch: UseFormWatch<T>
  /** setValue to inject selected dial code */
  setValue: UseFormSetValue<T>
  /** Error for the phone number field */
  phoneError?: string
  /** Error for the dial code field */
  dialCodeError?: string
  /** Label shown above the input group */
  label?: string
  /** Whether required asterisk is shown */
  required?: boolean
  /** Placeholder for the phone number input */
  placeholder?: string
  /** Extra classes on outer wrapper */
  className?: string
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function PhoneInput<T extends FieldValues>({
  register,
  phoneName,
  dialCodeName,
  watch,
  setValue,
  phoneError,
  dialCodeError,
  label = 'Telephone',
  required = false,
  placeholder = '10-2345-6789',
  className = '',
}: PhoneInputProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const dialCode: string = (watch(dialCodeName) as string) ?? '+82'

  // Merge priority first, then all (deduped by dial code isn't needed — show both groups)
  const allOptions = [...PRIORITY_COUNTRIES, ...COUNTRIES]
  const filtered = search.trim()
    ? allOptions.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dial.includes(search)
      )
    : allOptions

  // Find selected country for display (prefer exact match from full list)
  const selectedCountry =
    COUNTRIES.find((c) => c.dial === dialCode) ??
    PRIORITY_COUNTRIES.find((c) => c.dial === dialCode) ??
    PRIORITY_COUNTRIES[0]

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 30)
    }
  }, [open])

  const handleSelect = (dial: string) => {
    setValue(dialCodeName, dial as never, { shouldValidate: true })
    setOpen(false)
    setSearch('')
  }

  const errorMsg = phoneError ?? dialCodeError

  return (
    <div className={className}>
      {/* Label */}
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>

      <div className="flex gap-2">
        {/* ── Country code selector ── */}
        <div className="relative shrink-0" ref={wrapperRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Country code: ${selectedCountry.name} ${dialCode}`}
            className={`form-input w-28 flex items-center gap-1.5 cursor-pointer pr-2 select-none
              ${open ? 'border-brand-teal ring-2 ring-brand-teal/20' : ''}`}
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="text-sm font-medium tabular-nums">{dialCode}</span>
            <svg
              className={`w-3.5 h-3.5 ml-auto text-brand-muted shrink-0 transition-transform duration-200
                ${open ? 'rotate-180' : ''}`}
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" />
            </svg>
          </button>

          {/* Dropdown panel */}
          {open && (
            <div
              role="listbox"
              aria-label="Select country code"
              className="absolute z-30 top-full left-0 mt-1 w-68 min-w-[260px] bg-white border border-brand-border
                         rounded-xl shadow-premium-lg overflow-hidden"
            >
              {/* Search */}
              <div className="p-2 border-b border-brand-border">
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted pointer-events-none" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M6.5 1a5.5 5.5 0 104.22 9.03l2.62 2.62a.75.75 0 001.06-1.06L11.78 9.2A5.5 5.5 0 006.5 1zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search country or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-sm border border-brand-border rounded-lg
                               focus:outline-none focus:border-brand-teal bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') { setOpen(false); setSearch('') }
                    }}
                  />
                </div>
              </div>

              {/* Options */}
              <ul className="max-h-52 overflow-y-auto">
                {filtered.length === 0 ? (
                  <li className="px-3 py-4 text-sm text-brand-muted text-center">No results</li>
                ) : (
                  filtered.map((c) => (
                    <li key={`${c.code}-${c.dial}`} role="option" aria-selected={c.dial === dialCode}>
                      <button
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors duration-100
                          ${c.dial === dialCode
                            ? 'bg-brand-cream/80 font-semibold'
                            : 'hover:bg-brand-cream/60'
                          }`}
                        onClick={() => handleSelect(c.dial)}
                      >
                        <span className="text-base w-6 shrink-0 leading-none">{c.flag}</span>
                        <span className="flex-1 text-brand-navy truncate">{c.name}</span>
                        <span className="text-brand-muted font-mono text-xs shrink-0">{c.dial}</span>
                        {c.dial === dialCode && (
                          <svg className="w-3.5 h-3.5 text-brand-teal shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                          </svg>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* ── Phone number input ── */}
        <input
          {...register(phoneName)}
          type="tel"
          className={`form-input flex-1${errorMsg ? ' border-red-400 focus:border-red-500' : ''}`}
          placeholder={placeholder}
          autoComplete="tel-national"
        />
      </div>

      {/* Error */}
      {errorMsg && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0V5zm-.75 6.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
          {errorMsg}
        </p>
      )}
    </div>
  )
}
