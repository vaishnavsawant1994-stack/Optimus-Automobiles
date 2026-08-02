import { AccountHeading } from '@/components/account/AccountPrimitives'
import { SecurityForm } from '@/components/account/AccountForms'
import { requireAuthenticatedUser } from '@/lib/auth/session'

export default async function SecurityPage() {
  const user = await requireAuthenticatedUser('/account/security')
  return <><AccountHeading eyebrow="Account protection" title="Security" text="Manage your password and revoke sessions you no longer recognize." /><SecurityForm hasPassword={Boolean(user.passwordHash)} /></>
}
