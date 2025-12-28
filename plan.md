# Riichi Mahjong PWA - Implementation Plan

## Project Overview
A Progressive Web App for Japanese Riichi Mahjong with single-player gameplay against AI opponents. Modern pixel art aesthetic inspired by Clubhouse Games with retro charm.

**Repository**: https://github.com/0x000NULL/mahjong
**Deployment**: DigitalOcean (via doctl)
**Tech Stack**: React + TypeScript, Node.js + WebSocket (future multiplayer)

---

## Phase 1: Project Foundation ✅

### 1.1 Project Setup
- [x] Initialize React + TypeScript project with Vite
- [x] Configure PWA with vite-plugin-pwa (service worker, manifest)
- [x] Set up ESLint, Prettier for code quality
- [x] Configure path aliases (@/components, @/game, @/ai, etc.)
- [ ] Set up GitHub Actions for CI/CD

### 1.2 Project Structure
```
/
├── .do/                 # DigitalOcean App Platform config
│   └── app.yaml        # App spec for deployment
├── src/
│   ├── components/      # React UI components
│   │   ├── game/       # Game-specific (Hand, Tile, Table)
│   │   ├── ui/         # Generic UI (Button, Modal, Dialog)
│   │   └── layout/     # Layout components
│   ├── game/           # Core game engine
│   │   ├── engine/     # Game state, rules, flow
│   │   ├── tiles/      # Tile definitions, utilities
│   │   ├── yaku/       # Yaku detection and scoring
│   │   └── scoring/    # Han/Fu calculation, payments
│   ├── ai/             # AI opponents
│   │   ├── core/       # Base AI logic
│   │   ├── strategies/ # Difficulty-based strategies
│   │   └── personalities/ # Character-specific behaviors
│   ├── assets/         # Sprites, sounds, fonts
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # State management (Zustand)
│   ├── storage/        # localStorage persistence layer
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
└── public/              # Static PWA assets
```

---

## Phase 2: Core Game Engine (Partial ✅)

### 2.1 Tile System ✅
- [x] Define all 136 tiles (34 unique × 4 each)
  - Manzu (1-9 characters)
  - Pinzu (1-9 circles)
  - Souzu (1-9 bamboo)
  - Honors: Winds (East/South/West/North), Dragons (White/Green/Red)
- [x] Tile comparison, sorting, grouping utilities
- [x] Wall building and dead wall management
- [x] Dora indicator → Dora tile conversion

### 2.2 Hand Management ✅
- [x] 13-tile hand representation (14 on draw)
- [x] Meld tracking (chi/pon/kan - open vs closed)
- [x] Tenpai detection (waiting tiles calculation)
- [x] Shanten calculation (tiles away from tenpai)
- [x] Valid discard determination

### 2.3 Game Flow Engine (Partial)
- [x] Round state machine:
  - Draw → Discard → Call Check → Next Turn
  - Win declaration (Tsumo/Ron)
  - Exhaustive draw (Ryuukyoku)
- [x] Call priority system (Ron > Pon/Kan > Chi)
- [ ] Riichi declaration and betting
- [ ] Kan handling (all 4 types)
- [ ] Furiten tracking (temporary and permanent)

### 2.4 Yaku Detection (All Standard Riichi Yaku)
**1-Han Yaku**: Riichi, Ippatsu, Menzen Tsumo, Tanyao, Pinfu, Iipeikou, Yakuhai (3 types), Chankan, Rinshan, Haitei, Houtei
**2-Han Yaku**: Double Riichi, Chanta, Ittsu, Sanshoku Doujun, Sanshoku Doukou, Sankantsu, Toitoi, Sanankou, Shousangen, Honroutou, Chiitoitsu
**3-Han Yaku**: Honitsu, Junchan, Ryanpeikou
**6-Han Yaku**: Chinitsu
**Yakuman**: Kokushi, Suuankou, Daisangen, Shousuushii, Daisuushii, Tsuuiisou, Chinroutou, Ryuuiisou, Chuuren, Suukantsu, Tenhou, Chiihou

### 2.5 Scoring System
- [ ] Fu calculation (base fu + melds + wait + win type)
- [ ] Han counting (yaku + dora + ura-dora + aka-dora)
- [ ] Score lookup tables (dealer vs non-dealer)
- [ ] Payment distribution (tsumo splits, ron direct)
- [ ] Honba (repeat counter) bonus calculation
- [ ] Riichi stick collection

---

## Phase 3: AI System

### 3.1 Base AI Framework ✅
- [x] Decision interface: discard selection, call decisions, riichi timing
- [ ] Hand evaluation metrics (shanten, ukeire, tile efficiency)
- [ ] Danger assessment (suji, kabe, genbutsu tracking)
- [ ] Win probability estimation

### 3.2 Difficulty Levels
**Easy AI**:
- Random-adjacent tile efficiency
- No defensive play
- Never folds, always pushes

**Medium AI**:
- Basic tile efficiency (maximize ukeire)
- Simple danger recognition
- Will fold against riichi with bad hand

**Hard AI**:
- Optimal tile efficiency
- Advanced defense (suji, kabe, early/late safe tiles)
- Push/fold decision based on hand value vs risk
- Reads opponent hands from discards

### 3.3 AI Personalities (6 Characters)
Each has portrait, dialogue, and distinct playstyle:

1. **Hana** (Beginner-friendly) - Cautious, folds easily, celebrates small wins
2. **Kenji** (Aggressive) - Pushes risky hands, loves big yaku, taunts
3. **Yuki** (Defensive) - Master of folding, frustrating to deal into
4. **Taro** (Balanced) - Solid fundamentals, default medium-hard
5. **Mei** (Speed Demon) - Cheap fast hands, lots of riichi
6. **Grandmaster Sato** (Expert) - Reads everything, intimidating dialogue

---

## Phase 4: User Interface

### 4.1 Game Screen Layout
```
┌─────────────────────────────────────────┐
│  [Opponent 2 - Top]    Score | Portrait │
├─────────────────────────────────────────┤
│         │                     │         │
│ [Opp 1] │   Center Table      │ [Opp 3] │
│  Left   │   - Discards        │  Right  │
│         │   - Dora indicators │         │
│         │   - Round wind      │         │
├─────────────────────────────────────────┤
│  [Player Hand]              [Actions]   │
│  Riichi | Chi | Pon | Kan | Tsumo/Ron   │
└─────────────────────────────────────────┘
```

### 4.2 Pixel Art Assets
- [ ] 34 unique tile designs (clear, readable at small sizes)
- [ ] Table background with wood texture
- [ ] 6 character portraits (neutral, happy, frustrated, thinking)
- [ ] UI elements (buttons, panels, indicators)
- [ ] Riichi stick, point sticks, wind markers

### 4.3 Core UI Components ✅
- [x] `TileSprite` - Renders individual tile with states (selected, discarded, called)
- [x] `Hand` - Player's 13-14 tiles with draw separation
- [x] `Meld` - Open/closed meld display
- [x] `DiscardPool` - 6×N grid of discards with riichi marker
- [x] `OpponentHand` - Back-of-tile display with melds
- [x] `ActionBar` - Context-sensitive action buttons
- [x] `ScoreDisplay` - Points, round wind, dealer marker
- [ ] `CharacterPanel` - Portrait, name, dialogue bubble

### 4.4 Animations & Feedback
- [ ] Tile draw/discard animations
- [ ] Call animations (chi/pon/kan)
- [ ] Riichi declaration (stick placement)
- [ ] Win celebration (yaku display, score breakdown)
- [ ] Character reactions (emotes during key moments)

---

## Phase 5: Tutorial & Learning System

### 5.1 Interactive Tutorial
Progressive lessons:
1. **Basics**: Tiles, suits, honors, hand structure
2. **Winning**: What is a winning hand, basic yaku
3. **Gameplay**: Draw, discard, turn order
4. **Calls**: Chi, Pon, Kan - when and why
5. **Riichi**: Declaration, benefits, furiten
6. **Scoring**: Han, fu, score calculation
7. **Strategy**: Tile efficiency, defense basics

### 5.2 In-Game Hints System
Toggle-able assists:
- Highlight valid discards
- Show shanten count
- Display waiting tiles when tenpai
- Suggest calls (chi/pon opportunities)
- Warn about furiten status
- Riichi recommendation

### 5.3 Reference Guide
- Searchable yaku list with examples
- Tile reference (suits, honors)
- Scoring tables
- Term glossary (Japanese → English)
- Rule clarifications (FAQ)

---

## Phase 6: PWA Features ✅

### 6.1 Offline Support
- [x] Service worker for asset caching
- [x] Full offline single-player gameplay
- [ ] Local storage for game saves and settings

### 6.2 Mobile Optimization
- [x] Touch-friendly tile selection
- [x] Responsive layout (portrait/landscape)
- [ ] Pull-to-action gestures
- [ ] Haptic feedback on actions

### 6.3 Installation
- [x] Web app manifest with icons
- [x] iOS Safari "Add to Home Screen" support
- [x] Android TWA-ready configuration
- [ ] Splash screens for all devices

---

## Phase 7: State Management & Persistence

### 7.1 Game State (Zustand) ✅
- [x] Current round state
- [x] Player hands and melds
- [x] Discard pools
- [x] Scores and riichi sticks
- [ ] Game history for undo (optional)

### 7.2 Persistent Data (localStorage)
- [ ] Player statistics (wins, losses, hand history)
- [ ] Settings (hints, animation speed, volume)
- [ ] Unlocked content (characters, if gated)
- [ ] Tutorial progress

---

## Phase 8: Deployment (DigitalOcean App Platform)

### 8.1 Repository Setup ✅
- [x] Repository: https://github.com/0x000NULL/mahjong
- [x] Initialize with proper .gitignore, README
- [ ] Set up branch protection for main

### 8.2 DigitalOcean App Platform Setup (doctl)
```bash
# Authenticate
doctl auth init

# Create app from GitHub repo
doctl apps create --spec .do/app.yaml

# App spec includes:
# - Static site component (React build)
# - Auto-deploy from main branch
# - Environment variables
```

### 8.3 DigitalOcean Managed Database (DEFERRED)
**Not needed for MVP** - Single-player uses localStorage for:
- Player statistics and profiles
- Game saves and settings
- Tutorial progress

**Add database later when needed for:**
- User accounts and authentication
- Cross-device sync
- Online multiplayer state
- Global leaderboards
- Shared replays

### 8.4 App Spec File (.do/app.yaml) ✅
```yaml
name: riichi-mahjong
region: nyc
static_sites:
  - name: web
    github:
      repo: 0x000NULL/mahjong
      branch: main
    build_command: npm run build
    output_dir: dist
    environment_slug: node-js
    routes:
      - path: /
# Uncomment when multiplayer is added:
# services:
#   - name: api
#     source_dir: server
#     ...
# databases:
#   - name: mahjong-db
#     engine: PG
```

### 8.5 CI/CD Pipeline
- [ ] DigitalOcean App Platform auto-deploys from GitHub
- [ ] Automatic preview deployments for PRs
- [ ] GitHub Actions for:
  - Lint and type check on PR
  - Run tests before merge
  - Optional: E2E tests with Playwright

---

## Implementation Order (Milestones)

### Milestone 1: Playable Prototype ✅
- [x] Project setup with Vite + React + TypeScript + PWA
- [x] Tile system and basic hand management
- [x] Game flow engine (draw/discard cycle)
- [x] Placeholder UI (functional, not styled)
- [x] Single random AI opponent
- [x] Basic win detection (any valid hand)

### Milestone 2: Complete Riichi Rules
- [ ] All yaku detection
- [ ] Full scoring calculation (han/fu)
- [ ] Riichi declaration and furiten
- [ ] All kan types
- [ ] Call system (chi/pon)
- [ ] Round/game flow (East/South rounds)

### Milestone 3: AI & Difficulty
- [ ] AI decision framework
- [ ] Easy/Medium/Hard difficulties
- [ ] 1-3 opponent configuration
- [ ] Basic AI dialogue

### Milestone 4: Visual Polish
- [ ] Pixel art tile sprites
- [ ] Character portraits
- [ ] Styled UI components
- [ ] Animations (tile movement, wins)
- [ ] Sound effects (optional)

### Milestone 5: Learning System
- [ ] Interactive tutorial
- [ ] In-game hints
- [ ] Yaku reference guide

### Milestone 6: AI Personalities
- [ ] 6 unique character behaviors
- [ ] Character dialogue system
- [ ] Expression changes based on game state

### Milestone 7: Production Release
- [ ] Performance optimization
- [ ] Full PWA compliance
- [ ] DigitalOcean deployment
- [ ] Cross-device testing

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build tool | Vite | Fast HMR, great PWA plugin, modern |
| State management | Zustand | Lightweight, TypeScript-friendly |
| Styling | Tailwind CSS | Rapid development, utility-first |
| Canvas vs DOM | DOM + CSS | Simpler for tile layout, good performance |
| Sprite format | PNG sprite sheets | Wide support, easy pixel art |
| Testing | Vitest + RTL | Fast, Vite-native, good DX |

---

## Future Considerations (Post-MVP)
- Online multiplayer (WebSocket server)
- Ranked matchmaking
- Replays and hand analysis
- Custom rulesets (red fives toggle, etc.)
- Achievements and unlockables
- Seasonal events
