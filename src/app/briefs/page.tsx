"use client";

import Link from 'next/link';
import { useState } from 'react';

interface Brief {
  title: string;
  date: string;
  type: 'futurist' | 'tech' | 'software' | 'construction' | 'healthcheck' | 'book';
  description: string;
  file: string;
  badge?: string;
}

const briefs: Brief[] = [
  {
    title: "Weekly Futurist Scan — May 31, 2026",
    date: "May 31, 2026",
    type: "futurist",
    description: "7 synthesized trends anchored on Google I/O 2026: biggest search overhaul in 25 years (AI Search replaces classic Search), Antigravity agent + skills registries (agent teaching agent pattern), agent memory systems as new infrastructure layer, physical AI (Gemini Robotics-ER 1.6, reBot open-source arm), AI supply chain attacks (malicious npm, Pentest Agent Suite, ChatGPT Markdown exploit), MCP/A2A protocols hitting critical mass, and construction AI patent race — with PGC-relevant MVP experiments.",
    file: "/briefs/futurist-scan-2026-05-31.html",
    badge: "Latest"
  },
  {
    title: "Weekly Software Watch — May 27, 2026",
    date: "May 27, 2026",
    type: "software",
    description: "12 new tools: Fresco (Division 8 AI takeoff, Try Now), Resolve (BIM+VR collaboration, Watch), Pillar (AI construction ERP, Watch), Ciridae (a16z-backed AI ops, Watch), Speckle (open-source BIM interoperability, Try Now), Document Crunch (AI contract review, Try Now), OpenConstructionERP (open-source Python ERP, Try Now), AdamCAD (text-to-CAD, Watch), Zoo (text-to-CAD with reasoning, Watch), SafeT Coach (free AI safety app, Try Now), Ediphi (cloud preconstruction + Togal.AI, Watch), and Rudus (concrete AI takeoff, Skip).",
    file: "/briefs/software-watch-2026-05-27.html"
  },
  {
    title: "Tech Trends Brief — May 25, 2026",
    date: "May 25, 2026",
    type: "tech",
    description: "15 trending technologies: OpenHuman private AI (26,795 ⭐), RuView WiFi see-through-walls sensing (65,107 ⭐), Google AI search overhaul, codegraph token-efficient knowledge graph, supertonic on-device TTS, agentmemory persistent memory, 12-factor production agents, CloakBrowser stealth browser, Bun JS runtime, A2A+MCP agent protocols, Salesforce Agentforce ($800M ARR), Bayesian control layers, Dell token economics (320x), NVIDIA+ServiceNow governed agents, and ViMax agentic video generation — all with PGC-relevant MVP experiments.",
    file: "/briefs/tech-trends-2026-05-25.html",
  },
  {
    title: "Weekly Futurist Scan — May 24, 2026",
    date: "May 24, 2026",
    type: "futurist",
    description: "7 synthesized trends: $5.5B AI deployment JVs (OpenAI + Anthropic), Gemini Robotics-ER 1.6 physical AI, viral AI agent skills pattern (1,618 stars), Emergent Misalignment fine-tuning risk, MCP/A2A protocols at 97M downloads, AI coding agents hitting 4% of GitHub commits, and 60+ construction AI safety patents filed in 2026 — with PGC-relevant MVP experiments.",
    file: "/briefs/futurist-scan-2026-05-24.html",
  },
  {
    title: "Nashville Trip Brief — June 10-15, 2026",
    date: "May 22, 2026",
    type: "tech",
    description: "Complete 6-day Nashville itinerary: Musicians Corner finale, Broadway honky-tonks, Country Music Hall of Fame, Ryman Auditorium, food guide (hot chicken + BBQ), neighborhood breakdown, and $1,200-2,000 budget estimate.",
    file: "/briefs/nashville-trip-june-2026.html",
  },
  {
    title: "Weekly Tech Brief — May 18, 2026",
    date: "May 18, 2026",
    type: "tech",
    description: "15 trending technologies: MolmoAct 2 open robotics, sodium-ion batteries (30% cheaper), agentic AI workflows, edge small language models, neuromorphic chips, AI coding agents, CRISPR 3.0, MCP protocol, solid-state batteries, browser automation, text-to-CAD, humanoid actuators, AI cybersecurity threats, green steel, and AI agent memory — all with MVP experiments.",
    file: "/briefs/tech-brief-2026-05-18.html",
  },
  {
    title: "Book Summary: Tiny Experiments",
    date: "May 17, 2026",
    type: "book",
    description: "Anne-Laure Le Cunff on why traditional goal-setting is broken: the arrival fallacy, toxic productivity, and rigid linear goals. Her alternative is the tiny experiment — small, low-stakes, hypothesis-driven commitments that let you learn what actually fulfills you. Full of neuroscience, practical pacts, and a reframing of uncertainty as opportunity.",
    file: "/briefs/book-summary-tiny-experiments.html",
  },
  {
    title: "Book Summary: Decoding Greatness",
    date: "May 13, 2026",
    type: "book",
    description: "Ron Friedman on reverse-engineering excellence: study top performers, break down their methods, and deliberately practice replicating their patterns. Includes practical applications for PGC in bid proposals, field workflows, client communication, and software evaluation.",
    file: "/briefs/book-summary-decoding-greatness.html",
  },
  {
    title: "Software Watch — May 20, 2026",
    date: "May 20, 2026",
    type: "software",
    description: "12 new tools: Fresco (AI Division 8 takeoff), Tasa.app (visual task + AI translation), Rudus (concrete AI estimating), Helonic (AI plan check), Opusense AI (voice field reports), ConstructConnect Takeoff Boost, Bidflow (electrical AI), Structured AI (design QA/QC), Togal.AI (general AI takeoff), ArchiLabs (AI CAD), On Center Software (door/hardware estimating), and eMullion ePWS (industry baseline).",
    file: "/briefs/software-watch-2026-05-20.html",
  },
  {
    title: "Software Watch — 12 New Tools for Glazing",
    date: "May 13, 2026",
    type: "software",
    description: "12 new tools: FreeCAD (parametric open-source CAD), Blender (3D creation suite), Planera (AI construction scheduling), Buildots (computer vision site tracking), Applied Intuition (physical AI/construction simulation), Fieldwire (field-first PM), Bluebeam Cloud (PDF collaboration), Onshape (cloud CAD with branching), Shapr3D (touch CAD for iPad), Duro Labs (cloud PLM), Fabriq (MES for fab shops), and GoCanvas (no-code field forms).",
    file: "/briefs/software-watch-2026-05-13.html",
  },
  {
    title: "Tech Trends Brief — May 11, 2026",
    date: "May 11, 2026",
    type: "tech",
    description: "15 trending technologies: ds4 local inference, Zig-native apps, mirage virtual filesystem for agents, 3DCellForge 3D generation, tokenspeed GPU inference, HTML templates for coding agents, let-go Lisp-in-Go, tilde.run versioned agent sandboxes, adamsreview multi-agent PR review, re_gent git-for-agents, mochi.js browser automation, airbyte-agents cross-source context, Text-to-CAD, balcony solar boom, and more — all with MVP experiments.",
    file: "/briefs/tech-trends-2026-05-11.html",
  },
  {
    title: "Software Watch — 12 New Tools for Glazing",
    date: "May 6, 2026",
    type: "software",
    description: "12 new tools: Shapr3D (iPad CAD), Onshape (cloud CAD), InspectMind ($100 AI plan check), Trunk Tools (AI spec review), Fabriq (shop floor MES), GoCanvas (field forms), BricsCAD (perpetual AutoCAD alt), and 6 more.",
    file: "/briefs/software-watch-2026-05-06.html"
  },
  
  {
    title: "Tech Trends Brief — May 4, 2026",
    date: "May 4, 2026",
    type: "tech",
    description: "15 trending technologies: AI Agent Orchestration, Coding Agents, Multimodal Generation, MCP Protocol, LoRa Mesh Radio, Edge AI, Text-to-CAD, Browser Automation, Agent Memory, Privacy-Preserving AI, Humanoid Actuators, and more — all with free MVP experiments for PGC.",
    file: "/briefs/tech-brief-2026-05-04.html",
  },
  {
    title: "Futurist Brief — May 11, 2026",
    date: "May 11, 2026",
    type: "futurist",
    description: "7 emerging signals: DS4 local Mac inference (7K stars), Mirage virtual filesystem for agents (1.9K stars), humanoid robots on real worksites, Text-to-CAD hits 2.4K stars, The Memory Curse (LLM agents forget cooperation under long context), AI agent payment rails unlock real transactions, and 123D autonomous driving dataset unifying LiDAR+camera+radar at scale.",
    file: "/briefs/futurist-brief-2026-05-11.html",
  },
  {
    title: "Futurist Brief — May 3, 2026",
    date: "May 3, 2026",
    type: "futurist",
    description: "General-purpose robotics ChatGPT moment, sleep-state learning becomes reproducible, AI agent infrastructure goes enterprise, biomimetic computing, self-healing materials, quantum error correction breakthrough, space manufacturing, and 5 more emerging trends.",
    file: "/briefs/futurist-brief-2026-05-03.html"
  },
    {
    title: "Tech Trends Brief — 15 Technologies to Watch",
    date: "May 1, 2026",
    type: "tech",
    description: "AI coding agents, MCP universal integration, edge inference accelerators, construction computer vision, voice AI agents, multimodal models, and 9 more trends with MVP experiments for PGC.",
    file: "/briefs/tech-brief-2026-05-01.html",
    badge: "Recent"
  },
  {
    title: "Software Watch — 10 New Tools for Glazing",
    date: "April 29, 2026",
    type: "software",
    description: "Helonic (AI plan review), Opusense (voice field reports), BricsCAD (Revit alternative), Graebert neXt (AutoCAD alternative), and 6 more modern tools replacing 20-year-old software.",
    file: "/briefs/software-watch-2026-04-29.html",
    badge: undefined
  },
  {
    title: "Futurist Brief — Week of April 26, 2026",
    date: "April 26, 2026",
    type: "futurist",
    description: "ConstructConnect's AI Takeoff Boost launch, agentic AI workflows beyond demos, robotics on live construction sites, and 7 trends shaping the future of glazing.",
    file: "/briefs/futurist-brief-2026-04-26.html",
    badge: undefined
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
  const [filter, setFilter] = useState<'all' | 'futurist' | 'tech' | 'software' | 'construction' | 'healthcheck' | 'book'>('all');

  const filteredBriefs = filter === 'all' 
    ? briefs 
    : briefs.filter(b => b.type === filter);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'futurist': return 'bg-purple-100 text-purple-800';
      case 'tech': return 'bg-blue-100 text-blue-800';
      case 'software': return 'bg-cyan-100 text-cyan-800';
      case 'construction': return 'bg-orange-100 text-orange-800';
      case 'healthcheck': return 'bg-amber-100 text-amber-800';
      case 'book': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'futurist': return '🔮';
      case 'tech': return '🛠️';
      case 'software': return '💻';
      case 'construction': return '🏗️';
      case 'healthcheck': return '🔒';
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
            Six briefing categories: tech trends + futurist signals + software reviews + construction analysis + book summaries + security
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
              onClick={() => setFilter('software')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'software' 
                  ? 'bg-white text-purple-700' 
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              💻 Software
            </button>
            <button
              onClick={() => setFilter('construction')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'construction' 
                  ? 'bg-white text-purple-700' 
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              🏗️ Construction
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
