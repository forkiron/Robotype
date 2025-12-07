"use client";

import React, { useState } from "react";

import {
  Box,
  Menu,
  Search,
  Settings,
  Share2,
  Play,
  Undo2,
  Redo2,
  Minus,
  Plus,
  Maximize,
  Hexagon,
  MousePointer2,
  Command,
  ArrowRight,
  ChevronDown,
  Layers,
  Cpu,
} from "lucide-react";

const RoboTypeWorkspace = () => {
  // State to simulate UI interactivity
  const [prompt, setPrompt] = useState("");
  const [rotation, setRotation] = useState({ x: 60, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentView, setCurrentView] = useState("TOP");

  // Right-click drag handler for orbiting
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      // Right mouse button
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setRotation((prev) => ({
        x: Math.max(10, Math.min(90, prev.x - deltaY * 0.5)),
        z: prev.z + deltaX * 0.5,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // View cube click handler
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    const views: Record<string, { x: number; z: number }> = {
      TOP: { x: 90, z: 0 },
      FRONT: { x: 0, z: 0 },
      RIGHT: { x: 0, z: -90 },
      BACK: { x: 0, z: 180 },
      LEFT: { x: 0, z: 90 },
      BOTTOM: { x: -90, z: 0 },
    };
    if (views[view]) {
      setRotation(views[view]);
    }
  };

  return (
    <div className="h-screen w-full bg-[#f0f4f8] flex flex-col font-sans overflow-hidden text-slate-700">
      {/* 1. APP HEADER */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <Hexagon className="fill-slate-900 text-slate-900" size={20} />
            <span className="font-bold text-base tracking-tight text-slate-900">
              RoboType
            </span>
          </div>

          {/* File Menu */}
          <div className="hidden md:flex items-center gap-1">
            {["File", "Edit", "View", "Group", "Help"].map((item) => (
              <button
                key={item}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {/* Project Title & Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
            <span className="text-xs font-semibold text-slate-700">
              Untitled_Project_01
            </span>
            <ChevronDown size={12} className="text-slate-500" />
          </div>
          <div className="h-4 w-px bg-slate-300"></div>
          <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Settings size={18} />
          </button>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
            <Share2 size={14} /> Share
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE AREA */}
      <main
        className="flex-1 relative overflow-hidden bg-[#f8fafc]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* GRID BACKGROUND (Simulating the 3D Workplane from Reference) */}
        {/* In production, this div is where <Canvas> from @react-three/fiber goes */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden perspective-[1000px] select-none">
          {/* The Square Grid Workplane */}
          <div
            className="w-[600px] h-[600px] bg-white shadow-2xl border-2 border-slate-300"
            style={{
              transform: `rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg) translateZ(-100px)`,
              backgroundImage: `
                 linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
               `,
              backgroundSize: "20px 20px",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
          >
            {/* Center Origin Marker */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-400/60"></div>
            <div className="absolute top-0 left-1/2 h-full w-0.5 bg-red-400/60"></div>

            {/* Workplane Labels */}
            <div className="absolute bottom-2 left-2 text-blue-400/60 text-xs font-medium">
              Workplane
            </div>
            <div className="absolute bottom-2 right-2 text-blue-400/60 text-xs font-medium">
              Millimeters
            </div>

            {/* Simulated Object Placeholder */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 bg-blue-500/20 border-2 border-blue-500 rounded-lg backdrop-blur-sm flex items-center justify-center relative">
                <span className="text-blue-600 font-mono text-xs">Origin</span>
                {/* Z-Axis Line */}
                <div className="absolute bottom-1/2 left-1/2 w-0.5 h-32 bg-green-400 origin-bottom -translate-x-1/2 transform -rotate-x-90"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. FLOATING UI CONTROLS */}
        {/* Top Left: Toolbar */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-1">
            <button
              className="p-2 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 tooltip"
              title="Select"
            >
              <MousePointer2 size={18} />
            </button>
            <button
              className="p-2 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 tooltip"
              title="Move"
            >
              <ArrowRight size={18} />
            </button>
            <button
              className="p-2 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 tooltip"
              title="Undo"
            >
              <Undo2 size={18} />
            </button>
            <button
              className="p-2 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 tooltip"
              title="Redo"
            >
              <Redo2 size={18} />
            </button>
          </div>
        </div>

        {/* Left Side: View Controls (Like Tinkercad) */}
        <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-4">
          {/* View Cube - Functional */}
          <div
            className="w-16 h-16 bg-white border-2 border-slate-200 shadow-sm rounded-lg flex items-center justify-center font-bold text-[10px] text-slate-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-all transform hover:scale-105"
            style={{
              transform: `rotate(45deg) ${currentView === "TOP" ? "scale(1.05)" : ""}`,
              borderColor: currentView === "TOP" ? "#3b82f6" : undefined,
              color: currentView === "TOP" ? "#3b82f6" : undefined,
            }}
            onClick={() => handleViewChange("TOP")}
          >
            <span style={{ transform: "rotate(-45deg)" }}>TOP</span>
          </div>

          {/* Zoom Controls - Square Layout (2x2) */}
          <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-200 grid grid-cols-2 gap-1 w-20">
            <button className="p-2 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center">
              <Plus size={16} />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center">
              <Minus size={16} />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center col-span-2">
              <Maximize size={16} />
            </button>
          </div>
        </div>

        {/* Right Side: Properties / Object Inspector */}
        <div className="absolute top-4 right-4 bottom-24 w-64 bg-white/80 backdrop-blur-md border border-white/60 shadow-xl shadow-slate-200/50 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-white/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Inspector
            </span>
            <Layers size={14} className="text-slate-400" />
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-6">
            {/* Empty State / Context */}
            <div className="text-center mt-10 opacity-50">
              <Cpu size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs text-slate-400">
                Select an object or describe a part to see properties.
              </p>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM COMMAND BAR (Persistent from Landing) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[600px] max-w-[90%] z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 p-1.5 rounded-2xl shadow-2xl shadow-blue-900/10 flex items-center gap-2 ring-1 ring-black/5">
            {/* Input Area */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Command size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe a change (e.g. 'Add a 4mm mounting hole to the left corner')..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                autoFocus
              />
            </div>
            {/* Action Button */}
            <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Helper Text */}
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400 font-medium">
              Press{" "}
              <span className="bg-white border border-slate-200 rounded px-1">
                Enter
              </span>{" "}
              to generate
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoboTypeWorkspace;

