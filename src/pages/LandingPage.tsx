import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo with Name - Prominent */}
          <div className="flex items-center">
            <img
              src="/natnlab-logo+name-svg.svg"
              alt="NATN Lab"
              className="h-12 md:h-14"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              className="btn-secondary"
              onClick={() => alert('Sign In - Coming Soon!\n\nThis will connect to Supabase Auth.')}
            >
              Sign In
            </button>
            <button
              className="btn-primary"
              onClick={() => alert('Get Started - Coming Soon!\n\nThis will open the registration flow.')}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-6 py-12 md:py-20 flex-grow">
        <div className="max-w-4xl mx-auto text-center">
          {/* Large Logo in Hero - Increased size */}
          <div className="flex justify-center mb-8">
            <img
              src="/natnlab-logo-svg.svg"
              alt="NATN Lab"
              className="h-40 md:h-52 w-auto"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to{' '}
            <span className="text-primary-600">NATN Lab</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-3">
            Your Trading Strategy Laboratory
          </p>
          <p className="text-base md:text-lg text-primary-600 font-medium mb-6">
            Learn . Test . Trade Smarter
          </p>
          <p className="text-base text-gray-500 mb-10 max-w-2xl mx-auto">
            Experiment with trading strategies in a risk-free paper trading environment.
            Master technical indicators, backtest your ideas, and build confidence
            before going live.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button
              className="btn-primary text-lg px-8 py-3"
              onClick={() => alert('Start Learning - Coming Soon!\n\nThis will take you to the dashboard.')}
            >
              Start Learning
            </button>
            <button
              className="btn-secondary text-lg px-8 py-3"
              onClick={() => alert('View Demo - Coming Soon!\n\nThis will show a demo of the platform.')}
            >
              View Demo
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="card text-left hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div className="card text-left hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div className="card text-left hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Status Banner */}
          <div className="mt-16 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-primary-800 text-sm">
              <span className="font-semibold">Development Status:</span> This is a scaffold page.
              Authentication and dashboard features are coming soon.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        {/* Upper Footer */}
        <div className="px-6 py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <img
                src="/natnlab-logo+name-svg.svg"
                alt="NATN Lab"
                className="h-12"
              />
              <div className="text-center md:text-right text-gray-600">
                <p className="font-medium">NATN Lab - Educational Trading Platform</p>
                <p className="text-sm mt-1 text-gray-500">
                  Paper trading only. This is not financial advice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Footer - Copyright and Links */}
        <div className="px-6 py-4 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              {/* Copyright */}
              <p>
                Copyright © 2026{' '}
                <a
                  href="https://ai-focus.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 transition-colors"
                >
                  ai-focus.org
                </a>
                {' '} · Sujit Gangadharan · All rights reserved.
              </p>

              {/* Legal Links */}
              <div className="flex items-center gap-4">
                <Link
                  to="/terms"
                  className="hover:text-primary-600 transition-colors"
                >
                  Terms of Use
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/privacy"
                  className="hover:text-primary-600 transition-colors"
                >
                  Privacy Policy
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/guidelines"
                  className="hover:text-primary-600 transition-colors"
                >
                  Agreements and Guidelines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
