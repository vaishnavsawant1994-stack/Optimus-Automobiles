import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPrimitives'
import { NewsletterManager } from '@/components/admin/NewsletterManager'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export default async function Page() { await requirePermission('newsletter.view'); const subscribers = await prisma.newsletterSubscriber.findMany({ take: 100, orderBy: { createdAt: 'desc' } }); return <><AdminPageHeader title="Newsletter" text="Consent-aware subscriber operations. Suppressed records remain excluded from active campaigns." breadcrumb="Newsletter" actions={<Link className="admin-button admin-button--secondary" href="/api/admin/exports/newsletter">Export CSV</Link>} /><NewsletterManager subscribers={subscribers.map((item) => ({ ...item, consentedAt: item.consentedAt.toISOString() }))} /></> }
