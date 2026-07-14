# Oracle | Hackathon UI/UX Clickable Demo (Round 1)

This project is a completely standalone, frontend-only clickable prototype of the Oracle application, built specifically for the **GDG Noida Sketch 'n' Ship Round 1 UI Prototype** submission. 

It is entirely decoupled from the main application, using hardcoded JSON datasets for zero-backend deployment.

## Features Showcased
- **Premium Landing Page**: Authentic branding and tagline, providing choices to skip or run calibration.
- **Oracle Calibration Wizard**: A 6-question wizard to build cognitive styles. Selections are stored locally.
- **Decision DNA Synthesis Splash**: Renders decision archetypes (Builder) and initial metrics with CSS animations.
- **Interactive Workspace Composer**: Prompt builder with quick-start templates and active DNA status indicator.
- **Staged AI Loading Transition**: Cycling loader messages mimicking backend decision calculations.
- **Scenario Comparison Dashboard**: Renders 3 distinct paths side-by-side (Accelerated Growth, Balanced, Defensive Hedge).
- **Interactive Scrubber Slider**: Scrubbing years updates compound compensation line charts, radar grids, and milestones dynamically.
- **DNA Profile Dashboard**: Includes Calibration Health, model versioning, editable traits cards, and explainability popups ("Why?").
- **Briefing Report Preview**: Replicates ReportLab PDF summaries, enabling simulated PDF report downloads.

---

## Tech Stack
- **React 19**
- **Vite**
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion**
- **Recharts**
- **Lucide Icons**

---

## Folder Structure
- `src/mock/`: Stores all mock data files (`dna.json`, `decision.json`, `timeline.json`, `history.json`, `report.json`).
- `public/`: Hosts static download resources (`oracle_report.pdf`).

---

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

---

## Standalone Deployment

This prototype is prepared to be deployed directly to Vercel or Netlify. Set the base directory of the deployment tool to `oracle-prototype/` and compile using `npm run build`.
