import Link from 'next/link'

type BrandLogoProps = {
  compact?: boolean
}

export function DeccanMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`deccan-mark ${className}`}
      viewBox="0 0 92 42"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 10h31l7 7-7 7H18l6 6h13l-8 8H17L3 22h27l3-4H11L4 10Z" />
      <path d="M88 10H57l-7 7 7 7h17l-6 6H55l8 8h12l14-16H62l-3-4h22l7-8Z" />
      <path d="m39 10 7 7 7-7h10L46 34 29 10h10Z" />
    </svg>
  )
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <Link className="brand-logo" href="/" aria-label="Deccan Wheels home">
      <DeccanMark className="brand-logo__mark" />
      {!compact ? (
        <span className="brand-logo__copy">
          <strong>Deccan Wheels</strong>
          <small>Pre-owned luxury cars</small>
        </span>
      ) : null}
    </Link>
  )
}
