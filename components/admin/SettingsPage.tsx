import { AdminPageHeader } from './AdminPrimitives'
import { SettingsManager } from './SettingsManager'
import { requirePermission } from '@/lib/auth/require-permission'
import { prisma } from '@/lib/db/prisma'
export async function SettingsPage({ category, title }: { category?: string; title: string }) { await requirePermission('settings.view'); const settings = await prisma.siteSetting.findMany({ where: category ? { category } : {}, orderBy: [{ category: 'asc' }, { key: 'asc' }] }); return <><AdminPageHeader title={title} text="Versioned public configuration. Secrets and provider credentials are intentionally excluded." breadcrumb={`Settings / ${title}`} /><SettingsManager settings={settings} /></> }
