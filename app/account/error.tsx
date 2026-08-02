'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function AccountError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="account-empty"><AlertTriangle /><h2>Account view unavailable</h2><p>Your data is safe. Please retry this view.</p><button className="gold-button" type="button" onClick={reset}><RotateCcw />Retry</button></div>
}
