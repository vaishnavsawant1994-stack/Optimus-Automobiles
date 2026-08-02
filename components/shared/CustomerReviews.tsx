'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight, BadgeCheck, Car, MapPin, Quote, Star } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { testimonials } from '@/lib/constants/site'

function slugFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function CustomerReviews({ title = 'Happy Customers' }: { title?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true, skipSnaps: false })
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)

  useEffect(() => {
    if (!emblaApi) return
    const updateSelected = () => setActiveTestimonial(emblaApi.selectedScrollSnap())
    emblaApi.on('select', updateSelected)
    return () => { emblaApi.off('select', updateSelected) }
  }, [emblaApi])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches || isCarouselPaused) return

    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => {
        const next = (current + 1) % testimonials.length
        emblaApi?.scrollTo(next)
        return next
      })
    }, 4200)
    return () => window.clearInterval(timer)
  }, [emblaApi, isCarouselPaused])

  return (
    <section className="testimonials container-wide">
      <div className="section-title"><span /><h2>{title}</h2><span /></div>
      <div className="testimonial-summary" aria-label="Customer satisfaction rating">
        <strong>4.9</strong>
        <span className="testimonial-summary__stars" aria-label="Rated 4.9 out of 5 stars">
          {Array.from({ length: 5 }).map((_, index) => <Star key={index} aria-hidden="true" fill="currentColor" />)}
        </span>
        <span>from 2,500+ verified buyers</span>
      </div>
      <div
        className="testimonial-wrap"
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
        onFocusCapture={() => setIsCarouselPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsCarouselPaused(false)
        }}
      >
        <button className="round-nav round-nav--left" type="button" aria-label="Previous testimonials" onClick={() => emblaApi?.scrollPrev()}><ArrowLeft size={18} /></button>
        <div className="embla" ref={emblaRef}>
          <div className="testimonial-track">
            {testimonials.map((testimonial, index) => {
              const titleId = `testimonial-${slugFor(testimonial.name)}`
              return (
                <article
                  className={`testimonial-card${activeTestimonial === index ? ' testimonial-card--active' : ''}`}
                  key={testimonial.name}
                  aria-labelledby={titleId}
                  onMouseEnter={() => setActiveTestimonial(index)}
                  onFocus={() => setActiveTestimonial(index)}
                  tabIndex={0}
                >
                  <Quote className="testimonial-card__quote" aria-hidden="true" />
                  <div className="testimonial-card__content">
                    <div className="testimonial-card__header">
                      <div className="testimonial-card__reviewer">
                        <div className="testimonial-card__avatar">
                          <Image src={testimonial.avatar} alt="" aria-hidden="true" width={76} height={76} />
                          <BadgeCheck aria-hidden="true" />
                        </div>
                        <div>
                          <h3 id={titleId}>{testimonial.name}</h3>
                          <span className="testimonial-card__verified"><BadgeCheck aria-hidden="true" />Verified buyer</span>
                        </div>
                      </div>
                      <div className="testimonial-card__score">
                        <strong>5.0</strong>
                        <span className="testimonial-rating" aria-label="Rated 5 out of 5 stars">
                          {Array.from({ length: 5 }).map((_, starIndex) => <Star key={starIndex} aria-hidden="true" fill="currentColor" />)}
                        </span>
                      </div>
                    </div>
                    <q>{testimonial.quote}</q>
                    <div className="testimonial-card__footer">
                      <span className="testimonial-card__purchase"><Car aria-hidden="true" />{testimonial.purchase}</span>
                      <span><MapPin aria-hidden="true" />{testimonial.location}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
        <button className="round-nav round-nav--right" type="button" aria-label="Next testimonials" onClick={() => emblaApi?.scrollNext()}><ArrowRight size={18} /></button>
      </div>
      <div className="testimonial-dots" aria-label="Choose testimonial">
        {testimonials.map((testimonial, index) => (
          <button
            type="button"
            key={testimonial.name}
            className={activeTestimonial === index ? 'is-active' : ''}
            aria-label={`Show testimonial from ${testimonial.name}`}
            aria-pressed={activeTestimonial === index}
            onClick={() => { setActiveTestimonial(index); emblaApi?.scrollTo(index) }}
          />
        ))}
      </div>
    </section>
  )
}
