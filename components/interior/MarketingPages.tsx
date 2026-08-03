'use client'

import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Car,
  CarFront,
  Check,
  FileText,
  ImageIcon,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Star,
  UploadCloud,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { FormEvent } from 'react'
import { useState } from 'react'
import {
  FaqList,
  IconFeatureGrid,
  InteriorCta,
  InteriorHeading,
  PageHero,
  ProcessSteps,
} from '@/components/interior/PagePrimitives'
import { CustomerReviews } from '@/components/shared/CustomerReviews'
import {
  aboutValues,
  contactDetails,
  faqs,
  helpCards,
  interiorImages,
  journeySteps,
  sellingSteps,
  serviceCards,
  trustStats,
  whySell,
} from '@/lib/constants/interior'
import { gallery, siteConfig } from '@/lib/constants/site'

function CredibilityStrip() {
  return (
    <div className="credibility-strip container-wide">
      <span><ShieldCheck /><strong>No Obligation</strong><small>100% free evaluation</small></span>
      <span><BadgeCheck /><strong>Secure & Confidential</strong><small>Your data is safe</small></span>
      <span><Car /><strong>5000+ Cars Sold</strong><small>Trusted by customers</small></span>
      <span><Star /><strong>Google Rated 4.9/5</strong><small>Verified reviews</small></span>
    </div>
  )
}

function SellValuationForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileNotice, setFileNotice] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  function addFiles(incoming: File[]) {
    const accepted = incoming.filter((file) => (file.type.startsWith('image/') || file.type === 'application/pdf') && file.size <= 10 * 1024 * 1024)
    const rejectedCount = incoming.length - accepted.length

    setFiles((current) => {
      const unique = accepted.filter((file) => !current.some((item) => item.name === file.name && item.size === file.size))
      return [...current, ...unique].slice(0, 8)
    })

    if (rejectedCount) setFileNotice(`${rejectedCount} file${rejectedCount > 1 ? 's were' : ' was'} skipped. Use JPG, PNG or PDF files up to 10 MB.`)
    else if (incoming.length) setFileNotice('Files added successfully. You can remove or replace them before submitting.')
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
    setFileNotice('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    setStatus('loading')
    setMessage('')
    const form = new FormData(formElement)
    const response = await fetch('/api/sell-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    })
    const body = await response.json().catch(() => ({ message: 'The message could not be sent. Please try again.' })) as { message?: string }
    setStatus(response.ok ? 'success' : 'error')
    setMessage(body.message ?? 'Please try again.')
    if (response.ok) {
      formElement.reset()
      setFiles([])
      setFileNotice('')
    }
  }

  return (
    <section className="valuation-panel container-wide">
      <header className="valuation-panel__intro">
        <div>
          <span className="valuation-eyebrow"><ShieldCheck />Free, no-obligation estimate</span>
          <h2>Get Your Car Valued <span>— It’s Free</span></h2>
          <p>Share a few details and clear photos. Our buying team will review your car and call with a transparent market-led estimate.</p>
        </div>
        <div className="valuation-intro__assurance"><strong>Fast response</strong><span>Usually within 30 minutes during business hours</span></div>
      </header>

      <form id="sell-valuation-form" className="valuation-form" onSubmit={submit}>
        <div className="valuation-step-heading"><span>01</span><div><strong>Owner & vehicle details</strong><small>Fields marked * are required</small></div></div>
        <fieldset className="valuation-fieldset">
          <legend>Your details</legend>
          <div className="valuation-fields valuation-fields--owner">
            <label>Full Name *<input name="name" required minLength={2} autoComplete="name" placeholder="Your full name" /></label>
            <label>Phone Number *<input name="phone" required inputMode="tel" autoComplete="tel" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" /></label>
            <label>Email Address *<input name="email" required type="email" autoComplete="email" placeholder="you@example.com" /></label>
          </div>
        </fieldset>
        <fieldset className="valuation-fieldset">
          <legend>Vehicle details</legend>
          <div className="valuation-fields">
            <label>Car Brand *<select name="make" required defaultValue=""><option value="" disabled>Select brand</option><option>Mercedes-Benz</option><option>BMW</option><option>Audi</option><option>Porsche</option><option>Land Rover</option><option>Jaguar</option><option>Volvo</option><option>Lexus</option><option>Other</option></select></label>
            <label>Model *<input name="model" required placeholder="Vehicle model" /></label>
            <label>Year *<select name="year" required defaultValue=""><option value="" disabled>Select year</option>{Array.from({ length: 15 }, (_, index) => 2026 - index).map((year) => <option key={year}>{year}</option>)}</select></label>
            <label>Fuel Type<select name="fuel"><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label>
            <label>Transmission<select name="transmission"><option>Automatic</option><option>Manual</option></select></label>
            <label>Kms Driven *<input name="mileage" required type="number" min="0" max="1000000" inputMode="numeric" placeholder="Enter mileage" /></label>
            <label>City *<input name="city" required autoComplete="address-level2" placeholder="Your city" /></label>
            <label className="valuation-message">Message<textarea name="message" placeholder="Condition, service history or anything else we should know" /></label>
          </div>
        </fieldset>
        <div className="valuation-form__footer">
          <span><ShieldCheck />Your details remain secure and confidential.</span>
          <button className="gold-button valuation-submit" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Submitting…' : 'Submit for Evaluation'}<ArrowRight /></button>
        </div>
        {message ? <p className={`form-status form-status--${status}`} role="status">{message}</p> : null}
      </form>
      <aside className="upload-panel">
        <div className="valuation-step-heading"><span>02</span><div><strong>Photos & documents</strong><small>Clear images help us value your car accurately</small></div></div>
        <label
          className={`upload-dropzone${isDragging ? ' is-dragging' : ''}`}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
          onDragLeave={(event) => { event.preventDefault(); setIsDragging(false) }}
          onDrop={(event) => { event.preventDefault(); setIsDragging(false); addFiles(Array.from(event.dataTransfer.files)) }}
        >
          <span className="upload-dropzone__icon"><UploadCloud aria-hidden="true" /></span>
          <strong>Drop car photos here</strong>
          <span>or select images and documents from your device</span>
          <span className="upload-browse-button">Choose Files</span>
          <small>JPG, PNG or PDF · up to 8 files · 10 MB each</small>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,application/pdf"
            onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.target.value = '' }}
          />
        </label>
        <div className="upload-types" aria-label="Recommended uploads">
          <span><CarFront /><small>Front View</small></span>
          <span><Camera /><small>Rear View</small></span>
          <span><ImageIcon /><small>Interior</small></span>
          <span><FileText /><small>RC Book</small></span>
        </div>
        {files.length ? (
          <div className="upload-selection">
            <header><strong>Selected files</strong><button type="button" onClick={() => { setFiles([]); setFileNotice('') }}>Clear all</button></header>
            <ul className="upload-files">
              {files.map((file, index) => <li key={`${file.name}-${file.size}`}><span><Check /><span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(1)} MB</small></span></span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)}><X /></button></li>)}
            </ul>
          </div>
        ) : <p className="upload-empty"><ImageIcon />No files selected yet</p>}
        {fileNotice ? <p className="upload-notice" role="status">{fileNotice}</p> : null}
      </aside>
    </section>
  )
}

export function SellYourCarPage() {
  return (
    <main className="interior-page" id="main-content">
      <PageHero eyebrow="Home / Sell Your Car" title="Sell Your Car" accent="The Easy Way." text="Fast valuation, a transparent offer and secure payment." image={interiorImages.hero} actions={[{ label: 'Get Free Valuation', href: '#valuation' }, { label: 'Contact Our Team', href: '/contact', secondary: true }]} />
      <section className="interior-section container-wide"><InteriorHeading eyebrow="Simple & Transparent" title="Our 3-Step Selling Process" /><ProcessSteps items={sellingSteps} /></section>
      <section className="interior-section container-wide"><InteriorHeading title="Why Sell to Deccan Wheels?" /><IconFeatureGrid items={whySell} className="feature-grid--five" /></section>
      <div id="valuation"><SellValuationForm /></div>
      <CredibilityStrip />
      <section className="interior-section container-wide"><InteriorHeading title="Frequently Asked Questions" /><FaqList items={faqs.sell} /></section>
      <CustomerReviews title="What Our Sellers Say" />
      <InteriorCta title="Ready to Sell Your Car?" text="Get the best value today with a process that is quick, easy and completely transparent." image={interiorImages.sedan} primary={{ label: 'Get Free Valuation Now', href: '#valuation' }} />
    </main>
  )
}

function ServiceBand({ reverse, eyebrow, title, text, image, points }: { reverse?: boolean; eyebrow: string; title: string; text: string; image: string; points: string[] }) {
  return (
    <article className={`service-band${reverse ? ' service-band--reverse' : ''}`}>
      <div className="service-band__image"><Image src={image} alt="Deccan Wheels premium automotive service" fill sizes="50vw" /></div>
      <div><p>{eyebrow}</p><h2>{title}</h2><span>{text}</span><ul>{points.map((point) => <li key={point}><Check />{point}</li>)}</ul><Link className="outline-button" href="/contact">Talk to an Expert<ArrowRight /></Link></div>
    </article>
  )
}

export function ServicesPage() {
  return (
    <main className="interior-page" id="main-content">
      <PageHero eyebrow="Home / Services" title="Luxury Car Care" accent="Done Right." text="Finance, insurance, transfers and complete ownership support." image={interiorImages.hero} actions={[{ label: 'Book a Service', href: '/contact' }, { label: 'Talk to an Expert', href: 'tel:+919876543210', secondary: true }]} />
      <section className="interior-section container-wide"><InteriorHeading title="Our Services" /><IconFeatureGrid items={serviceCards.map((item) => ({ ...item, href: '/contact' }))} /></section>
      <section className="service-bands container-wide">
        <ServiceBand eyebrow="Easy & Hassle-Free" title="Car Finance Solutions" text="Drive your dream car with flexible financing and quick approvals." image={interiorImages.finance} points={['Competitive interest rates', 'Up to 100% funding', 'Minimal documentation', 'Quick approval process']} />
        <ServiceBand reverse eyebrow="Complete Peace of Mind" title="Insurance Assistance" text="We help select the right coverage and assist through renewals and claims." image={interiorImages.service} points={['Comprehensive coverage options', 'Top insurance partners', 'Cashless claim support', 'Hassle-free renewals']} />
        <ServiceBand eyebrow="Best Value for Your Car" title="Buyback Solutions" text="Get a transparent market-led valuation and a secure payment experience." image={interiorImages.key} points={['Free car evaluation', 'Instant payment', 'Transparent process', 'No hidden charges']} />
      </section>
      <section className="interior-section container-wide"><InteriorHeading title="Why Choose Deccan Wheels Services?" /><IconFeatureGrid items={whySell} className="feature-grid--five" /></section>
      <section className="interior-section container-wide"><InteriorHeading eyebrow="Simple from Start to Finish" title="Our Process" /><ProcessSteps items={journeySteps.slice(0, 5)} /></section>
      <CustomerReviews title="What Our Customers Say" />
      <section className="interior-section container-wide"><InteriorHeading title="Frequently Asked Questions" /><FaqList items={faqs.services} /></section>
      <InteriorCta title="Need Assistance? We’re Here to Help." text="Book a service or speak to our experts for personalised assistance." image={interiorImages.sedan} primary={{ label: 'Book a Service', href: '/contact' }} secondary={{ label: 'Call Us Now', href: 'tel:+919876543210' }} />
    </main>
  )
}

export function AboutPage() {
  return (
    <main className="interior-page" id="main-content">
      <PageHero eyebrow="Home / About Us" title="About" accent="Deccan Wheels" text="Built on trust. Driven by premium automotive expertise." image={interiorImages.hero} />
      <section className="story-section container-wide"><div className="story-image"><Image src={interiorImages.showroom} alt="Inside the Deccan Wheels showroom" fill sizes="50vw" /></div><div><InteriorHeading eyebrow="Our Story" title="Building Trust. Delivering Excellence." /><p>Deccan Wheels was founded with a simple belief: luxury should be accessible and trust should be non-negotiable. What began as a focused showroom has grown into one of Hyderabad’s trusted premium pre-owned car destinations.</p><p>Every car is handpicked, rigorously inspected and delivered with complete transparency. For us, it is not only about cars; it is about creating relationships that last.</p></div></section>
      <section className="trust-stat-grid container-wide">{trustStats.map((item) => { const Icon = item.icon; return <article key={item.label}><Icon /><strong>{item.value}</strong><span>{item.label}</span></article> })}</section>
      <section className="interior-section container-wide"><InteriorHeading title="Why Choose Deccan Wheels?" /><IconFeatureGrid items={aboutValues} /></section>
      <section className="founder-section container-wide"><div className="founder-image"><Image src={interiorImages.founder} alt="Founder of Deccan Wheels" fill sizes="40vw" /></div><div><InteriorHeading eyebrow="Founder’s Message" title="Passion. People. Performance." /><p>Our mission is to redefine the pre-owned luxury car experience through honesty, quality and exceptional service. Thank you for trusting us as your automotive partner.</p><strong>— Sandeep Reddy</strong><small>Founder & CEO, Deccan Wheels</small></div></section>
      <section className="interior-section container-wide"><InteriorHeading title="A Seamless Journey from Start to Finish" /><ProcessSteps items={journeySteps} /></section>
      <CustomerReviews title="What Our Customers Say" />
      <section className="interior-section container-wide"><InteriorHeading title="Our Showroom" /><div className="about-gallery">{gallery.slice(0, 5).map((item) => <div key={item.alt}><Image src={item.image} alt={item.alt} fill sizes="20vw" /></div>)}</div></section>
      <InteriorCta title="Ready to Find Your Dream Car?" text="Explore our premium collection or connect with our experts today." image={interiorImages.sedan} primary={{ label: 'Explore Inventory', href: '/inventory' }} secondary={{ label: 'Contact Our Team', href: '/contact' }} />
    </main>
  )
}

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    setStatus('loading')
    const form = new FormData(formElement)
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form.entries())) })
    const body = (await response.json()) as { message?: string }
    setStatus(response.ok ? 'success' : 'error')
    setMessage(body.message ?? 'Please try again.')
    if (response.ok) formElement.reset()
  }
  return (
    <form className="contact-page-form" onSubmit={submit}>
      <InteriorHeading title="Send Us a Message" />
      <div><label>Full Name *<input name="name" required minLength={2} placeholder="Enter your full name" /></label><label>Phone Number *<input name="phone" required inputMode="tel" pattern="[6-9][0-9]{9}" placeholder="Enter your phone number" /></label></div>
      <div><label>Email Address *<input name="email" required type="email" placeholder="Enter your email address" /></label><label>Subject *<select name="subject" required defaultValue=""><option value="" disabled>Select a subject</option><option>Buying a car</option><option>Selling a car</option><option>Finance assistance</option><option>After-sales support</option></select></label></div>
      <div><label>Interested In<select name="interest"><option>Luxury Cars</option><option>Sell Your Car</option><option>Finance</option><option>Insurance</option></select></label><label>Preferred Contact Method<select name="contactMethod"><option>Phone</option><option>Email</option><option>WhatsApp</option></select></label></div>
      <label>Message *<textarea name="message" required minLength={10} placeholder="Type your message here" /></label>
      <input className="honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="gold-button" type="submit" disabled={status === 'loading'}><Send />{status === 'loading' ? 'Sending…' : 'Send Message'}</button>
      {message ? <p className={`form-status form-status--${status}`} role="status">{message}</p> : null}
    </form>
  )
}

export function ContactPage() {
  return (
    <main className="interior-page" id="main-content">
      <PageHero eyebrow="Home / Contact" title="Contact" accent="Our Team" text="Expert help for buying, selling, finance and ownership." image={interiorImages.hero} compact />
      <section className="contact-workspace container-wide">
        <aside className="contact-details-panel"><InteriorHeading title="Get in Touch" />{contactDetails.map((item) => { const Icon = item.icon; return <article key={item.title}><span><Icon /></span><div><h3>{item.title}</h3>{item.lines.map((line) => <p key={line}>{line}</p>)}</div></article> })}<a className="outline-button" href={siteConfig.mapsUrl} target="_blank" rel="noreferrer">Get Directions<ArrowRight /></a></aside>
        <ContactForm />
        <aside className="location-panel"><InteriorHeading title="Our Location" /><div className="location-map"><Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=82" alt="Map showing Deccan Wheels showroom area" fill sizes="30vw" /><span><MapPin /><strong>Deccan Wheels</strong><small>Banjara Hills, Hyderabad</small></span></div><div><h3>Easy to Find, Worth the Drive.</h3><p>Located in the heart of Banjara Hills, with a premium collection ready to explore.</p></div></aside>
      </section>
      <section className="visit-help container-wide"><div className="visit-showroom"><div><Image src={interiorImages.showroom} alt="Deccan Wheels luxury showroom" fill sizes="50vw" /></div><article><InteriorHeading title="Visit Our Showroom" /><p>Step into our world of luxury and explore a curated collection in a world-class showroom.</p><Link className="outline-button" href="/inventory">View Inventory<ArrowRight /></Link></article></div><div><InteriorHeading title="How We Help You" /><IconFeatureGrid items={helpCards} /></div></section>
      <CustomerReviews />
      <section className="interior-section container-wide"><InteriorHeading title="Frequently Asked Questions" /><FaqList items={faqs.contact} /></section>
      <InteriorCta title="Ready to Find Your Dream Car?" text="Explore our handpicked collection of luxury pre-owned cars." image={interiorImages.sedan} primary={{ label: 'Browse Inventory', href: '/inventory' }} secondary={{ label: 'Chat on WhatsApp', href: siteConfig.whatsAppUrl }} />
      <div className="mobile-contact-actions"><a href={siteConfig.phoneHref}><Phone />Call</a><a href={siteConfig.whatsAppUrl}><MessageCircle />WhatsApp</a><a href={siteConfig.mapsUrl}><MapPin />Directions</a></div>
    </main>
  )
}
