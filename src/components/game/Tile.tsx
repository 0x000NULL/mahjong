import type { Tile as TileType, TileDefinition } from '@/types/tiles'
import { isSuit, isWindValue, isDragonValue } from '@/types/tiles'

interface TileProps {
  tile: TileType | TileDefinition
  onClick?: () => void
  selected?: boolean
  faceDown?: boolean
  small?: boolean
  disabled?: boolean
  highlight?: boolean
}

// Tile display characters (using Unicode)
const SUIT_CHARS: Record<string, Record<number, string>> = {
  man: { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九' },
  pin: { 1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤', 6: '⑥', 7: '⑦', 8: '⑧', 9: '⑨' },
  sou: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9' },
}

const WIND_CHARS: Record<string, string> = {
  east: '東',
  south: '南',
  west: '西',
  north: '北',
}

const DRAGON_CHARS: Record<string, string> = {
  white: '白',
  green: '發',
  red: '中',
}

const SUIT_COLORS: Record<string, string> = {
  man: 'text-red-600',
  pin: 'text-blue-600',
  sou: 'text-green-700',
  wind: 'text-gray-800',
  dragon: 'text-gray-800',
}

export function Tile({
  tile,
  onClick,
  selected = false,
  faceDown = false,
  small = false,
  disabled = false,
  highlight = false,
}: TileProps) {
  const baseClasses = `
    relative flex items-center justify-center
    rounded-sm border-2 shadow-md
    transition-all duration-150
    ${small ? 'w-6 h-8 text-xs' : 'w-10 h-14 text-lg'}
    ${faceDown ? 'bg-mahjong-tile-back border-green-800' : 'bg-mahjong-tile border-gray-300'}
    ${selected ? 'ring-2 ring-mahjong-highlight -translate-y-2' : ''}
    ${highlight ? 'ring-2 ring-mahjong-gold' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer hover:-translate-y-1' : ''}
  `

  if (faceDown) {
    return (
      <div className={baseClasses} onClick={disabled ? undefined : onClick}>
        <div className="w-2 h-4 bg-green-900 rounded-sm opacity-50" />
      </div>
    )
  }

  const getDisplayChar = (): string => {
    if (isSuit(tile.type) && typeof tile.value === 'number') {
      return SUIT_CHARS[tile.type]?.[tile.value] || String(tile.value)
    }
    if (isWindValue(tile.value)) {
      return WIND_CHARS[tile.value]
    }
    if (isDragonValue(tile.value)) {
      return DRAGON_CHARS[tile.value]
    }
    return '?'
  }

  const getSuitLabel = (): string | null => {
    if (tile.type === 'man') return '萬'
    if (tile.type === 'sou') return '索'
    return null
  }

  const colorClass = SUIT_COLORS[tile.type] || 'text-gray-800'
  const isRedDora = 'isRedDora' in tile && tile.isRedDora

  return (
    <div className={baseClasses} onClick={disabled ? undefined : onClick}>
      <div className={`font-bold ${colorClass} ${isRedDora ? 'text-red-500' : ''}`}>
        {getDisplayChar()}
      </div>
      {getSuitLabel() && (
        <div className={`absolute bottom-0.5 text-[8px] ${colorClass}`}>
          {getSuitLabel()}
        </div>
      )}
      {isRedDora && (
        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
      )}
    </div>
  )
}

// Tile back for opponent hands
export function TileBack({ small = false }: { small?: boolean }) {
  return <Tile tile={{ type: 'man', value: 1 } as TileDefinition} faceDown small={small} />
}

// Empty tile slot
export function TileSlot({ small = false }: { small?: boolean }) {
  const sizeClasses = small ? 'w-6 h-8' : 'w-10 h-14'
  return (
    <div
      className={`${sizeClasses} border-2 border-dashed border-gray-600 rounded-sm opacity-30`}
    />
  )
}
