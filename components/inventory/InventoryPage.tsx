'use client'

import { ArrowLeft, ArrowRight, Banknote, CarFront, Fuel, Gauge, Grid2X2, Heart, List, Settings2, SlidersHorizontal, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { InteriorCta, PageHero } from '@/components/interior/PagePrimitives'
import { CustomerReviews } from '@/components/shared/CustomerReviews'
import { interiorImages } from '@/lib/constants/interior'
import type { InventoryResult, VehicleCardData } from '@/lib/types/inventory'

type InventoryPageProps = {
  result: InventoryResult
  basePath?: string
  eyebrow?: string
  title?: string
  accent?: string
  description?: string
  lockedFilter?: 'brand' | 'bodyType'
}

function InventoryFilter({ result, basePath, lockedFilter, onClose }: { result: InventoryResult; basePath: string; lockedFilter?: InventoryPageProps['lockedFilter']; onClose?: () => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { availableFilters } = result

  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(name, value)
    else next.delete(name)
    if (name === 'brand') next.delete('model')
    next.delete('page')
    router.replace(`${basePath}${next.size ? `?${next.toString()}` : ''}`, { scroll: false })
  }

  return (
    <aside className="inventory-filter" aria-label="Inventory filters">
      <header><strong>Refine Your Search</strong><button type="button" onClick={() => router.replace(basePath)}>Clear All</button>{onClose ? <button className="filter-close" type="button" aria-label="Close filters" onClick={onClose}><X /></button> : null}</header>
      <div className="filter-fields">
        {lockedFilter !== 'brand' ? <label>Make<select value={searchParams.get('brand') ?? searchParams.get('make') ?? ''} onChange={(event) => setFilter('brand', event.target.value)}><option value="">All Makes</option>{availableFilters.brands.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label> : null}
        <label>Model<select value={searchParams.get('model') ?? ''} onChange={(event) => setFilter('model', event.target.value)}><option value="">All Models</option>{availableFilters.models.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <fieldset>
          <legend>Price Range</legend>
          <div className="filter-range-copy"><span>₹{availableFilters.priceRange.min.toLocaleString('en-IN')}</span><span>₹{availableFilters.priceRange.max.toLocaleString('en-IN')}</span></div>
          <input aria-label="Maximum price" type="range" min={availableFilters.priceRange.min} max={availableFilters.priceRange.max} step="500000" value={searchParams.get('maxPrice') ?? availableFilters.priceRange.max} onChange={(event) => setFilter('maxPrice', event.target.value)} />
          <div className="filter-dual-input"><input aria-label="Minimum price" value={`₹${availableFilters.priceRange.min.toLocaleString('en-IN')}`} readOnly /><input aria-label="Selected maximum price" value={`₹${Number(searchParams.get('maxPrice') ?? availableFilters.priceRange.max).toLocaleString('en-IN')}`} readOnly /></div>
        </fieldset>
        <fieldset><legend>Year</legend><div className="filter-dual-input"><select aria-label="From year" value={searchParams.get('fromYear') ?? ''} onChange={(event) => setFilter('fromYear', event.target.value)}><option value="">From</option>{yearOptions(availableFilters.yearRange.min, availableFilters.yearRange.max).map((year) => <option key={year}>{year}</option>)}</select><select aria-label="To year" value={searchParams.get('toYear') ?? ''} onChange={(event) => setFilter('toYear', event.target.value)}><option value="">To</option>{yearOptions(availableFilters.yearRange.min, availableFilters.yearRange.max).map((year) => <option key={year}>{year}</option>)}</select></div></fieldset>
        <label>Mileage<select value={searchParams.get('maxMileage') ?? ''} onChange={(event) => setFilter('maxMileage', event.target.value)}><option value="">Any Mileage</option><option value="25000">Under 25,000 km</option><option value="50000">Under 50,000 km</option><option value="100000">Under 100,000 km</option></select></label>
        {lockedFilter !== 'bodyType' ? <label>Body Type<select value={searchParams.get('bodyType') ?? ''} onChange={(event) => setFilter('bodyType', event.target.value)}><option value="">All Body Types</option>{availableFilters.bodyTypes.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label> : null}
        <label>Fuel Type<select value={searchParams.get('fuelType') ?? ''} onChange={(event) => setFilter('fuelType', event.target.value)}><option value="">All Fuel Types</option>{availableFilters.fuelTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Transmission<select value={searchParams.get('transmission') ?? ''} onChange={(event) => setFilter('transmission', event.target.value)}><option value="">All Transmissions</option>{availableFilters.transmissions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Ownership<select value={searchParams.get('ownership') ?? ''} onChange={(event) => setFilter('ownership', event.target.value)}><option value="">All Ownerships</option><option value="1">First Owner</option><option value="2">Second Owner</option><option value="3">Third Owner</option></select></label>
      </div>
      <button className="gold-button filter-results-button" type="button" onClick={onClose}>Show Results <ArrowRight /></button>
    </aside>
  )
}

export function VehicleResultCard({ vehicle, favorite, toggle, listView = false }: { vehicle: VehicleCardData; favorite: boolean; toggle: () => void; listView?: boolean }) {
  return (
    <article className={`inventory-card${listView ? ' inventory-card--list' : ''}`}>
      <div className="inventory-card__media">
        <Image src={vehicle.image} alt={vehicle.imageAlt} fill sizes="(max-width: 760px) 100vw, 25vw" />
        <span>{vehicle.badge}</span>
        <button type="button" aria-label={`${favorite ? 'Remove' : 'Add'} ${vehicle.make} ${vehicle.model} ${favorite ? 'from' : 'to'} favourites`} onClick={toggle}><Heart fill={favorite ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="inventory-card__body">
        <h3>{vehicle.make} {vehicle.model}</h3><p>{vehicle.variant}</p>
        <ul><li><CarFront />{vehicle.year}</li><li><Gauge />{vehicle.mileage}</li><li><Fuel />{vehicle.fuel}</li><li><Settings2 />{vehicle.transmission}</li></ul>
        <strong>{vehicle.price}</strong><Link href={`/inventory/${vehicle.slug}`}>View Details</Link>
      </div>
    </article>
  )
}

export function InventoryPage({ result, basePath = '/inventory', eyebrow = 'Home / Inventory', title = 'Explore', accent = 'Inventory', description, lockedFilter }: InventoryPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [filterOpen, setFilterOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const saved = window.localStorage.getItem('inventory-favorites')
    if (saved) setFavorites(new Set(JSON.parse(saved) as string[]))
  }, [])

  function updateParameter(name: string, value: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(name, value)
    else next.delete(name)
    if (name !== 'page') next.delete('page')
    router.replace(`${basePath}${next.size ? `?${next.toString()}` : ''}`, { scroll: false })
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      window.localStorage.setItem('inventory-favorites', JSON.stringify([...next]))
      return next
    })
  }

  return (
    <main className="interior-page" id="main-content">
      <PageHero compact eyebrow={eyebrow} title={title} accent={accent} text={description ?? `${result.pagination.totalItems} handpicked premium cars available`} image={interiorImages.hero} />
      <section className="inventory-workspace container-wide">
        <div className="inventory-filter-desktop"><InventoryFilter result={result} basePath={basePath} lockedFilter={lockedFilter} /></div>
        <div className="inventory-results">
          <div className="inventory-toolbar">
            <button className="mobile-filter-trigger" type="button" onClick={() => setFilterOpen(true)}><SlidersHorizontal />Filters</button>
            <strong>{result.pagination.totalItems} Results Found</strong>
            <label>Sort by:<select value={result.appliedFilters.sort} onChange={(event) => updateParameter('sort', event.target.value)}><option value="latest">Latest Arrivals</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="year-desc">Year: Newest First</option><option value="year-asc">Year: Oldest First</option><option value="mileage-asc">Mileage: Low to High</option><option value="popular">Most Popular</option></select></label>
            <div className="inventory-view-toggle"><button className={view === 'grid' ? 'is-active' : ''} type="button" aria-label="Grid view" onClick={() => setView('grid')}><Grid2X2 /></button><button className={view === 'list' ? 'is-active' : ''} type="button" aria-label="List view" onClick={() => setView('list')}><List /></button></div>
          </div>
          <div className="active-filter-bar"><span><SlidersHorizontal />Database Filters</span><label>Per page<select value={result.pagination.pageSize} onChange={(event) => updateParameter('pageSize', event.target.value)}><option>12</option><option>24</option><option>48</option></select></label><button type="button" onClick={() => router.replace(basePath)}>Clear All <X /></button></div>
          {result.items.length ? <div className={`inventory-grid${view === 'list' ? ' inventory-grid--list' : ''}`}>{result.items.map((vehicle) => <VehicleResultCard key={vehicle.id} vehicle={vehicle} favorite={favorites.has(vehicle.id)} toggle={() => toggleFavorite(vehicle.id)} listView={view === 'list'} />)}</div> : <div className="inventory-empty"><CarFront /><h2>No matching vehicles</h2><p>Try widening your filters or let our team find the right car.</p><button className="gold-button" type="button" onClick={() => router.replace(basePath)}>Clear Filters</button></div>}
          <Pagination result={result} onPage={(page) => updateParameter('page', String(page))} />
        </div>
      </section>
      {filterOpen ? <div className="mobile-filter-drawer" role="dialog" aria-modal="true"><button className="mobile-filter-backdrop" type="button" aria-label="Close filters" onClick={() => setFilterOpen(false)} /><InventoryFilter result={result} basePath={basePath} lockedFilter={lockedFilter} onClose={() => setFilterOpen(false)} /></div> : null}
      <CustomerReviews />
      <InteriorCta title="Can't Find the Right Car?" text="Let our experts help you find the perfect match from our extended network." image={interiorImages.sedan} primary={{ label: 'Get Assistance', href: '/contact' }} secondary={{ label: 'Call +91 98765 43210', href: 'tel:+919876543210' }} />
      <section className="support-strip container-wide"><article><Banknote /><span><strong>Flexible Finance Options</strong><small>Quick approvals and minimal paperwork.</small></span></article><article><Settings2 /><span><strong>Certified & Inspected</strong><small>Every car receives a detailed inspection.</small></span></article><article><CarFront /><span><strong>Sell Your Car</strong><small>Get a fair, fast valuation.</small></span></article></section>
    </main>
  )
}

function Pagination({ result, onPage }: { result: InventoryResult; onPage: (page: number) => void }) {
  const { page, totalPages, hasPreviousPage, hasNextPage } = result.pagination
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((item) => Math.abs(item - page) <= 2 || item === 1 || item === totalPages)
  return <nav className="inventory-pagination" aria-label="Inventory pages"><button type="button" aria-label="Previous page" disabled={!hasPreviousPage} onClick={() => onPage(page - 1)}><ArrowLeft /></button>{visiblePages.map((item, index) => <span key={item}>{index > 0 && item - visiblePages[index - 1] > 1 ? <i aria-hidden="true">…</i> : null}<button className={item === page ? 'is-active' : ''} type="button" aria-current={item === page ? 'page' : undefined} onClick={() => onPage(item)}>{item}</button></span>)}<button type="button" aria-label="Next page" disabled={!hasNextPage} onClick={() => onPage(page + 1)}><ArrowRight /></button></nav>
}

function yearOptions(min: number, max: number) {
  return Array.from({ length: max - min + 1 }, (_, index) => max - index)
}
