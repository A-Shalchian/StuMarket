import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen bg-background transition-colors flex flex-col items-center">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center">
              <h1 className="text-6xl md:text-7xl font-bold mb-6">
                <span className="text-text">Stu</span>
                <span className="text-accent">Market</span>
              </h1>
              <p className="text-xl text-text/70 mb-12 max-w-2xl mx-auto">
                The simple, safe marketplace for college students to buy and sell locally
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/login"
                  className="px-8 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium"
                >
                  Get Started
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-3 bg-surface text-text rounded-lg hover:bg-surface/80 transition-colors font-medium"
                >
                  Learn More
                </Link>
              </div>

              <p className="text-xs text-text/40 mt-6">
                Exclusive for students with verified college emails
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-surface w-full">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 place-items-center text-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text">Verified Students Only</h3>
                <p className="text-text/60 text-sm">
                  Trade safely with verified college students from your campus
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text">Simple & Fast</h3>
                <p className="text-text/60 text-sm">
                  List items in seconds, connect with buyers instantly
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 11-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text">Campus Community</h3>
                <p className="text-text/60 text-sm">
                  Buy and sell within your trusted college network
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background w-full">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-text">Ready to start trading?</h2>
            <p className="text-text/60 mb-8">
              Join thousands of students already using StuMarket
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors font-medium"
            >
              Get Started Now
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-surface w-full">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-sm text-text/50">
              © 2024 StuMarket. Exclusive for college students.
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}