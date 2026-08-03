import { LeadListPage } from '@/components/admin/LeadListPage'

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; status?: string; assigned?: string }> }) {
  return <LeadListPage kind="test-drives" title="Test Drives" description="Confirm appointments, prevent vehicle slot conflicts and keep customers informed." permission="testDrive.view" searchParams={searchParams} />
}
