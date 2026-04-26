"use client";

import Link from 'next/link';
import { useState } from 'react';

interface Brief {
  title: string;
  date: string;
  type: 'futurist' | 'tech' | 'healthcheck';
  description: string;
  file: string;
  badge?: string;
}

const briefs: Brief[] = [
  {
    title: "Software Watch — 10 New Tools for Glazing",
    date: "April 29, 2026",
    type: "tech",
    description: "Helonic (AI plan review), Opusense (voice field reports), BricsCAD (Revit alternative), Graebert neXt (AutoCAD alternative), and 6 more modern tools replacing 20-year-old software.",
    file: "/briefs/software-watch-2026-04-29.html",
    badge: "New Series"
  },
  {
    title: "Futurist Brief — Week of April 26, 2026",
    date: "April 26, 2026",
    type: "futurist",
    description: "ConstructConnect's AI Takeoff Boost launch, agentic AI workflows beyond demos, robotics on live construction sites, and 7 trends shaping the future of glazing.",
    file: "/briefs/futurist-brief-2026-04-26.html",
    badge: "Latest"
  },
  {
    title: "Tech Trends Brief — 15 Technologies to Watch",
    date: "April 27, 2026",
    type: "tech",
    description: "Neuromorphic chips, Edge AI, Agentic workflows, humanoid robots, solid-state batteries, CRISPR, quantum-AI hybrids, and 8 more trends with MVP experiments.",
    file: "/briefs/tech-trends-2026-04-27.html",
    badge: "New Format"
  },
  {
    title: "Tech Deep Dive — AI Takeoff Automation",
    date: "April 21, 2026",
    type: "tech",
    description: "[LEGACY FORMAT] Three MVPs to test: AI Spec-Sifter, Digital Counter, Voice-to-Scope. Complete implementation roadmap with 3-layer takeoff stack.",
    file: "/briefs/tech-deep-dive-2026-04-21.html",
  },
  {
    title: "Futurist Brief — Week of April 19, 2026",
    date: "April 19, 2026",
    type: "futurist",
    description: "Construction robotics ROI analysis, 7 AI trends for PGC, watch list items including MCP vulnerabilities and OpenAI Codex Labs.",
    file: "/briefs/futurist-brief-2026-04-19.md",
  },
  {
    title: "Security Healthcheck — April 23, 2026",
    date: "April 23, 2026",
    type: "healthcheck",
    description: "OpenClaw security audit results, small model risk mitigation, SSH hardening recommendations, and host posture assessment.",
    file: "/briefs/security-healthcheck-2026-04-23.md",
  },
];

export default function BriefsPage() {
  const [filter, setFilter] = useState<'all' | 'futurist' | 'tech' | 'healthcheck'>('all');

  const filteredBriefs = filter === 'all' 
    ? briefs 
    : briefs.filter(b => b.type === filter);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'futurist': return 'bg-purple-100 text-purple-800';
      case 'tech': return 'bg-blue-100 text-blue-800';
      case 'healthcheck': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'futurist': return '🔮';
      case 'tech': return '🛠️';
      case 'healthcheck': return '🔒';
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
            Weekly futurist scans, tech deep-dives, and security audits for Pacific Glazing Corporation
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
              All Briefs
            </button>
            <button
              onClick={() => setFilter('futurist')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'futurist' 
                  ? 'bg-white text-purple-700' 
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              🔮 Futurist
            </button>
            <button
              onClick={() => setFilter('tech')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'tech' 
                  ? 'bg-white text-purple-700' 
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              🛠️ Tech
            </button>
            <button
              onClick={() => setFilter('healthcheck')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'healthcheck' 
                  ? 'bg-white text-purple-700' 
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              🔒 Security
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
          <p className="text-xs text-gray-500 mt-2">
            Generated by Joe 🔧 • Updated weekly
          </p>
        </div>
      </footer>
    </div>
  );
}
