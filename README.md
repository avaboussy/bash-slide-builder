# BASH Workout Generator

A web-based tool for generating daily boxing workout slide decks (.pptx) for BASH fitness studios.

## Features

- Weekly planner with 7 days
- 6 workout types: Strength, Resistance, Endurance, Power, Force, Speed & Stamina
- Generates 4 .pptx files per day (Bags + Floor × Bottom + Middle screen)
- Icon uploads for duck, roll, dash, fire combos
- Auto-names punch sequences
- Timed or reps-based floor modes

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import the GitHub repo
4. Framework: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click Deploy

No environment variables needed — this is a fully client-side app.
