# Cursor Fit

Mobile-first web fitness app: manage exercises, create sessions, run workouts. Built with **React**, **TypeScript**, **TailwindCSS**, and **localStorage**.

## Run

```bash
npm install
npm run dev
```

Open the URL shown (e.g. `http://localhost:5173`). Use **Build** for production:

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

Every push to `main` builds and deploys to GitHub Pages via the [Deploy to GitHub Pages](.github/workflows/deploy.yml) workflow.

**One-time setup:**

1. In the repo: **Settings → Pages → Build and deployment**
2. Set **Source** to **GitHub Actions**.
3. If your repo name is not `cursor-fit`, set the `VITE_BASE_PATH` env in `.github/workflows/deploy.yml` to `/<your-repo-name>/`.

The app will be available at `https://<username>.github.io/cursor-fit/` (or your repo URL).

## Features

- **Exercises**: Create strength (reps + weight per level) or cardio (duration per level). Set sets, rest between sets, and 1–10 levels.
- **Sessions**: Combine exercises with chosen levels and rest between exercises.
- **Single-exercise workout**: From the exercise list, start a workout for one exercise (default level).
- **Session workout**: Run a full session with rest timers between sets and between exercises.
- **Rest timer**: Large countdown; beep and “Start next set/exercise” when done. Timer stays accurate in background tabs (Web Worker).
- **Results**: After finishing, see total time and completed sets; “Finish” returns to the app.

## Tech

- **State**: Zustand store; screen, exercises, sessions, active workout, results.
- **Persistence**: `localStorage` via `storage.ts` (exercises, sessions, workout history).
- **Timer**: `timer.worker.ts` + `timer-utils.ts` for countdowns that work when the tab is in the background.
- **Sound**: Web Audio beep in `sound.ts` (no asset).

## Structure

- `src/types.ts` — Interfaces (Exercise, Session, ActiveWorkout, etc.)
- `src/storage.ts` — localStorage helpers
- `src/timer.worker.ts` — Web Worker countdown
- `src/timer-utils.ts` — Timer API and `formatSeconds`
- `src/store.ts` — Zustand store and actions
- `src/components/` — Home, ExerciseList, ExerciseForm, SessionList, SessionCreator, ActiveWorkoutScreen, RestTimer, ResultsScreen
- `src/App.tsx` — Screen-based routing
