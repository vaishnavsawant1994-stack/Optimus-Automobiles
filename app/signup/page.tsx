import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { SignupForm } from '@/components/auth/AuthForms'
import { safeCallbackUrl } from '@/lib/auth/validation'

export const metadata: Metadata = { title: 'Create Account | Deccan Wheels', description: 'Create a Deccan Wheels customer account.' }

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const query = await searchParams
  return <AuthShell eyebrow="Private garage" title="Create your account" intro="Save premium cars and keep every conversation, visit and valuation organized."><SignupForm callbackUrl={safeCallbackUrl(query.callbackUrl)} /></AuthShell>
}
