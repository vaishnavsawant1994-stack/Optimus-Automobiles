'use client'

import { useEffect, useRef } from 'react'

const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!active || !ref.current) return
    const previous = document.activeElement as HTMLElement | null
    const container = ref.current
    const elements = () => Array.from(container.querySelectorAll<HTMLElement>(focusable)).filter((element) => !element.hidden)
    elements()[0]?.focus()
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const items = elements(); if (!items.length) return
      const first = items[0]; const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    container.addEventListener('keydown', trap)
    return () => { container.removeEventListener('keydown', trap); previous?.focus() }
  }, [active])
  return ref
}
