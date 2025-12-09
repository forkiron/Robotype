# Agentic Workflow: Text-to-Spec-to-Mesh

## Architecture Overview

This system implements a **3-step procedural CAD pipeline** that builds objects from components rather than generating them as blobs.

```
User Prompt → Architect Agent → Constraint Solver → Builder Agent → 3D Model
```

## The 3 Agents

### 1. 🏗️ Architect Agent (`server/agents/architect-agent.ts`)

**Role:** Decomposes natural language into structured JSON recipe

**Input:** "Make a Cybertruck-style car"

**Output:** JSON with components, dimensions, hierarchy

```json
{
  "object_type": "car",
  "root_component": "chassis_main",
  "components": [
    {
      "id": "chassis_main",
      "type": "box",
      "dimensions": { "length": 4500, "width": 2000, "height": 1200 },
      "label": "Chassis"
    },
    {
      "id": "wheel_front_left",
      "type": "cylinder",
      "parent": "chassis_main",
      "dimensions": { "radius": 400, "height": 300 },
      "relative_position": { "x": 1500, "y": 1100, "z": -500 },
      "label": "Front Left Wheel"
    }
  ]
}
```

**Key Features:**

- Uses Google Gemini API with structured JSON output
- Forces hierarchical component structure
- Labels components automatically
- Falls back to mock data if API unavailable

### 2. 🔧 Constraint Solver (`server/agents/constraint-solver.ts`)

**Role:** Validates and auto-corrects dimensions

**Validations:**

- ✅ Ensures wheels touch ground (z ≤ 0)
- ✅ Checks component fits within parent
- ✅ Validates required dimensions per type
- ✅ Prevents negative dimensions

**Auto-Corrections:**

- Adjusts wheel positions to ground level
- Scales oversized components
- Fixes invalid parent-child relationships

**Output:** Validated recipe with corrections log

### 3. 🏭 Builder Agent (`server/agents/builder-agent.ts`)

**Role:** Generates actual 3D geometry from recipe

**Process:**

1. Maps component types to Three.js geometries
2. Creates meshes with materials
3. Positions components in 3D space
4. Applies rotations
5. Extracts vertices/faces for export

**Output:** Three.js meshes ready for rendering

## Usage

### API Endpoint

```typescript
POST /api/design/generate
Body: { "prompt": "Make a car with 4 wheels" }

Response: {
  success: true,
  data: {
    designId: "design-123",
    recipe: { ... },
    geometry: {
      meshes: [...],
      boundingBox: {...}
    },
    validation: {
      valid: true,
      issues: [],
      corrections: [...]
    }
  }
}
```

### Example Workflow

```typescript
// 1. User sends prompt
const response = await fetch("/api/design/generate", {
  method: "POST",
  body: JSON.stringify({ prompt: "Make a minimalist car" }),
});

const { data } = await response.json();

// 2. System identifies components
console.log(`Found ${data.recipe.components.length} components`);

// 3. System validates
if (!data.validation.valid) {
  console.warn("Issues:", data.validation.issues);
}

// 4. Render in Three.js scene
<GeneratedModel geometry={data.geometry} />;
```

## Updating Designs (Agentic Behavior)

The key advantage: **updates modify JSON, not pixels**

```typescript
// User: "Make the wheels bigger"
// System updates JSON: radius: 400 → radius: 600
// Builder re-runs → New model instantly

// User: "Add a spoiler"
// System inserts new component into JSON
// Builder re-runs → Spoiler appears
```

## Cost Optimization

- **Testing:** Use Gemini 1.5 Flash (free tier: 15 requests/min) or mock data
- **Production:** Use Gemini 1.5 Pro for accuracy (free tier available)
- **Caching:** Cache common component recipes
- **Batching:** Process multiple components in one LLM call

## API Configuration

Set `GOOGLE_API_KEY` in your `.env.local` file:

```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

## Next Steps

1. ✅ Basic 3-agent pipeline implemented
2. ⏳ Add component database integration
3. ⏳ Implement glTF/STL export
4. ⏳ Add annotation rendering
5. ⏳ Implement update/edit workflow
6. ⏳ Add Python backend for advanced CAD (optional)

## File Structure

```
server/
├── agents/
│   ├── architect-agent.ts    # LLM → JSON recipe
│   ├── constraint-solver.ts  # Validates & corrects
│   └── builder-agent.ts      # JSON → 3D geometry
├── services/
│   └── orchestrator.ts       # Coordinates pipeline
shared/
└── types/
    └── component-types.ts     # TypeScript interfaces
```

## Testing

Without API key, the system uses mock data:

- Try: "Make a car" → Returns car with 4 wheels
- Try: "Make a robot arm" → Returns basic structure

With API key (set `GOOGLE_API_KEY`):

- Full LLM-powered decomposition using Gemini
- More accurate component identification
- Better dimension inference
- Free tier: 15 requests/minute (Gemini 1.5 Flash)
