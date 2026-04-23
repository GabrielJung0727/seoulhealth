import { useState, useRef, useEffect, useCallback } from 'react'
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldValues, Path } from 'react-hook-form'
import { COUNTRIES, PRIORITY_COUNTRIES } from '@/data/countries'

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface CountrySelectProps<T extends FieldValues> {
  register: UseFormRegister<T>
  name: Path<T>
  watch: UseFormWatch<T>
  setValue: UseFormSetValue<T>
  error?: string
  label?: string
  required?: boolean
  placeholder?: string
  className?: string
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function CountrySelect<T extends FieldValues>({
  register,
  name,
  watch,
  setValue,
  error,
  label = 'Country of Origin',
  required = false,
  placeholder = 'Select country...',
  className = '',
}: CountrySelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const value: string = (watch(name) as string) ?? ''

  const selected = COUNTRIES.find((c) => c.code === value) ?? PRIORITY_COUNTRIES.find((c) => c.code === value)

  // Filtered lists
  const q = search.trim().toLowerCase()
  const filteredPriority = q
    ? PRIORITY_COUNTRIES.filter((c) => c.name.toLowerCase().includes(q))
    : PRIORITY_COUNTRIES
  const filteredAll = q
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q))
    : COUNTRIES

  const hasResults = filteredPriority.length > 0 || filteredAll.length > 0

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

  // Focus search on open
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 30)
  }, [open])

  const handleSelect = useCallback(
    (code: string) => {
      setValue(name, code as never, { shouldValidate: true })
      setOpen(false)
      setSearch('')
    },
    [name, setValue]
  )

  // Register without ref so we can control display ourselves
  const { ref: _rhfRef, ...restRegister } = register(name)
  void _rhfRef // suppress unused warning — RHF registration still happens via setValue

  return (
    <div className={className}>
      {/* Label */}
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>

      <div className="relative" ref={wrapperRef}>
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={selected ? `Selected: ${selected.name}` : placeholder}
          className={`form-input w-full flex items-center gap-2.5 cursor-pointer text-left select-none
            ${open ? 'border-brand-teal ring-2 ring-brand-teal/20' : ''}
            ${error ? 'border-red-400' : ''}
            ${!selected ? 'text-brand-muted' : ''}`}
        >
          {selected ? (
            <>
              <span className="text-base leading-none shrink-0">{selected.flag}</span>
              <span className="flex-1 text-brand-navy text-sm font-medium">{selected.name}</span>
            </>
          ) : (
            <span className="flex-1 text-sm">{placeholder}</span>
          )}
          <svg
            className={`w-4 h-4 text-brand-muted shrink-0 transition-transform duration-200
              ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" />
          </svg>
        </button>

        {/* Hidden input for RHF registration */}
        <input type="hidden" {...restRegister} value={value} />

        {/* Dropdown */}
        {open && (
          <div
            role="listbox"
            aria-label="Select country"
            className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-brand-border
                       rounded-xl shadow-premium-lg overflow-hidden"
          >
            {/* Search box */}
            <div className="p-2 border-b border-brand-border">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted pointer-events-none" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M6.5 1a5.5 5.5 0 104.22 9.03l2.62 2.62a.75.75 0 001.06-1.06L11.78 9.2A5.5 5.5 0 006.5 1zm-4 5.5a4 4 0 118 0 4 4 0 01-8 0z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search country..."
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

            <ul className="max-h-56 overflow-y-auto">
              {!hasResults && (
                <li className="px-3 py-4 text-sm text-brand-muted text-center">No results</li>
              )}

              {/* Priority group */}
              {filteredPriority.length > 0 && (
                <>
                  {!q && (
                    <li className="px-3 py-1.5 text-[0.6rem] font-bold tracking-widest uppercase text-brand-muted bg-brand-cream/60">
                      Common
                    </li>
                  )}
                  {filteredPriority.map((c) => (
                    <CountryOption
                      key={`p-${c.code}`}
                      country={c}
                      selected={value === c.code}
                      onSelect={handleSelect}
                    />
                  ))}
                  {!q && filteredAll.length > 0 && (
                    <li className="px-3 py-1.5 text-[0.6rem] font-bold tracking-widest uppercase text-brand-muted bg-brand-cream/60">
                      All Countries
                    </li>
                  )}
                </>
              )}

              {/* All countries */}
              {filteredAll.map((c) => (
                <CountryOption
                  key={c.code}
                  country={c}
                  selected={value === c.code}
                  onSelect={handleSelect}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Error */}
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

/* ─── Country Option Row ─────────────────────────────────────────────────── */
function CountryOption({
  country,
  selected,
  onSelect,
}: {
  country: { code: string; flag: string; name: string; dial: string }
  selected: boolean
  onSelect: (code: string) => void
}) {
  return (
    <li role="option" aria-selected={selected}>
      <button
        type="button"
        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors duration-100
          ${selected ? 'bg-brand-cream/80 font-semibold' : 'hover:bg-brand-cream/60'}`}
        onClick={() => onSelect(country.code)}
      >
        <span className="text-base w-6 shrink-0 leading-none">{country.flag}</span>
        <span className="flex-1 text-brand-navy truncate">{country.name}</span>
        {selected && (
          <svg className="w-3.5 h-3.5 text-brand-teal shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
        )}
      </button>
    </li>
  )
}
