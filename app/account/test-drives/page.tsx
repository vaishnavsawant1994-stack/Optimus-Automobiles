import { ArrowRight, CalendarCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { AccountEmpty, AccountHeading, StatusBadge } from '@/components/account/AccountPrimitives'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

export default async function TestDrivesPage() {
  const user = await requireAuthenticatedUser('/account/test-drives')
  const drives = await prisma.testDrive.findMany({ where: { userId: user.id }, select: { referenceNumber: true, status: true, preferredDate: true, preferredTime: true, submittedAt: true, vehicle: { select: { shortTitle: true, variant: true, images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } } } } }, orderBy: { submittedAt: 'desc' } })
  return <><AccountHeading eyebrow="Showroom appointments" title="My Test Drives" text="Review confirmed visits, request a new time or cancel before your appointment." action={{ label: 'Find a vehicle', href: '/inventory' }} />{drives.length ? <div className="account-record-list">{drives.map((item) => <Link href={`/account/test-drives/${item.referenceNumber}`} key={item.referenceNumber}>{item.vehicle.images[0] ? <Image src={item.vehicle.images[0].url} alt={item.vehicle.images[0].altText} width={170} height={110} /> : <span className="record-image-placeholder"><CalendarCheck /></span>}<div><small>{item.referenceNumber}</small><h2>{item.vehicle.shortTitle}</h2><p>{item.vehicle.variant}</p><span>{item.preferredDate.toLocaleDateString('en-IN')} · {item.preferredTime}</span></div><aside><StatusBadge status={item.status} /><ArrowRight /></aside></Link>)}</div> : <AccountEmpty title="No test drives yet" text="Choose an available vehicle and request a convenient showroom visit." action={{ label: 'Explore vehicles', href: '/inventory' }} />}</>
}
