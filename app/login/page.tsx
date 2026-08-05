import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { LoginForm } from '@/components/auth/AuthForms'
import { googleAuthEnabled } from '@/auth'
import { safeCallbackUrl } from '@/lib/auth/validation'

export const metadata: Metadata = { title: 'Sign In | Optimum Automobiles', description: 'Sign in to your Optimum Automobiles customer account.' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const query = await searchParams
  const callbackUrl = safeCallbackUrl(query.callbackUrl)
  return <AuthShell eyebrow="Customer access" title="Welcome back" intro="Sign in to your private garage and continue where you left off."><LoginForm callbackUrl={callbackUrl} googleEnabled={googleAuthEnabled} /></AuthShell>
}
