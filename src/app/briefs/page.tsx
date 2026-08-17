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
    title: "Tech Trends Brief — August 17, 2026",
    date: "August 17, 2026",
    type: "tech",
    description: "15 trending technologies: AI Agent Skills Marketplaces / SKILL.md (Adopt), Agentic Payments & Commerce (Evaluate), EU AI Act + California AI Transparency Act enforcement (Watch), Agentic AI Governance & Observability (Evaluate), Frontier Model Race / Grok 4.6 + GPT-5.6 (Adopt), Chinese Frontier Models & Price Collapse (Adopt), Small & Edge Language Models (Adopt), AI Glass Defect Detection & Vision Inspection (Adopt), A+W Order Entry AI (Adopt), AI Structural Design of Glass Facades (Evaluate), Intelligent & Dynamic Facades (Evaluate), glasstec 2026 / GlassBuild America (Watch), Agentic AI in Construction (Adopt), The Agent Leap in Enterprise AI (Adopt), Digital Twins & Construction Robotics (Evaluate) — with 3 meta-trends: AI as an Owned Asset, Governance as the New Bottleneck, and the Glazing Industry's Own AI Stack.",
    file: "/briefs/tech-trends-2026-08-17.html",
    badge: "Latest"
  },
  {
    title: "Weekly Tech Briefing — August 15, 2026",
    date: "August 15, 2026",
    type: "tech",
    description: "AI focus shifts from models to packaged skills, edge inference grows, and Pacific Glazing Corp can turn its glazing knowledge into a defensible asset",
    file: "/briefs/weekly-briefing-2026-08-15.html",
    badge: ""
  },
  {
    title: "Software Watch — August 12, 2026",
    date: "August 12, 2026",
    type: "software",
    description: "12 new tools: Exayard (AI glazing takeoff that reads window schedules/type marks, Try Now), GlassBook (cloud glazing estimating, Try Now), Manifold (phone LiDAR field measurement, Try Now), OnRamp (fabrication-shop ERP built inside a real plant, Try Now), Glazyr (quick glass estimating, Try Now), HxGN SMART Build (Hexagon/Leica construction platform, Watch), Magicplan (LiDAR floor plans, Watch), VisualLive (BIM-to-AR on-site, Watch), Autodesk Forma (ACC integration, Watch), JobBOSS² (small-mfr ERP, Watch), Procore Concept Projects (owner tool, Skip), InEight Control (GC cost control, Skip). Top picks: Exayard > GlassBook > Manifold > OnRamp > Glazyr.",
    file: "/briefs/software-watch-2026-08-12.html",
    badge: "Latest"
  },
  {
    title: "Construction Software Brief — August 12, 2026",
    date: "August 12, 2026",
    type: "software",
    description: "Open-source AEC now offers IFC parsing, browser BIM review, and photogrammetry at zero cost, driving free web tools for construction",
    file: "/briefs/software-brief-2026-08-12.html",
    badge: ""
  },
  {
    title: "Tech Trends Brief — August 10, 2026",
    date: "August 10, 2026",
    type: "tech",
    description: "15 trending technologies: Agentic AI in Construction / Procore Digital Coworkers (Adopt), AI Takeoff & Estimating Automation (Adopt), Construction Robotics / Monumental $32M (Evaluate), Edge AI / On-Device Inference (Adopt), Agent Memory Systems (Adopt), Visual AI Agent Builders / Langflow-Dify-Flowise (Adopt), MCP & Agent Interoperability (Adopt), Autonomous Coding Agents (Adopt), Computer Vision for Construction Safety (Adopt), Digital Twins in BIM (Adopt), Synthetic Data Generation (Evaluate), Domain-Specific LLMs (Evaluate), AI-Enhanced Document Management (Adopt), Smart PPE & Wearables (Evaluate), AI Procurement Rules & EU AI Act (Watch) — with 3 meta-trends: Construction Is Now a First-Class AI Market, The Democratization of AI Building, From Generic AI to Teach-It-Your-Standards.",
    file: "/briefs/tech-trends-2026-08-10.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing — August 08, 2026",
    date: "August 08, 2026",
    type: "tech",
    description: "The briefing outlines the move from monolithic AI to modular agent skills packaged as apps, plus production‑ready local inference on field hardware",
    file: "/briefs/weekly-briefing-2026-08-08.html",
    badge: ""
  },
  {
    title: "Software Watch — August 5, 2026",
    date: "August 5, 2026",
    type: "software",
    description: "12 new tools: OpenConstructionERP v3.0 (free open-source ERP with CAD takeoff, Try Now), Nomic AI (AEC AI agents for drawing review, Try Now), Togal.AI ($299/mo AI takeoff, Try Now), Alpen High Performance Products (thin-glass IGUs, Try Now), Buildots (AI site monitoring, Watch), OpenSpace (visual intelligence, Watch), Dusty Robotics (robotic layout, Watch), Text-to-CAD (AI CAD skills, Watch), Chili3D (browser CAD, Watch), goNeon (AI infrastructure planning, Watch), Fixxly (building materials quick commerce, Watch), Buildforce (electrician staffing, Skip). Top picks: OpenConstructionERP v3.0 > Togal.AI > Nomic AI > Alpen High Performance Products.",
    file: "/briefs/software-watch-2026-08-05.html",
    badge: ""
  },
  {
    title: "Construction Software Brief — August 05, 2026",
    date: "August 05, 2026",
    type: "software",
    description: "Open-source AEC tools—ThatOpen Engine, OpenDroneMap, and web‑ifc—hit production readiness, signaling a shift to cost‑free workflows",
    file: "/briefs/software-brief-2026-08-05.html",
    badge: ""
  },
  {
    title: "Tech Trends Brief — August 3, 2026",
    date: "August 3, 2026",
    type: "tech",
    description: "15 trending technologies: MCP 2026-07-28 Spec (Adopt), Autonomous Coding Agents (Adopt), Edge AI/On-Device ML (Adopt), Computer Vision for Construction Safety (Adopt), Digital Twins in BIM (Adopt), Synthetic Data Generation (Evaluate), Domain-Specific Language Models (Evaluate), Physical AI/Robotics Infrastructure (Evaluate), Agentic AI Frameworks CrewAI/AutoGen (Adopt), 6G & Native AI Networking (Watch), AI-Powered Drone Monitoring (Adopt), Open-Source AI Agent Frameworks (Adopt), AI-Enhanced Document Management (Adopt), Federated Learning (Watch), Smart PPE & Wearables (Evaluate) — with 3 meta-trends: The AI-Native Construction Site, The Democratization of AI Building, Edge-First Architecture.",
    file: "/briefs/tech-trends-2026-08-03.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing — August 01, 2026",
    date: "August 01, 2026",
    type: "tech",
    description: "Edge AI now production-ready, focusing on glazing workflows with voice-first interfaces and composable agent skills, local inference outpacing cloud",
    file: "/briefs/weekly-briefing-2026-08-01.html",
    badge: ""
  },
  {
    title: "Software Watch — July 29, 2026",
    date: "July 29, 2026",
    type: "software",
    description: "12 new tools: Structured AI (AI workforce for construction design QC, Try Now), Beam AI (cross-trade AI takeoff with façade support, Try Now), Helonic (AI clash detection + auto RFIs production-ready, Try Now), OpenConstructionERP v8.6 (free open-source ERP with vector DWG/DXF takeoff, Try Now), Togal.AI ($299/mo gold standard AI takeoff, Try Now), Foreman (AI full lifecycle contractor platform, Try Now), FlowManual (AI bidding to PO, Try Now), Merlin (AI-native construction ERP, Try Now), Prolo (AI procurement + embedded finance, Try Now), Cascade ($3.5M a16z-backed AI project discovery, Watch), ODA MCP Servers (CAD/BIM for AI agents, Watch), Stabileo (open-source browser structural analysis, Watch). Top picks: Structured AI > Beam AI > Helonic > OpenConstructionERP > Togal.AI > Foreman > FlowManual > Merlin > Prolo.",
    file: "/briefs/software-watch-2026-07-29.html",
    badge: ""
  },
  {
    title: "Construction Software Brief — July 29, 2026",
    date: "July 29, 2026",
    type: "software",
    description: "Browser‑based BIM viewing, drone photogrammetry, point‑cloud processing and ThatOpen Engine are production‑ready AEC tools reshaping industry",
    file: "/briefs/software-brief-2026-07-29.html",
    badge: ""
  },
  {
    title: "Futurist Technology Brief — July 28, 2026",
    date: "July 28, 2026",
    type: "futurist",
    description: "Open-source robotics, AI-accelerated materials discovery, and high-fidelity simulation compress automation deployment from years to 18 months",
    file: "/briefs/futurist-brief-2026-07-28.html",
    badge: ""
  },
  {
    title: "Tech Trends Brief — July 27, 2026",
    date: "July 27, 2026",
    type: "tech",
    description: "15 trending technologies: Kimi K3 2.8T open-weight model (Adopt), OpenAI Codex Micro keyboard (Watch), Gemini 3.6 Flash agentic AI (Adopt), Block Buzz open-source AI collab (Watch), OpenAI sandbox escape (Alert), Computer vision safety monitoring (Adopt), AI procurement agents (Adopt), MIT chip-based LiDAR (Watch), Programmable photonic chip (Watch), Data center energy crisis 4x by 2035 (Alert), Unitree humanoid robots IPO (Watch), Garmin CIRQA screenless wearables (Adopt), AI in construction survey (Adopt), Generative design for construction (Watch), Predictive scheduling AI (Adopt) — with 3 meta-trends: AI Agents Are Leaving the Lab, The Energy Crunch Is Reshaping Hardware, Construction Is Becoming a First-Class AI Market.",
    file: "/briefs/tech-trends-2026-07-27.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing — July 25, 2026",
    date: "July 25, 2026",
    type: "tech",
    description: "Edge AI deployment validated for industrial use, agent skills as installable AI modules, and synthetic data boosting quality control",
    file: "/briefs/weekly-briefing-2026-07-25.html",
    badge: ""
  },
  {
    title: "Software Watch — July 22, 2026",
    date: "July 22, 2026",
    type: "software",
    description: "12 new tools: Merlin (AI-native construction ERP, Try Now), Prolo (£4.2M AI procurement + embedded finance, Try Now), Helonic (AI clash detection + auto RFIs, Try Now), OpenConstructionERP v3.0 (free open-source ERP, Try Now), Togal.AI ($299/mo gold standard AI takeoff, Try Now), Foreman (AI full lifecycle contractor platform, Try Now), FlowManual (AI bidding to PO, Try Now), Resolve (VR BIM review, Watch), Snaptrude (free cloud BIM, Watch), CentralComs (AI agents for property management, Watch), Rudus (concrete AI takeoff, Skip), PLAN0 AI (construction analytics, Skip). Top picks: Merlin > Prolo > Helonic > OpenConstructionERP > Togal.AI > Foreman > FlowManual.",
    file: "/briefs/software-watch-2026-07-22.html",
    badge: ""
  },
  {
    title: "Construction Software Brief — July 22, 2026",
    date: "July 22, 2026",
    type: "software",
    description: "Browser‑based BIM viewing with ThatOpen displaces tools for glazing submittals, while open‑source photogrammetry matches survey costs",
    file: "/briefs/software-brief-2026-07-22.html",
    badge: ""
  },
  {
    title: "Futurist Technology Brief — July 21, 2026",
    date: "July 21, 2026",
    type: "futurist",
    description: "Signals narrow robotics reaching production viability, a shift from research demos to real‑world deployment, and three converging tech streams",
    file: "/briefs/futurist-brief-2026-07-21.html",
    badge: ""
  },
  {
    title: "Tech Trends Brief — July 20, 2026",
    date: "July 20, 2026",
    type: "tech",
    description: "15 trending technologies: Strix AI pen testing agent (Adopt), Grok Build open-source coding agent (Watch), Vibe-Trading AI research platform (Experiment), Codebase-Memory-MCP 99% token reduction (Adopt), Hallmark anti-AI-slop design (Adopt), Orca parallel agent workspace (Watch), CubeSandbox agent sandbox (Adopt), OmniRoute local AI gateway (Adopt), Sakana AI brain-like learning (Watch), AlayaWorld open-source world models (Watch), Destructive Command Guard agent safety (Adopt), Moonshot AI world's largest open model (Watch), Noetra Japan's multimodal AI (Watch), PsiQuantum commercial quantum computer (Watch), GPT-Red OpenAI's super-hacker LLM (Watch) — with 3 meta-trends: The Agent Safety Stack Is Maturing, Brain-Inspired Learning Is Challenging Backprop, The AI Gateway Pattern Goes Mainstream.",
    file: "/briefs/tech-trends-2026-07-20.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing — July 18, 2026",
    date: "July 18, 2026",
    type: "tech",
    description: "This briefing covers AI's shift to local, on‑device tools, their commoditization, and implications for Pacific Glazing's field operations",
    file: "/briefs/weekly-briefing-2026-07-18.html",
    badge: ""
  },
  {
    title: "Software Watch — July 15, 2026",
    date: "July 15, 2026",
    type: "software",
    description: "12 new tools: FlowManual (AI bidding + procurement, Try Now), Foreman (AI takeoff to proposal, Try Now), Rudus (concrete AI takeoff, Watch), PLAN0 AI (analytics layer, Watch), Helonic (AI clash detection + auto RFIs, Try Now), OpenConstructionERP v3.0 (free open-source ERP, Try Now), Prolo (a16z-backed procurement, Try Now), OpenSpace (visual intelligence, Watch), Trimble AI Takeoff (MEP estimating, Watch), Togal.AI (one-click AI takeoff, Try Now), ConstructionBids.ai (AI bid matching, Try Now), Aasaan (AI PM platform, Watch). Top picks: FlowManual > Foreman > Helonic > OpenConstructionERP > Prolo > Togal.AI > ConstructionBids.ai.",
    file: "/briefs/software-watch-2026-07-15.html",
    badge: ""
  },
  {
    title: "Construction Software Brief — July 15, 2026",
    date: "July 15, 2026",
    type: "software",
    description: "Open-source AEC tools enable browser BIM viewing and drone photogrammetry, cutting submittal costs while PDF‑based quantity takeoff remains a gap",
    file: "/briefs/software-brief-2026-07-15.html",
    badge: ""
  },
  {
    title: "Futurist Technology Brief — July 15, 2026",
    date: "July 15, 2026",
    type: "futurist",
    description: "AI‑driven materials discovery, narrow robotic autonomy, manufacturing controls signal shift from tech to construction solutions",
    file: "/briefs/futurist-brief-2026-07-15.html",
    badge: ""
  },
  {
    title: "Tech Trends Brief — July 13, 2026",
    date: "July 13, 2026",
    type: "tech",
    description: "15 trending technologies: GPT-5.6 (Adopt), LongCat-2.0 1.6T MoE (Watch), CubeSandbox agent sandbox (Adopt), MCP 10K+ servers (Adopt), pgrust Postgres in Rust (Watch), Ternlight 7MB browser embeddings (Experiment), Voicebox open-source voice cloning (Experiment), RuView WiFi spatial sensing (Watch), Meta Iris AI chip (Watch), FloatForm swarm robots (Watch), Bun Rust rewrite (Watch), YC B2B 2,623 companies (Adopt), autonomous defense spillover (Watch), OmniVoice 600+ language TTS (Experiment), agency-agents multi-agent orchestration (Adopt) — with 3 meta-trends: Agent Infrastructure Stack Solidifying, Open-Weight Models Closing the Gap, Sensing Without Cameras Is Real.",
    file: "/briefs/tech-trends-2026-07-13.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing — July 11, 2026",
    date: "July 11, 2026",
    type: "tech",
    description: "Embodied AI consolidating into vision-video-action stacks opens a 12-18 month window for PGC to lead automation, but quantization may cause drift",
    file: "/briefs/weekly-briefing-2026-07-11.html",
    badge: ""
  },
  {
    title: "Software Watch — July 8, 2026",
    date: "July 8, 2026",
    type: "software",
    description: "12 new tools: Foreman (AI estimating + proposals from shop drawings, Try Now), Rudus (concrete AI takeoff, Watch), Helonic (AI clash detection + auto RFIs, Try Now), FlowManual (AI back-office automation, Try Now), PLAN0 AI (analytics layer for developers, Skip), Resolve (VR BIM review, Watch), Scope3D (3D building twins for retrofit glazing, Try Now), OpenConstructionERP v3.0 (free open-source ERP, Try Now), Higharc ($95M Series C AI homebuilding, Watch), Autodesk Fusion July update (construction geometry, Watch), Gstarsoft (open CAD/BIM ecosystem, Watch), Contractor Foreman ($49/mo Procore alternative, Try Now). Top picks: Foreman > FlowManual > Scope3D > OpenConstructionERP > Contractor Foreman > Helonic.",
    file: "/briefs/software-watch-2026-07-08.html",
    badge: ""
  },
  {
    title: "Construction Software Brief — July 08, 2026",
    date: "July 08, 2026",
    type: "software",
    description: "Open-source AEC stack, Procore-validated browser-based BIM, drone photogrammetry at cost-parity, and AI-driven automation reshaping glazing workflows",
    file: "/briefs/software-brief-2026-07-08.html",
    badge: ""
  },
  {
    title: "Futurist Technology Brief — July 07, 2026",
    date: "July 07, 2026",
    type: "futurist",
    description: "Readiness over feasibility, AI-accelerated materials now production-ready (160k+ validations), glazing with digital twins and green supply chains",
    file: "/briefs/futurist-brief-2026-07-07.html",
    badge: ""
  },
  {
    title: "Futurist Technology Brief — July 07, 2026",
    date: "July 07, 2026",
    type: "futurist",
    description: "AI-driven materials discovery combined with narrow robotic glass-handling automation, enabling rapid prototyping and cost-efficient R&D for glazing",
    file: "/briefs/futurist-brief-2026-07-07.html",
    badge: ""
  },
  {
    title: "Tech Trends Brief — July 6, 2026",
    date: "July 6, 2026",
    type: "tech",
    description: "15 trending technologies: Agentic AI for Construction (Try Now), Computer Vision Safety Monitoring (Try Now), Digital Twins for Buildings (Try Now), Edge AI for Jobsite Devices (Watch), AI Video Generation Veo 3.1/Kling 3.0 (Watch), RAG + Fine-Tuning for Enterprise Knowledge (Try Now), Humanoid Robots in Construction (Explore), Autonomous Heavy Equipment (Explore), Open-Source LLMs Qwen3/DeepSeek (Try Now), AI-Powered Drone Site Mapping (Try Now), AI Coding Assistants Cursor/Copilot (Try Now), Self-Hosted AI Infrastructure (Watch), AI Workflow Automation n8n/LangChain (Try Now), Proptech/Construction Fintech (Watch), and AI-Generated 3D Models for BIM (Try Now) — with 3 meta-trends: Physical AI Hits the Jobsite, The AI Stack Goes Open-Source and Self-Hosted, and From Reactive to Predictive Operations.",
    file: "/briefs/tech-trends-2026-07-06.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing — July 04, 2026",
    date: "July 04, 2026",
    type: "tech",
    description: "Local AI moves to production, offering a 12‑18 month window for PGC to deploy AI tools; data quality and agent security are key",
    file: "/briefs/weekly-briefing-2026-07-04.html",
    badge: ""
  },
  {
    title: "Software Watch — July 1, 2026",
    date: "July 1, 2026",
    type: "software",
    description: "10 new tools: Bidflow (AI CAD symbol counting, 99% accuracy, Try Now), Civils.ai (glazing/façade AI takeoff from elevation PDFs, Try Now), Opusense AI (voice-to-report field documentation, Try Now), Helonic (AI clash detection + auto RFIs, Try Now), OpenConstructionERP v3.5 (free open-source ERP, Try Now), FlowManual (AI back-office procurement, Watch), Beam AI (cross-trade takeoff + Revit, Watch), Foreman (all-in-one contractor PM, Watch), Bild AI (Division 8 opening schedules, Watch), Karmen (AI crew scheduling, Watch). Top picks: Civils.ai > Bidflow > Opusense AI > Helonic > OpenConstructionERP.",
    file: "/briefs/software-watch-2026-07-01.html",
    badge: ""
  },
  {
    title: "Construction Software Brief — July 01, 2026",
    date: "July 01, 2026",
    type: "software",
    description: "LLM call failed - model 'minimax-m2.7:cloud' may not be available",
    file: "/briefs/software-brief-2026-07-01.html",
    badge: ""
  },
  {
    title: "Futurist Technology Brief — June 30, 2026",
    date: "June 30, 2026",
    type: "futurist",
    description: "AI-driven convergence across robotics, quantum computing, and materials science compresses discovery cycles, reshaping the next‑decade horizon",
    file: "/briefs/futurist-brief-2026-06-30.html",
    badge: ""
  },
  {
    title: "Tech Trends Brief — June 29, 2026",
    date: "June 29, 2026",
    type: "tech",
    description: "15 trending technologies: Wan-Streamer (real-time video AI, Watch), OpenAI Jalapeño custom chip (inference cost drop, Read), OpenKnowledge (AI-first knowledge management, Try Now), AI Voice Agents for Business (automate customer calls, Try Now), OpenConstructionERP (free open-source ERP, Try Now), BlockTrain (decentralized AI training, Read), AI Safety & Evaluation Platforms ($50M Patronus round, Watch), Asian Mythos-like models (cost competition, Watch), Computer Vision for Construction Takeoffs (automate blueprint measurement, Try Now), AI Photo-based Client Updates (automated progress photos, Try Now), White House AI Executive Order (federal funding for AI adoption, Try Now), Flow Voice-First AI Platform (voice project management, Watch), Firmus AI Design Review (preconstruction risk analysis, Try Now), Open-Source Design Tools (free CAD alternatives, Watch), and AI Subcontractor Scheduling (crew optimization, Try Now) — with 3 meta-trends: AI is eating construction, the cost of AI is crashing, and voice/video are the new interfaces.",
    file: "/briefs/tech-trends-2026-06-29.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing — June 27, 2026",
    date: "June 27, 2026",
    type: "tech",
    description: "AI now viable for field ops via local‑first architectures, urging a single glazing‑specific model and addressing prompt‑injection security",
    file: "/briefs/weekly-briefing-2026-06-27.html",
    badge: ""
  },
  {
    title: "Software Watch — June 24, 2026",
    date: "June 24, 2026",
    type: "software",
    description: "12 new tools: Trunk Tools Cortex (AI brain for drawing review, Try Now), PLAN0 AI (predictive cost analytics with 24-month forecasts, Try Now), Resolve (web-based BIM+VR collaboration, Watch), Rudus (concrete AI takeoff, Skip), Foreman (all-in-one contractor PM, Watch), Helonic (AI clash detection and draft RFIs, Try Now), Structured AI (building code QC on drawings, Watch), Snaptrude (free cloud BIM, Watch), Zoo Design Studio (open-source AI CAD, Watch), Togal.AI ($299/mo AI takeoff, Try Now), Quotr.ai (plans-to-proposal estimating, Try Now), and OpenSpace (reality capture for as-built verification, Try Now). Top picks: Trunk Tools Cortex > Helonic > Togal.AI > Quotr.ai > OpenSpace > PLAN0 AI.",
    file: "/briefs/software-watch-2026-06-24.html",
    badge: ""
  },
  {
    title: "Construction Software Brief — June 24, 2026",
    date: "June 24, 2026",
    type: "software",
    description: "Open-source BIM tools like web-ifc and @thatopen/components surge to production with 3× growth, while Procore v17.8.0 expands integration",
    file: "/briefs/software-brief-2026-06-24.html",
    badge: ""
  },
  {
    title: "Tech Trends Brief — June 22, 2026",
    date: "June 22, 2026",
    type: "tech",
    description: "15 trending technologies: Claude Fable 5 (access restored June 18 after export control saga, Epoch 161 score), Apple container v1.0 (Apple's official Docker alternative, 37,845 stars), NVIDIA SkillSpector (26% of agent skills have vulnerabilities, 4,633 stars/week), Codebase-Memory-MCP (99% token reduction, pure C, 158 languages), Omnigent (YC P26 multi-agent orchestration, 2,736 stars), solid-state air conditioning (MIT Tech Review, 80% more efficient, no refrigerants), Xcimer Phoenix (most powerful private laser for fusion, $100M raised), YC P26 agent supply chain (identity, payments, memory, insurance for AI agents), Headroom (95% token compression), Understand-Anything (#1 GitHub trending vision model), PicoClaw (AI agents on $10 hardware), Ponytail (24,417 stars in first week), Linux 7.1, Copilot token billing, and Build-Your-Own-X (350K+ ⭐) — with 3 meta-trends: the agent supply chain goes vertical (YC P26 + NVIDIA SkillSpector), the developer tooling revolution (Apple container + Codebase-Memory-MCP), and the physical infrastructure shift (solid-state cooling + fusion energy).",
    file: "/briefs/tech-trends-2026-06-22.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing — June 20, 2026",
    date: "June 20, 2026",
    type: "tech",
    description: "The briefing notes shift to composable local-first AI, robotics commoditization for mid-size firms, and barrier collapse for industry-specific AI",
    file: "/briefs/weekly-briefing-2026-06-20.html",
    badge: ""
  },
  {
    title: "Software Watch — June 17, 2026",
    date: "June 17, 2026",
    type: "software",
    description: "12 new tools: Quotr.ai (takeoff-to-procurement, 40-50% material savings, Try Now), Togal.AI (gold-standard AI takeoff, Try Now), Snaptrude (browser-based BIM at LOD 350, Watch), Kreo + Caddie AI agent (drawings to Excel cost workbook, Try Now), OpenConstructionERP v3.0 (free self-hosted ERP, Try Now), Veras by Chaos (AI rendering for Revit, Watch), Metaroom by Amrax (iPhone LiDAR field measurement to CAD, Try Now), Fieldwire by Hilti (drawing-based field mgmt, Try Now), EasyGLASS (glass-specific CAD/CAM, Watch), R2U (AR staging on Apple Vision Pro, Watch), Snap Spectacles ($2,195 consumer AR glasses shipping Fall 2026, Watch), and Caddie AI Agent (automated Excel workbook from drawings, Try Now). Top picks: Quotr.ai > Metaroom > OpenConstructionERP > Fieldwire > Kreo+Caddie.",
    file: "/briefs/software-watch-2026-06-17.html",
    badge: ""
  },
  {
    title: "Construction Software Brief — June 17, 2026",
    date: "June 17, 2026",
    type: "software",
    description: "Browser-based BIM tools web-ifc, @thatopen/components and xeokit in production, as photogrammetry reaches cost parity for facade surveys",
    file: "/briefs/software-brief-2026-06-17.html",
    badge: ""
  },
  {
    title: "Tech Trends Brief — June 15, 2026",
    date: "June 15, 2026",
    type: "tech",
    description: "15 trending technologies: Claude Fable 5/Mythos 5 (Anthropic Mythos-class, pulled offline by export directive 3 days after launch), WWDC 2026 Siri AI + iOS 27 (Apple's agentic OS with cross-app context, Tim Cook → John Ternus transition), Trace (offline Mac meeting transcripts), Kage (#1 HN, shadow websites to single binary), zeroserve + Caddy (3x throughput, 70% lower latency), DeepMind agent swarm warnings (MIT Tech Review), China BCI world-first brain-chip patient, YC P26 contech startups (Structured AI, RealPact, Rudus), Linux 7.1, Copilot token billing, formal methods at Jane Street, Headroom (95% token compression), Understand-Anything (#1 GitHub trending vision model), ReactOS Half-Life 3D milestone, and Build-Your-Own-X (350K+ ⭐) — with 3 meta-trends: the Mythos-class AI race (export controls on frontier models), Apple's Siri AI moment (consumer AI agents go mainstream), and the construction AI supply chain (from YC startups to agent swarm risks).",
    file: "/briefs/tech-trends-2026-06-15.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing — June 13, 2026",
    date: "June 13, 2026",
    type: "tech",
    description: "AI orchestration and on‑device AI maturity are shifting commercial glazing from model experimentation to combining models for field tools",
    file: "/briefs/weekly-briefing-2026-06-13.html",
    badge: ""
  },
  {
    title: "Software Watch — June 10, 2026",
    date: "June 10, 2026",
    type: "software",
    description: "12 new tools: AdamCAD (YC W25 AI text-to-CAD, $4.1M, Watch), Zoo Design Studio (open-source AI CAD kernel, ~$49/mo, Watch), OpenConstructionERP (free self-hosted construction ERP, v3.0, Try Now), Togal.AI ($299/mo AI takeoff, 95%+ accuracy, Try Now), STACK ($2,499/yr AI takeoff + PM, Try Now), OpenSpace (360° jobsite documentation, Watch), Knowify ($99/mo trade contractor PM + QB, Try Now), Buildertrend ($499-799/mo cloud PM, Watch), Bild AI (YC blueprint material extraction, Watch), Kreo ($149-299/mo BIM estimating, Watch), Buildbite ($39-89/mo field-to-billing, Watch), Scope AR/Trimble XR10 (AR for construction, Watch). Top picks: Togal.AI > Knowify > OpenConstructionERP > STACK.",
    file: "/briefs/software-watch-2026-06-10.html",
    badge: ""
  },  {
    title: "Tech Trends Brief — June 8, 2026",
    date: "June 8, 2026",
    type: "tech",
    description: "15 trending technologies: Claude Opus 4.8 (Anthropic hybrid reasoning flagship with 1M context, IPO at $965B valuation), Perplexity Personal Computer (hybrid local-cloud desktop agent now on Windows), Structured AI (YC P26) construction drawing QC, Cursor 3.7 Design Mode (voice + click + draw UI editing), SpaceX $30B Google AI compute deal ($920M/mo, IPO June 12), vLLM 20x throughput local inference, Orion-100B $1.25/hr model training, contech $121M funding week (LightTable, August Robotics), Devin Desktop (Windsurf rebrand to multi-agent IDE), Gemini 3.5 Pro, Copilot usage-based billing, Awesome Claude Skills 55K+ ⭐, SLM thesis (80% of tasks locally), Kanwas cross-agent shared context, and agent infrastructure boom (Coralogix $200M) — with 3 meta-trends: AI IPO supercycle, the desktop agent war, and construction AI going vertical.",
    file: "/briefs/tech-trends-2026-06-08.html",
    badge: ""
  },
  {
    title: "Weekly Tech Brief — June 8, 2026",
    date: "June 8, 2026",
    type: "tech",
    description: "15 technology signals: OpenAI Codex for Work (office productivity agent, released June 2), Microsoft Scout (always-on M365 AI, GA June 16), Google Managed Agents (I/O 2026 — agentic Gemini era), O'Reilly Radar (agent infrastructure as central 2026 question), OpenSpace 1,000+ data center projects milestone, BIM-Services AI automation in modeling, ENR live event (AI in Construction: From More Work to Better Work), smart window industry entering growth phase ($51.9M avg AI Series A), GitHub usage-based Copilot pricing, smaller specialized open-source models trend, agentic coding workflows, SpaceX/Google AI compute deal vs Marvell S&P 500, MIT Sloan bubble concerns, and Kanwas cross-agent context sharing. Theme: the AI office worker is here — strategy is everything.",
    file: "/briefs/tech-brief-2026-06-08.html",
    badge: ""
  },  {
    title: "Construction Software Brief - June 07, 2026",
    date: "June 07, 2026",
    type: "software",
    description: "Open-source AEC tools like the web-ifc engine now enable browser-based BIM viewing for glazing, reducing Revit licensing and accelerating adoption",
    file: "/briefs/software-brief-2026-06-07.html",
    badge: ""
  },
  {
    title: "Construction Software Brief - June 07, 2026",
    date: "June 07, 2026",
    type: "software",
    description: "Browser-based BIM viewers (web-ifc, xeokit, @thatopen/components) and FreeCAD BIM upgrades enable open-source model review without Revit licensing",
    file: "/briefs/software-brief-2026-06-07.html",
    badge: ""
  },
  {
    title: "Futurist Technology Brief - June 07, 2026",
    date: "June 07, 2026",
    type: "futurist",
    description: "Key signals include AI-driven materials design, autonomous logistics, digital twins, robotics, and sustainable smart glazing reshaping construction",
    file: "/briefs/futurist-brief-2026-06-07.html",
    badge: ""
  },
  {
    title: "Futurist Scan - June 7, 2026",
    date: "June 7, 2026",
    type: "futurist",
    description: "7 synthesized trends: CVPR 2026 multimodal explosion (vision-language papers doubled), Helion fusion $465M Series G for Microsoft power plant, Hello Robot Stretch Gen 4 home robotics, agent infrastructure boom (Coralogix $200M, ZeroDrift $10M, Lowfat 91.8% token savings), Anthropic IPO + Claude Opus 4.8 dynamic workflows, Orion-100B $1.25/hr model training, and the anti-AI backlash (DuckDuckGo boom, Meta AI hack). Triangulated across 6 sources.",
    file: "/briefs/futurist-scan-2026-06-07.html",
  },
  {
    title: "Weekly Tech Briefing - June 06, 2026",
    date: "June 06, 2026",
    type: "tech",
    description: "AI briefing highlights agentic infrastructure hitting production maturity for autonomous workflows and vision-language-action robotics moving from lab to field",
    file: "/briefs/weekly-briefing-2026-06-06.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing - June 06, 2026",
    date: "June 06, 2026",
    type: "tech",
    description: "Enterprises are moving AI infrastructure in-house, with self-hosted tools like Odysseus gaining traction for privacy-preserving, vendor-independent AI solutions",
    file: "/briefs/weekly-briefing-2026-06-06.html",
    badge: ""
  },
  {
    title: "Weekly Tech Briefing - June 06, 2026",
    date: "June 06, 2026",
    type: "tech",
    description: "AI development tooling surge, agent framework standardization, and regulatory backlash on AI content - with MVP experiments for PGC",
    file: "/briefs/weekly-briefing-2026-06-06.html",
    badge: ""
  },
  {
    title: "Top 20 Trending GitHub Repos - June 5, 2026",
    date: "June 5, 2026",
    type: "tech",
    description: "Top 20 trending GitHub repositories by weekly star-growth: Understand-Anything (#1, 2K/week), ECC (#2, 205K+ ⭐), Headroom (95% token compression, 🔥 new), Karpathy Skills, AutoGen v1.0, browser-use (96.8K ⭐), CrewAI, Trivy, MarkItDown (MIT), Hermes Agent, Ollama (120K+ ⭐), MoneyPrinterTurbo, OpenHands, FreeDomain, codegraph, build-your-own-x (350K+ ⭐), openhuman, vLLM (20x throughput), Dify (60K+ ⭐), and LangChain (105K+ ⭐) - with use cases and PGC relevance.",
    file: "/briefs/github-trending-2026-06-05.html",
    badge: ""
  },
  {
    title: "Software Watch - June 3, 2026",
    date: "June 3, 2026",
    type: "software",
    description: "12 new tools: NavigateAI (Eric Wu's field copilot, $25M seed), Fresco (Division 8 AI takeoff, Try Now), Rudus (concrete AI takeoff, YC P26), Bobyard (multi-trade AI takeoff, $35M Series A), OpenConstructionERP (open-source ERP v3.0, Try Now), Speckle (open-source BIM data, Try Now), Helonic (AI clash detection), Togal.AI ($199/mo AI takeoff), STACK (cloud takeoff & estimating), vPlan AR (LiDAR field measurement, Try Now), Drawer AI (electrical takeoff, Skip), and Bidi Contracting (takeoff + bid network). PGC top picks: vPlan AR, OpenConstructionERP, Speckle, Fresco.",
    file: "/briefs/software-watch-2026-06-03.html"
  },
  {
    title: "Tech Trends Brief - June 1, 2026",
    date: "June 1, 2026",
    type: "tech",
    description: "15 trending technologies: Ollama + nanochat (local LLM training), Bumblebee (Perplexity AI supply chain scanner), GitHub Copilot Token Billing (usage-based starts today), Claude Cowork (desktop intelligence), OpenAI Operator (browser automation), agent-browser (Vercel, open-source), Veo 3 + Google Flow (AI filmmaking), CVPR 2026 vision breakthroughs, agent memory research (Beyond Dialogue Time), construction AI + robotics (MARIO project), small language models (Phi-4, Llama-3.2), NSA MCP Security Advisory, Awesome Claude Skills (55K+ ⭐), Apple Vision Pro gen 2, and enterprise agent platforms (SAP Joule, Gartner 40% prediction) - with PGC-relevant MVP experiments and 3 meta-trends: the agent infrastructure layer, the end of flat-rate AI, and the computer-use era.",
    file: "/briefs/tech-trends-2026-06-01.html"
  },
  {
    title: "Weekly Futurist Scan - May 31, 2026",
    date: "May 31, 2026",
    type: "futurist",
    description: "7 synthesized trends anchored on Google I/O 2026: biggest search overhaul in 25 years (AI Search replaces classic Search), Antigravity agent + skills registries (agent teaching agent pattern), agent memory systems as new infrastructure layer, physical AI (Gemini Robotics-ER 1.6, reBot open-source arm), AI supply chain attacks (malicious npm, Pentest Agent Suite, ChatGPT Markdown exploit), MCP/A2A protocols hitting critical mass, and construction AI patent race - with PGC-relevant MVP experiments.",
    file: "/briefs/futurist-scan-2026-05-31.html"
  },
  {
    title: "Weekly Software Watch - May 27, 2026",
    date: "May 27, 2026",
    type: "software",
    description: "12 new tools: Fresco (Division 8 AI takeoff, Try Now), Resolve (BIM+VR collaboration, Watch), Pillar (AI construction ERP, Watch), Ciridae (a16z-backed AI ops, Watch), Speckle (open-source BIM interoperability, Try Now), Document Crunch (AI contract review, Try Now), OpenConstructionERP (open-source Python ERP, Try Now), AdamCAD (text-to-CAD, Watch), Zoo (text-to-CAD with reasoning, Watch), SafeT Coach (free AI safety app, Try Now), Ediphi (cloud preconstruction + Togal.AI, Watch), and Rudus (concrete AI takeoff, Skip).",
    file: "/briefs/software-watch-2026-05-27.html"
  },
  {
    title: "Tech Trends Brief - May 25, 2026",
    date: "May 25, 2026",
    type: "tech",
    description: "15 trending technologies: OpenHuman private AI (26,795 ⭐), RuView WiFi see-through-walls sensing (65,107 ⭐), Google AI search overhaul, codegraph token-efficient knowledge graph, supertonic on-device TTS, agentmemory persistent memory, 12-factor production agents, CloakBrowser stealth browser, Bun JS runtime, A2A+MCP agent protocols, Salesforce Agentforce ($800M ARR), Bayesian control layers, Dell token economics (320x), NVIDIA+ServiceNow governed agents, and ViMax agentic video generation - all with PGC-relevant MVP experiments.",
    file: "/briefs/tech-trends-2026-05-25.html",
  },
  {
    title: "Weekly Futurist Scan - May 24, 2026",
    date: "May 24, 2026",
    type: "futurist",
    description: "7 synthesized trends: $5.5B AI deployment JVs (OpenAI + Anthropic), Gemini Robotics-ER 1.6 physical AI, viral AI agent skills pattern (1,618 stars), Emergent Misalignment fine-tuning risk, MCP/A2A protocols at 97M downloads, AI coding agents hitting 4% of GitHub commits, and 60+ construction AI safety patents filed in 2026 - with PGC-relevant MVP experiments.",
    file: "/briefs/futurist-scan-2026-05-24.html",
  },
  {
    title: "Nashville Trip Brief - June 10-15, 2026",
    date: "May 22, 2026",
    type: "tech",
    description: "Complete 6-day Nashville itinerary: Musicians Corner finale, Broadway honky-tonks, Country Music Hall of Fame, Ryman Auditorium, food guide (hot chicken + BBQ), neighborhood breakdown, and $1,200-2,000 budget estimate.",
    file: "/briefs/nashville-trip-june-2026.html",
  },
  {
    title: "Weekly Tech Brief - May 18, 2026",
    date: "May 18, 2026",
    type: "tech",
    description: "15 trending technologies: MolmoAct 2 open robotics, sodium-ion batteries (30% cheaper), agentic AI workflows, edge small language models, neuromorphic chips, AI coding agents, CRISPR 3.0, MCP protocol, solid-state batteries, browser automation, text-to-CAD, humanoid actuators, AI cybersecurity threats, green steel, and AI agent memory - all with MVP experiments.",
    file: "/briefs/tech-brief-2026-05-18.html",
  },
  {
    title: "Book Summary: Meditations for Mortals",
    date: "June 7, 2026",
    type: "book",
    description: "Oliver Burkeman on why the quest for self-mastery is a trap: imperfectionism - radical acceptance of your limitations as the gateway to a meaningful life. 28 daily essays covering defeat as liberation, doing things 'dailyish', productivity debt, rules that serve life, starting from sanity, and finishing what you start. With practical applications for running PGC.",
    file: "/briefs/book-summary-meditations-for-mortals.html",
    badge: ""
  },
  {
    title: "Book Summary: Decoding Greatness",
    date: "May 13, 2026",
    type: "book",
    description: "Ron Friedman on reverse-engineering excellence: study top performers, break down their methods, and deliberately practice replicating their patterns. Includes practical applications for PGC in bid proposals, field workflows, client communication, and software evaluation.",
    file: "/briefs/book-summary-decoding-greatness.html",
  },
  {
    title: "Software Watch - May 20, 2026",
    date: "May 20, 2026",
    type: "software",
    description: "12 new tools: Fresco (AI Division 8 takeoff), Tasa.app (visual task + AI translation), Rudus (concrete AI estimating), Helonic (AI plan check), Opusense AI (voice field reports), ConstructConnect Takeoff Boost, Bidflow (electrical AI), Structured AI (design QA/QC), Togal.AI (general AI takeoff), ArchiLabs (AI CAD), On Center Software (door/hardware estimating), and eMullion ePWS (industry baseline).",
    file: "/briefs/software-watch-2026-05-20.html",
  },
  {
    title: "Software Watch - 12 New Tools for Glazing",
    date: "May 13, 2026",
    type: "software",
    description: "12 new tools: FreeCAD (parametric open-source CAD), Blender (3D creation suite), Planera (AI construction scheduling), Buildots (computer vision site tracking), Applied Intuition (physical AI/construction simulation), Fieldwire (field-first PM), Bluebeam Cloud (PDF collaboration), Onshape (cloud CAD with branching), Shapr3D (touch CAD for iPad), Duro Labs (cloud PLM), Fabriq (MES for fab shops), and GoCanvas (no-code field forms).",
    file: "/briefs/software-watch-2026-05-13.html",
  },
  {
    title: "Tech Trends Brief - May 11, 2026",
    date: "May 11, 2026",
    type: "tech",
    description: "15 trending technologies: ds4 local inference, Zig-native apps, mirage virtual filesystem for agents, 3DCellForge 3D generation, tokenspeed GPU inference, HTML templates for coding agents, let-go Lisp-in-Go, tilde.run versioned agent sandboxes, adamsreview multi-agent PR review, re_gent git-for-agents, mochi.js browser automation, airbyte-agents cross-source context, Text-to-CAD, balcony solar boom, and more - all with MVP experiments.",
    file: "/briefs/tech-trends-2026-05-11.html",
  },
  {
    title: "Software Watch - 12 New Tools for Glazing",
    date: "May 6, 2026",
    type: "software",
    description: "12 new tools: Shapr3D (iPad CAD), Onshape (cloud CAD), InspectMind ($100 AI plan check), Trunk Tools (AI spec review), Fabriq (shop floor MES), GoCanvas (field forms), BricsCAD (perpetual AutoCAD alt), and 6 more.",
    file: "/briefs/software-watch-2026-05-06.html"
  },

  {
    title: "Tech Trends Brief - May 4, 2026",
    date: "May 4, 2026",
    type: "tech",
    description: "15 trending technologies: AI Agent Orchestration, Coding Agents, Multimodal Generation, MCP Protocol, LoRa Mesh Radio, Edge AI, Text-to-CAD, Browser Automation, Agent Memory, Privacy-Preserving AI, Humanoid Actuators, and more - all with free MVP experiments for PGC.",
    file: "/briefs/tech-brief-2026-05-04.html",
  },
  {
    title: "Futurist Brief - May 11, 2026",
    date: "May 11, 2026",
    type: "futurist",
    description: "7 emerging signals: DS4 local Mac inference (7K stars), Mirage virtual filesystem for agents (1.9K stars), humanoid robots on real worksites, Text-to-CAD hits 2.4K stars, The Memory Curse (LLM agents forget cooperation under long context), AI agent payment rails unlock real transactions, and 123D autonomous driving dataset unifying LiDAR+camera+radar at scale.",
    file: "/briefs/futurist-brief-2026-05-11.html",
  },
  {
    title: "Futurist Brief - May 3, 2026",
    date: "May 3, 2026",
    type: "futurist",
    description: "General-purpose robotics ChatGPT moment, sleep-state learning becomes reproducible, AI agent infrastructure goes enterprise, biomimetic computing, self-healing materials, quantum error correction breakthrough, space manufacturing, and 5 more emerging trends.",
    file: "/briefs/futurist-brief-2026-05-03.html"
  },
    {
    title: "Tech Trends Brief - 15 Technologies to Watch",
    date: "May 1, 2026",
    type: "tech",
    description: "AI coding agents, MCP universal integration, edge inference accelerators, construction computer vision, voice AI agents, multimodal models, and 9 more trends with MVP experiments for PGC.",
    file: "/briefs/tech-brief-2026-05-01.html",
  },
  {
    title: "Software Watch - 10 New Tools for Glazing",
    date: "April 29, 2026",
    type: "software",
    description: "Helonic (AI plan review), Opusense (voice field reports), BricsCAD (Revit alternative), Graebert neXt (AutoCAD alternative), and 6 more modern tools replacing 20-year-old software.",
    file: "/briefs/software-watch-2026-04-29.html",
  },
  {
    title: "Futurist Brief - Week of April 26, 2026",
    date: "April 26, 2026",
    type: "futurist",
    description: "ConstructConnect's AI Takeoff Boost launch, agentic AI workflows beyond demos, robotics on live construction sites, and 7 trends shaping the future of glazing.",
    file: "/briefs/futurist-brief-2026-04-26.html",
  },
  {
    title: "Tech Trends Brief - 15 Technologies to Watch",
    date: "April 27, 2026",
    type: "tech",
    description: "Neuromorphic chips, Edge AI, Agentic workflows, humanoid robots, solid-state batteries, CRISPR, quantum-AI hybrids, and 8 more trends with MVP experiments.",
    file: "/briefs/tech-trends-2026-04-27.html",
  },
  {
    title: "Tech Deep Dive - AI Takeoff Automation",
    date: "April 21, 2026",
    type: "tech",
    description: "[LEGACY FORMAT] Three MVPs to test: AI Spec-Sifter, Digital Counter, Voice-to-Scope. Complete implementation roadmap with 3-layer takeoff stack.",
    file: "/briefs/tech-deep-dive-2026-04-21.html",
  },
  {
    title: "Futurist Brief - Week of April 19, 2026",
    date: "April 19, 2026",
    type: "futurist",
    description: "Construction robotics ROI analysis, 7 AI trends for PGC, watch list items including MCP vulnerabilities and OpenAI Codex Labs.",
    file: "/briefs/futurist-brief-2026-04-19.md",
  },
  {
    title: "Security Healthcheck - April 23, 2026",
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
              onClick={() => setFilter('book')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'book'
                  ? 'bg-white text-purple-700'
                  : 'bg-purple-500 text-white hover:bg-purple-400'
              }`}
            >
              📚 Books
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