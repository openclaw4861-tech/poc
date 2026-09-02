"use client";

import Link from 'next/link';
import { useState } from 'react';

interface Brief {
  title: string;
  date: string;
  type: 'weekly' | 'book';
  description: string;
  file: string;
  badge?: string;
}

const briefs: Brief[] = [
  {
    title: "Weekly Brief — Teach the tracker one PGC rule",
    date: "September 1, 2026",
    type: "weekly",
    description: "One-hour experiment for Steve Watts: run a real spec through the Submittal Tracker, write every glazing miss as a reusable skill, and see if a second spec catches it without hand-holding.",
    file: "/briefs/weekly-briefing-2026-09-01.html",
    badge: "Latest"
  },
  {
    title: "Book Summary: Flourish",
    date: "August 31, 2026",
    type: "book",
    description: "Daniel Coyle on flourishing as joyful, meaningful growth shared with others — not a solo productivity hack. Presence (wide-beam attention), group flow, the Rule of the Beautiful Mess, yellow doors of possibility, and practical applications for PGC crews, the submittal tracker, and field huddles.",
    file: "/briefs/book-summary-flourish.html",
  },
  {
    title: "Book Summary: Meditations for Mortals",
    date: "June 7, 2026",
    type: "book",
    description: "Oliver Burkeman on why the quest for self-mastery is a trap: imperfectionism - radical acceptance of your limitations as the gateway to a meaningful life. 28 daily essays covering defeat as liberation, doing things 'dailyish', productivity debt, rules that serve life, starting from sanity, and finishing what you start. With practical applications for running PGC.",
    file: "/briefs/book-summary-meditations-for-mortals.html",
  },
  {
    title: "Book Summary: Tiny Experiments",
    date: "May 17, 2026",
    type: "book",
    description: "Anne-Laure Le Cunff on treating life as a laboratory: drop fixed SMART goals, run time-boxed hypotheses, and let direction emerge from what you learn. Pact structure, procrastination-as-compass, and practical applications for PGC experiments.",
    file: "/briefs/book-summary-tiny-experiments.html",
  },
  {
    title: "Book Summary: Decoding Greatness",
    date: "May 13, 2026",
    type: "book",
    description: "Ron Friedman on reverse-engineering excellence: study top performers, break down their methods, and deliberately practice replicating their patterns. Includes practical applications for PGC in bid proposals, field workflows, client communication, and software evaluation.",
    file: "/briefs/book-summary-decoding-greatness.html",
  },
];

export default function BriefsPage() {
  const [filter, setFilter] = useState<'all' | 'weekly' | 'book'>('all');

  const filteredBriefs = filter === 'all'
    ? briefs
    : briefs.filter(b => b.type === filter);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'book': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'weekly': return '🛠️';
      case 'book': return '📚';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              🔧 PGC Field Tools
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">
            📰 PGC Intelligence Briefs
          </h1>
          <p className="text-xl text-purple-100 mb-6">
            Book reviews and a single weekly experiment note — not a trend factory.
          </p>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-purple-700'
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('weekly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'weekly'
                  ? 'bg-white text-purple-700'
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              🛠️ Weekly
            </button>
            <button
              onClick={() => setFilter('book')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'book'
                  ? 'bg-white text-purple-700'
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              📚 Books
            </button>
          </div>
        </div>
      </div>

      {/* Briefs List */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {filteredBriefs.map((brief, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getTypeIcon(brief.type)}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {brief.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Published: {brief.date}
                      </p>
                    </div>
                  </div>
                  {brief.badge && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {brief.badge}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-4">
                  {brief.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(brief.type)}`}>
                    {brief.type.charAt(0).toUpperCase() + brief.type.slice(1)}
                  </span>

                  <a
                    href={brief.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Read Brief
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBriefs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No briefs found for this filter.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2026 Pacific Glazing Corporation • Intelligence Briefs
          </p>
        </div>
      </footer>
    </div>
  );
}
