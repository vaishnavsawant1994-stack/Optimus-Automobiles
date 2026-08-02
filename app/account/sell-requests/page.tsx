import { ArrowRight, CarFront } from 'lucide-react'
import Link from 'next/link'
import { AccountEmpty, AccountHeading, StatusBadge } from '@/components/account/AccountPrimitives'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export default async function SellRequestsPage() {
  const user = await requireAuthenticatedUser('/account/sell-requests')
  const requests = await prisma.sellRequest.findMany({ where: { userId: user.id }, select: { referenceNumber: true, status: true, make: true, model: true, year: true, mileage: true, city: true, createdAt: true }, orderBy: { createdAt: 'desc' } })
  return <><AccountHeading eyebrow="Vehicle valuation" title="My Sell Requests" text="Track valuations submitted from your signed-in account." action={{ label: 'Value another car', href: '/sell-your-car#valuation' }} />{requests.length ? <div className="sell-request-grid">{requests.map((item) => <article key={item.referenceNumber}><header><CarFront /><StatusBadge status={item.status} /></header><small>{item.referenceNumber}</small><h2>{item.make} {item.model}</h2><p>{item.year ?? 'Year pending'} · {item.mileage?.toLocaleString('en-IN') ?? 'Mileage pending'} km · {item.city}</p><time>{item.createdAt.toLocaleDateString('en-IN')}</time><Link href="/contact">Contact buying team<ArrowRight /></Link></article>)}</div> : <AccountEmpty title="No sell requests yet" text="Request a transparent valuation and it will be tracked here." action={{ label: 'Get a free valuation', href: '/sell-your-car#valuation' }} />}</>
}
