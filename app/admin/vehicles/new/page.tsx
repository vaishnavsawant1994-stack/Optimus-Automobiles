import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { VehicleForm } from '@/components/admin/VehicleForm'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'

export default async function NewVehiclePage() {
  await requirePermission('vehicle.create', '/admin/vehicles/new')
  const [brands, bodyTypes, features] = await Promise.all([prisma.brand.findMany({ where: { active: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }), prisma.bodyType.findMany({ where: { active: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }), prisma.feature.findMany({ where: { active: true }, orderBy: [{ category: 'asc' }, { name: 'asc' }], select: { id: true, name: true, category: true } })])
  return <><AdminPageHeader title="Create Draft Vehicle" text="Complete the structured record, add images and publish only after the readiness checklist passes." breadcrumb="Vehicles / New" /><VehicleForm brands={brands} bodyTypes={bodyTypes} features={features} /></>
}
