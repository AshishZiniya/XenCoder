import { useEffect } from 'react'
import MaterialIcon from './MaterialIcon'
import { Panel, useReactFlow } from '@xyflow/react'

function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        zoomIn()
      } else if (e.key === '-') {
        e.preventDefault()
        zoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        fitView()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoomIn, zoomOut, fitView])

  return (
    <Panel position="bottom-right" className="m-4!">
      <div className="flex flex-col gap-1 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black shadow-sm p-1 text-black dark:text-white/60">
        <button
          type="button"
          onClick={() => zoomIn()}
          className="aspect-square size-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Zoom in"
          title="Zoom in (⌘+)"
        >
          <MaterialIcon name="add" />
        </button>
        <button
          type="button"
          onClick={() => zoomOut()}
          className="aspect-square size-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Zoom out"
          title="Zoom out (⌘-)"
        >
          <MaterialIcon name="remove" />
        </button>
        <button
          type="button"
          onClick={() => fitView()}
          className="aspect-square size-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Fit view to canvas"
          title="Fit view (⌘0)"
        >
          <MaterialIcon name="fit_screen" />
        </button>
      </div>
    </Panel>
  )
}

export default ZoomControls
