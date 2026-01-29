import { Link } from 'react-router-dom'
import Footer from '@/components/layout/Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-slate-50 to-white flex flex-col">
      {/* Navigation — frosted glass, sticky */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo with Name */}
          <div className="flex items-center">
            <img
              src="/natnlab-logo+name-svg.svg"
              alt="NATN Lab"
              className="h-8 md:h-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary shadow-lg hover:shadow-xl">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 py-12 md:py-20 flex-grow">
        <div className="max-w-4xl mx-auto text-center">
          {/* Large Logo in Hero — with soft blue glow */}
          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 md:w-72 md:h-72 bg-primary-400/15 rounded-full blur-3xl" />
            </div>
            <img
              src="/natnlab-logo-svg.svg"
              alt="NATN Lab"
              className="h-44 md:h-56 w-auto relative"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              NATN Lab
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-3">
            Your Trading Strategy Laboratory
          </p>
          <p className="uppercase tracking-wide font-semibold text-primary-600 mb-6 text-sm md:text-base">
            Learn &middot; Test &middot; Trade Smarter
          </p>
          <p className="text-base text-gray-500 mb-10 max-w-2xl mx-auto">
            Experiment with trading strategies in a risk-free paper trading environment.
            Master technical indicators, backtest your ideas, and build confidence
            before going live.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/signup" className="btn-primary text-lg px-10 py-3.5 shadow-lg hover:shadow-xl">
              Start Learning
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-10 py-3.5">
              Sign In
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="card text-left hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Learn
              </h3>
              <p className="text-gray-600">
                Understand trading signals, technical indicators (RSI, SMA), and market fundamentals
                through hands-on experimentation.
              </p>
            </div>

            <div className="card text-left hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
              <div className="w-16 h-16 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Test
              </h3>
              <p className="text-gray-600">
                Backtest your strategies against historical data. See how they would
                have performed before risking real capital.
              </p>
            </div>

            <div className="card text-left hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Trade Smarter
              </h3>
              <p className="text-gray-600">
                Paper trade with confidence using automated strategies.
                Track performance in real-time with detailed analytics.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer variant="full" />
    </div>
  )
}

export default LandingPage
