'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { buildWhatsAppUrl, businessIdentity } from '@/lib/constants/business'
import { siteConfig } from '@/lib/constants/site'

type PublicSiteConfig = typeof siteConfig
type ApiPayload = { data?: { settings?: Record<string, string>; showroom?: { name?: string; address?: string; city?: string; state?: string; postalCode?: string; phone?: string; email?: string; hours?: string; mapUrl?: string } | null } }

const SiteConfigContext = createContext<PublicSiteConfig>(siteConfig)

function phoneHref(phone: string) { return `tel:${phone.replace(/[^+\d]/g, '')}` }
function whatsappHref(value: string) {
  if (/^https?:\/\//i.test(value)) return value
  return buildWhatsAppUrl(businessIdentity.whatsappMessage, value)
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PublicSiteConfig>(siteConfig)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/site-config', { signal: controller.signal }).then((response) => response.ok ? response.json() : null).then((payload: ApiPayload | null) => {
      if (!payload?.data) return
      const values = payload.data.settings ?? {}; const showroom = payload.data.showroom
      setConfig((current) => {
        const phone = values.primary_phone || showroom?.phone || current.phone
        const secondaryPhone = values.support_phone || current.secondaryPhone
        const email = values.sales_email || showroom?.email || current.email
        const secondaryEmail = values.support_email || current.secondaryEmail
        const address = showroom ? [showroom.address, showroom.city, showroom.state, showroom.postalCode].filter(Boolean).join(', ') : values.inventory_location || current.address
        return { ...current, name: values.site_name || current.name, tagline: values.site_tagline || current.tagline, phone, phoneHref: phoneHref(phone), secondaryPhone, secondaryPhoneHref: secondaryPhone ? phoneHref(secondaryPhone) : '/contact', email, emailHref: `mailto:${email}`, secondaryEmail, secondaryEmailHref: `mailto:${secondaryEmail}`, address, hours: values.opening_hours || showroom?.hours || current.hours, mapsUrl: showroom?.mapUrl || current.mapsUrl, whatsAppUrl: whatsappHref(values.whatsapp || phone), facebook: values.facebook_url ?? current.facebook, instagram: values.instagram_url ?? current.instagram, youtube: values.youtube_url ?? current.youtube, linkedin: values.linkedin_url ?? current.linkedin }
      })
    }).catch(() => undefined)
    return () => controller.abort()
  }, [])
  const value = useMemo(() => config, [config])
  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig() { return useContext(SiteConfigContext) }
