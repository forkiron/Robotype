"use client";

import React, { useState, useRef } from "react";
import { Scene3D } from "./Scene3D";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

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
  // State for UI interactivity
  const [prompt, setPrompt] = useState("");
  const [currentView, setCurrentView] = useState("TOP");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGeometry, setGeneratedGeometry] = useState<any>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);

  // View cube click handler - will control camera via refs
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    // Camera positions for different views (isometric-like distances)
    const views: Record<
      string,
      { position: [number, number, number]; target: [number, number, number] }
    > = {
      TOP: { position: [0, 10, 0], target: [0, 0, 0] },
      FRONT: { position: [0, 0, 10], target: [0, 0, 0] },
      RIGHT: { position: [10, 0, 0], target: [0, 0, 0] },
      BACK: { position: [0, 0, -10], target: [0, 0, 0] },
      LEFT: { position: [-10, 0, 0], target: [0, 0, 0] },
      BOTTOM: { position: [0, -10, 0], target: [0, 0, 0] },
    };

    if (views[view] && controlsRef.current && cameraRef.current) {
      const controls = controlsRef.current;
      const camera = cameraRef.current;

      // Calculate current distance from target to preserve zoom
      const currentDistance = camera.position.distanceTo(controls.target);

      // Get the direction vector for the new view
      const { position: targetPosition } = views[view];
      const direction = new THREE.Vector3(...targetPosition);
      // Nudge away from exact pole to avoid getting stuck
      const poleNudge = 0.001;
      if (Math.abs(direction.y) > 0.999) {
        direction.y = Math.sign(direction.y) * (0.999 - poleNudge);
      }

      // Handle edge case: if direction is zero vector (shouldn't happen), use default
      if (direction.length() === 0) {
        direction.set(0, 0, 1);
      }

      // Normalize and scale by current distance
      direction.normalize();
      const newPosition = direction.multiplyScalar(currentDistance);

      // Smoothly animate to new position
      const startPos = camera.position.clone();
      const startTarget = controls.target.clone();
      const endTarget = new THREE.Vector3(0, 0, 0);

      let progress = 0;
      const duration = 500; // 500ms animation
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);

        // Ease in-out for smooth transition
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Interpolate position
        camera.position.lerpVectors(startPos, newPosition, eased);

        // Interpolate target
        controls.target.lerpVectors(startTarget, endTarget, eased);

        // Update camera rotation to look at target
        camera.lookAt(controls.target);
        controls.update();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (controlsRef.current && cameraRef.current) {
      const direction = new THREE.Vector3();
      cameraRef.current.getWorldDirection(direction);
      cameraRef.current.position.add(direction.multiplyScalar(-1));
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current && cameraRef.current) {
      const direction = new THREE.Vector3();
      cameraRef.current.getWorldDirection(direction);
      cameraRef.current.position.add(direction.multiplyScalar(1));
      controlsRef.current.update();
    }
  };

  const handleFitView = () => {
    if (controlsRef.current && cameraRef.current) {
      // Reset to default isometric view
      cameraRef.current.position.set(5, 5, 5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Handle prompt submission
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/design/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      // Store the generated geometry to render in the scene
      if (data.success && data.data?.geometry) {
        setGeneratedGeometry(data.data.geometry);
        console.log("Generated design:", data);
      }
    } catch (error) {
      console.error("Error generating design:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
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
      <main className="flex-1 relative overflow-hidden bg-[#f8fafc]">
        {/* Real 3D Scene */}
        <div className="absolute inset-0">
          <Scene3D
            controlsRef={controlsRef}
            cameraRef={cameraRef}
            onViewChange={handleViewChange}
            currentView={currentView}
            generatedGeometry={generatedGeometry}
          />
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
          {/* View Cube is now a 3D model in the scene, so we just show zoom controls here */}
          {/* Zoom Controls - Vertical Layout */}
          <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-1">
            <button
              onClick={handleFitView}
              className="p-2 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center"
              title="Fit View"
            >
              <Maximize size={16} />
            </button>
            <div className="h-px bg-slate-100 my-0.5"></div>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center"
              title="Zoom In"
            >
              <Plus size={16} />
            </button>
            <div className="h-px bg-slate-100 my-0.5"></div>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center"
              title="Zoom Out"
            >
              <Minus size={16} />
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
                onKeyPress={handleKeyPress}
                placeholder="Describe a change (e.g. 'Add a 4mm mounting hole to the left corner')..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                autoFocus
                disabled={isGenerating}
              />
            </div>
            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
