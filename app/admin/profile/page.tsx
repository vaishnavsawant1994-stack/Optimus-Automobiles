import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { AdminProfileForm } from '@/components/admin/AdminProfileForm'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db/prisma'
export default async function Page() { const actor = await requireAdmin('/admin/profile'); const profile = await prisma.user.findUniqueOrThrow({ where: { id: actor.id }, include: { adminPreferences: true } }); return <><AdminPageHeader title="Staff Profile" text={`Role: ${profile.role.replaceAll('_', ' ')}`} breadcrumb="Profile" /><AdminProfileForm profile={{ name: profile.name, email: profile.email, phone: profile.phone, image: profile.image, role: profile.role, adminPreferences: profile.adminPreferences }} /></> }
