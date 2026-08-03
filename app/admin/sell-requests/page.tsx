import { LeadListPage } from '@/components/admin/LeadListPage'

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string; assigned?: string }> }) {
  return <LeadListPage kind="sell-requests" title="Sell Requests" description="Coordinate inspection, valuation, offers and ownership intake." permission="sellRequest.view" searchParams={searchParams} />
}
