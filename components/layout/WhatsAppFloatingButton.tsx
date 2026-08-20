'use client'

import { MessageCircle } from 'lucide-react'
import { useSiteConfig } from '@/components/providers/SiteConfigProvider'

export function WhatsAppFloatingButton() {
  const config = useSiteConfig()

  return (
    <a
      className="whatsapp-float"
      href={config.whatsAppUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Optimum Automobiles on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <span className="whatsapp-float__icon"><MessageCircle aria-hidden="true" /></span>
      <span className="whatsapp-float__copy"><small>Need help?</small><strong>Chat on WhatsApp</strong></span>
    </a>
  )
}
