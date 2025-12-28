/**
 * ChapterMenu Component
 * Shows tutorial chapters with progress indicators
 */

import { motion } from 'framer-motion'
import { TUTORIAL_CHAPTERS } from '@/tutorial/chapters'
import { useTutorialStore, useCurrentChapter } from '@/stores/tutorialStore'

interface ChapterMenuProps {
  onClose?: () => void
}

export function ChapterMenu({ onClose }: ChapterMenuProps) {
  const currentChapter = useCurrentChapter()
  const skipToChapter = useTutorialStore((s) => s.skipToChapter)
  const isChapterUnlocked = useTutorialStore((s) => s.isChapterUnlocked)
  const isChapterCompleted = useTutorialStore((s) => s.isChapterCompleted)
  const getChapterProgress = useTutorialStore((s) => s.getChapterProgress)

  const handleChapterClick = (chapterId: string) => {
    if (isChapterUnlocked(chapterId)) {
      skipToChapter(chapterId)
      onClose?.()
    }
  }

  return (
    <motion.div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-[55] w-64 max-h-[70vh] overflow-y-auto"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="bg-gray-900/95 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-amber-400">Tutorial Chapters</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
            >
              &times;
            </button>
          )}
        </div>

        {/* Chapter list */}
        <div className="p-2 space-y-1">
          {TUTORIAL_CHAPTERS.map((chapter, index) => {
            const unlocked = isChapterUnlocked(chapter.id)
            const completed = isChapterCompleted(chapter.id)
            const isCurrent = currentChapter?.id === chapter.id
            const progress = getChapterProgress(chapter.id)

            return (
              <button
                key={chapter.id}
                onClick={() => handleChapterClick(chapter.id)}
                disabled={!unlocked}
                className={`
                  w-full text-left px-3 py-2 rounded-md transition-colors
                  ${isCurrent ? 'bg-amber-600/30 border border-amber-500/50' : ''}
                  ${unlocked && !isCurrent ? 'hover:bg-gray-800' : ''}
                  ${!unlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-2">
                  {/* Status icon */}
                  <div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center text-xs
                      ${completed ? 'bg-green-600 text-white' : ''}
                      ${isCurrent && !completed ? 'bg-amber-600 text-white' : ''}
                      ${!completed && !isCurrent ? 'bg-gray-700 text-gray-400' : ''}
                    `}
                  >
                    {completed ? '✓' : index + 1}
                  </div>

                  {/* Chapter info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`
                        text-sm font-medium truncate
                        ${isCurrent ? 'text-amber-300' : 'text-gray-200'}
                      `}
                    >
                      {chapter.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{chapter.description}</div>
                  </div>

                  {/* Progress indicator */}
                  {unlocked && !completed && (
                    <div className="text-xs text-gray-500">
                      {progress.completed}/{progress.total}
                    </div>
                  )}
                </div>

                {/* Progress bar for current chapter */}
                {isCurrent && progress.total > 0 && (
                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress.completed / progress.total) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Advanced badge */}
                {chapter.isAdvanced && (
                  <div className="mt-1 inline-block text-[10px] text-purple-400 bg-purple-900/50 px-1.5 py-0.5 rounded">
                    Advanced
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default ChapterMenu
