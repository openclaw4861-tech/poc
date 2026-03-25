import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">
            PGC Field Tools
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Pacific Glazing Corporation — Digital measurement and estimation tools
          </p>
          <div className="flex gap-4">
            <Link
              href="/glass-calculator"
              className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
            >
              📐 Glass Calculator
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Available Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Glass Calculator Card */}
          <Link href="/glass-calculator" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">📐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Glass Size Calculator
              </h3>
              <p className="text-gray-600 mb-4">
                Field measurement tool for interior glazing. Calculate glass sizes from level/plumb line measurements with database storage.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Single, double, and triple lites</li>
                <li>✓ Out-of-square detection</li>
                <li>✓ Save to database</li>
                <li>✓ View by job name</li>
              </ul>
              <div className="mt-4 text-blue-600 font-medium">
                Launch →
              </div>
            </div>
          </Link>

          {/* Coming Soon Cards */}
          <div className="bg-gray-100 rounded-lg p-6 opacity-60">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI Takeoff Automation
            </h3>
            <p className="text-gray-600 mb-4">
              Upload architectural PDFs → AI extracts window data → Generate 3D model
            </p>
            <div className="text-sm text-gray-500">
              Coming Q3 2026
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 opacity-60">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Project Dashboard
            </h3>
            <p className="text-gray-600 mb-4">
              Track all measurements, quotes, and installations by job
            </p>
            <div className="text-sm text-gray-500">
              Coming Q4 2026
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2026 Pacific Glazing Corporation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
