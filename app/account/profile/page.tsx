import { AccountHeading } from '@/components/account/AccountPrimitives'
import { ProfileForm } from '@/components/account/AccountForms'
import { requireAuthenticatedUser } from '@/lib/auth/session'

export default async function ProfilePage() {
  const user = await requireAuthenticatedUser('/account/profile')
  return <><AccountHeading eyebrow="Personal details" title="My Profile" text="These details prefill enquiries, appointments and valuation requests." /><ProfileForm profile={{ name: user.name ?? '', email: user.email, phone: user.phone ?? '', city: user.city ?? 'Hyderabad', preferredContactMethod: user.preferredContactMethod }} /></>
}
