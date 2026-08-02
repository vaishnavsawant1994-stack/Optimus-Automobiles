import { SearchX } from 'lucide-react'
import Link from 'next/link'

export default function AccountRecordNotFound() {
  return <div className="account-empty"><SearchX /><h2>Record not found</h2><p>This record does not exist or does not belong to your account.</p><Link className="gold-button" href="/account">Return to account</Link></div>
}
