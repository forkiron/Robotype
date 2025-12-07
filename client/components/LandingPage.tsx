"use client";

import React from "react";
import Link from "next/link";

import {
  Box,
  ArrowRight,
  Play,
  PenTool,
  Hexagon,
  MousePointer2,
  Command,
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 font-sans selection:bg-blue-200 overflow-hidden relative">
      {/* BACKGROUND ELEMENTS */}
      {/* Soft Pastel Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-200/40 rounded-full blur-3xl opacity-60 mix-blend-multiply filter"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-100/60 rounded-full blur-3xl opacity-70 mix-blend-multiply filter"></div>
        <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl opacity-50 mix-blend-multiply filter"></div>

        {/* Subtle Grid Pattern for "Tech/CAD" feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Hexagon className="fill-slate-900 text-slate-900" size={28} />
            <span className="font-bold text-lg tracking-tight">RoboType</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-slate-900 transition-colors">
              Product
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              Solutions
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              Resources
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              Pricing
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors">
            Sign In
          </button>
          <Link
            href="/workspace"
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 group"
          >
            Get started
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-32 flex flex-col items-start relative z-10">
        {/* Headline */}
        <h1 className="font-serif text-6xl md:text-8xl leading-[0.95] tracking-tight text-slate-900 mb-8 max-w-4xl">
          Engineers, <br />
          <span className="text-slate-900">welcome home.</span>
        </h1>

        {/* Subtext */}
        <p className="text-xl text-slate-600 max-w-xl leading-relaxed mb-10 font-light">
          RoboType is the intelligent canvas for robotics. Turn rough sketches
          and prompts into manufacturable CAD models, instantly.
        </p>

        {/* Main CTA */}
        <div className="flex items-center gap-4 mb-24">
          <Link
            href="/workspace"
            className="bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2 transform hover:-translate-y-1"
          >
            Get started for free
            <ArrowRight size={18} />
          </Link>
          <button className="px-8 py-4 rounded-full text-lg font-medium text-slate-700 hover:bg-white/50 transition-all flex items-center gap-2 border border-transparent hover:border-slate-200">
            <Play size={18} className="fill-slate-700" />
            Watch the video
          </button>
        </div>
      </main>

      {/* FLOATING UI ELEMENT (Bottom Toolbar Simulation) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-20">
        {/* Floating Toolbar Container */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-2 rounded-2xl shadow-2xl shadow-blue-900/5 flex items-center justify-between gap-4">
          {/* Left Tools */}
          <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl">
            <button className="p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-500 hover:text-blue-600">
              <MousePointer2 size={20} />
            </button>
            <button className="p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-500 hover:text-blue-600">
              <PenTool size={20} />
            </button>
            <button className="p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-500 hover:text-blue-600">
              <Box size={20} />
            </button>
          </div>

          {/* Center Input (The "Cursor" Prompt) */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Command size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Describe a mechanism (e.g., 'A 3-axis robot arm with a claw')..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <span className="text-[10px] bg-slate-200 px-2 py-1 rounded text-slate-500 font-mono">
                Enter
              </span>
            </div>
          </div>

          {/* Right Tools (Cleaned up) */}
          <div className="flex items-center gap-3 pr-2">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors">
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
