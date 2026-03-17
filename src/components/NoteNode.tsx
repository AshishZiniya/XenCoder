import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useSetAtom, useAtomValue, getDefaultStore } from 'jotai'
import { Handle, Position, NodeResizer, useReactFlow, useViewport, useStoreApi, getViewportForBounds, NodeProps, Node, Edge } from '@xyflow/react'
import chroma from 'chroma-js'
import ChatWindow from './ChatWindow'
import EditableTitle from './EditableTitle'
import MaterialIcon from './MaterialIcon'
import { nodesAtom, edgesAtom, lastAddedNodeIdAtom, systemInstructionsAtom } from '../store/canvasAtoms'
import { pushHistory } from '../store/historyStore'

interface ChatCompletionOptions {
  systemInstructions?: string
  stream?: boolean
  onChunk?: (text: string) => void
}

interface CreateChatCompletionResult {
  title?: string
  content: string
}

async function createChatCompletion(messages: { role: string, content: string }[], options: ChatCompletionOptions): Promise<CreateChatCompletionResult> {
  const response = await fetch('/api/cerebras', {
    method: 'POST',
    body: JSON.stringify({ messages, ...options }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  if (options.stream) {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      result += chunk;
      options.onChunk?.(result);
    }
    return JSON.parse(result);
  }

  return response.json();
}

function tryExtractContent(raw: string) {
  const match = raw.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)/);
  if (!match) return null;
  try {
    return JSON.parse('"' + match[1] + '"');
  } catch {
    return match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
}

const DEFAULT_WIDTH = '85ch'
/** Pixel fallback for layout math when width is in ch (e.g. 85ch ≈ 680px) */
const DEFAULT_WIDTH_PX = 680
const EXPANDED_HEIGHT = 840

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  content?: string;
  errorCode?: string;
}

export interface PersistedHighlight {
  messageId: string
  startOffset: number
  endOffset: number
  color: string
  highlightId?: string
  appliedPersistedHighlight?: string
  sourceNodeId?: string | null
}

export interface NoteData extends Record<string, unknown> {
  title?: string;
  messages?: Message[];
  draft?: string;
  initMode?: 'explain' | 'ask' | null;
  selectedText?: string;
  contextMessages?: Message[];
  initialQuestion?: string;
  parentNodeId?: string | null;
  selectionHighlightColor?: string | null;
  persistedHighlight?: PersistedHighlight | null;
  explainedSelections?: {
    messageId: string
    startOffset: number
    endOffset: number
    explanation: string
  }[];
  mentionedNodeIds?: string[];
  renamed?: boolean;
  openedAsAsk?: boolean;
  scrollToHighlightOnNextFocus?: boolean;
  scrollToHighlightTrigger?: number;
}

const FORMAT_INSTRUCTION_SUFFIX: { [key: string]: string } = {
  list: '\n\n[Please format your response as a bullet list.]',
  table: '\n\n[Please format your response as a markdown table.]',
  'one-line': '\n\n[Please respond in a single line.]',
}

const REPEAT_IN_FORMAT_MESSAGE: { [key: string]: string } = {
  list: 'Please repeat your previous response, formatted as a bullet list.',
  table: 'Please repeat your previous response, formatted as a markdown table.',
  'one-line': 'Please repeat your previous response in a single line.',
}

/** Darken the highlight color for the back button so it stays visible. */
function darkerHighlightColor(highlightColor: string | null) {
  if (!highlightColor || typeof highlightColor !== 'string') return null
  try {
    return chroma(highlightColor).darken(1.5).alpha(1).css()
  } catch {
    return null
  }
}

function NoteNode({ id, data, selected, width: nodeWidth, height: nodeHeight }: NodeProps<Node<NoteData>>) {
  const { getNode, fitView, setViewport } = useReactFlow()
  const storeApi = useStoreApi()
  const { zoom } = useViewport()
  // Scale title up when zoomed out so it stays readable (zoom 0.5–1)
  const titleFontSize = `${14 / zoom}px`
  // Custom title (user-renamed) or latest AI-generated title; empty for new chats
  const displayTitle = data.title ?? ''
  const store = getDefaultStore()
  const nodes = useAtomValue(nodesAtom) as Node[]
  const setNodesRaw = useSetAtom(nodesAtom)
  // Cast setNodes to accept Node[] and return Node[]
  const setNodes = useCallback((updater: (nds: Node[]) => Node[]) => {
    setNodesRaw((prev) => updater(prev as Node[]))
  }, [setNodesRaw])
  const setLastAddedNodeId = useSetAtom(lastAddedNodeIdAtom)
  const systemInstructions = useAtomValue(systemInstructionsAtom)

  const messages = useMemo(() => data.messages ?? [], [data.messages])
  const draft = data.draft ?? ''
  const initMode = data.initMode ?? null
  const selectedText = data.selectedText ?? ''
  const contextMessages = useMemo(() => data.contextMessages ?? [], [data.contextMessages])
  const initialQuestion = data.initialQuestion ?? ''
  const parentNodeId = data.parentNodeId ?? null
  const parentNodeExists = parentNodeId ? nodes.some((n) => n.id === parentNodeId) : false
  const selectionHighlightColor = data.selectionHighlightColor ?? null
  const persistedHighlight = data.persistedHighlight ?? null
  const explainedSelections = useMemo(() => data.explainedSelections ?? [], [data.explainedSelections])
  const mentionedNodeIds = useMemo(() => data.mentionedNodeIds ?? [], [data.mentionedNodeIds])

  const otherNodes = useMemo(() => {
    return nodes
      .filter((n) => n.id !== id && n.type === 'note')
      .map((n) => ({
        id: n.id,
        title: (n.data?.title ?? '') as string,
      }))
  }, [nodes, id])

  const mentionedNodes = useMemo(() => {
    return mentionedNodeIds
      .map((nodeId) => {
        const n = nodes.find((and) => and.id === nodeId)
        return n ? { id: n.id, title: (n.data?.title ?? '') as string } : null
      })
      .filter(Boolean) as { id: string; title: string }[]
  }, [nodes, mentionedNodeIds])

  const updateNodeDataInStore = useCallback(
    (nodeId: string, data: Partial<NoteData>) => {
      setNodes((nds) =>
        nds.map((n: Node) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        )
      )
    },
    [setNodes]
  )
  const isEmpty = messages.length === 0
  const width = nodeWidth ?? DEFAULT_WIDTH
  const height = isEmpty ? undefined : (nodeHeight ?? EXPANDED_HEIGHT)

  const explainRanRef = useRef(false)
  const chatWindowRef = useRef<{ focusInput: () => void }>(null)
  const prevEmptyRef = useRef<boolean | undefined>(undefined)

  const handleDraftChange = useCallback(
    (value: string) => {
      updateNodeDataInStore(id, { draft: value ?? '' })
    },
    [id, updateNodeDataInStore]
  )

  const handleTitleSave = useCallback(
    (newValue: string, isEmpty: boolean) => {
      updateNodeDataInStore(id, {
        title: newValue,
        renamed: !isEmpty,
      })
    },
    [id, updateNodeDataInStore]
  )

  useEffect(() => {
    const prevEmpty = prevEmptyRef.current
    if (prevEmpty === isEmpty) return
    prevEmptyRef.current = isEmpty
    const targetHeight = isEmpty ? undefined : EXPANDED_HEIGHT
    setNodes((nds) =>
      nds.map((n: Node) => {
        if (n.id !== id) return n
        const restStyle = { ...n.style }
        delete restStyle.height
        return { ...n, style: { ...restStyle, ...(targetHeight != null ? { height: targetHeight } : {}) } }
      })
    )
    if (prevEmpty === true && !isEmpty) {
      setTimeout(() => {
        fitView({
          nodes: [{ id }],
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1,
          duration: 300,
        })
        chatWindowRef.current?.focusInput?.()
      }, 50)
    }
  }, [isEmpty, id, setNodes, fitView])

  useEffect(() => {
    if (initMode !== 'explain' || !selectedText || explainRanRef.current) return
    explainRanRef.current = true
    const apiMessages = [
      ...contextMessages.map((m) => ({
        role: m.role,
        content: m.text ?? m.content ?? '',
      })),
      {
        role: 'user' as const,
        content: `[The user has selected "${selectedText}" from the conversation above.]\n\nPlease explain this selected text in the context of the conversation. Be concise and clear. Do not include any links in your response.`,
      },
    ]
    const userMsgId = `msg-${Date.now()}`
    const loadingId = 'msg-loading'
    updateNodeDataInStore(id, { messages: [{ id: userMsgId, text: `Explain: ${selectedText}`, role: 'user' }, { id: loadingId, text: '…', role: 'assistant' }] })
    createChatCompletion(apiMessages, {
      systemInstructions,
      onChunk: (raw: string) => {
        const content = tryExtractContent(raw)
        if (content) {
          updateNodeDataInStore(id, {
            messages: [
              { id: userMsgId, text: `Explain: ${selectedText}`, role: 'user' },
              { id: loadingId, text: content, role: 'assistant' },
            ],
          })
        }
      },
    })
      .then(({ content }) => {
        updateNodeDataInStore(id, {
          messages: [
            { id: `msg-${Date.now()}`, text: `Explain: ${selectedText}`, role: 'user' },
            { id: `msg-${Date.now()}`, text: content, role: 'assistant' },
          ],
          initMode: null,
          selectedText: '',
          contextMessages: [],
        })
      })
      .catch((err: unknown) => {
        const error = err as { message?: string; code?: string }
        const isQuotaError = error.code === 'TOKEN_QUOTA_EXCEEDED'
        const assistantMsg: Message = {
          id: `msg-${Date.now()}`,
          text: isQuotaError ? (error.message ?? 'Unknown quota error') : `Error: ${error.message ?? 'Unknown error'}`,
          role: 'assistant',
          ...(isQuotaError && { errorCode: 'TOKEN_QUOTA_EXCEEDED' }),
        }
        updateNodeDataInStore(id, {
          messages: [
            { id: `msg-${Date.now()}`, text: `Explain: ${selectedText}`, role: 'user' },
            assistantMsg,
          ],
          initMode: null,
          selectedText: '',
          contextMessages: [],
        })
      })
  }, [initMode, selectedText, contextMessages, id, updateNodeDataInStore, systemInstructions])

  const openBranchWindow = useCallback(
    (mode: 'explain' | 'ask', selectedText: string, contextMessages: Message[], initialQuestion: string | undefined, highlightColor: string | null, persistHighlightPayload: PersistedHighlight | null) => {
      if (!getNode(id)) return
      const newWidth = DEFAULT_WIDTH
      const newWidthPx = DEFAULT_WIDTH_PX
      const emptyNodeHeightEstimate = 80
      const gap = 48

      const getNodeWidth = (n: Node): number => {
        const w = n.measured?.width ?? n.style?.width
        return typeof w === 'number' ? w : DEFAULT_WIDTH_PX
      }
      const getNodeHeight = (n: Node): number => {
        const nData = (n.data ?? {}) as NoteData
        const nMessages = nData.messages ?? []
        const nEmpty = nMessages.length === 0
        const height = n.measured?.height ?? n.style?.height ?? (nEmpty ? emptyNodeHeightEstimate : EXPANDED_HEIGHT)
        return typeof height === 'number' ? height : emptyNodeHeightEstimate
      }

      const overlaps = (ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) =>
        ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by

      const newId = `node-${Date.now()}`
      const isAsk = mode === 'ask'
      setNodes((nds: Node[]) => {
        const sourceNode = nds.find((n) => n.id === id)
        if (!sourceNode) return nds
        pushHistory(nds, store.get(edgesAtom) as Edge[])
        const newHeight = EXPANDED_HEIGHT
        const rightmost = nds.reduce((max: number, node: Node) => {
          const right = node.position.x + getNodeWidth(node)
          return right > max ? right : max
        }, sourceNode.position.x + getNodeWidth(sourceNode))
        let candidateX = rightmost + gap
        const candidateY = sourceNode.position.y
        let found = false
        for (let i = 0; i < 50; i++) {
          found = true
          for (const node of nds) {
            const nw = getNodeWidth(node)
            const nh = getNodeHeight(node)
            if (overlaps(candidateX, candidateY, newWidthPx, newHeight, node.position.x, node.position.y, nw, nh)) {
              found = false
              candidateX = node.position.x + nw + gap
              break
            }
          }
          if (found) break
        }
        const newChild: Node<NoteData> = {
          id: newId,
          position: { x: candidateX, y: candidateY },
          data: {
            messages: [],
            initMode: mode,
            selectedText,
            contextMessages,
            initialQuestion,
            parentNodeId: id,
            openedAsAsk: isAsk,
            ...(highlightColor != null && { selectionHighlightColor: highlightColor }),
          },
          type: 'note',
          style: { width: newWidth },
        }
        return nds
          .map((n) =>
            n.id === id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    ...(isAsk && { scrollToHighlightOnNextFocus: true }),
                    ...(persistHighlightPayload && { persistedHighlight: persistHighlightPayload }),
                  },
                }
              : n
          )
          .concat(newChild)
      })
      setLastAddedNodeId(newId)
    },
    [id, getNode, setNodes, setLastAddedNodeId, store]
  )

  const fetchExplanation = useCallback(
    async (selectedText: string, contextMessages: Message[]) => {
      const apiMessages = [
        ...(contextMessages ?? []).map((m) => ({
          role: m.role,
          content: m.text ?? m.content ?? '',
        })),
        {
          role: 'user' as const,
          content: `[The user has selected "${selectedText}" from the conversation above.]\n\nPlease explain this selected text in the context of the conversation. Be concise and clear. Do not include any links in your response.`,
        },
      ]
      const { content } = await createChatCompletion(apiMessages, { systemInstructions })
      return content
    },
    [systemInstructions]
  )

  const handlePersistExplain = useCallback(
    ({ messageId, startOffset, endOffset, explanation }: { messageId: string, startOffset: number, endOffset: number, explanation: string }) => {
      if (!messageId || typeof startOffset !== 'number' || typeof endOffset !== 'number' || !explanation) return
      setNodes((nds) =>
        nds.map((n: Node) =>
          n.id !== id
            ? n
            : {
                ...n,
                data: {
                  ...n.data,
                  explainedSelections: [
                    ...(Array.isArray(n.data?.explainedSelections) ? n.data.explainedSelections : []),
                    { messageId, startOffset, endOffset, explanation },
                  ],
                },
              }
        )
      )
    },
    [id, setNodes]
  )

  const handleExplain = useCallback(
    (selectedText: string, contextMessages: Message[], highlightColor: string | null, persistHighlightPayload: PersistedHighlight | null) => {
      openBranchWindow('explain', selectedText, contextMessages ?? [], undefined, highlightColor, persistHighlightPayload)
    },
    [openBranchWindow]
  )

  const handleAsk = useCallback(
    (selectedText: string, question: string, contextMessages: Message[], highlightColor: string | null, persistHighlightPayload: PersistedHighlight | null) => {
      openBranchWindow('ask', selectedText, contextMessages ?? [], question, highlightColor, persistHighlightPayload)
    },
    [openBranchWindow]
  )

  const handleMentionSelect = useCallback(
    (nodeId: string) => {
      if (mentionedNodeIds.includes(nodeId)) return
      updateNodeDataInStore(id, { mentionedNodeIds: [...mentionedNodeIds, nodeId] })
    },
    [id, mentionedNodeIds, updateNodeDataInStore]
  )

  const handleMentionSelectAll = useCallback(() => {
    const allOtherIds = otherNodes.map((n) => n.id).filter((mid) => !mentionedNodeIds.includes(mid))
    if (allOtherIds.length === 0) return
    updateNodeDataInStore(id, { mentionedNodeIds: [...mentionedNodeIds, ...allOtherIds] })
  }, [id, mentionedNodeIds, otherNodes, updateNodeDataInStore])

  const handleBackToParent = useCallback(
    () => {
      if (!parentNodeId) return
      const parentNode = getNode(parentNodeId)
      if (!parentNode) return
      setNodes((nds) =>
        nds.map((n: Node) =>
          n.id === parentNodeId
            ? { ...n, data: { ...n.data, scrollToHighlightOnNextFocus: true, scrollToHighlightTrigger: Date.now() } }
            : n
        )
      )
      setLastAddedNodeId(parentNodeId)
      const pw =
        parentNode.measured?.width ??
        (typeof parentNode.style?.width === 'number' ? parentNode.style.width : DEFAULT_WIDTH_PX)
      const phRaw = parentNode.measured?.height ?? parentNode.style?.height ?? EXPANDED_HEIGHT
      const ph = typeof phRaw === 'number' ? phRaw : EXPANDED_HEIGHT
      const bounds = {
        x: parentNode.position.x,
        y: parentNode.position.y,
        width: pw,
        height: ph,
      }
      const state = storeApi.getState()
      const viewportWidth = typeof state.width === 'number' ? state.width : window.innerWidth
      const viewportHeight = typeof state.height === 'number' ? state.height : window.innerHeight
      const viewport = getViewportForBounds(bounds, viewportWidth, viewportHeight, 0.85, 1, 0.2)
      setViewport(viewport, { duration: 300 })
    },
    [parentNodeId, getNode, setNodes, setLastAddedNodeId, setViewport, storeApi]
  )

  const handleRemoveMention = useCallback(
    (nodeId: string) => {
      updateNodeDataInStore(id, {
        mentionedNodeIds: mentionedNodeIds.filter((mid) => mid !== nodeId),
      })
    },
    [id, mentionedNodeIds, updateNodeDataInStore]
  )

  const handleEditAndResend = useCallback(
    async (messageId: string, newText: string) => {
      const idx = messages.findIndex((m) => m.id === messageId)
      if (idx < 0 || messages[idx]?.role !== 'user') return
      const trimmed = newText.trim()
      if (!trimmed) return

      const messagesUpToEdit = messages.slice(0, idx).map((m) => ({
        role: m.role,
        content: m.text ?? m.content ?? '',
      }))
      const messagesWithEdit = [
        ...messages.slice(0, idx),
        { ...messages[idx], text: trimmed },
      ]
      const loadingId = `msg-loading-${Date.now()}`
      updateNodeDataInStore(id, {
        messages: [
          ...messagesWithEdit,
          { id: loadingId, text: '…', role: 'assistant' },
        ],
      })

      const apiMessages = [
        ...messagesUpToEdit,
        { role: 'user' as const, content: trimmed },
      ]

      try {
        const { content } = await createChatCompletion(apiMessages, {
          systemInstructions,
          onChunk: (raw: string) => {
            const partial = tryExtractContent(raw)
            if (partial) {
              updateNodeDataInStore(id, {
                messages: [
                  ...messagesWithEdit,
                  { id: loadingId, text: partial, role: 'assistant' },
                ],
              })
            }
          },
        })
        updateNodeDataInStore(id, {
          messages: [
            ...messagesWithEdit,
            { id: `msg-${Date.now()}`, text: content, role: 'assistant' },
          ],
        })
      } catch (err: unknown) {
        const isQuotaError = (err as { code: string })?.code === 'TOKEN_QUOTA_EXCEEDED'
        updateNodeDataInStore(id, {
          messages: [
            ...messagesWithEdit,
            {
              id: `msg-${Date.now()}`,
              text: isQuotaError ? (err as { message: string })?.message : `Error: ${(err as { message: string })?.message}`,
              role: 'assistant',
              ...(isQuotaError && { errorCode: 'TOKEN_QUOTA_EXCEEDED' }),
            },
          ],
        })
      }
    },
    [id, messages, updateNodeDataInStore, systemInstructions]
  )

  const handleRetry = useCallback(
    async () => {
      const lastAssistantIdx = messages.reduce((acc, m, i) => (m.role === 'assistant' ? i : acc), -1)
      const lastUserIdx = messages.reduce((acc, m, i) => (m.role === 'user' ? i : acc), -1)
      if (lastAssistantIdx < 0 || lastUserIdx < 0 || lastUserIdx >= lastAssistantIdx) return

      const messagesUpToUser = messages.slice(0, lastAssistantIdx)
      const loadingId = `msg-loading-${Date.now()}`
      updateNodeDataInStore(id, {
        messages: [
          ...messagesUpToUser,
          { id: loadingId, text: '…', role: 'assistant' },
        ],
      })

      const apiMessages = messagesUpToUser.map((m) => ({
        role: m.role,
        content: m.text ?? m.content ?? '',
      }))

      try {
        const { content } = await createChatCompletion(apiMessages, {
          systemInstructions,
          onChunk: (raw: string) => {
            const partial = tryExtractContent(raw)
            if (partial) {
              updateNodeDataInStore(id, {
                messages: [
                  ...messagesUpToUser,
                  { id: loadingId, text: partial, role: 'assistant' },
                ],
              })
            }
          },
        })
        updateNodeDataInStore(id, {
          messages: [
            ...messagesUpToUser,
            { id: `msg-${Date.now()}`, text: content, role: 'assistant' },
          ],
        })
      } catch (err: unknown) {
        const isQuotaError = (err as { code: string })?.code === 'TOKEN_QUOTA_EXCEEDED'
        updateNodeDataInStore(id, {
          messages: [
            ...messagesUpToUser,
            {
              id: `msg-${Date.now()}`,
              text: isQuotaError ? (err as { message: string })?.message : `Error: ${(err as { message: string })?.message}`,
              role: 'assistant',
              ...(isQuotaError && { errorCode: 'TOKEN_QUOTA_EXCEEDED' }),
            },
          ],
        })
      }
    },
    [id, messages, updateNodeDataInStore, systemInstructions]
  )

  const handleSend = useCallback(
    async (text: string, options?: { responseFormat?: string }) => {
      const isFormatOnly = !text?.trim() && options?.responseFormat
      const displayText = isFormatOnly
        ? REPEAT_IN_FORMAT_MESSAGE[options.responseFormat!] ?? ''
        : text ?? ''
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        text: displayText,
        role: 'user',
      }
      const messagesWithUser = [...messages, userMessage]
      updateNodeDataInStore(id, { messages: messagesWithUser })

      const loadingId = `msg-loading-${Date.now()}`
      updateNodeDataInStore(id, {
        messages: [
          ...messagesWithUser,
          { id: loadingId, text: '…', role: 'assistant' },
        ],
      })

      const mentionedContext: { role: 'user' | 'assistant', content: string }[] = []
      if (mentionedNodeIds.length > 0) {
        const allNodes = store.get(nodesAtom) as Node[]
        for (const nodeId of mentionedNodeIds) {
          const node = allNodes.find((n: Node) => n.id === nodeId) as (Node<NoteData> | undefined)
          if (!node?.data?.messages?.length) continue
          const nodeData = node.data as NoteData
          const messages = nodeData.messages ?? []
          if (!messages.length) continue
          const title = nodeData.title || '(Untitled)'
          mentionedContext.push({
            role: 'user',
            content: `[Context from "${title}":]`,
          })
          for (const m of messages) {
            mentionedContext.push({
              role: m.role,
              content: m.text ?? m.content ?? '',
            })
          }
        }
      }

      const formatSuffix =
        options?.responseFormat && !isFormatOnly
          ? FORMAT_INSTRUCTION_SUFFIX[options.responseFormat] ?? ''
          : ''

      const isFirstAsk = initMode === 'ask' && selectedText && contextMessages.length > 0
      const baseMessages = isFirstAsk
        ? [
            ...contextMessages.map((m) => ({
              role: m.role,
              content: m.text ?? m.content ?? '',
            })),
            {
              role: 'user' as const,
              content: `[The user has selected "${selectedText}" from the conversation above.]\n\nTheir question: ${text}${formatSuffix}`,
            },
          ]
        : messagesWithUser.map((m, i) => ({
            role: m.role,
            content:
              m.role === 'user' &&
              i === messagesWithUser.length - 1 &&
              (m.text ?? m.content ?? '')
                ? (m.text ?? m.content ?? '') + formatSuffix
                : m.text ?? m.content ?? '',
          }))
      const apiMessages = [...mentionedContext, ...baseMessages]

      try {
        const { title, content } = await createChatCompletion(apiMessages, {
          systemInstructions,
          onChunk: (raw: string) => {
            const partial = tryExtractContent(raw)
            if (partial) {
              updateNodeDataInStore(id, {
                messages: [
                  ...messagesWithUser,
                  { id: loadingId, text: partial, role: 'assistant' },
                ],
              })
            }
          },
        })
        const isFirstExchange = messages.length === 0
        updateNodeDataInStore(id, {
          messages: [
            ...messagesWithUser,
            { id: `msg-${Date.now()}`, text: content, role: 'assistant' },
          ],
          ...(!data.renamed && isFirstExchange && { title }),
          ...(isFirstAsk && {
            initMode: null,
            contextMessages: [],
          }),
          mentionedNodeIds: [],
        })
      } catch (err: unknown) {
        const isQuotaError = (err as { code: string })?.code === 'TOKEN_QUOTA_EXCEEDED'
        updateNodeDataInStore(id, {
          messages: [
            ...messagesWithUser,
            {
              id: `msg-${Date.now()}`,
              text: isQuotaError ? (err as { message: string })?.message : `Error: ${(err as { message: string })?.message}`,
              role: 'assistant',
              ...(isQuotaError && { errorCode: 'TOKEN_QUOTA_EXCEEDED' }),
            },
          ],
          ...(isFirstAsk && {
            initMode: null,
            contextMessages: [],
          }),
          mentionedNodeIds: [],
        })
      }
    },
    [id, messages, initMode, selectedText, contextMessages, mentionedNodeIds, data.renamed, updateNodeDataInStore, systemInstructions, store]
  )

  const askRanRef = useRef(false)
  useEffect(() => {
    if (initMode !== 'ask' || !isEmpty || !initialQuestion?.trim() || askRanRef.current) return
    askRanRef.current = true
    updateNodeDataInStore(id, { initialQuestion: '' })
    handleSend(initialQuestion.trim())
  }, [initMode, isEmpty, initialQuestion, id, updateNodeDataInStore, handleSend])

  return (
    <div
      className={`note-node group flex flex-col rounded-2xl bg-background overflow-visible transition-shadow relative border ${selected ? 'border-primary' : 'border-border'}`}
      style={{ width, ...(height != null ? { height } : { height: 'auto', minHeight: 0 }) }}
    >
      <NodeResizer
        nodeId={id}
        isVisible={!isEmpty}
        minWidth={200}
        minHeight={isEmpty ? 70 : 560}
        color="#3b82f6"
      />
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      {!isEmpty && (
        <div
          className="shrink-0 pl-4 pr-2 py-2.5 flex items-center gap-2 select-none cursor-default"
          onClick={(e) => {
            const target = e.target as HTMLElement
            if (target.closest?.('input') || target.closest?.('textarea') || target.closest?.('[data-back-btn]')) return
            chatWindowRef.current?.focusInput?.()
          }}
          onKeyDown={(e) => {
            const target = e.target as HTMLElement
            if (target.closest?.('input') || target.closest?.('textarea')) return
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              chatWindowRef.current?.focusInput?.()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Focus chat input"
        >
          {parentNodeId && parentNodeExists && (
            <button
              type="button"
              data-back-btn
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleBackToParent()
              }}
              className="nodrag shrink-0 size-7 flex items-center justify-center rounded-lg text-black/50 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={selectionHighlightColor ? { color: darkerHighlightColor(selectionHighlightColor) || undefined } : undefined}
              aria-label="Back to parent chat"
            >
              <MaterialIcon name="arrow_back" className="text-lg" />
            </button>
          )}
          <div className="editable-title min-w-0 flex-1 w-full flex items-center">
            <EditableTitle
              value={displayTitle}
              onSave={handleTitleSave}
              style={{ fontSize: titleFontSize }}
            />
          </div>
        </div>
      )}
      <div className={`nodrag overflow-clip ${isEmpty ? 'shrink-0' : 'flex-1 min-h-0'}`}>
        <ChatWindow
          ref={chatWindowRef}
          nodeId={id}
          draft={draft}
          onDraftChange={handleDraftChange}
          messages={messages}
          selectedText={selectedText}
          selectionHighlightColor={selectionHighlightColor}
          nodeSelected={selected}
          onSend={handleSend}
          onEditAndResend={handleEditAndResend}
  
          onRetry={handleRetry}
          onExplain={handleExplain}
          onAsk={handleAsk}
          fetchExplanation={fetchExplanation}
          onPersistExplain={handlePersistExplain}
          explainedSelections={explainedSelections}
          persistedHighlight={persistedHighlight}
          otherNodes={otherNodes}
          mentionedNodes={mentionedNodes}
          onMentionSelect={handleMentionSelect}
          onMentionSelectAll={handleMentionSelectAll}
          onRemoveMention={handleRemoveMention}
          scrollToHighlightOnNextFocus={data.scrollToHighlightOnNextFocus ?? false}
          scrollToHighlightTrigger={data.scrollToHighlightTrigger}
          onScrollToHighlightDone={() =>
            updateNodeDataInStore(id, { scrollToHighlightOnNextFocus: false, scrollToHighlightTrigger: undefined })
          }
        />
      </div>
    </div>
  )
}

export default memo(NoteNode)
