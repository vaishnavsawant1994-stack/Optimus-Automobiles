import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { requirePermission } from '@/lib/auth/require-permission'
const pages = [['Homepage', '/admin/content/homepage'], ['About', '/admin/content/about'], ['Contact', '/admin/content/contact'], ['Services', '/admin/content/services']]
export default async function Page() { await requirePermission('content.manage'); return <><AdminPageHeader title="Website Content" text="Choose a public page to edit its structured, revisioned content." breadcrumb="Website Content" /><div className="admin-grid">{pages.map(([name, href]) => <section className="admin-panel" key={href}><header><h2>{name}</h2></header><div className="admin-panel__body"><p>Manage copy, calls to action and reusable page data.</p><Link className="admin-button admin-button--secondary" href={href}>Open editor</Link></div></section>)}</div></> }
