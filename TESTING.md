# Testing Guide

## Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 2. Test via UI (Easiest)

1. **Open the workspace:**

   - Go to `http://localhost:3000`
   - Click "Get started" button
   - Or navigate directly to `http://localhost:3000/workspace`

2. **Enter a prompt:**

   - Type in the bottom input bar: `"Make a car"`
   - Press `Enter` or click the arrow button

3. **Check the console:**

   - Open browser DevTools (F12)
   - Go to Console tab
   - You should see: `Generated design: { ... }`

4. **What to expect:**
   - Without API key: Mock car data (4 wheels + chassis)
   - With API key: Real Gemini-generated recipe

### 3. Test via API Directly (curl)

```bash
# Test with mock data (no API key needed)
curl -X POST http://localhost:3000/api/design/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Make a car"}'

# Test with different prompts
curl -X POST http://localhost:3000/api/design/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Make a robot arm with 3 joints"}'
```

### 4. Test with Postman/Thunder Client

**Request:**

- Method: `POST`
- URL: `http://localhost:3000/api/design/generate`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "prompt": "Make a car with 4 wheels"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "designId": "design-1234567890",
    "recipe": {
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
        // ... more components
      ]
    },
    "geometry": {
      "meshes": [...],
      "boundingBox": { "min": [...], "max": [...] }
    },
    "validation": {
      "valid": true,
      "issues": [],
      "warnings": [],
      "corrections": []
    }
  }
}
```

## Testing Scenarios

### Scenario 1: Without API Key (Mock Data)

**What happens:**

- Uses hardcoded mock responses
- Fast, no API calls
- Good for testing the pipeline

**Test prompts:**

- `"Make a car"` → Returns car with 4 wheels
- `"Make a robot"` → Returns generic box structure

### Scenario 2: With Gemini API Key

1. **Add API key to `.env.local`:**

   ```bash
   GOOGLE_API_KEY=your_key_here
   ```

2. **Restart dev server:**

   ```bash
   npm run dev
   ```

3. **Test prompts:**
   - `"Make a Cybertruck-style car"`
   - `"Create a 6-axis robot arm"`
   - `"Build a simple table with 4 legs"`

**What to expect:**

- Real LLM decomposition
- More accurate component identification
- Better dimension inference
- May take 2-5 seconds

## Debugging

### Check Server Logs

The orchestrator logs each step:

```
🎨 Step 1: Architect Agent - Decomposing prompt into recipe...
✅ Recipe created: 5 components
🔧 Step 2: Constraint Solver - Validating and correcting dimensions...
✅ Applied 2 corrections
🏗️ Step 3: Builder Agent - Generating 3D geometry...
✅ Geometry generated: 5 meshes
```

### Common Issues

**1. "Google API key not configured"**

- Check `.env.local` exists
- Verify `GOOGLE_API_KEY` is set
- Restart dev server after adding key

**2. "Failed to parse design recipe"**

- Check console for LLM response
- May need to adjust prompt format
- Try simpler prompts first

**3. "Validation issues"**

- Check `data.validation.issues` in response
- Constraint solver will auto-correct when possible
- Warnings are non-critical

### Test Individual Agents

You can test each agent separately:

```typescript
// In a test file or API route
import { architectAgent } from "@/server/agents/architect-agent";
import { constraintSolver } from "@/server/agents/constraint-solver";
import { builderAgent } from "@/server/agents/builder-agent";

// Test Architect
const recipe = await architectAgent.execute("Make a car");
console.log(recipe);

// Test Constraint Solver
const validated = constraintSolver.validate(recipe);
console.log(validated.validation);

// Test Builder
const geometry = await builderAgent.execute(validated);
console.log(geometry.geometry.meshes.length);
```

## Expected Output Structure

### Recipe Structure

```json
{
  "object_type": "car",
  "root_component": "chassis_main",
  "components": [
    {
      "id": "chassis_main",
      "type": "box",
      "dimensions": { "length": 4500, "width": 2000, "height": 1200 },
      "relative_position": { "x": 0, "y": 0, "z": 0 },
      "label": "Chassis"
    }
  ],
  "metadata": {
    "description": "...",
    "scale": "mm"
  }
}
```

### Geometry Structure

```json
{
  "meshes": [
    {
      "component_id": "chassis_main",
      "vertices": [[x, y, z], ...],
      "faces": [[i, j, k], ...],
      "label": "Chassis"
    }
  ],
  "boundingBox": {
    "min": [x, y, z],
    "max": [x, y, z]
  }
}
```

## Next: Render in 3D Scene

Currently, the geometry is generated but not rendered. To see it in the 3D scene:

1. Import `GeneratedModel` component
2. Pass `data.geometry` to it
3. Add to your Scene3D

See `client/components/GeneratedModel.tsx` for implementation.
