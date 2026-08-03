import { LeadDetailPage } from '@/components/admin/LeadDetailPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <LeadDetailPage kind="enquiries" id={id} title="Enquirie" permission="enquiry.view" />
}
