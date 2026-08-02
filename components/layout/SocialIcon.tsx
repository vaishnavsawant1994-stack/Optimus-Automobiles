import { siFacebook, siInstagram, siYoutube } from 'simple-icons'

const icons = {
  facebook: siFacebook,
  instagram: siInstagram,
  youtube: siYoutube,
}

export function SocialIcon({ network, className = '' }: { network: keyof typeof icons | 'linkedin'; className?: string }) {
  if (network === 'linkedin') {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <text x="12" y="17" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="800">in</text>
      </svg>
    )
  }

  const icon = icons[network]

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d={icon.path} fill="currentColor" />
    </svg>
  )
}
