import { LeadDetailPage } from '@/components/admin/LeadDetailPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <LeadDetailPage kind="contact-inquiries" id={id} title="Contact Message" permission="contactInquiry.view" />
}
