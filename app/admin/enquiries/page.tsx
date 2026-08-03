import { LeadListPage } from '@/components/admin/LeadListPage'

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string; assigned?: string }> }) {
  return <LeadListPage kind="enquiries" title="Enquiries" description="Assign, prioritise and resolve customer vehicle enquiries without exposing internal notes." permission="enquiry.view" searchParams={searchParams} />
}
