import Link from 'next/link'

type BrandLogoProps = {
  compact?: boolean
}

export function OptimumMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`optimum-mark ${className}`}
      viewBox="0 0 96 42"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 12h27l8 9-8 9H12l-7-7h22l2-2-2-2H9L3 12Z" />
      <path d="M93 12H66l-8 9 8 9h18l7-7H69l-2-2 2-2h18l6-7Z" />
      <circle cx="48" cy="21" r="15" />
      <text x="48" y="26" textAnchor="middle">OA</text>
    </svg>
  )
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <Link className="brand-logo" href="/" aria-label="Optimum Automobiles home">
      <OptimumMark className="brand-logo__mark" />
      {!compact ? (
        <span className="brand-logo__copy">
          <strong>Optimum Automobiles</strong>
          <small>Pre-owned luxury cars</small>
        </span>
      ) : null}
    </Link>
  )
}
