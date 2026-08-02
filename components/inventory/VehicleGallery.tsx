'use client'

import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { VehicleImageData } from '@/lib/types/inventory'

export function VehicleGallery({ images, title }: { images: VehicleImageData[]; title: string }) {
  const safeImages = images.length ? images : [{ id: 'fallback', url: '/images/hero/deccan-wheels-hero-final.png', thumbnailUrl: '/images/hero/deccan-wheels-hero-final.png', altText: `${title} image unavailable`, category: 'OTHER' }]
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const touchStart = useRef<number | null>(null)

  const previous = useCallback(() => setActive((index) => (index - 1 + safeImages.length) % safeImages.length), [safeImages.length])
  const next = useCallback(() => setActive((index) => (index + 1) % safeImages.length), [safeImages.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowLeft') previous()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'Tab') {
        const controls = [...document.querySelectorAll<HTMLElement>('.vehicle-lightbox button')]
        const first = controls[0]
        const last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
    }
  }, [lightboxOpen, next, previous, safeImages.length])

  function finishSwipe(clientX: number) {
    if (touchStart.current === null) return
    const delta = clientX - touchStart.current
    if (Math.abs(delta) > 45) {
      if (delta > 0) previous()
      else next()
    }
    touchStart.current = null
  }

  const current = safeImages[active]
  return (
    <div className="vehicle-gallery">
      <div className="vehicle-gallery__main" onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null }} onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}>
        <Image src={current.url} alt={current.altText} fill priority sizes="(max-width: 900px) 100vw, 65vw" />
        <span className="vehicle-gallery__counter">{active + 1} / {safeImages.length}</span>
        {safeImages.length > 1 ? <><button type="button" className="vehicle-gallery__previous" aria-label="Previous image" onClick={previous}><ArrowLeft /></button><button type="button" className="vehicle-gallery__next" aria-label="Next image" onClick={next}><ArrowRight /></button></> : null}
        <button ref={openerRef} type="button" className="vehicle-gallery__expand" aria-label="Open full-screen gallery" onClick={() => setLightboxOpen(true)}><Maximize2 /></button>
      </div>
      <div className="vehicle-gallery__thumbs" aria-label="Vehicle image thumbnails">
        {safeImages.map((image, index) => <button key={image.id} type="button" className={index === active ? 'is-active' : ''} aria-label={`Show image ${index + 1}`} aria-pressed={index === active} onClick={() => setActive(index)}><Image src={image.thumbnailUrl} alt="" fill sizes="100px" /></button>)}
      </div>
      {lightboxOpen ? <div className="vehicle-lightbox" role="dialog" aria-modal="true" aria-label={`${title} full-screen gallery`} onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null }} onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}><button className="vehicle-lightbox__backdrop" type="button" aria-label="Close gallery" onClick={() => setLightboxOpen(false)} /><Image src={current.url} alt={current.altText} fill sizes="100vw" /><span>{active + 1} / {safeImages.length}</span><button ref={closeButtonRef} className="vehicle-lightbox__close" type="button" aria-label="Close gallery" onClick={() => setLightboxOpen(false)}><X /></button><button type="button" className="vehicle-lightbox__previous" aria-label="Previous image" onClick={previous}><ArrowLeft /></button><button type="button" className="vehicle-lightbox__next" aria-label="Next image" onClick={next}><ArrowRight /></button></div> : null}
    </div>
  )
}
