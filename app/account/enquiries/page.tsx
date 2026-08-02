import { ArrowRight, CarFront } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { AccountEmpty, AccountHeading, StatusBadge } from '@/components/account/AccountPrimitives'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export default async function EnquiriesPage() {
  const user = await requireAuthenticatedUser('/account/enquiries')
  const enquiries = await prisma.inquiry.findMany({ where: { userId: user.id }, select: { referenceNumber: true, status: true, message: true, submittedAt: true, vehicle: { select: { shortTitle: true, slug: true, year: true, images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } } } } }, orderBy: { submittedAt: 'desc' } })
  return <><AccountHeading eyebrow="Purchase journey" title="My Enquiries" text="Track responses and keep each vehicle conversation together." action={{ label: 'Browse inventory', href: '/inventory' }} />{enquiries.length ? <div className="account-record-list">{enquiries.map((item) => <Link href={`/account/enquiries/${item.referenceNumber}`} key={item.referenceNumber}>{item.vehicle?.images[0] ? <Image src={item.vehicle.images[0].url} alt={item.vehicle.images[0].altText} width={170} height={110} /> : <span className="record-image-placeholder"><CarFront /></span>}<div><small>{item.referenceNumber}</small><h2>{item.vehicle?.shortTitle ?? 'General enquiry'}</h2><p>{item.message}</p><span>{item.submittedAt.toLocaleDateString('en-IN')}</span></div><aside><StatusBadge status={item.status} /><ArrowRight /></aside></Link>)}</div> : <AccountEmpty title="No enquiries yet" text="Ask about any vehicle and its status will appear here." action={{ label: 'Explore vehicles', href: '/inventory' }} />}</>
}
