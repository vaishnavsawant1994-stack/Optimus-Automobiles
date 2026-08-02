import type { ReactNode } from 'react'
import { AccountNav } from '@/components/account/AccountNav'
import { requireAuthenticatedUser } from '@/lib/auth/session'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireAuthenticatedUser('/account')
  return <div className="account-shell"><div className="account-shell__inner container-wide"><AccountNav name={user.name ?? 'Customer'} email={user.email} /><section className="account-content">{children}</section></div></div>
}
