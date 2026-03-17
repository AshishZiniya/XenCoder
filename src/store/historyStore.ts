import { Node, Edge } from '@xyflow/react';

/**
 * Undo/redo history for canvas nodes and edges.
 * Stores snapshots of { nodes, edges } for each undoable action.
 */

const MAX_HISTORY = 50

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

const past: HistoryEntry[] = []
const future: HistoryEntry[] = []
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function getHistoryState(): HistoryState {
  return { canUndo: past.length > 0, canRedo: future.length > 0 }
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function deepClone<T>(obj: T): T {
  return typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj))
}

/**
 * Push current state to history before an undoable action.
 * Call this with the state BEFORE applying the change.
 */
export function pushHistory(nodes: Node[], edges: Edge[]) {
  past.push({
    nodes: deepClone(nodes),
    edges: deepClone(edges),
  })
  if (past.length > MAX_HISTORY) past.shift()
  future.length = 0
  notify()
}

/**
 * Undo: returns the previous state to restore, or null if nothing to undo.
 */
export function undo(): HistoryEntry | null {
  if (past.length === 0) return null
  const entry = past.pop()
  notify()
  return entry ?? null
}

/**
 * Redo: returns the next state to restore, or null if nothing to redo.
 */
export function redo(): HistoryEntry | null {
  if (future.length === 0) return null
  const entry = future.shift()
  notify()
  return entry ?? null
}

/**
 * Push current state to future stack (used when undoing - the state we're undoing from goes to future).
 */
export function pushFuture(nodes: Node[], edges: Edge[]) {
  future.unshift({
    nodes: deepClone(nodes),
    edges: deepClone(edges),
  })
  if (future.length > MAX_HISTORY) future.pop()
  notify()
}

/**
 * Push current state to past stack (used when redoing - the state we're redoing from goes to past).
 */
export function pushToPast(nodes: Node[], edges: Edge[]) {
  past.push({
    nodes: deepClone(nodes),
    edges: deepClone(edges),
  })
  if (past.length > MAX_HISTORY) past.shift()
  notify()
}
