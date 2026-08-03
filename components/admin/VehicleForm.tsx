'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, LoaderCircle, Save, WandSparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { generateVehicleSlug } from '@/lib/admin/vehicle-workflow'
import { vehicleAdminSchema } from '@/lib/validation/admin'

type FormInput = z.input<typeof vehicleAdminSchema>
type FormValues = z.output<typeof vehicleAdminSchema>
type Option = { id: string; name: string }
type FeatureOption = Option & { category: string }

const emptyVehicle: FormInput = { brandId: '', bodyTypeId: '', model: '', variant: '', stockNumber: '', slug: '', shortTitle: '', year: new Date().getFullYear(), price: 0, currency: 'INR', mileage: 0, fuelType: 'Diesel', transmission: 'Automatic', shortDescription: '', description: '', status: 'DRAFT', featured: false, newArrival: false, certified: false, featureIds: [], version: 1 }

export function VehicleForm({ vehicle, brands, bodyTypes, features }: { vehicle?: Partial<FormInput> & { id: string }; brands: Option[]; bodyTypes: Option[]; features: FeatureOption[] }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(vehicleAdminSchema), defaultValues: { ...emptyVehicle, ...vehicle } })
  const brandId = watch('brandId'); const year = watch('year'); const model = watch('model'); const variant = watch('variant')
  function createSlug() { const brand = brands.find((item) => item.id === brandId)?.name ?? ''; setValue('slug', generateVehicleSlug({ year: Number(year), brand, model, variant }), { shouldValidate: true }) }
  async function submit(values: FormValues) {
    setMessage(''); setIsError(false)
    const response = await fetch(vehicle ? `/api/admin/vehicles/${vehicle.id}` : '/api/admin/vehicles', { method: vehicle ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
    const payload = await response.json()
    if (!response.ok) { setIsError(true); setMessage(payload.error?.message ?? 'Vehicle could not be saved.'); return }
    setMessage(payload.message ?? 'Vehicle saved.')
    router.push(`/admin/vehicles/${payload.data.id}`); router.refresh()
  }
  const error = (key: keyof FormInput) => errors[key]?.message ? <small style={{ color: '#f29a93' }}>{String(errors[key]?.message)}</small> : null
  return <form className="admin-form" onSubmit={handleSubmit(submit)}>
    <section className="admin-form-section"><header><h2>1. Basic Information</h2><p>Identity, classification and operational state.</p></header><div className="admin-form-grid">
      <label>Brand<select {...register('brandId')}><option value="">Choose brand</option>{brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{error('brandId')}</label>
      <label>Model<input {...register('model')} />{error('model')}</label><label>Variant<input {...register('variant')} />{error('variant')}</label>
      <label>Stock number<input {...register('stockNumber')} />{error('stockNumber')}</label><label>Year<input type="number" {...register('year', { valueAsNumber: true })} />{error('year')}</label>
      <label>Body type<select {...register('bodyTypeId')}><option value="">Choose body type</option>{bodyTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{error('bodyTypeId')}</label>
      <label className="span-2">Public slug<input {...register('slug')} />{error('slug')}</label><button className="admin-button admin-button--secondary" type="button" onClick={createSlug}><WandSparkles />Generate slug</button>
      <label className="span-2">Short title<input {...register('shortTitle')} />{error('shortTitle')}</label><label>Status<select {...register('status')}><option>DRAFT</option><option>AVAILABLE</option><option>RESERVED</option><option>SOLD</option><option>ARCHIVED</option></select></label>
    </div></section>
    <section className="admin-form-section"><header><h2>2. Pricing</h2><p>Store money as integer INR values.</p></header><div className="admin-form-grid"><label>Sale price<input type="number" {...register('price', { valueAsNumber: true })} />{error('price')}</label><label>Original price<input type="number" {...register('originalPrice', { setValueAs: (value) => value === '' ? undefined : Number(value) })} />{error('originalPrice')}</label><label>Currency<input {...register('currency')} /></label></div></section>
    <section className="admin-form-section"><header><h2>3. Vehicle Specifications</h2><p>Public technical and condition data.</p></header><div className="admin-form-grid">
      <label>Mileage<input type="number" {...register('mileage', { valueAsNumber: true })} /></label><label>Fuel type<input {...register('fuelType')} /></label><label>Transmission<input {...register('transmission')} /></label>
      <label>Exterior colour<input {...register('exteriorColor')} /></label><label>Interior colour<input {...register('interiorColor')} /></label><label>Engine<input {...register('engineDescription')} /></label>
      <label>Power<input {...register('power')} /></label><label>Torque<input {...register('torque')} /></label><label>Drivetrain<input {...register('drivetrain')} /></label>
      <label>Seats<input type="number" {...register('seatingCapacity', { setValueAs: (value) => value === '' ? undefined : Number(value) })} /></label><label>Doors<input type="number" {...register('doors', { setValueAs: (value) => value === '' ? undefined : Number(value) })} /></label>
    </div></section>
    <section className="admin-form-section"><header><h2>4. Registration and Ownership</h2><p>Use masked registration data only.</p></header><div className="admin-form-grid"><label>Registration year<input type="number" {...register('registrationYear', { setValueAs: (value) => value === '' ? undefined : Number(value) })} /></label><label>State<input {...register('registrationState')} /></label><label>Masked registration<input {...register('registrationNumberMasked')} /></label><label>Ownership count<input type="number" {...register('ownershipCount', { setValueAs: (value) => value === '' ? undefined : Number(value) })} /></label><label>Service history<input {...register('serviceHistory')} /></label><label>Keys available<input type="number" {...register('keysAvailable', { setValueAs: (value) => value === '' ? undefined : Number(value) })} /></label></div></section>
    <section className="admin-form-section"><header><h2>5. Description</h2><p>Structured public copy without raw HTML.</p></header><div className="admin-form-grid"><label className="span-3">Short description<textarea {...register('shortDescription')} />{error('shortDescription')}</label><label className="span-3">Full description<textarea {...register('description')} />{error('description')}</label></div></section>
    <section className="admin-form-section"><header><h2>6. Features</h2><p>Select reusable, active vehicle features.</p></header><div className="admin-form-grid">{features.map((feature) => <label className="admin-checkbox" key={feature.id}><input type="checkbox" value={feature.id} {...register('featureIds')} /><span>{feature.name}<small>{feature.category}</small></span></label>)}</div></section>
    <section className="admin-form-section"><header><h2>7. Publication Flags</h2><p>Publishing is a separate permission-protected action after image review.</p></header><div className="admin-form-grid"><label className="admin-checkbox"><input type="checkbox" {...register('featured')} /><span>Featured vehicle</span></label><label className="admin-checkbox"><input type="checkbox" {...register('newArrival')} /><span>New arrival</span></label><label className="admin-checkbox"><input type="checkbox" {...register('certified')} /><span>Certified</span></label></div></section>
    {message ? <p className={`admin-form-message${isError ? ' is-error' : ''}`} role="status">{message}</p> : null}
    <footer className="admin-form-footer"><button className="admin-button admin-button--secondary" type="button" onClick={() => router.back()}>Cancel</button><button className="admin-button" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle /> : <Save />}{vehicle ? 'Save changes' : 'Create draft'}<ArrowRight /></button></footer>
  </form>
}
