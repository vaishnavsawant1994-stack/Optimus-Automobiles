import type { Metadata } from 'next'
import { CompletePage } from '@/components/interior/CompletePage'
export const metadata: Metadata = { title: 'Our Buying Process | Optimum Automobiles', description: 'How viewing, inspection, agreement, paperwork and delivery work.' }
export default function Page() { return <CompletePage pageKey="process" /> }
