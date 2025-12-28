import { useState, useEffect } from 'react'
import type { Tile as TileType } from '@/types/tiles'
import { useGameStore, useGamePhase } from '@/stores/gameStore'
import { PlayerHandDisplay, OpponentHand, DiscardPool } from './Hand'
import { Tile } from './Tile'
import { getDoraIndicators } from '@/game/tiles/wall'
import { getAIDecision, getAICallDecision } from '@/ai/core'

export function GameTable() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const phase = useGamePhase()
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null)

  if (!game) {
    return <StartScreen />
  }

  if (phase === 'waiting') {
    return <StartScreen />
  }

  const humanPlayer = game.players[0]
  const isHumanTurn = game.currentPlayerIndex === 0

  // AI auto-play
  useEffect(() => {
    if (!game || phase === 'win' || phase === 'draw') {
      return
    }

    const currentPlayer = game.players[game.currentPlayerIndex]

    // Handle AI turns
    if (!currentPlayer.isHuman && phase === 'playing') {
      const timer = setTimeout(() => {
        const decision = getAIDecision(game, game.currentPlayerIndex)
        if (decision) {
          dispatch(decision.action)
        }
      }, 500) // Small delay for better UX

      return () => clearTimeout(timer)
    }

    // Handle AI call decisions
    if (phase === 'calling') {
      // Check each AI player for call decisions
      const aiPlayers = game.players
        .map((p, i) => ({ player: p, index: i }))
        .filter(({ player }) => !player.isHuman)

      for (const { index } of aiPlayers) {
        const decision = getAICallDecision(game, index)
        if (decision) {
          const timer = setTimeout(() => {
            dispatch(decision.action)
          }, 300)
          return () => clearTimeout(timer)
        }
      }
    }
  }, [game, phase, dispatch])

  const handleTileClick = (tile: TileType) => {
    if (selectedTileId === tile.id) {
      // Double click to discard
      dispatch({ type: 'discard', tileId: tile.id })
      setSelectedTileId(null)
    } else {
      setSelectedTileId(tile.id)
    }
  }

  const handleDiscard = () => {
    if (selectedTileId) {
      dispatch({ type: 'discard', tileId: selectedTileId })
      setSelectedTileId(null)
    }
  }

  const handleTsumo = () => {
    dispatch({ type: 'tsumo' })
  }

  const handleSkip = () => {
    dispatch({ type: 'skip_call' })
    setSelectedTileId(null)
  }

  const doraIndicators = getDoraIndicators(game.wall)

  return (
    <div className="w-full h-screen bg-mahjong-dark flex flex-col">
      {/* Top opponent */}
      {game.playerCount >= 3 && (
        <div className="flex justify-center p-4">
          <OpponentHand
            hand={game.players[2].hand}
            position="top"
            playerName={game.players[2].name}
            score={game.players[2].score}
            isCurrentPlayer={game.currentPlayerIndex === 2}
          />
        </div>
      )}

      {/* Middle section: left opponent, center table, right opponent */}
      <div className="flex-1 flex">
        {/* Left opponent */}
        {game.playerCount >= 2 && (
          <div className="flex items-center p-4">
            <OpponentHand
              hand={game.players[1].hand}
              position="left"
              playerName={game.players[1].name}
              score={game.players[1].score}
              isCurrentPlayer={game.currentPlayerIndex === 1}
            />
          </div>
        )}

        {/* Center table */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-80 h-80 bg-mahjong-medium rounded-lg border-4 border-mahjong-accent shadow-xl">
            {/* Round info */}
            <div className="absolute top-2 left-2 text-xs text-gray-400">
              {game.roundWind.charAt(0).toUpperCase()}{game.roundNumber} |
              Tiles: {game.wall.tiles.length}
            </div>

            {/* Dora indicators */}
            <div className="absolute top-2 right-2">
              <div className="text-xs text-gray-400 mb-1">Dora</div>
              <div className="flex gap-0.5">
                {doraIndicators.map((tile, i) => (
                  <Tile key={i} tile={tile} small />
                ))}
              </div>
            </div>

            {/* Center discard areas */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4">
                {/* Player discard pools */}
                {game.players.map((player, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">{player.name}</div>
                    <DiscardPool
                      discards={player.hand.discards}
                      riichiTurn={player.hand.riichiTurn}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Last discard highlight */}
            {game.lastDiscard && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
                <div className="animate-pulse">
                  <Tile tile={game.lastDiscard} highlight />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right opponent */}
        {game.playerCount >= 4 && (
          <div className="flex items-center p-4">
            <OpponentHand
              hand={game.players[3].hand}
              position="right"
              playerName={game.players[3].name}
              score={game.players[3].score}
              isCurrentPlayer={game.currentPlayerIndex === 3}
            />
          </div>
        )}
      </div>

      {/* Bottom: Player hand and actions */}
      <div className="p-4 bg-mahjong-medium border-t border-mahjong-accent">
        <div className="max-w-4xl mx-auto">
          {/* Player info */}
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-mahjong-gold font-medium">{humanPlayer.name}</span>
              <span className="text-gray-400 ml-2">
                {humanPlayer.score.toLocaleString()} pts
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {isHumanTurn ? 'Your turn' : `${game.players[game.currentPlayerIndex].name}'s turn`}
            </div>
          </div>

          {/* Hand */}
          <div className="flex justify-center mb-4">
            <PlayerHandDisplay
              hand={humanPlayer.hand}
              isCurrentPlayer={isHumanTurn}
              isHuman={true}
              onTileClick={handleTileClick}
              selectedTileId={selectedTileId}
              lastDrawnTileId={game.lastDrawnTile?.id}
            />
          </div>

          {/* Action buttons */}
          <ActionBar
            canDiscard={isHumanTurn && selectedTileId !== null && phase === 'playing'}
            canTsumo={isHumanTurn && phase === 'playing'}
            canCall={phase === 'calling'}
            onDiscard={handleDiscard}
            onTsumo={handleTsumo}
            onSkip={handleSkip}
          />
        </div>
      </div>

      {/* Win/Draw overlay */}
      {(phase === 'win' || phase === 'draw') && (
        <GameEndOverlay
          phase={phase}
          winner={game.winner}
          players={game.players}
          isTsumo={game.isTsumo}
        />
      )}
    </div>
  )
}

function StartScreen() {
  const dispatch = useGameStore((s) => s.dispatch)
  const initGame = useGameStore((s) => s.initGame)

  const handleStart = () => {
    initGame({
      playerCount: 4,
      includeRedDora: true,
      playerNames: ['You', 'Hana', 'Kenji', 'Yuki'],
      aiDifficulties: ['easy', 'medium', 'hard'],
    })
    dispatch({ type: 'start_game' })
  }

  return (
    <div className="w-full h-screen bg-mahjong-dark flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-mahjong-gold mb-8">Riichi Mahjong</h1>
      <p className="text-gray-400 mb-8">Japanese Mahjong vs AI Opponents</p>
      <button
        onClick={handleStart}
        className="px-8 py-3 bg-mahjong-highlight text-white font-medium rounded-lg
                   hover:bg-red-500 transition-colors shadow-lg"
      >
        Start Game
      </button>
    </div>
  )
}

interface ActionBarProps {
  canDiscard: boolean
  canTsumo: boolean
  canCall: boolean
  onDiscard: () => void
  onTsumo: () => void
  onSkip: () => void
}

function ActionBar({
  canDiscard,
  canTsumo,
  canCall,
  onDiscard,
  onTsumo,
  onSkip,
}: ActionBarProps) {
  const buttonBase = `px-4 py-2 rounded font-medium transition-colors`
  const activeBtn = `bg-mahjong-accent text-white hover:bg-blue-700`
  const disabledBtn = `bg-gray-700 text-gray-500 cursor-not-allowed`

  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={onDiscard}
        disabled={!canDiscard}
        className={`${buttonBase} ${canDiscard ? activeBtn : disabledBtn}`}
      >
        Discard
      </button>

      <button
        onClick={onTsumo}
        disabled={!canTsumo}
        className={`${buttonBase} ${canTsumo ? 'bg-green-600 text-white hover:bg-green-500' : disabledBtn}`}
      >
        Tsumo
      </button>

      {canCall && (
        <button
          onClick={onSkip}
          className={`${buttonBase} bg-gray-600 text-white hover:bg-gray-500`}
        >
          Skip
        </button>
      )}
    </div>
  )
}

interface GameEndOverlayProps {
  phase: 'win' | 'draw'
  winner: number | null
  players: { name: string; score: number }[]
  isTsumo: boolean
}

function GameEndOverlay({ phase, winner, players, isTsumo }: GameEndOverlayProps) {
  const initGame = useGameStore((s) => s.initGame)
  const dispatch = useGameStore((s) => s.dispatch)

  const handleNewGame = () => {
    initGame({
      playerCount: 4,
      includeRedDora: true,
      playerNames: ['You', 'Hana', 'Kenji', 'Yuki'],
      aiDifficulties: ['easy', 'medium', 'hard'],
    })
    dispatch({ type: 'start_game' })
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-mahjong-medium p-8 rounded-xl shadow-2xl text-center max-w-md">
        {phase === 'win' && winner !== null ? (
          <>
            <h2 className="text-3xl font-bold text-mahjong-gold mb-4">
              {players[winner].name} Wins!
            </h2>
            <p className="text-gray-300 mb-2">
              {isTsumo ? 'Tsumo' : 'Ron'}
            </p>
          </>
        ) : (
          <h2 className="text-3xl font-bold text-gray-300 mb-4">Draw</h2>
        )}

        <div className="mt-6 space-y-2">
          {players.map((p, i) => (
            <div
              key={i}
              className={`flex justify-between px-4 py-2 rounded ${
                i === winner ? 'bg-mahjong-gold/20 text-mahjong-gold' : 'text-gray-400'
              }`}
            >
              <span>{p.name}</span>
              <span>{p.score.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleNewGame}
          className="mt-8 px-6 py-2 bg-mahjong-highlight text-white rounded-lg
                     hover:bg-red-500 transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  )
}
