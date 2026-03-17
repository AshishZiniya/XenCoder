import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { Node, Edge, Viewport } from '@xyflow/react'

const STORAGE_KEY_NODES = 'mg-nodes'
const STORAGE_KEY_EDGES = 'mg-edges'
const STORAGE_KEY_VIEWPORT = 'mg-viewport'
const STORAGE_KEY_SYSTEM_INSTRUCTIONS = 'mg-system-instructions'

function createDebouncedStorage(delay = 200) {
  let timeout: NodeJS.Timeout
  const pending = new Map<string, string>()
  const flush = () => {
    if (typeof window === 'undefined') return
    for (const [key, value] of pending) {
      localStorage.setItem(key, value)
    }
    pending.clear()
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flush)
    window.addEventListener('pagehide', flush)
  }
  return {
    getItem: (key: string) => {
      if (typeof window === 'undefined') return null
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem: (key: string, value: string) => {
      if (typeof window === 'undefined') return
      pending.set(key, value)
      clearTimeout(timeout)
      timeout = setTimeout(flush, delay)
    },
    removeItem: (key: string) => {
      if (typeof window === 'undefined') return
      try {
        localStorage.removeItem(key)
      } catch {
        // ignore
      }
    },
  }
}

const debouncedStorage = createDebouncedStorage(200)
const baseStorage = createJSONStorage(() => debouncedStorage)

/** When persisting nodes, keep only style.width/height and omit measured so we don't store dimensions twice. */
function storageWithNodeNormalization() {
  const s = baseStorage
  return {
    ...s,
    getItem: (key: string, initialValue: unknown) => s.getItem(key, initialValue),
      setItem: (key: string, value: unknown) => {
      if (key === STORAGE_KEY_NODES && Array.isArray(value)) {
        const normalized = value.map((node: Node) => {
          const rest = { ...node }
          delete rest.measured
          return rest
        })
        return s.setItem(key, normalized)
      }
      return s.setItem(key, value)
    },
    removeItem: (key: string) => s.removeItem(key),
  }
}
interface SyncStorage<T> {
  getItem: (key: string, initialValue: T) => T;
  setItem: (key: string, value: T) => void;
  removeItem: (key: string) => void;
}

const storage = storageWithNodeNormalization()

export const nodesAtom = atomWithStorage<Node[]>(STORAGE_KEY_NODES, [], storage as unknown as SyncStorage<Node[]>, {
  getOnInit: true,
})
export const edgesAtom = atomWithStorage<Edge[]>(STORAGE_KEY_EDGES, [], storage as unknown as SyncStorage<Edge[]>, {
  getOnInit: true,
})
export const viewportAtom = atomWithStorage<Viewport | null>(STORAGE_KEY_VIEWPORT, null, storage as unknown as SyncStorage<Viewport | null>, {
  getOnInit: true,
})

/** Set when a new node is added; ChatWindow focuses its input when nodeId matches, then clears. */
export const lastAddedNodeIdAtom = atom<string | null>(null)

/** User-editable system instructions prepended to the AI system prompt. Persisted to localStorage. */
export const systemInstructionsAtom = atomWithStorage<string>(
  STORAGE_KEY_SYSTEM_INSTRUCTIONS,
  '',
  storage as unknown as SyncStorage<string>,
  { getOnInit: true }
)
