import Link from 'next/link'
import { routeTitles } from '@/lib/constants/site'

type PageProps = {
  params: Promise<{ slug: string[] }>
}

function titleFromSlug(slug: string[]) {
  const first = slug[0] ?? ''
  return routeTitles[first] ?? slug.map((part) => part.replace(/-/g, ' ')).join(' / ')
}

export default async function PlaceholderPage({ params }: PageProps) {
  const { slug } = await params
  const title = titleFromSlug(slug)

  return (
    <main className="placeholder-page" id="main-content">
      <section className="container-narrow placeholder-panel">
        <p className="eyebrow-label">Route Foundation</p>
        <h1>{title}</h1>
        <p>
          This route is wired into the application shell. The homepage phase is
          complete first, and this page is ready for the next implementation
          pass.
        </p>
        <Link className="gold-button" href="/">
          Back To Home
        </Link>
      </section>
    </main>
  )
}
