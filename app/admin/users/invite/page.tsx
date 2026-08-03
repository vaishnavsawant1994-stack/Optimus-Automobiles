import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { UserManager } from '@/components/admin/UserManager'
import { requirePermission } from '@/lib/auth/require-permission'
export default async function Page() { await requirePermission('user.invite'); return <><AdminPageHeader title="Invite Staff" text="Create an expiring, single-use invitation. Administrators never choose or view staff passwords." breadcrumb="Users / Invite" /><UserManager users={[]} invitationMode /></> }
