import { CalendarCheck, CarFront, ClipboardList, Heart } from 'lucide-react'
import Link from 'next/link'
import { AccountHeading, StatusBadge } from '@/components/account/AccountPrimitives'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export default async function AccountPage() {
  const user = await requireAuthenticatedUser('/account')
  const [favoriteCount, enquiryCount, testDriveCount, sellCount, enquiries, drives] = await Promise.all([
    prisma.favorite.count({ where: { userId: user.id } }), prisma.inquiry.count({ where: { userId: user.id } }), prisma.testDrive.count({ where: { userId: user.id } }), prisma.sellRequest.count({ where: { userId: user.id } }),
    prisma.inquiry.findMany({ where: { userId: user.id }, select: { referenceNumber: true, status: true, submittedAt: true, vehicle: { select: { shortTitle: true } } }, orderBy: { submittedAt: 'desc' }, take: 3 }),
    prisma.testDrive.findMany({ where: { userId: user.id }, select: { referenceNumber: true, status: true, preferredDate: true, preferredTime: true, vehicle: { select: { shortTitle: true } } }, orderBy: { submittedAt: 'desc' }, take: 3 }),
  ])
  const stats = [[favoriteCount, 'Saved vehicles', Heart, '/account/favourites'], [enquiryCount, 'Enquiries', ClipboardList, '/account/enquiries'], [testDriveCount, 'Test drives', CalendarCheck, '/account/test-drives'], [sellCount, 'Sell requests', CarFront, '/account/sell-requests']] as const
  return <>
    <AccountHeading eyebrow="Customer overview" title={`Welcome, ${user.name?.split(' ')[0] ?? 'Customer'}`} text="Your saved vehicles and every active request, in one place." action={{ label: 'Browse vehicles', href: '/inventory' }} />
    <div className="account-stat-grid">{stats.map(([value, label, Icon, href]) => <Link href={href} key={label}><Icon /><strong>{value}</strong><span>{label}</span></Link>)}</div>
    <div className="account-dashboard-grid">
      <section className="account-section"><header><h2>Recent enquiries</h2><Link href="/account/enquiries">View all</Link></header>{enquiries.length ? <div className="account-activity-list">{enquiries.map((item) => <Link href={`/account/enquiries/${item.referenceNumber}`} key={item.referenceNumber}><span><strong>{item.vehicle?.shortTitle ?? 'General vehicle enquiry'}</strong><small>{item.referenceNumber} · {item.submittedAt.toLocaleDateString('en-IN')}</small></span><StatusBadge status={item.status} /></Link>)}</div> : <p className="account-section__empty">No enquiries yet.</p>}</section>
      <section className="account-section"><header><h2>Upcoming test drives</h2><Link href="/account/test-drives">View all</Link></header>{drives.length ? <div className="account-activity-list">{drives.map((item) => <Link href={`/account/test-drives/${item.referenceNumber}`} key={item.referenceNumber}><span><strong>{item.vehicle.shortTitle}</strong><small>{item.preferredDate.toLocaleDateString('en-IN')} · {item.preferredTime}</small></span><StatusBadge status={item.status} /></Link>)}</div> : <p className="account-section__empty">No test drives scheduled.</p>}</section>
    </div>
  </>
}
