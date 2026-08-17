import Link from 'next/link'

export default function NotFound() {
  return <main className="placeholder-page" id="main-content"><section className="container-narrow placeholder-panel"><p className="eyebrow-label">404</p><h1>Page not found</h1><p>The address may be incorrect or the page may have moved.</p><div className="interior-actions"><Link className="gold-button" href="/inventory">Browse Inventory</Link><Link className="outline-button" href="/">Return Home</Link></div></section></main>
}
