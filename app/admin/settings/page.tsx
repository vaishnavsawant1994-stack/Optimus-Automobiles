import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { requirePermission } from '@/lib/auth/require-permission'
const sections = ['general', 'contact', 'social', 'email', 'seo']
export default async function Page() { await requirePermission('settings.view'); return <><AdminPageHeader title="Settings" text="Structured public, contact, social, email and SEO configuration." breadcrumb="Settings" /><div className="admin-grid">{sections.map((section) => <section className="admin-panel" key={section}><header><h2>{section[0].toUpperCase() + section.slice(1)}</h2></header><div className="admin-panel__body"><Link className="admin-button admin-button--secondary" href={`/admin/settings/${section}`}>Manage settings</Link></div></section>)}</div></> }
