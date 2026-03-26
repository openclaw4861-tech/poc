"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                🔧 PGC Field Tools
              </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex items-center space-x-4">
              {/* Tools Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <span>🛠️ Tools</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                    <Link
                      href="/glass-calculator"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">📐</span>
                        <div>
                          <div className="font-medium">Glass Calculator</div>
                          <div className="text-xs text-gray-500">Field measurements</div>
                        </div>
                      </div>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <div className="px-4 py-2 text-gray-400 text-sm">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">🏗️</span>
                        <div>
                          <div className="font-medium">AI Takeoff</div>
                          <div className="text-xs text-gray-500">Coming Q3 2026</div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 text-gray-400 text-sm">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">📊</span>
                        <div>
                          <div className="font-medium">Project Dashboard</div>
                          <div className="text-xs text-gray-500">Coming Q4 2026</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

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
              className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center space-x-2"
            >
              <span>📐</span>
              <span>Launch Glass Calculator</span>
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
