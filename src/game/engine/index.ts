import type { Tile, WindValue } from '@/types/tiles'
import type { GameState, GameConfig, GameAction, ActionResult, GameEvent, Player } from '@/types/game'
import type { Meld } from '@/types/melds'
import { createEmptyHand, createFuritenState } from '@/types/hand'
import { createWall, drawFromWall, getRemainingTiles, isWallExhausted } from '@/game/tiles/wall'
import {
  addTileToHand,
  removeTileFromHand,
  isCompleteHand,
  isTenpai,
  analyzeHand,
} from './hand'
import { tilesEqual, compareTiles, sortTiles } from '@/game/tiles'

const WINDS: WindValue[] = ['east', 'south', 'west', 'north']
const STARTING_SCORE = 25000

/**
 * Create initial game state
 */
export function createGameState(config: GameConfig): GameState {
  const players: Player[] = []

  for (let i = 0; i < config.playerCount; i++) {
    players.push({
      name: config.playerNames[i] || `Player ${i + 1}`,
      hand: createEmptyHand(),
      furiten: createFuritenState(),
      score: STARTING_SCORE,
      seatWind: WINDS[i],
      isDealer: i === 0,
      isHuman: i === 0, // First player is human
      aiDifficulty: i > 0 ? config.aiDifficulties[i - 1] || 'medium' : undefined,
      aiPersonality: i > 0 ? config.aiPersonalities?.[i - 1] : undefined,
    })
  }

  return {
    playerCount: config.playerCount,
    includeRedDora: config.includeRedDora,
    roundWind: 'east',
    roundNumber: 1,
    honba: 0,
    riichiSticks: 0,
    phase: 'waiting',
    currentPlayerIndex: 0,
    turnNumber: 0,
    wall: createWall(config.includeRedDora),
    lastDiscard: null,
    lastDiscardPlayerIndex: null,
    players,
    pendingCalls: [],
    pendingWinners: [],
    lastDrawnTile: null,
    winner: null,
    winningTile: null,
    isTsumo: false,
  }
}

/**
 * Start a new round (deal hands)
 */
export function startRound(state: GameState): GameEvent[] {
  const events: GameEvent[] = []

  // Reset the wall
  state.wall = createWall(state.includeRedDora)

  // Clear player hands
  for (const player of state.players) {
    player.hand = createEmptyHand()
    player.furiten = createFuritenState()
  }

  // Deal 13 tiles to each player
  for (let round = 0; round < 4; round++) {
    for (let p = 0; p < state.playerCount; p++) {
      const dealCount = round < 3 ? 4 : 1 // 4+4+4+1 = 13
      for (let t = 0; t < dealCount; t++) {
        const tile = drawFromWall(state.wall)
        if (tile) {
          addTileToHand(state.players[p].hand, tile)
        }
      }
    }
  }

  // Sort each player's hand
  for (const player of state.players) {
    player.hand.tiles.sort(compareTiles)
  }

  // Dealer draws first tile
  const dealerTile = drawFromWall(state.wall)
  if (dealerTile) {
    addTileToHand(state.players[state.currentPlayerIndex].hand, dealerTile)
    state.lastDrawnTile = dealerTile
    events.push({
      type: 'tile_drawn',
      playerIndex: state.currentPlayerIndex,
      tile: dealerTile,
    })
  }

  state.phase = 'playing'
  state.turnNumber = 1

  return events
}

/**
 * Process a game action
 */
export function processAction(state: GameState, action: GameAction): ActionResult {
  const events: GameEvent[] = []

  switch (action.type) {
    case 'start_game':
      if (state.phase !== 'waiting') {
        return { success: false, error: 'Game already started', stateChanged: false, events }
      }
      events.push(...startRound(state))
      return { success: true, stateChanged: true, events }

    case 'discard':
      return processDiscard(state, action.tileId)

    case 'skip_call':
      return processSkipCall(state)

    case 'tsumo':
      return processTsumo(state)

    case 'ron':
      return processRon(state)

    case 'chi':
      return processChi(state, action.tiles)

    case 'pon':
      return processPon(state, action.tiles)

    case 'riichi':
      return processRiichi(state, action.discardTileId)

    default:
      return { success: false, error: 'Unknown action', stateChanged: false, events }
  }
}

function processDiscard(state: GameState, tileId: string): ActionResult {
  const events: GameEvent[] = []
  const player = state.players[state.currentPlayerIndex]

  // Find and remove tile from hand
  const tile = removeTileFromHand(player.hand, tileId)
  if (!tile) {
    return { success: false, error: 'Tile not in hand', stateChanged: false, events }
  }

  // Add to discards
  player.hand.discards.push(tile)
  state.lastDiscard = tile
  state.lastDiscardPlayerIndex = state.currentPlayerIndex

  // Reset ippatsu for this player
  player.hand.ippatsu = false

  // Check for furiten
  updateFuritenAfterDiscard(state, state.currentPlayerIndex)

  events.push({
    type: 'tile_discarded',
    playerIndex: state.currentPlayerIndex,
    tile,
  })

  // Reset drawn tile marker
  state.lastDrawnTile = null

  // Check if anyone can call
  const calls = findPossibleCalls(state)
  state.pendingCalls = calls

  if (calls.length > 0) {
    state.phase = 'calling'
  } else {
    // Move to next player's turn
    advanceToNextPlayer(state)
  }

  return { success: true, stateChanged: true, events }
}

function processSkipCall(state: GameState): ActionResult {
  if (state.phase !== 'calling') {
    return { success: false, error: 'Not in calling phase', stateChanged: false, events: [] }
  }

  // Remove current player's pending calls
  state.pendingCalls = state.pendingCalls.filter(
    (c) => c.playerIndex !== 0 // Human is always player 0
  )

  // If no more calls pending, advance to next player
  if (state.pendingCalls.length === 0) {
    advanceToNextPlayer(state)
  }

  return { success: true, stateChanged: true, events: [] }
}

function processTsumo(state: GameState): ActionResult {
  const events: GameEvent[] = []
  const player = state.players[state.currentPlayerIndex]

  if (!isCompleteHand(player.hand)) {
    return { success: false, error: 'Hand is not complete', stateChanged: false, events }
  }

  state.winner = state.currentPlayerIndex
  state.winningTile = state.lastDrawnTile
  state.isTsumo = true
  state.phase = 'win'

  events.push({
    type: 'tsumo',
    playerIndex: state.currentPlayerIndex,
  })

  return { success: true, stateChanged: true, events }
}

function processRon(state: GameState): ActionResult {
  const events: GameEvent[] = []

  if (state.lastDiscard === null || state.lastDiscardPlayerIndex === null) {
    return { success: false, error: 'No discard to ron', stateChanged: false, events }
  }

  // For simplicity, assume player 0 (human) is the one calling ron
  const player = state.players[0]

  // Add the discarded tile temporarily to check win
  const testHand = [...player.hand.tiles, state.lastDiscard]

  // Check if hand is complete with this tile
  const shanten = analyzeHand({ ...player.hand, tiles: testHand }).shanten
  if (shanten !== -1) {
    return { success: false, error: 'Cannot win with this tile', stateChanged: false, events }
  }

  // Check furiten
  if (player.furiten.permanent || player.furiten.riichi) {
    return { success: false, error: 'Cannot ron while in furiten', stateChanged: false, events }
  }

  state.winner = 0
  state.winningTile = state.lastDiscard
  state.isTsumo = false
  state.phase = 'win'

  events.push({
    type: 'ron',
    winnerIndex: 0,
    loserIndex: state.lastDiscardPlayerIndex,
  })

  return { success: true, stateChanged: true, events }
}

function processChi(state: GameState, tileIds: [string, string]): ActionResult {
  const events: GameEvent[] = []

  if (state.phase !== 'calling' || !state.lastDiscard) {
    return { success: false, error: 'Cannot chi now', stateChanged: false, events }
  }

  // Chi can only be called from the player to your left
  const callerIndex = 0 // Human player
  const discarderIndex = state.lastDiscardPlayerIndex!
  const expectedDiscarder = (callerIndex + state.playerCount - 1) % state.playerCount

  if (discarderIndex !== expectedDiscarder) {
    return { success: false, error: 'Can only chi from left player', stateChanged: false, events }
  }

  const player = state.players[callerIndex]

  // Find the tiles in hand
  const tile1 = player.hand.tiles.find((t) => t.id === tileIds[0])
  const tile2 = player.hand.tiles.find((t) => t.id === tileIds[1])

  if (!tile1 || !tile2) {
    return { success: false, error: 'Tiles not in hand', stateChanged: false, events }
  }

  // Remove tiles from hand and create meld
  removeTileFromHand(player.hand, tileIds[0])
  removeTileFromHand(player.hand, tileIds[1])

  const meldTiles = sortTiles([tile1, tile2, state.lastDiscard]) as [Tile, Tile, Tile]
  const meld: Meld = {
    type: 'chi',
    tiles: meldTiles,
    isOpen: true,
    calledFrom: discarderIndex,
  }

  player.hand.melds.push(meld)
  player.hand.ippatsu = false // Calling breaks ippatsu

  // Clear discarded tile from table
  state.lastDiscard = null
  state.pendingCalls = []

  events.push({
    type: 'meld_called',
    playerIndex: callerIndex,
    meld,
    calledFrom: discarderIndex,
  })

  // Player who called gets to discard (no draw)
  state.currentPlayerIndex = callerIndex
  state.phase = 'playing'

  return { success: true, stateChanged: true, events }
}

function processPon(state: GameState, tileIds: [string, string]): ActionResult {
  const events: GameEvent[] = []

  if (state.phase !== 'calling' || !state.lastDiscard) {
    return { success: false, error: 'Cannot pon now', stateChanged: false, events }
  }

  const callerIndex = 0 // Human player
  const discarderIndex = state.lastDiscardPlayerIndex!
  const player = state.players[callerIndex]

  // Find the tiles in hand
  const tile1 = player.hand.tiles.find((t) => t.id === tileIds[0])
  const tile2 = player.hand.tiles.find((t) => t.id === tileIds[1])

  if (!tile1 || !tile2) {
    return { success: false, error: 'Tiles not in hand', stateChanged: false, events }
  }

  // Verify they match the discarded tile
  if (!tilesEqual(tile1, state.lastDiscard) || !tilesEqual(tile2, state.lastDiscard)) {
    return { success: false, error: 'Tiles do not match discard', stateChanged: false, events }
  }

  // Remove tiles from hand and create meld
  removeTileFromHand(player.hand, tileIds[0])
  removeTileFromHand(player.hand, tileIds[1])

  const meld: Meld = {
    type: 'pon',
    tiles: [tile1, tile2, state.lastDiscard] as [Tile, Tile, Tile],
    isOpen: true,
    calledFrom: discarderIndex,
  }

  player.hand.melds.push(meld)
  player.hand.ippatsu = false

  state.lastDiscard = null
  state.pendingCalls = []

  events.push({
    type: 'meld_called',
    playerIndex: callerIndex,
    meld,
    calledFrom: discarderIndex,
  })

  // Player who called gets to discard (no draw)
  state.currentPlayerIndex = callerIndex
  state.phase = 'playing'

  return { success: true, stateChanged: true, events }
}

function processRiichi(state: GameState, discardTileId: string): ActionResult {
  const events: GameEvent[] = []
  const player = state.players[state.currentPlayerIndex]

  // Check if player can riichi
  if (player.hand.riichiTurn !== null) {
    return { success: false, error: 'Already in riichi', stateChanged: false, events }
  }

  if (player.score < 1000) {
    return { success: false, error: 'Not enough points for riichi', stateChanged: false, events }
  }

  if (!isTenpai(player.hand)) {
    return { success: false, error: 'Not in tenpai', stateChanged: false, events }
  }

  if (player.hand.melds.some((m) => m.isOpen)) {
    return { success: false, error: 'Cannot riichi with open melds', stateChanged: false, events }
  }

  // Declare riichi
  player.hand.riichiTurn = state.turnNumber
  player.hand.riichiStick = true
  player.hand.ippatsu = true
  player.score -= 1000
  state.riichiSticks++

  events.push({
    type: 'riichi_declared',
    playerIndex: state.currentPlayerIndex,
  })

  // Now discard the tile
  return processDiscard(state, discardTileId)
}

function advanceToNextPlayer(state: GameState): void {
  // Check for exhaustive draw
  if (isWallExhausted(state.wall)) {
    state.phase = 'draw'
    return
  }

  // Clear temporary furiten for all players
  for (const player of state.players) {
    player.furiten.temporary = false
  }

  // Move to next player
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount
  state.turnNumber++

  // Draw tile for next player
  const tile = drawFromWall(state.wall)
  if (tile) {
    addTileToHand(state.players[state.currentPlayerIndex].hand, tile)
    state.lastDrawnTile = tile
  }

  state.phase = 'playing'
}

function findPossibleCalls(state: GameState): { type: 'chi' | 'pon' | 'kan' | 'ron'; playerIndex: number; tiles: Tile[]; targetTile: Tile }[] {
  const calls: { type: 'chi' | 'pon' | 'kan' | 'ron'; playerIndex: number; tiles: Tile[]; targetTile: Tile }[] = []

  if (!state.lastDiscard || state.lastDiscardPlayerIndex === null) {
    return calls
  }

  const discard = state.lastDiscard
  const discarderIndex = state.lastDiscardPlayerIndex

  for (let i = 0; i < state.playerCount; i++) {
    if (i === discarderIndex) continue

    const player = state.players[i]

    // Check ron
    const testHand = [...player.hand.tiles, discard]
    const analysis = analyzeHand({ ...player.hand, tiles: testHand })
    if (analysis.isComplete && !player.furiten.permanent && !player.furiten.riichi) {
      calls.push({
        type: 'ron',
        playerIndex: i,
        tiles: [],
        targetTile: discard,
      })
    }

    // Check pon (need 2 matching tiles)
    const matching = player.hand.tiles.filter((t) => tilesEqual(t, discard))
    if (matching.length >= 2) {
      calls.push({
        type: 'pon',
        playerIndex: i,
        tiles: matching.slice(0, 2),
        targetTile: discard,
      })
    }

    // Check chi (only from left player, needs suited tiles)
    if (i === (discarderIndex + 1) % state.playerCount) {
      // Chi is complex - check for valid sequences
      const chiCombos = findChiCombinations(player.hand.tiles, discard)
      for (const combo of chiCombos) {
        calls.push({
          type: 'chi',
          playerIndex: i,
          tiles: combo,
          targetTile: discard,
        })
      }
    }
  }

  return calls
}

function findChiCombinations(handTiles: Tile[], discard: Tile): Tile[][] {
  const combos: Tile[][] = []

  if (discard.type !== 'man' && discard.type !== 'pin' && discard.type !== 'sou') {
    return combos // Can't chi honors
  }

  const value = discard.value as number
  const suitTiles = handTiles.filter((t) => t.type === discard.type)

  // Check for val-2, val-1, discard (penchan low or ryanmen)
  if (value >= 3) {
    const lower2 = suitTiles.find((t) => t.value === value - 2)
    const lower1 = suitTiles.find((t) => t.value === value - 1 && t.id !== lower2?.id)
    if (lower2 && lower1) {
      combos.push([lower2, lower1])
    }
  }

  // Check for val-1, discard, val+1 (ryanmen or kanchan)
  if (value >= 2 && value <= 8) {
    const lower = suitTiles.find((t) => t.value === value - 1)
    const upper = suitTiles.find((t) => t.value === value + 1 && t.id !== lower?.id)
    if (lower && upper) {
      combos.push([lower, upper])
    }
  }

  // Check for discard, val+1, val+2 (penchan high or ryanmen)
  if (value <= 7) {
    const upper1 = suitTiles.find((t) => t.value === value + 1)
    const upper2 = suitTiles.find((t) => t.value === value + 2 && t.id !== upper1?.id)
    if (upper1 && upper2) {
      combos.push([upper1, upper2])
    }
  }

  return combos
}

function updateFuritenAfterDiscard(state: GameState, playerIndex: number): void {
  const player = state.players[playerIndex]
  const discardedTile = state.lastDiscard!

  // Check if this tile was a waiting tile
  const analysis = analyzeHand(player.hand)
  if (analysis.waitingTiles.some((w) => tilesEqual(w, discardedTile))) {
    player.furiten.permanent = true
  }
}

/**
 * Get the current game status for UI
 */
export function getGameStatus(state: GameState): {
  phase: string
  currentPlayer: string
  tilesRemaining: number
  roundInfo: string
  scores: { name: string; score: number; wind: WindValue }[]
} {
  return {
    phase: state.phase,
    currentPlayer: state.players[state.currentPlayerIndex].name,
    tilesRemaining: getRemainingTiles(state.wall),
    roundInfo: `${state.roundWind.charAt(0).toUpperCase() + state.roundWind.slice(1)} ${state.roundNumber}`,
    scores: state.players.map((p) => ({
      name: p.name,
      score: p.score,
      wind: p.seatWind,
    })),
  }
}
