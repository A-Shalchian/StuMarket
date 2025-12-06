import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text mb-4">Page Not Found</h2>
        <p className="text-text/60 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or hasn&apos;t been created yet.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-accent-text font-medium rounded-lg transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
