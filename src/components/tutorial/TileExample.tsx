/**
 * TileExample Component
 * Displays example tiles inline in tutorial content
 */

import { Tile } from '@/components/game/Tile'
import type { TileExample as TileExampleType } from '@/tutorial/steps'

interface TileExampleProps {
  example: TileExampleType
}

export function TileExample({ example }: TileExampleProps) {
  return (
    <div className="mt-3 mb-2">
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {example.tiles.map((tile, index) => (
          <Tile key={`${tile.type}-${tile.value}-${index}`} tile={tile} small />
        ))}
      </div>
      {example.label && (
        <div className="text-xs text-gray-400 text-center mt-1">{example.label}</div>
      )}
    </div>
  )
}

export default TileExample
