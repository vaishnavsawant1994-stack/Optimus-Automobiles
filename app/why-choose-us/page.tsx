import type { Metadata } from 'next'
import { CompletePage } from '@/components/interior/CompletePage'
export const metadata: Metadata = { title: 'Why Choose Optimum Automobiles', description: 'A transparent, inspection-led approach to premium pre-owned cars.' }
export default function Page() { return <CompletePage pageKey="why" /> }
