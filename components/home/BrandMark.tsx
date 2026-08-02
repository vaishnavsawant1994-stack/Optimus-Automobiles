import type { CSSProperties } from 'react'

export function BrandMark({ slug, accent }: { slug: string; accent: string }) {
  return (
    <span
      className="brand-logo-mask"
      style={{ '--brand-logo': `url(/images/brands/${slug}.svg)`, '--brand-accent': accent } as CSSProperties}
      aria-hidden="true"
    />
  )
}
