# TanukiType

Monkeytype-style kana typing trainer. See kana, type romaji. Fast, minimal, satisfying.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite 7
- **Styling:** Tailwind CSS v4 + shadcn/ui (Base UI primitives, Nova preset)
- **Backend/Auth:** Supabase (planned - not yet wired up)
- **State:** localStorage for guest stats, Supabase for authenticated users (planned)
- **Deployment:** Static site (Vercel/Netlify)

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check + production build
pnpm preview      # Preview production build
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm typecheck    # TypeScript check (no emit)
```

## Architecture

### Core Mechanic
- Display a sequence of kana characters (hiragana, katakana, or mixed)
- User types the corresponding romaji
- Real-time feedback: correct chars highlighted, mistakes shown
- Timer-based rounds (15s / 30s / 60s / 120s)
- Results screen with WPM, accuracy, consistency

### Design Philosophy
- **Auth enhances, never gates.** Every feature works without login. Auth unlocks cross-device sync, leaderboard presence, profiles, and badges.
- **Instant start.** No modals, no onboarding, no tutorials. Land on the page, start typing.
- **Monkeytype-level polish.** Smooth cursor, faded untyped text, satisfying rhythm. This should feel like a vibe, not homework.
- **Dark-first UI.** Monkeytype-inspired aesthetic with a dark theme as the default.

### File Structure

```
src/
  components/
    ui/              # shadcn/ui components (auto-generated, don't manually edit)
    game/            # Core typing game components
    layout/          # Header, footer, nav
    results/         # Post-game stats display
    leaderboard/     # Leaderboard views (planned)
    profile/         # User profile & badges (planned)
  hooks/             # Custom React hooks (useTimer, useTypingEngine, etc.)
  lib/               # Utilities, helpers, kana data
    kana.ts          # Hiragana/katakana character maps and romaji mappings
    utils.ts         # General utilities (cn, etc.)
    stats.ts         # WPM/accuracy calculation logic
    storage.ts       # localStorage abstraction for guest stats
  types/             # TypeScript type definitions
  App.tsx
  main.tsx
  index.css
```

### Kana Data Model
Each kana character maps to one or more valid romaji inputs:
- し → "shi" or "si"
- つ → "tsu" or "tu"
- ち → "chi" or "ti"
- ふ → "fu" or "hu"

Support both Hepburn and Kunrei-shiki romanization systems where they diverge.

### Game Modes
- **Hiragana** — basic hiragana characters
- **Katakana** — basic katakana characters
- **Mixed** — both hiragana and katakana
- **Dakuten** (planned) — voiced consonants only (が, ざ, だ, etc.)
- **Custom rows** (planned) — drill specific rows of the gojuuon table

### Timer Modes
- 15 seconds / 30 seconds / 60 seconds / 120 seconds

## MVP Scope (v0.1)

1. Core typing engine: display kana → accept romaji input → real-time correctness feedback
2. Mode selection: hiragana / katakana / mixed
3. Timer modes: 15 / 30 / 60 seconds
4. Results screen: WPM, accuracy, characters correct/incorrect
5. Clean dark Monkeytype-style UI
6. localStorage for personal best stats
7. Restart on Tab+Enter (Monkeytype convention)

## Future Features

- Supabase auth (Google/GitHub OAuth, subtle top-right login)
- Cross-device stat sync for authenticated users
- Global leaderboards (daily / all-time)
- Profile pages with badges
- Granular drill modes (dakuten, specific kana rows)
- WPM/accuracy graphs over time
- Tanuki mascot with subtle reactions
- Sound effects (optional, off by default)
- Custom themes

## Code Style

- Functional components only, no class components
- Custom hooks for logic separation (useTypingEngine, useTimer, useStats)
- Prefer composition over prop drilling
- Keep components small and focused
- All game logic lives in hooks, components are purely presentational where possible
