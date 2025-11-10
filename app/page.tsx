import Link from 'next/link'
import { Lock, ShoppingCart, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen transition-colors flex flex-col items-center">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 w-full">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center">
              <h1 className="text-6xl md:text-7xl font-bold mb-6">
                <span className="text-text">Stu</span><span className="text-accent">Market</span>
              </h1>
              <p className="text-xl text-text/70 mb-12 max-w-2xl mx-auto">
                The simple, safe marketplace for college students to buy and sell locally
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/login"
                  className="px-8 py-3 bg-accent text-accent-text rounded-lg hover:bg-accent-hover transition-colors font-medium"
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
        <section id="features" className="py-20 w-full backdrop-blur-sm bg-surface/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 place-items-center text-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-background/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-text/10">
                  <Lock className="w-8 h-8 text-text" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text">Verified Students Only</h3>
                <p className="text-text/60 text-sm">
                  Trade safely with verified college students from your campus
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-background/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-text/10">
                  <ShoppingCart className="w-8 h-8 text-text" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text">Simple & Fast</h3>
                <p className="text-text/60 text-sm">
                  List items in seconds, connect with buyers instantly
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-background/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-text/10">
                  <Users className="w-8 h-8 text-text" />
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
        <section className="py-20 w-full">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-text">Ready to start trading?</h2>
            <p className="text-text/60 mb-8">
              Join thousands of students already using StuMarket
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-accent text-accent-text rounded-lg hover:bg-accent-hover transition-colors font-medium"
            >
              Get Started Now
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-text/10 w-full">
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