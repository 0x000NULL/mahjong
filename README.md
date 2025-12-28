# Riichi Mahjong PWA

A Progressive Web App for Japanese Riichi Mahjong with single-player gameplay against AI opponents.

## Features

- **Full Riichi Mahjong Rules** - Japanese competitive mahjong with yaku, scoring, and calls
- **AI Opponents** - Play against 1-3 AI players with varying difficulties
- **PWA Support** - Install on iOS, Android, or desktop for offline play
- **Modern UI** - Clean interface with touch-friendly controls

## Tech Stack

- React 19 + TypeScript
- Vite + PWA Plugin
- Tailwind CSS
- Zustand (state management)
- DigitalOcean App Platform (deployment)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This app is configured for DigitalOcean App Platform:

```bash
# Authenticate with DigitalOcean
doctl auth init

# Create app from spec
doctl apps create --spec .do/app.yaml
```

## Project Structure

```
src/
├── components/     # React UI components
│   └── game/       # Game-specific components
├── game/           # Core game engine
│   ├── engine/     # Game state and flow
│   ├── tiles/      # Tile system
│   ├── yaku/       # Yaku detection (coming soon)
│   └── scoring/    # Scoring system (coming soon)
├── ai/             # AI opponents
├── stores/         # Zustand state
├── types/          # TypeScript types
└── utils/          # Utilities
```

## Roadmap

- [x] Core tile system
- [x] Hand management
- [x] Basic game flow
- [x] Placeholder UI
- [x] Basic AI
- [ ] All yaku detection
- [ ] Full scoring (han/fu)
- [ ] Riichi declaration
- [ ] Visual polish
- [ ] Tutorial system
- [ ] AI personalities
