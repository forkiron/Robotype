# RoboType Setup Guide

## ✅ What's Been Set Up

### Frontend (3D Editor)

- **React Three Fiber** - 3D rendering engine
- **@react-three/drei** - Helper components (OrbitControls, Grid, etc.)
- **Three.js** - Core 3D library
- **Functional 3D Scene** with:
  - Interactive workplane with grid
  - Orbit controls (right-click drag to pan, left-click drag to rotate, scroll to zoom)
  - View cube for quick view changes
  - Zoom controls
  - Origin markers and axis lines

### Backend Structure

- **Next.js API Routes** - `/app/api/design/generate/route.ts`
- **Server Services** (placeholder structure):
  - `server/services/ai-service.ts` - AI model integration
  - `server/services/cad-service.ts` - CAD file generation
  - `server/services/component-service.ts` - Component database
  - `server/services/storage-service.ts` - File storage

### Project Structure

```
robotype/
├── app/
│   ├── api/design/generate/    # API endpoint for design generation
│   └── workspace/              # Workspace page
├── client/
│   └── components/
│       ├── LandingPage.tsx      # Landing page
│       ├── RoboTypeWorkspace.tsx # Main workspace
│       ├── Scene3D.tsx         # 3D scene wrapper
│       └── Workplane.tsx       # 3D workplane component
└── server/
    └── services/               # Backend services (to be implemented)
```

## 🚀 How to Run

1. **Install dependencies** (already done):

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Open browser**:
   - Navigate to `http://localhost:3000`
   - Click "Get started" to go to workspace
   - The 3D editor should be fully interactive

## 🎮 Controls

- **Left-click + drag**: Rotate camera
- **Right-click + drag**: Pan view
- **Scroll wheel**: Zoom in/out
- **View Cube**: Click to snap to different views (TOP, FRONT, etc.)
- **Zoom Controls**: Use +/- buttons or fullscreen

## 📋 Next Steps (Backend Integration)

### 1. AI Service Integration

You'll need to integrate with AI models for CAD generation:

- **OpenAI API** - For text-to-CAD prompts
- **Anthropic Claude** - Alternative AI model
- **Google Gemini** - For multi-modal generation

**Environment Variables Needed:**

```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
```

### 2. CAD Processing

For actual CAD file generation, you'll need:

- **OpenCASCADE** or similar CAD kernel
- **FreeCAD** integration (Python backend)
- **CAD file converters** (STEP, STL, glTF)

### 3. Component Database

For BOM generation:

- **DigiKey API** - Component search
- **Mouser API** - Alternative component source
- **Local database** - Custom components

### 4. File Storage

For storing generated CAD files:

- **Local storage** - For development
- **AWS S3** or **Cloudflare R2** - For production
- **File conversion pipeline** - Convert between formats

## 🔧 External Services Setup

### Option 1: Python Backend (Recommended for CAD)

If you want to use Python for CAD processing (FreeCAD, OpenCASCADE):

1. **Set up Python backend**:

   ```bash
   # Create separate Python service
   mkdir backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install fastapi uvicorn opencascade-python
   ```

2. **Run FastAPI server**:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

3. **Update Next.js API route** to call Python backend

### Option 2: Node.js Only

If you want to keep everything in Node.js:

- Use **OpenCASCADE.js** (WebAssembly)
- Use **Three.js** for visualization only
- Generate CAD files client-side or via API

## 📝 Current Status

✅ **Working:**

- 3D scene rendering
- Interactive camera controls
- View cube
- UI layout
- API route structure

⏳ **To Be Implemented:**

- AI prompt processing
- CAD model generation
- 3D model loading into scene
- Component BOM generation
- File export (STEP, STL, glTF)

## 🐛 Troubleshooting

**3D scene not showing?**

- Check browser console for errors
- Ensure WebGL is enabled in browser
- Try a different browser (Chrome/Firefox recommended)

**Controls not working?**

- Make sure you're clicking in the 3D viewport area
- Right-click might be disabled by browser - check settings

**API errors?**

- Check that Next.js dev server is running
- Verify API route is accessible at `/api/design/generate`
