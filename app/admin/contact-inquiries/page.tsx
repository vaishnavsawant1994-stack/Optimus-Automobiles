import { LeadListPage } from '@/components/admin/LeadListPage'

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string; assigned?: string }> }) {
  return <LeadListPage kind="contact-inquiries" title="Contact Messages" description="Triage showroom, service and general contact requests." permission="contactInquiry.view" searchParams={searchParams} />
}
