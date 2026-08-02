import { AccountHeading } from '@/components/account/AccountPrimitives'
import { NotificationSettingsForm } from '@/components/account/AccountForms'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export default async function SettingsPage() {
  const user = await requireAuthenticatedUser('/account/settings')
  const settings = await prisma.customerNotificationSettings.findUnique({ where: { userId: user.id } })
  return <><AccountHeading eyebrow="Communication control" title="Notifications" text="Choose useful service updates and opt in to marketing channels separately." /><NotificationSettingsForm initial={{ enquiryUpdates: settings?.enquiryUpdates ?? true, testDriveReminders: settings?.testDriveReminders ?? true, priceChangeAlerts: settings?.priceChangeAlerts ?? true, soldVehicleAlerts: settings?.soldVehicleAlerts ?? true, marketingEmails: settings?.marketingEmails ?? false, whatsAppUpdates: settings?.whatsAppUpdates ?? false }} /></>
}
