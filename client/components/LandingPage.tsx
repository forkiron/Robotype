"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Play,
  Hexagon,
  MousePointer2,
  PenTool,
  Box,
  Command,
  Settings2,
} from "lucide-react";
import { BlueprintScene } from "./BlueprintScene";

const LandingPage = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const handlePromptSubmit = () => {
    const value = prompt.trim();
    if (!value) return;
    router.push(`/workspace?prompt=${encodeURIComponent(value)}`);
  };

  const handlePromptKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-sky-200 overflow-hidden relative">
      {/* BACKGROUND: Soft Blue Gradients & Tech Grid */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        {/* Brighter, more specific blue gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[900px] h-[900px] bg-sky-200/40 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-cyan-100/60 rounded-full blur-3xl opacity-70 mix-blend-multiply"></div>

        {/* The Grid: Now slightly blue tinted */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e91a_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e91a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            {/* Logo is now Blue */}
            <Hexagon className="fill-blue-600 text-blue-600" size={28} />
            <span className="font-bold text-lg tracking-tight text-slate-900">
              RoboType
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Product
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Solutions
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Resources
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors">
            Sign In
          </button>
          {/* Button is now Blue */}
          <Link
            href="/workspace"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 group"
          >
            Get started
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION - Now a GRID layout to fit the 3D scene on the right */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* LEFT COLUMN: Text & CTA */}
        <div className="flex flex-col items-start">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v1.0 is live: beta
          </div>
          <h1 className="font-serif text-6xl md:text-7xl leading-[0.95] tracking-tight text-slate-900 mb-8">
            Engineers, <br />
            <span className="text-blue-600">welcome home.</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-10 font-light max-w-lg">
            RoboType is the{" "}
            <span className="text-blue-600 font-medium">
              intelligent canvas
            </span>{" "}
            for robotics. Turn rough sketches and prompts into manufacturable
            CAD models, instantly.
          </p>
          <div className="flex items-center gap-4">
            {/* Primary Button: Blue */}
            <Link
              href="/workspace"
              className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 transform hover:-translate-y-1"
            >
              Get started for free
              <ArrowRight size={18} />
            </Link>
            {/* Secondary Button: Blue Icon */}
            <button className="px-8 py-4 rounded-full text-lg font-medium text-slate-700 hover:bg-white/50 transition-all flex items-center gap-2 border border-transparent hover:border-slate-200">
              <Play size={18} className="fill-blue-600 text-blue-600" />
              Watch the video
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: The 3D Scene */}
        <div className="relative h-full min-h-[500px] flex items-center justify-center">
          {/* Background Glow behind the robot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-400/20 blur-3xl rounded-full -z-10"></div>

          {/* The 3D Component */}
          <BlueprintScene />

          {/* Floating "Status" badge for extra tech feel */}
          <div className="absolute top-10 right-10 bg-white/80 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
            <Settings2 size={14} className="text-blue-600" />
            <span className="text-xs font-mono text-slate-600">
              ASSEMBLY_MODE: ONLINE
            </span>
          </div>
        </div>
      </main>

      {/* FLOATING PROMPT BAR (Bottom) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-20">
        <div className="bg-white/90 backdrop-blur-xl border border-blue-100 p-2 rounded-2xl shadow-2xl shadow-blue-900/10 flex items-center justify-between gap-4 ring-1 ring-blue-500/5">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
            {/* Icons are now Slate/Blue on hover */}
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
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Command size={16} className="text-blue-400" />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handlePromptKey}
              placeholder="Describe a mechanism (e.g., 'A 6-axis robot arm')..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              {/* Blue hint key */}
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-mono font-bold">
                Enter
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 pr-2">
            <button
              onClick={handlePromptSubmit}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              disabled={!prompt.trim()}
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
