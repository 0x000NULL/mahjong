import type { Tile as TileType } from '@/types/tiles'
import type { PlayerHand } from '@/types/hand'
import type { Meld } from '@/types/melds'
import { Tile, TileBack } from './Tile'

interface PlayerHandProps {
  hand: PlayerHand
  isCurrentPlayer: boolean
  isHuman: boolean
  onTileClick?: (tile: TileType) => void
  selectedTileId?: string | null
  lastDrawnTileId?: string | null
}

export function PlayerHandDisplay({
  hand,
  isCurrentPlayer,
  isHuman,
  onTileClick,
  selectedTileId,
  lastDrawnTileId,
}: PlayerHandProps) {
  const canInteract = isCurrentPlayer && isHuman

  return (
    <div className="flex items-end gap-1">
      {/* Main hand tiles */}
      <div className="flex gap-0.5">
        {hand.tiles.map((tile) => {
          const isLastDrawn = tile.id === lastDrawnTileId
          const isSelected = tile.id === selectedTileId

          return (
            <div key={tile.id} className={isLastDrawn ? 'ml-2' : ''}>
              {isHuman ? (
                <Tile
                  tile={tile}
                  selected={isSelected}
                  onClick={canInteract ? () => onTileClick?.(tile) : undefined}
                  disabled={!canInteract}
                />
              ) : (
                <TileBack />
              )}
            </div>
          )
        })}
      </div>

      {/* Called melds */}
      {hand.melds.length > 0 && (
        <div className="flex gap-2 ml-4">
          {hand.melds.map((meld, meldIndex) => (
            <MeldDisplay key={meldIndex} meld={meld} />
          ))}
        </div>
      )}

      {/* Riichi indicator */}
      {hand.riichiStick && (
        <div className="ml-2 flex items-center">
          <div className="w-12 h-2 bg-white rounded-full shadow-md border border-gray-300" />
        </div>
      )}
    </div>
  )
}

interface MeldDisplayProps {
  meld: Meld
}

function MeldDisplay({ meld }: MeldDisplayProps) {
  return (
    <div className="flex gap-0.5">
      {meld.tiles.map((tile, index) => {
        // For called melds, one tile might be rotated to indicate it was called
        const isCalledTile = meld.isOpen && index === getCalledTileIndex(meld)

        return (
          <div
            key={tile.id}
            className={isCalledTile ? 'rotate-90 origin-center' : ''}
          >
            <Tile tile={tile} small />
          </div>
        )
      })}
    </div>
  )
}

function getCalledTileIndex(meld: Meld): number {
  // Position of rotated tile indicates who it was called from
  // 0 = left (shimocha), 1 = across (toimen), 2 = right (kamicha)
  // For simplicity, we'll put it at position based on calledFrom
  if (meld.calledFrom === undefined) return -1
  return meld.calledFrom % 3
}

interface OpponentHandProps {
  hand: PlayerHand
  position: 'left' | 'top' | 'right'
  playerName: string
  score: number
  isCurrentPlayer: boolean
}

export function OpponentHand({
  hand,
  position,
  playerName,
  score,
  isCurrentPlayer,
}: OpponentHandProps) {
  const tileCount = hand.tiles.length

  const containerClasses = {
    left: 'flex-col',
    top: 'flex-row',
    right: 'flex-col-reverse',
  }

  const isVertical = position === 'left' || position === 'right'

  return (
    <div className={`flex ${containerClasses[position]} items-center gap-2`}>
      {/* Player info */}
      <div className="text-center text-sm">
        <div className={`font-medium ${isCurrentPlayer ? 'text-mahjong-gold' : 'text-gray-300'}`}>
          {playerName}
        </div>
        <div className="text-gray-400">{score.toLocaleString()}</div>
      </div>

      {/* Hand (backs) */}
      <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} gap-0.5`}>
        {Array.from({ length: tileCount }).map((_, i) => (
          <div key={i} className={isVertical ? 'rotate-90' : ''}>
            <TileBack small />
          </div>
        ))}
      </div>

      {/* Melds */}
      {hand.melds.length > 0 && (
        <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} gap-1`}>
          {hand.melds.map((meld, i) => (
            <div key={i} className={isVertical ? 'rotate-90' : ''}>
              <MeldDisplay meld={meld} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface DiscardPoolProps {
  discards: TileType[]
  riichiTurn: number | null
}

export function DiscardPool({ discards, riichiTurn }: DiscardPoolProps) {
  // Display discards in 6-column grid
  const rows: TileType[][] = []
  for (let i = 0; i < discards.length; i += 6) {
    rows.push(discards.slice(i, i + 6))
  }

  return (
    <div className="flex flex-col gap-0.5">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-0.5">
          {row.map((tile, colIndex) => {
            const discardIndex = rowIndex * 6 + colIndex
            const isRiichiDiscard = riichiTurn !== null && discardIndex === riichiTurn - 1

            return (
              <div key={tile.id} className={isRiichiDiscard ? 'rotate-90' : ''}>
                <Tile tile={tile} small />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
