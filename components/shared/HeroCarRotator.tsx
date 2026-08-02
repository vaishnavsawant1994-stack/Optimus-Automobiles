'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { heroCarSlides } from '@/lib/constants/site'

const ROTATION_INTERVAL = 5200

export function HeroCarRotator() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroCarSlides.length)
    }, ROTATION_INTERVAL)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="hero-car-rotator" aria-live="off">
      {heroCarSlides.map((slide, index) => (
        <Image
          className={`hero-home__image hero-car-rotator__image${activeSlide === index ? ' is-active' : ''}`}
          src={slide.image}
          alt={slide.alt}
          fill
          priority={index === 0}
          sizes="100vw"
          key={slide.name}
        />
      ))}
    </div>
  )
}
