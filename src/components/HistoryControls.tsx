import { useEffect, useState, useCallback } from 'react'
import MaterialIcon from './MaterialIcon'
import { Panel } from '@xyflow/react'
import { useAtom } from 'jotai'
import { nodesAtom, edgesAtom } from '../store/canvasAtoms'
import {
  getHistoryState,
  subscribe,
  undo,
  redo,
  pushFuture,
  pushToPast,
  HistoryState,
} from '../store/historyStore'

function HistoryControls() {
  const [nodes, setNodes] = useAtom(nodesAtom)
  const [edges, setEdges] = useAtom(edgesAtom)
  const [historyState, setHistoryState] = useState<HistoryState>(getHistoryState)

  useEffect(() => {
    const unsubscribe = subscribe(() => setHistoryState(getHistoryState()))
    return () => {
      unsubscribe()
    }
  }, [])

  const handleUndo = useCallback(() => {
    const prev = undo()
    if (prev) {
      pushFuture(nodes, edges)
      setNodes(prev.nodes)
      setEdges(prev.edges)
    }
  }, [nodes, edges, setNodes, setEdges])

  const handleRedo = useCallback(() => {
    const next = redo()
    if (next) {
      pushToPast(nodes, edges)
      setNodes(next.nodes)
      setEdges(next.edges)
    }
  }, [nodes, edges, setNodes, setEdges])

  return (
    <Panel position="bottom-left" className="m-4!">
      <div className="flex gap-1 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black shadow-sm p-1 text-black dark:text-white/60">
        <button
          type="button"
          onClick={handleUndo}
          disabled={!historyState.canUndo}
          className="aspect-square size-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Undo"
          title={historyState.canUndo ? 'Undo (⌘Z)' : undefined}
        >
          <MaterialIcon name="undo" />
        </button>
        <button
          type="button"
          onClick={handleRedo}
          disabled={!historyState.canRedo}
          className="aspect-square size-10 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Redo"
          title={historyState.canRedo ? 'Redo (⌘⇧Z)' : undefined}
        >
          <MaterialIcon name="redo" />
        </button>
      </div>
    </Panel>
  )
}

export default HistoryControls
