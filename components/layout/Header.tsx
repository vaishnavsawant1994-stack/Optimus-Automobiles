'use client'

import {
  ChevronDown,
  Clock3,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Settings,
  LogOut,
  UserRound,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { SocialIcon } from '@/components/layout/SocialIcon'
import { navItems } from '@/lib/constants/site'
import type { SearchSuggestion } from '@/lib/types/inventory'
import { useFavourites } from '@/components/providers/FavouriteProvider'
import { useSiteConfig } from '@/components/providers/SiteConfigProvider'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'

export function Header() {
  const pathname = usePathname()
  const { data: session, status: sessionStatus } = useSession()
  const favourites = useFavourites()
  const publicConfig = useSiteConfig()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchSuggestion[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileDialogRef = useFocusTrap<HTMLDivElement>(mobileOpen)
  const searchDialogRef = useFocusTrap<HTMLDivElement>(searchOpen)

  useEffect(() => {
    if (!searchOpen) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearchLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        const payload = await response.json() as { data?: SearchSuggestion[] }
        setResults(response.ok ? payload.data ?? [] : [])
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setResults([])
      } finally {
        setSearchLoading(false)
      }
    }, query.trim() ? 220 : 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query, searchOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
        setSearchOpen(false)
        setMobileOpen(false)
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    document.body.classList.toggle('drawer-open', mobileOpen || searchOpen)
    return () => document.body.classList.remove('drawer-open')
  }, [mobileOpen, searchOpen])

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="utility-bar">
        <div className="utility-bar__inner">
          <div className="utility-group utility-group--wide">
            <a href={publicConfig.phoneHref}>
              <Phone size={14} />
              {publicConfig.phone}
            </a>
            <span className="utility-divider" />
            <a href={publicConfig.mapsUrl} target="_blank" rel="noreferrer">
              <MapPin size={14} />
              {publicConfig.address}
            </a>
            <span className="utility-divider" />
            <span>
              <Clock3 size={14} />
              {publicConfig.hours}
            </span>
          </div>
          <div className="utility-group">
            <a className="whatsapp-link" href={publicConfig.whatsAppUrl} target="_blank" rel="noreferrer">
              <MessageCircle size={14} />
              {publicConfig.whatsAppUrl.startsWith('https://wa.me/') ? 'Chat on WhatsApp' : 'Contact Us'}
            </a>
            <span className="utility-divider utility-divider--social" />
            {([['facebook', publicConfig.facebook], ['instagram', publicConfig.instagram], ['youtube', publicConfig.youtube], ['linkedin', publicConfig.linkedin]] as const).filter(([, href]) => href && !/^https?:\/\/(www\.)?(facebook|linkedin)\.com\/?$/i.test(href)).map(([network, href]) => <a href={href} aria-label={network} target="_blank" rel="noreferrer" key={network}><SocialIcon network={network} /></a>)}
          </div>
        </div>
      </div>

      <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
        <div className="site-header__inner">
          <BrandLogo priority />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => {
              const expanded = openMenu === item.label
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <div className="nav-item" key={item.label}>
                  {item.children ? (
                    <button
                      type="button"
                      className={`nav-button${active ? ' is-active' : ''}`}
                      aria-expanded={expanded}
                      aria-controls={`menu-${item.label}`}
                      onClick={() => setOpenMenu(expanded ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown size={14} />
                    </button>
                  ) : (
                    <Link className={`nav-link${active ? ' is-active' : ''}`} href={item.href}>
                      {item.label}
                    </Link>
                  )}
                  {item.children && expanded ? (
                    <div className="dropdown-menu" id={`menu-${item.label}`} role="menu">
                      {item.children.map(([label, href]) => (
                        <Link key={href} href={href} role="menuitem" onClick={() => setOpenMenu(null)}>
                          {label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </nav>
          <div className="header-actions">
            <button type="button" className="icon-button" aria-label="Open search" onClick={() => setSearchOpen(true)}>
              <Search size={18} />
            </button>
            <Link className="icon-button header-favorite" href="/favorites" aria-label={`${favourites.count} saved vehicles`}>
              <Heart size={18} />
              {favourites.count ? <span>{favourites.count > 99 ? '99+' : favourites.count}</span> : null}
            </Link>
            {sessionStatus === 'authenticated' && session?.user ? (
              <div className="header-account">
                <button className="icon-button header-account__trigger" type="button" aria-label="Open customer account menu" aria-expanded={openMenu === '__account'} onClick={() => setOpenMenu(openMenu === '__account' ? null : '__account')}>
                  {session.user.image ? <Image src={session.user.image} alt="" width={30} height={30} /> : <span>{session.user.name?.charAt(0).toUpperCase() ?? <UserRound size={18} />}</span>}
                </button>
                {openMenu === '__account' ? <div className="account-menu"><header><small>Signed in as</small><strong>{session.user.name ?? 'Customer'}</strong><span>{session.user.email}</span></header><Link href="/account" onClick={() => setOpenMenu(null)}><UserRound />My account</Link><Link href="/account/settings" onClick={() => setOpenMenu(null)}><Settings />Settings</Link><button type="button" onClick={() => signOut({ callbackUrl: '/' })}><LogOut />Sign out</button></div> : null}
              </div>
            ) : <Link className="icon-button" href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} aria-label="Sign in"><UserRound size={18} /></Link>}
            <button
              type="button"
              className="icon-button mobile-menu-button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation" ref={mobileDialogRef}>
          <div className="drawer__panel">
            <div className="drawer__header">
              <BrandLogo compact />
              <button type="button" className="icon-button" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="drawer__nav">
              {navItems.map((item) => <div className="drawer__nav-group" key={item.href}><Link href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>{item.children ? <div className="drawer__subnav">{item.children.map(([label, href]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)}>{label}</Link>)}</div> : null}</div>)}
              <Link href={session ? '/account' : `/login?callbackUrl=${encodeURIComponent(pathname)}`} onClick={() => setMobileOpen(false)}>{session ? 'My Account' : 'Sign In'}</Link>
              <Link href="/favorites" onClick={() => setMobileOpen(false)}>Saved Vehicles {favourites.count ? `(${favourites.count})` : ''}</Link>
            </nav>
            <a className="gold-button" href={publicConfig.whatsAppUrl} target="_blank" rel="noreferrer">
              {publicConfig.whatsAppUrl.startsWith('https://wa.me/') ? 'Chat on WhatsApp' : 'Contact Us'}
            </a>
          </div>
        </div>
      ) : null}

      {searchOpen ? (
        <div className="search-modal" role="dialog" aria-modal="true" aria-label="Global vehicle search" ref={searchDialogRef}>
          <button className="modal-backdrop" type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} />
          <div className="search-modal__panel">
            <div className="search-modal__header">
              <label htmlFor="global-search">Search inventory</label>
              <button type="button" className="icon-button" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="search-input-wrap">
              <Search size={18} />
              <input
                ref={searchInputRef}
                id="global-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search make, model, variant or year"
              />
            </div>
            <div className="search-results" role="listbox">
              {searchLoading ? <p className="search-results__status">Searching inventory...</p> : null}
              {results.map((item) => (
                <Link key={item.id} href={item.href} onClick={() => setSearchOpen(false)}>
                  <Image src={item.image} alt={`${item.title} thumbnail`} width={72} height={48} />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </span>
                </Link>
              ))}
              {!searchLoading && !results.length ? <p className="search-results__status">No matching vehicles found.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
