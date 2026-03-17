import * as Tooltip from '@radix-ui/react-tooltip'
import { useInView } from 'framer-motion'
import { useAtomValue, useSetAtom } from 'jotai'
import React, { forwardRef, isValidElement, memo, ReactNode, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import 'katex/dist/katex.min.css'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { useTypewriter } from '../hooks/useTypewriter'
import { lastAddedNodeIdAtom } from '../store/canvasAtoms'
import { parseAndSanitizeSvg } from '../utils/svgSanitize'
import MaterialIcon from './MaterialIcon'
import SelectionPopup from './SelectionPopup'

const HIGHLIGHT_COLORS = [
  'rgb(251 191 36 / 0.35)',
  'rgb(96 165 250 / 0.35)',
  'rgb(74 222 128 / 0.35)',
  'rgb(244 114 182 / 0.35)',
  'rgb(167 139 250 / 0.35)',
  'rgb(34 211 238 / 0.35)',
  'rgb(251 113 133 / 0.35)',
  'rgb(163 230 53 / 0.35)',
  'rgb(56 189 248 / 0.35)',
  'rgb(251 146 60 / 0.35)',
]

const P5_CDN_URL = 'https://cdn.jsdelivr.net/npm/p5@1.7.0/lib/p5.min.js'

const TRUNCATE_QUESTION_LENGTH = 350
const MIN_WORD_LENGTH_FOR_SUGGESTION = 5

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  content?: string;
  errorCode?: string;
}

interface PersistedHighlight {
  messageId: string
  startOffset: number
  endOffset: number
  color: string
  highlightId?: string
  appliedPersistedHighlight?: string
  sourceNodeId?: string | null
}

interface ExplainedSelection {
  messageId: string;
  startOffset: number;
  endOffset: number;
  explanation: string;
}

interface OtherNode {
  id: string;
  title: string;
}

interface MentionOption {
  type: string;
  id: string;
  title: string;
}

interface ChatWindowImperativeHandle {
  focusInput: () => void;
}

interface ChatWindowProps {
  nodeId: string;
  draft?: string;
  onDraftChange?: (draft: string) => void;
  messages?: Message[];
  selectedText?: string;
  selectionHighlightColor?: string | null;
  nodeSelected?: boolean;
  onSend: (text: string, options?: { responseFormat?: string }) => void;
  onEditAndResend?: (messageId: string, newText: string) => void;
  onRetry?: () => void;
  onExplain?: (selectedText: string, contextMessages: Message[], highlightColor: string | null, persistHighlightPayload: PersistedHighlight | null) => void;
  onAsk?: (selectedText: string, question: string, contextMessages: Message[], highlightColor: string | null, persistHighlightPayload: PersistedHighlight | null) => void;
  fetchExplanation?: (selectedText: string, contextMessages: Message[]) => Promise<string>;
  onPersistExplain?: (payload: ExplainedSelection) => void;
  explainedSelections?: ExplainedSelection[];
  persistedHighlight?: PersistedHighlight | null;
  otherNodes?: OtherNode[];
  mentionedNodes?: OtherNode[];
  onMentionSelect?: (nodeId: string) => void;
  onMentionSelectAll?: () => void;
  onRemoveMention?: (nodeId: string) => void;
  scrollToHighlightOnNextFocus?: boolean;
  scrollToHighlightTrigger?: number | null;
  onScrollToHighlightDone?: () => void;
}

/** Extract unique words longer than 4 chars from text (current chat messages + draft) */
function extractLongWords(messages: Message[], draft: string) {
  const words = new Set<string>()
  const addText = (text: string) => {
    if (!text || typeof text !== 'string') return
    const tokens = text.split(/\s+/).map((w) => w.replace(/^\W+|\W+$/g, '').toLowerCase()).filter(Boolean)
    tokens.forEach((w) => {
      if (w.length >= MIN_WORD_LENGTH_FOR_SUGGESTION) words.add(w)
    })
  }
  messages.forEach((m) => addText(m.text))
  addText(draft)
  return words
}

function truncateAtWord(text: string, maxLen: number) {
  if (text.length <= maxLen) return { truncated: false, display: text }
  const slice = text.slice(0, maxLen)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > 0 ? lastSpace : maxLen
  return { truncated: true, display: text.slice(0, cut).trim() + '…' }
}

function P5SketchBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.1, once: false })
  const escapedCode = (code || '').replace(/<\/script/gi, '<\\/script')
  const srcdoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="${P5_CDN_URL}"><\/script>
</head>
<body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100%;background:#fafafa;">
  <script>
${escapedCode}
  <\/script>
</body>
</html>`
  return (
    <div ref={ref} className="markdown-p5-block">
      {inView ? (
        <iframe
          title="p5.js sketch"
          srcDoc={srcdoc}
          className="markdown-p5-iframe"
          sandbox="allow-scripts"
        />
      ) : (
        <div className="markdown-p5-placeholder" aria-hidden="true">
          Scroll to view sketch
        </div>
      )}
    </div>
  )
}

function SvgBlock({ code }: { code: string }) {
  const [view, setView] = useState('preview') // 'preview' | 'code'
  const [copied, setCopied] = useState(false)
  const codeWrapperRef = useRef<HTMLDivElement>(null)
  const sanitized = useMemo(() => parseAndSanitizeSvg(code), [code])
  const canPreview = !!sanitized

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [code])

  return (
    <div className="markdown-svg-block">
      <div className="markdown-svg-tabs">
        <span className="markdown-code-block-lang">svg</span>
        <button
          type="button"
          className={`markdown-svg-tab ${view === 'preview' ? 'markdown-svg-tab-active' : ''}`}
          onClick={() => setView('preview')}
          aria-pressed={view === 'preview'}
        >
          Preview
        </button>
        <button
          type="button"
          className={`markdown-svg-tab ${view === 'code' ? 'markdown-svg-tab-active' : ''}`}
          onClick={() => setView('code')}
          aria-pressed={view === 'code'}
        >
          Code
        </button>
      </div>
      {view === 'preview' && (
        <div className="markdown-svg-diagram" aria-hidden={false}>
          {canPreview ? (
            <div dangerouslySetInnerHTML={{ __html: sanitized }} />
          ) : (
            <div className="markdown-svg-fallback">
              <pre>{code}</pre>
              <p className="markdown-svg-error-msg">Invalid or unsafe SVG — showing raw code.</p>
            </div>
          )}
        </div>
      )}
      {view === 'code' && (
        <div ref={codeWrapperRef} className="markdown-svg-code-wrapper">
          <pre className="markdown-svg-code">{code}</pre>
          <button
            type="button"
            onClick={handleCopy}
            className="markdown-svg-copy-btn"
            aria-label="Copy code"
          >
            {copied ? <MaterialIcon name="check" /> : <MaterialIcon name="content_copy" />}
          </button>
        </div>
      )}
    </div>
  )
}

function CodeBlock({ children, ...props }: { children?: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const getCodeText = (node: ReactNode): string => {
    if (typeof node === 'string') return node
    if (node == null) return ''
    if (Array.isArray(node)) return node.map(getCodeText).join('')
    if (isValidElement(node) && node.props && 'children' in (node.props as Record<string, unknown>)) {
      return getCodeText((node.props as { children?: ReactNode }).children as ReactNode)
    }
    return String(node ?? '')
  }
  const codeText = getCodeText(children)
  const classNames = isValidElement(children) && children.props && 'className' in (children.props as object) ? (children.props as { className?: string }).className : undefined
  const lang =
    Array.isArray(classNames)
      ? classNames.find((c) => typeof c === 'string' && c.startsWith('language-'))
      : typeof classNames === 'string' && classNames.startsWith('language-')
        ? classNames
        : null
  const langStr = typeof lang === 'string' ? lang.replace('language-', '') : ''

  const handleCopy = useCallback(() => {
    if (langStr === 'p5') {
      navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      return
    }
    const codeEl = wrapperRef.current?.querySelector('code')
    if (codeEl) {
      navigator.clipboard.writeText(codeEl.textContent ?? '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [langStr, codeText])

  const isSvg = langStr === 'svg' || (!langStr && /<\s*svg[\s>]/i.test(codeText))
  if (isSvg) {
    return (
      <div className="markdown-code-block-wrapper">
        <SvgBlock code={codeText} />
      </div>
    )
  }

  if (langStr === 'p5') {
    return (
      <div ref={wrapperRef} className="markdown-code-block-wrapper markdown-p5-wrapper">
        <div className="markdown-code-block-header">
          {langStr && (
            <div className="markdown-code-block-lang">{langStr.toUpperCase()}</div>
          )}
          <div className="markdown-code-block-controls">
            <button
              type="button"
              onClick={handleCopy}
              className="markdown-control-btn markdown-copy-btn"
              aria-label="Copy code"
              title="Copy code"
            >
              {copied ? <MaterialIcon name="check" size="sm" /> : <MaterialIcon name="content_copy" size="sm" />}
            </button>
          </div>
        </div>
        <P5SketchBlock code={codeText} />
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="markdown-code-block-wrapper">
      <div className="markdown-code-block-header">
        {langStr && (
          <div className="markdown-code-block-lang">{langStr.toUpperCase()}</div>
        )}
        <div className="markdown-code-block-controls">
          <button
            type="button"
            className="markdown-control-btn markdown-minimize-btn"
            aria-label="Collapse code block"
            title="Collapse code block"
          >
            <MaterialIcon name="close" size="sm" />
          </button>
          <button
            type="button"
            className="markdown-control-btn markdown-run-btn"
            aria-label="Run code"
            title="Run code"
          >
            <MaterialIcon name="play_arrow" size="sm" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="markdown-control-btn markdown-copy-btn"
            aria-label="Copy code"
            title="Copy code"
          >
            {copied ? <MaterialIcon name="check" size="sm" /> : <MaterialIcon name="content_copy" size="sm" />}
          </button>
        </div>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  )
}

function UserMessageBubble({
  msg,
  isEditing,
  editValue,
  onEditChange,
  onStartEdit,
  onSave,
  onCancel,
  editInputRef,
  showEditButton,
  className,
  selectedTextAbove = null,
  selectionHighlightColor = null,
}: {
  msg: Message,
  isEditing: boolean,
  editValue: string,
  onEditChange: (value: string) => void,
  onStartEdit: (msg: Message) => void,
  onSave: (trimmed: string) => void,
  onCancel: () => void,
  editInputRef: React.RefObject<HTMLTextAreaElement>,
  showEditButton: boolean,
  className: string,
  selectedTextAbove?: string | null,
  selectionHighlightColor?: string | null,
}) {
  const isLong = (msg.text || '').length > TRUNCATE_QUESTION_LENGTH
  const { display: truncatedDisplay } = truncateAtWord(msg.text || '', TRUNCATE_QUESTION_LENGTH)
  const [expanded, setExpanded] = useState(false)
  const showTruncated = isLong && !expanded

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const trimmed = editValue.trim()
        if (trimmed) onSave(trimmed)
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    },
    [editValue, onSave, onCancel]
  )

  if (isEditing) {
    return (
      <div className={className}>
        <textarea
          ref={editInputRef}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={Math.min(8, Math.max(2, editValue.split('\n').length))}
          className="nodrag w-full min-w-0 px-3 py-2 rounded-xl bg-black/4 dark:bg-white/10 ml-4 mr-0 text-black dark:text-white leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50"
          spellCheck={false}
          autoComplete="off"
          aria-label="Edit message"
        />
        <div className="flex items-center gap-1 mt-2 ml-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-lg text-black/50 hover:text-black hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 text-sm"
          >
            Cancel
          </button>
          {editValue.trim() && (
            <button
              type="button"
              onClick={() => onSave(editValue.trim())}
              className="px-3 py-2 rounded-lg bg-black dark:bg-white/20 text-white text-sm font-medium hover:bg-black/80 dark:hover:bg-white/30"
            >
              Save
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className="px-3 py-2 rounded-xl bg-black/4 dark:bg-white/10 ml-4 mr-0 text-black dark:text-white leading-relaxed cursor-text"
        data-message-body={msg.id}
        onDoubleClick={showEditButton ? () => onStartEdit(msg) : undefined}
      >
        {selectedTextAbove && (
          <p className="text-base font-medium text-black dark:text-white">
            {selectionHighlightColor ? (
              <span className="selection-highlight rounded px-0.5" style={{ backgroundColor: selectionHighlightColor }}>{selectedTextAbove}</span>
            ) : (
              selectedTextAbove
            )}
          </p>
        )}
        <span className="leading-relaxed">
          {showTruncated ? truncatedDisplay : msg.text}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="ml-1.5 cursor-pointer text-sm font-medium text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 rounded"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </span>
      </div>
      {showEditButton && (
        <Tooltip.Root delayDuration={300}>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => onStartEdit(msg)}
              className="self-start ml-4 aspect-square size-10 flex items-center justify-center rounded-lg text-black/50 hover:text-black hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 mt-1"
              aria-label="Edit message"
            >
              <MaterialIcon name="edit" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" sideOffset={6} className="z-9999 rounded-md bg-black dark:bg-black/90 px-2.5 py-1.5 text-xs text-white shadow-lg">
              Edit message
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      )}
    </div>
  )
}

const AssistantMessageBlock = memo(function AssistantMessageBlock({
  msg,
  seenAnimatedIdsRef,
  idx,
  lastAssistantIdx,
}: {
  msg: Message,
  seenAnimatedIdsRef: React.MutableRefObject<Set<string>>,
  idx: number,
  lastAssistantIdx: number
}) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (lastAssistantIdx === idx && msg.text !== '…' && !seenAnimatedIdsRef.current.has(msg.id)) {
      const timer = setTimeout(() => setShouldAnimate(true), 0)
      return () => clearTimeout(timer)
    }
  }, [idx, lastAssistantIdx, msg.id, msg.text, seenAnimatedIdsRef])
  
  const onAnimateComplete = useCallback(() => {
    if (msg.id) {
      seenAnimatedIdsRef.current.add(msg.id)
      setShouldAnimate(false)
    }
  }, [msg.id, seenAnimatedIdsRef])

  return (
    <div className={`markdown-content ${shouldAnimate ? 'assistant-animate' : ''}`} data-message-body={msg.id}>
      <AssistantMessageContent
        text={msg.text}
        animate={shouldAnimate}
        onAnimateComplete={onAnimateComplete}
      />
    </div>
  )
})

function AssistantThinkingMessage() {
  const options = useMemo(() => ['Hmm...', 'Umm...', 'So...'], [])
  const [word, setWord] = useState(() => options[0])
  
  useEffect(() => {
    setWord(options[Math.floor(Math.random() * options.length)])
  }, [options])
  return (
    <span className="inline-flex text-black/40 dark:text-white/40 animate-pulse [animation-duration:2.5s]">
      {word}
    </span>
  )
}

const AssistantMessageContent = memo(function AssistantMessageContent({ text, animate, onAnimateComplete }: { text: string, animate: boolean, onAnimateComplete: () => void }) {
  const displayedText = useTypewriter(text, {
    enabled: animate,
    charsPerTick: 99999,
    tickMs: 1,
  })
  const completedRef = useRef(false)
  useEffect(() => {
    completedRef.current = false
  }, [text])
  useEffect(() => {
    if (animate && onAnimateComplete && !completedRef.current && displayedText.length >= text.length && text.length > 0) {
      completedRef.current = true
      onAnimateComplete()
    }
  }, [animate, onAnimateComplete, displayedText.length, text.length])
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          table: ({ ...props }) => (
            <div className="markdown-table-wrapper">
              <table {...props} />
            </div>
          ),
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          pre: CodeBlock,
        }}
      >
        {displayedText}
      </ReactMarkdown>
    </div>
  )
})

const ChatWindow = forwardRef<ChatWindowImperativeHandle, ChatWindowProps>(function ChatWindow(
  {
    nodeId,
    draft = '',
    onDraftChange,
    messages = [],
    selectedText,
    selectionHighlightColor = null,
    nodeSelected = false,
    onSend,
    onEditAndResend,
    onRetry,
    onExplain,
    onAsk,
    fetchExplanation = null,
    onPersistExplain = null,
    explainedSelections = [],
    persistedHighlight = null,
    otherNodes = [],
    mentionedNodes = [],
    onMentionSelect,
    onMentionSelectAll,
    onRemoveMention,
    scrollToHighlightTrigger = null,
    onScrollToHighlightDone,
  },
  ref
) {
  const [inputValue, setInputValue] = useState(() => draft ?? '')
  const [selectionStart, setSelectionStart] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const isFocusedRef = useRef(false)
  const nodeSelectedRef = useRef(nodeSelected)
  
  useEffect(() => {
    nodeSelectedRef.current = nodeSelected
  }, [nodeSelected])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const lastUserMessageRef = useRef<HTMLDivElement>(null)
  const lastAddedNodeId = useAtomValue(lastAddedNodeIdAtom)
  const setLastAddedNodeId = useSetAtom(lastAddedNodeIdAtom)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [selectionState, setSelectionState] = useState<{ rect: { left: number, top: number } | null, text: string }>({
    rect: null,
    text: '',
  })
  const [explainPopoverState, setExplainPopoverState] = useState<{
    open: boolean,
    rect: { left: number, top: number } | null,
    selectedText: string,
    explanation: string | null,
    loading: boolean,
    persistPayload: Partial<PersistedHighlight> | null,
  }>({
    open: false,
    rect: null,
    selectedText: '',
    explanation: null,
    loading: false,
    persistPayload: null,
  })
  const [mentionState, setMentionState] = useState({
    active: false,
    filter: '',
    anchorStart: 0,
  })
  const [mentionHighlightIndex, setMentionHighlightIndex] = useState(0)
  const [responseFormatRequest, setResponseFormatRequest] = useState<string | null>(null) // 'list' | 'table' | 'one-line'
  const mentionItemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const seenAnimatedIdsRef = useRef(new Set<string>())
  const draftSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const selectionHighlightRef = useRef<HTMLElement | null>(null)
  const selectionStateRef = useRef<{ rect: { left: number, top: number } | null, text: string }>({ rect: null, text: '' })
  /** When true, we opened Explain/Ask and kept the highlight in the parent; do not remove it on selectionchange */
  const preserveHighlightRef = useRef(false)

  const chatWordsSet = useMemo(
    () => extractLongWords(messages, inputValue),
    [messages, inputValue]
  )

  const { wordSuggestion, suggestionSuffix } = useMemo(() => {
    const beforeCursor = inputValue.slice(0, selectionStart)
    const match = beforeCursor.match(/(\S*)$/)
    const fragment = match ? match[1].toLowerCase() : ''
    if (fragment.length < 2) return { wordSuggestion: null, suggestionSuffix: '' }
    const matches = [...chatWordsSet].filter(
      (w) => w.length > fragment.length && w.startsWith(fragment)
    )
    const candidate = matches.length ? matches.sort()[0] : null
    if (!candidate) return { wordSuggestion: null, suggestionSuffix: '' }
    return {
      wordSuggestion: candidate,
      suggestionSuffix: candidate.slice(fragment.length),
    }
  }, [inputValue, selectionStart, chatWordsSet])

  const mentionedIds = useMemo(() => new Set(mentionedNodes.map((n) => n.id)), [mentionedNodes])
  const showAllOption = useMemo(() => {
    if (!mentionState.active || otherNodes.length === 0) return false
    if (otherNodes.every((n) => mentionedIds.has(n.id))) return false
    const f = mentionState.filter.toLowerCase().trim()
    return !f || 'all'.startsWith(f)
  }, [mentionState.active, mentionState.filter, otherNodes, mentionedIds])

  const filteredMentionNodes = useMemo(() => {
    if (!mentionState.active) return []
    const f = mentionState.filter.toLowerCase().trim()
    return otherNodes.filter((n) => {
      if (mentionedIds.has(n.id)) return false
      const title = (n.title ?? '').toLowerCase()
      return !f || title.includes(f)
    })
  }, [otherNodes, mentionState.active, mentionState.filter, mentionedIds])

  const linkOptions = useMemo(() => {
    const nodes = filteredMentionNodes.map((n) => ({ type: 'node', id: n.id, title: n.title }))
    return showAllOption ? [{ type: 'all', id: '__all__', title: 'All' }, ...nodes] : nodes
  }, [showAllOption, filteredMentionNodes])

  const formatOptionsBase = useMemo(
    () => [
      { type: 'format', id: 'list', title: 'List' },
      { type: 'format', id: 'table', title: 'Table' },
      { type: 'format', id: 'one-line', title: 'One line' },
    ],
    []
  )

  const filteredFormatOptions = useMemo(() => {
    if (!mentionState.active) return []
    const f = mentionState.filter.toLowerCase().trim()
    return formatOptionsBase.filter((opt) => !f || opt.title.toLowerCase().includes(f))
  }, [mentionState.active, mentionState.filter, formatOptionsBase])

  const mentionOptions = useMemo(
    () => [...linkOptions, ...filteredFormatOptions],
    [linkOptions, filteredFormatOptions]
  )

  // Adjust mention highlight index if it's out of bounds during render
  const safeMentionHighlightIndex = Math.min(mentionHighlightIndex, Math.max(0, mentionOptions.length - 1))
  if (mentionState.active && mentionOptions.length > 0 && mentionHighlightIndex !== safeMentionHighlightIndex) {
    setMentionHighlightIndex(safeMentionHighlightIndex)
  }

  useEffect(() => {
    // No longer need adjust logic here
  }, [mentionState.active, mentionOptions])

  useEffect(() => {
    const el = mentionItemRefs.current[mentionHighlightIndex]
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [mentionHighlightIndex])

  const lastUserMessageIdx = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return i
    }
    return -1
  }, [messages])

  const firstUserMessageIdx = useMemo(() => {
    const i = messages.findIndex((m) => m.role === 'user')
    return i >= 0 ? i : -1
  }, [messages])

  useEffect(() => {
    messages.forEach((m) => {
      if (m.role === 'assistant' && m.id) seenAnimatedIdsRef.current.add(m.id)
    })
  }, [nodeId, messages])

  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      const canScroll = isFocusedRef.current || nodeSelectedRef.current
      if (canScroll) {
        e.stopPropagation()
        return
      }
      e.preventDefault()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [messages.length])

  const inlineEditRef = useRef<HTMLTextAreaElement | null>(null)
  
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      const input = inputRef.current
      const editInput = inlineEditRef.current
      if (!input) return
      if (input.contains(e.target as Node) || input === e.target) return
      // When editing a question, let the edit textarea behave like a normal text input
      if (editInput && (editInput.contains(e.target as Node) || editInput === e.target)) return
      // When typing in the selection popup ask input, don't steal focus
      if ((e.target as HTMLElement)?.closest?.('[data-selection-popup]')) return

      // Allow copy/paste/cut/select-all when text is selected in chat messages
      if ((e.metaKey || e.ctrlKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) return

      if (e.key.length > 1 && !['Enter', 'Tab', 'Backspace'].includes(e.key)) return

      input.focus()
      e.preventDefault()

      const saveDraft = (value: string) => {
        if (!nodeId || !onDraftChange) return
        if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current)
        draftSaveTimeoutRef.current = setTimeout(() => {
          onDraftChange(value)
          draftSaveTimeoutRef.current = null
        }, 300)
      }

      if (editingMessageId) {
        if (e.key === 'Backspace') {
          setEditValue((v) => v.slice(0, -1))
        } else if (e.key === 'Enter') {
          setEditValue((v) => v + '\n')
        } else if (e.key === 'Tab') {
          setEditValue((v) => v + '\t')
        } else if (e.key.length === 1) {
          setEditValue((v) => v + e.key)
        }
      } else {
        if (e.key === 'Backspace') {
          setInputValue((v) => {
            const next = v.slice(0, -1)
            saveDraft(next)
            return next
          })
        } else if (e.key === 'Enter') {
          setInputValue((v) => {
            const next = v + '\n'
            saveDraft(next)
            return next
          })
        } else if (e.key === 'Tab') {
          setInputValue((v) => {
            const next = v + '\t'
            saveDraft(next)
            return next
          })
        } else if (e.key.length === 1) {
          setInputValue((v) => {
            const next = v + e.key
            saveDraft(next)
            return next
          })
        }
      }
    },
    [editingMessageId, nodeId, onDraftChange]
  )

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    if (chatWindowRef.current?.contains(e.relatedTarget as Node)) return
    isFocusedRef.current = false
    setIsFocused(false)
  }, [])

  const removeSelectionHighlight = useCallback(() => {
    const span = selectionHighlightRef.current
    if (!span?.parentNode) return
    selectionHighlightRef.current = null
    const parent = span.parentNode
    while (span.firstChild) {
      parent.insertBefore(span.firstChild, span)
    }
    parent.removeChild(span)
  }, [])

  const applySelectionHighlight = useCallback(() => {
    const sel = window.getSelection()
    if (!sel?.rangeCount) return
    const range = sel.getRangeAt(0)
    const span = document.createElement('span')
    span.className = 'selection-highlight'
    span.setAttribute('data-selection-highlight', '')
    span.style.backgroundColor = HIGHLIGHT_COLORS[Math.floor(Math.random() * HIGHLIGHT_COLORS.length)]
    try {
      range.surroundContents(span)
      const msgEl = span.closest('[data-message-id]')
      if (msgEl) span.setAttribute('data-message-id', msgEl.getAttribute('data-message-id')!)
      selectionHighlightRef.current = span
    } catch {
      // surroundContents can fail if range spans multiple elements
    }
  }, [])

  useEffect(() => {
    selectionStateRef.current = selectionState as unknown as { rect: { left: number, top: number } | null, text: string }
  }, [selectionState])

  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection()
      const text = sel?.toString()?.trim()
      if (!text) {
        // Don't clear when popup is showing (user typing in ask input)
        const { text: popupText } = selectionStateRef.current
        if (popupText?.trim()) return
        // Keep highlight when we opened Explain/Ask and left it in the parent
        if (preserveHighlightRef.current) return
        removeSelectionHighlight()
        setSelectionState({ rect: null, text: '' })
      }
    }
    document.addEventListener('selectionchange', onSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange)
      removeSelectionHighlight()
    }
  }, [removeSelectionHighlight])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const sel = window.getSelection()
    const text = sel?.toString()?.trim()
    const container = messagesContainerRef.current
    if (!text || !container || !sel || !sel.anchorNode) {
      selectionStateRef.current = { rect: null, text: '' }
      setSelectionState({ rect: null, text: '' })
      return
    }
    if (!container.contains(sel?.anchorNode)) {
      selectionStateRef.current = { rect: null, text: '' }
      setSelectionState({ rect: null, text: '' })
      return
    }
    // Only allow selection from message content, not from input/textarea (e.g. editing question)
    const anchorEl = sel.anchorNode?.nodeType === Node.ELEMENT_NODE ? sel.anchorNode : sel.anchorNode?.parentElement
    if ((anchorEl as HTMLElement)?.closest?.('input, textarea, [contenteditable="true"]')) {
      selectionStateRef.current = { rect: null, text: '' }
      setSelectionState({ rect: null, text: '' })
      return
    }
    try {
      const left = e.clientX - 24
      const top = e.clientY + 8
      const next = { rect: { left, top }, text }
      selectionStateRef.current = next
      setSelectionState(next)
    } catch {
      selectionStateRef.current = { rect: null, text: '' }
      setSelectionState({ rect: null, text: '' })
    }
  }, [])

  const clearSelection = useCallback(() => {
    selectionStateRef.current = { rect: null, text: '' }
    removeSelectionHighlight()
    setSelectionState({ rect: null, text: '' })
    window.getSelection()?.removeAllRanges()
  }, [removeSelectionHighlight])

  const handleExplain = useCallback(
    (selectedText: string) => {
      const span = selectionHighlightRef.current
      const highlightColor = span?.style?.backgroundColor ?? null
      let persistPayload = null
      if (span) {
        preserveHighlightRef.current = true
        const messageId = span.getAttribute('data-message-id')
        if (messageId && highlightColor) {
          const bodyEl = span.closest('[data-message-body]') || span.closest('[data-message-id]')
          if (bodyEl) {
            const r = document.createRange()
            r.setStart(bodyEl, 0)
            r.setEndBefore(span)
            const startOffset = r.toString().length
            r.setEndAfter(span)
            const endOffset = r.toString().length
            const highlightId = `highlight-${nodeId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
            persistPayload = { messageId, startOffset, endOffset, color: highlightColor, highlightId, sourceNodeId: nodeId }
          }
        }
      }
      if (fetchExplanation) {
        const rect = selectionStateRef.current.rect ?? { left: 0, top: 0 }
        setExplainPopoverState({
          open: true,
          rect: { ...rect },
          selectedText,
          explanation: null,
          loading: true,
          persistPayload: persistPayload ? { messageId: persistPayload.messageId, startOffset: persistPayload.startOffset, endOffset: persistPayload.endOffset } : null,
        })
        setSelectionState({ rect: null, text: '' })
        selectionStateRef.current = { rect: null, text: '' }
        window.getSelection()?.removeAllRanges()
        fetchExplanation(selectedText, messages)
          .then((explanation) => {
            setExplainPopoverState((prev) => (prev.open ? { ...prev, explanation, loading: false } : prev))
          })
          .catch((err) => {
            setExplainPopoverState((prev) =>
              prev.open ? { ...prev, explanation: `Error: ${err.message}`, loading: false } : prev
            )
          })
        return
      }
      onExplain?.(selectedText, messages, highlightColor, persistPayload)
      setSelectionState({ rect: null, text: '' })
      selectionStateRef.current = { rect: null, text: '' }
      window.getSelection()?.removeAllRanges()
    },
    [nodeId, onExplain, fetchExplanation, messages]
  )

  const handleAsk = useCallback(
    (selectedText: string, question: string) => {
      const span = selectionHighlightRef.current
      const highlightColor = span?.style?.backgroundColor ?? null
      let persistPayload = null
      if (span) {
        preserveHighlightRef.current = true
        const messageId = span.getAttribute('data-message-id')
        if (messageId && highlightColor) {
          const bodyEl = span.closest('[data-message-body]') || span.closest('[data-message-id]')
          if (bodyEl) {
            const r = document.createRange()
            r.setStart(bodyEl, 0)
            r.setEndBefore(span)
            const startOffset = r.toString().length
            r.setEndAfter(span)
            const endOffset = r.toString().length
            const highlightId = `highlight-${nodeId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
            persistPayload = { messageId, startOffset, endOffset, color: highlightColor, highlightId, sourceNodeId: nodeId }
          }
        }
      }
      onAsk?.(selectedText, question, messages, highlightColor, persistPayload)
      setSelectionState({ rect: null, text: '' })
      selectionStateRef.current = { rect: null, text: '' }
      setExplainPopoverState((prev) => ({ ...prev, open: false }))
      window.getSelection()?.removeAllRanges()
    },
    [nodeId, onAsk, messages]
  )

  const handleExplainPopoverClose = useCallback(() => {
    setExplainPopoverState((prev) => {
      if (!prev.open) return prev
      if (prev.explanation && prev.persistPayload?.messageId && prev.persistPayload?.startOffset !== undefined && prev.persistPayload?.endOffset !== undefined && onPersistExplain) {
        onPersistExplain({
          messageId: prev.persistPayload.messageId,
          startOffset: prev.persistPayload.startOffset,
          endOffset: prev.persistPayload.endOffset,
          explanation: prev.explanation,
        })
        removeSelectionHighlight()
      }
      return { open: false, rect: null, selectedText: '', explanation: null, loading: false, persistPayload: null }
    })
  }, [onPersistExplain, removeSelectionHighlight])

  const handleAskFollowUp = useCallback(
    (selectedTextFromExplain: string, question: string) => {
      onAsk?.(selectedTextFromExplain, question, messages, null, null)
      setExplainPopoverState((prev) => ({ ...prev, open: false }))
    },
    [onAsk, messages]
  )

  const openExplainPopoverForCached = useCallback((rect: { left: number, top: number }, selectedText: string, explanation: string) => {
    setExplainPopoverState({
      open: true,
      rect: { ...rect },
      selectedText,
      explanation,
      loading: false,
      persistPayload: null,
    })
  }, [])

  const openExplainPopoverForCachedRef = useRef(openExplainPopoverForCached)
  useEffect(() => {
    openExplainPopoverForCachedRef.current = openExplainPopoverForCached
  }, [openExplainPopoverForCached])

  useImperativeHandle(ref, () => ({
    focusInput: () => inputRef.current?.focus(),
  }))

  const appliedPersistedHighlightRef = useRef<string | null>(null)
  useEffect(() => {
    const { messageId, startOffset, endOffset, color, highlightId, sourceNodeId } = persistedHighlight ?? {}
    if (!messageId || typeof startOffset !== 'number' || typeof endOffset !== 'number' || startOffset >= endOffset || !color) return
    // Only apply if this highlight belongs to this node (identified by sourceNodeId, or legacy payloads without it)
    if (sourceNodeId != null && sourceNodeId !== nodeId) return
    const appliedKey = highlightId ?? messageId
    const tryApply = () => {
      const container = messagesContainerRef.current
      if (!container) return false
      const msgEl = container.querySelector(`[data-message-id="${messageId}"]`)
      if (!msgEl) return false
      const bodyEl = msgEl.querySelector(`[data-message-body="${messageId}"]`) || msgEl
      if (appliedPersistedHighlightRef.current === appliedKey) return true
      const fullLen = (bodyEl.textContent || '').length
      if (endOffset > fullLen) return false
      const walker = document.createTreeWalker(bodyEl, NodeFilter.SHOW_TEXT)
      let charIndex = 0
      let startNode = null
      let startOff = 0
      let endNode = null
      let endOff = 0
      let node
      while ((node = walker.nextNode())) {
        const len = node.textContent?.length ?? 0
        if (startNode == null && charIndex + len > startOffset) {
          startNode = node
          startOff = startOffset - charIndex
        }
        if (endNode == null && charIndex + len >= endOffset) {
          endNode = node
          endOff = endOffset - charIndex
          break
        }
        charIndex += len
      }
      if (!startNode || !endNode) return false
      const range = document.createRange()
      range.setStart(startNode, startOff)
      range.setEnd(endNode, endOff)
      const span = document.createElement('span')
      span.className = 'selection-highlight'
      span.setAttribute('data-selection-highlight', '')
      span.setAttribute('data-message-id', messageId)
      if (highlightId) span.setAttribute('data-highlight-id', highlightId)
      span.style.backgroundColor = color
      try {
        range.surroundContents(span)
        selectionHighlightRef.current = span
        preserveHighlightRef.current = true
        appliedPersistedHighlightRef.current = appliedKey
        return true
      } catch {
        return false
      }
    }
    if (tryApply()) return
    const delays = [50, 200, 500, 1200]
    const timeouts = delays.map((delay) => setTimeout(() => tryApply(), delay))
    return () => timeouts.forEach((t) => clearTimeout(t))
  }, [persistedHighlight, messages, nodeId])

  const applyExplainedSpans = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || !explainedSelections?.length) return
    explainedSelections.forEach((item) => {
      const { messageId, startOffset, endOffset, explanation } = item
      if (!messageId || typeof startOffset !== 'number' || typeof endOffset !== 'number' || startOffset >= endOffset || !explanation) return
      const key = `${messageId}-${startOffset}-${endOffset}`
      const msgEl = container.querySelector(`[data-message-id="${messageId}"]`)
      if (!msgEl) return
      const bodyEl = msgEl.querySelector(`[data-message-body="${messageId}"]`) || msgEl
      if ((bodyEl as HTMLElement).querySelector(`[data-explained-key="${key}"]`)) return
      const fullLen = (bodyEl.textContent || '').length
      if (endOffset > fullLen) return
      const walker = document.createTreeWalker(bodyEl, NodeFilter.SHOW_TEXT)
      let charIndex = 0
      let startNode = null
      let startOff = 0
      let endNode = null
      let endOff = 0
      let node
      while ((node = walker.nextNode())) {
        const len = node.textContent?.length ?? 0
        if (startNode == null && charIndex + len > startOffset) {
          startNode = node
          startOff = startOffset - charIndex
        }
        if (endNode == null && charIndex + len >= endOffset) {
          endNode = node
          endOff = endOffset - charIndex
          break
        }
        charIndex += len
      }
      if (!startNode || !endNode) return
      const range = document.createRange()
      range.setStart(startNode, startOff)
      range.setEnd(endNode, endOff)
      const span = document.createElement('span')
      span.className = 'explained-trigger'
      span.setAttribute('data-explained-key', key)
      span.setAttribute('data-explained', '')
      span.setAttribute('role', 'button')
      span.setAttribute('tabIndex', '0')
      try {
        range.surroundContents(span)
        span.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          const rect = span.getBoundingClientRect()
          openExplainPopoverForCachedRef.current(
            { left: rect.left, top: rect.bottom + 4 },
            span.textContent || '',
            explanation
          )
        })
      } catch {
        // ignore
      }
    })
  }, [explainedSelections])

  useEffect(() => {
    if (!explainedSelections?.length) return
    const container = messagesContainerRef.current
    if (!container) return
    const runApply = () => applyExplainedSpans()
    runApply()
    const delays = [50, 200, 500, 1200]
    const timeouts = delays.map((d) => setTimeout(runApply, d))
    let debounceId: NodeJS.Timeout | null = null
    const observer = new MutationObserver(() => {
      if (debounceId) clearTimeout(debounceId)
      debounceId = setTimeout(runApply, 80)
    })
    observer.observe(container, { childList: true, subtree: true })
    return () => {
      timeouts.forEach((t) => clearTimeout(t))
      if (debounceId) clearTimeout(debounceId)
      observer.disconnect()
    }
  }, [explainedSelections, messages, applyExplainedSpans])

  useEffect(() => {
    if (persistedHighlight != null) return
    if (selectionHighlightRef.current) {
      removeSelectionHighlight()
      appliedPersistedHighlightRef.current = null
      preserveHighlightRef.current = false
    }
  }, [persistedHighlight, removeSelectionHighlight])

  const [prevDraft, setPrevDraft] = useState(draft)
  if (draft !== prevDraft) {
    setPrevDraft(draft)
    const next = draft ?? ''
    setInputValue(next)
    setSelectionStart(next.length)
  }

  useEffect(() => {
    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current)
      }
    }
  }, [nodeId, draft])

  useEffect(() => {
    if (!nodeId || nodeId !== lastAddedNodeId) return

    const timeoutId = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
      setLastAddedNodeId(null)
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [nodeId, lastAddedNodeId, setLastAddedNodeId])

  useEffect(() => {
    if (!scrollToHighlightTrigger) return
    const container = messagesContainerRef.current
    if (!container) {
      onScrollToHighlightDone?.()
      return
    }
    let cancelled = false
    const timeouts: NodeJS.Timeout[] = []
    const scrollToHighlight = (attempt = 0) => {
      if (cancelled) return
      const highlightId = persistedHighlight?.highlightId
      const span =
        selectionHighlightRef.current ||
        (highlightId ? container.querySelector(`[data-highlight-id="${highlightId}"]`) : null) ||
        container.querySelector('[data-selection-highlight]')
      if (!span || !container.contains(span)) {
        if (attempt < 5) {
          const t = setTimeout(() => scrollToHighlight(attempt + 1), 100 * (attempt + 1))
          timeouts.push(t)
        } else {
          onScrollToHighlightDone?.()
        }
        return
      }
      requestAnimationFrame(() => {
        if (cancelled) return
        const containerRect = container.getBoundingClientRect()
        const spanRect = span.getBoundingClientRect()
        const spanTopInContent = container.scrollTop + (spanRect.top - containerRect.top)
        const spanHeight = span.offsetHeight
        const containerHeight = container.clientHeight
        const scrollTop = Math.max(0, spanTopInContent - containerHeight / 2 + spanHeight / 2)
        container.scrollTo({ top: scrollTop, behavior: 'auto' })
        onScrollToHighlightDone?.()
      })
    }
    const id = setTimeout(() => scrollToHighlight(0), 10)
    return () => {
      cancelled = true
      clearTimeout(id)
      timeouts.forEach(clearTimeout)
    }
  }, [scrollToHighlightTrigger, onScrollToHighlightDone, persistedHighlight])

  useEffect(() => {
    if (messages.some((m) => m.role === 'user')) {
      const scrollToEndOfQuestion = () => {
        const container = messagesContainerRef.current
        const el = lastUserMessageRef.current
        if (!container || !el || !container.contains(el)) return
        const bodyEl = el.querySelector('[data-message-body]')
        const target = bodyEl || el
        const targetRect = target.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const bottomOffsetInView = targetRect.bottom - containerRect.top
        const newScrollTop = container.scrollTop + bottomOffsetInView - 8
        container.scrollTop = Math.max(0, newScrollTop)
      }
      requestAnimationFrame(() => requestAnimationFrame(scrollToEndOfQuestion))
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingMessageId) return
    const text = inputValue.trim()
    const formatOnly = !text && responseFormatRequest
    if (text || formatOnly) {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current)
        draftSaveTimeoutRef.current = null
      }
      const options = responseFormatRequest
        ? { responseFormat: responseFormatRequest }
        : undefined
      onSend(text, options)
      setInputValue('')
      setResponseFormatRequest(null)
      onDraftChange?.('')
    }
  }

  const startEdit = useCallback((msg: Message) => {
    setEditingMessageId(msg.id)
    setEditValue(msg.text ?? '')
    onDraftChange?.('')
  }, [onDraftChange])

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null)
    setEditValue('')
    inputRef.current?.focus()
  }, [])
  if (editingMessageId && (selectionState.rect !== null || selectionState.text !== '')) {
    setSelectionState({ rect: null, text: '' })
  }

  useEffect(() => {
    if (editingMessageId) {
      selectionStateRef.current = { rect: null, text: '' }
      removeSelectionHighlight()
      requestAnimationFrame(() => inlineEditRef.current?.focus())
    }
  }, [editingMessageId, removeSelectionHighlight])

  const isEmpty = messages.length === 0
  const isSubmitting = messages.some((m) => m.role === 'assistant' && m.text === '…')

  const lastAssistantIdx = useMemo(
    () => messages.reduce((acc, m, i) => (m.role === 'assistant' ? i : acc), -1),
    [messages]
  )

  const tokenQuotaErrorMessage = useMemo(
    () =>
      messages.find(
        (m) =>
          m.role === 'assistant' &&
          (m.errorCode === 'TOKEN_QUOTA_EXCEEDED' ||
            m.text?.includes('Rate limit exceeded'))
      ),
    [messages]
  )
  const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null)
  const hasAutoRetriedRef = useRef(false)
  const onRetryRef = useRef(onRetry)
  useEffect(() => {
    onRetryRef.current = onRetry
  }, [onRetry])

  useEffect(() => {
    if (!tokenQuotaErrorMessage || hasAutoRetriedRef.current) {
      if (autoRetryCountdown !== null) {
        const timer = setTimeout(() => setAutoRetryCountdown(null), 0)
        return () => clearTimeout(timer)
      }
      return
    }
    const setupTimer = setTimeout(() => setAutoRetryCountdown(5), 0)
    const id = setInterval(() => {
      setAutoRetryCountdown((prev) => {
        if (prev === null || prev <= 0) return prev
        if (prev === 1) {
          clearInterval(id)
          onRetryRef.current?.()
          hasAutoRetriedRef.current = true
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      clearTimeout(setupTimer)
      clearInterval(id)
    }
  }, [tokenQuotaErrorMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      const start = e.target.selectionStart ?? value.length
      setInputValue(value)
      setSelectionStart(start)

      const textBeforeCursor = value.slice(0, start)
      const match = textBeforeCursor.match(/@([^\s]*)$/)
      if (match) {
        const filter = match[1]
        const anchorStart = start - filter.length - 1
        setMentionState({ active: true, filter, anchorStart })
        setMentionHighlightIndex(0)
      } else {
        setMentionState((prev) => (prev.active ? { ...prev, active: false } : prev))
      }

      if (nodeId && onDraftChange) {
        if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current)
        draftSaveTimeoutRef.current = setTimeout(() => {
          onDraftChange(value)
          draftSaveTimeoutRef.current = null
        }, 300)
      }
    },
    [nodeId, onDraftChange]
  )

  const applyMentionSelection = useCallback(
    (option: MentionOption) => {
      const textarea = inputRef.current
      if (!textarea || !mentionState.active) return
      const start = mentionState.anchorStart
      const end = textarea.selectionStart ?? start
      const before = inputValue.slice(0, start)
      const after = inputValue.slice(end)
      const newValue = before + after
      setInputValue(newValue)
      onDraftChange?.(newValue)
      setMentionState({ active: false, filter: '', anchorStart: 0 })
      if (option.type === 'format') {
        setResponseFormatRequest(option.id)
      } else if (option.type === 'all') {
        onMentionSelectAll?.()
      } else {
        onMentionSelect?.(option.id)
      }
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(before.length, before.length)
      })
    },
    [inputValue, mentionState, onMentionSelect, onMentionSelectAll, onDraftChange]
  )

  const closeMentionDropdown = useCallback(() => {
    setMentionState((prev) => (prev.active ? { ...prev, active: false } : prev))
  }, [])

  const acceptWordSuggestion = useCallback(() => {
    if (!wordSuggestion) return
    const beforeCursor = inputValue.slice(0, selectionStart)
    const match = beforeCursor.match(/(\S*)$/)
    const fragment = match ? match[1] : ''
    const beforeFragment = inputValue.slice(0, selectionStart - fragment.length)
    const afterCursor = inputValue.slice(selectionStart)
    const newValue = beforeFragment + wordSuggestion + afterCursor
    const newCursor = beforeFragment.length + wordSuggestion.length
    setInputValue(newValue)
    setSelectionStart(newCursor)
    if (nodeId && onDraftChange) {
      if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current)
      draftSaveTimeoutRef.current = setTimeout(() => {
        onDraftChange(newValue)
        draftSaveTimeoutRef.current = null
      }, 300)
    }
    requestAnimationFrame(() => {
      const ta = inputRef.current
      if (ta) ta.setSelectionRange(newCursor, newCursor)
    })
  }, [wordSuggestion, inputValue, selectionStart, nodeId, onDraftChange])

  return (
    <div
      ref={chatWindowRef}
      tabIndex={-1}
      className={`chat-window flex flex-col ${isEmpty ? 'h-auto' : 'h-full min-h-0'}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {!isEmpty && (
        <div
          ref={messagesContainerRef}
          tabIndex={-1}
          className={`cursor-text select-text flex-1 overflow-y-auto overscroll-contain min-h-0 px-6 pb-96 py-6 space-y-5 relative ${isFocused || nodeSelected ? 'nowheel' : ''}`}
          onMouseUp={handleMouseUp}
        >
          {messages.map((msg, idx) => {
            return (
              <div
                key={msg.id}
                data-message-id={msg.id}
                data-is-last-user={msg.role === 'user' && idx === lastUserMessageIdx}
                ref={(el) => {
                  if (msg.role === 'user' && idx === lastUserMessageIdx) {
                    lastUserMessageRef.current = el
                  }
                }}
                className="flex flex-col gap-1"
              >
                {msg.role === 'user' && (
                  <div className="flex flex-col gap-1">
                    <UserMessageBubble
                      msg={msg}
                      isEditing={editingMessageId === msg.id}
                      editValue={editValue}
                      onEditChange={setEditValue}
                      onStartEdit={startEdit}
                      onSave={(trimmed) => {
                        if (editingMessageId && trimmed) {
                          onEditAndResend?.(editingMessageId, trimmed)
                          setEditingMessageId(null)
                          setEditValue('')
                          inputRef.current?.focus()
                        }
                      }}
                      onCancel={cancelEdit}
                      editInputRef={inlineEditRef as React.RefObject<HTMLTextAreaElement>}
                      showEditButton={!!onEditAndResend}
                      className="flex flex-col gap-1"
                      selectedTextAbove={idx === firstUserMessageIdx && selectedText ? selectedText : null}
                      selectionHighlightColor={idx === firstUserMessageIdx && selectedText ? selectionHighlightColor : null}
                    />
                  </div>
                )}
                {msg.role === 'assistant' && (
                  <>
                    {(msg.errorCode === 'TOKEN_QUOTA_EXCEEDED' ||
                      msg.text?.includes('Rate limit exceeded')) ? (
                      <div className="chat-rate-limit-error mr-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 px-4 py-3 flex flex-col gap-3">
                        <p className="text-black/80 dark:text-white/80 m-0">
                          {msg.text}
                        </p>
                        {onRetry && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {autoRetryCountdown !== null && (
                              <span className="text-amber-800 dark:text-amber-200 text-sm">
                                {autoRetryCountdown > 0
                                  ? `Retrying in ${autoRetryCountdown} second${autoRetryCountdown === 1 ? '' : 's'}…`
                                  : 'Retrying now…'}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={onRetry}
                              className="px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-900 dark:text-amber-100 text-sm font-medium transition-colors"
                            >
                              Retry
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="mr-4 ml-0 text-black dark:text-white">
                          {msg.text === '…' ? (
                            <AssistantThinkingMessage />
                          ) : (
                            <AssistantMessageBlock
                              msg={msg}
                              idx={idx}
                              lastAssistantIdx={lastAssistantIdx}
                              seenAnimatedIdsRef={seenAnimatedIdsRef}
                            />
                          )}
                        </div>
                        {lastAssistantIdx === idx &&
                          msg.text !== '…' &&
                          onRetry && (
                            <div className="self-start mt-1 flex items-center gap-0.5">
                              <Tooltip.Root delayDuration={300}>
                                <Tooltip.Trigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(msg.text ?? '')
                                      setCopiedMessageId(msg.id)
                                      setTimeout(() => setCopiedMessageId(null), 1500)
                                    }}
                                    className="aspect-square size-10 flex items-center justify-center rounded-lg text-black/50 hover:text-black hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10"
                                    aria-label="Copy message"
                                  >
                                    {copiedMessageId === msg.id ? (
                                      <MaterialIcon name="check" />
                                    ) : (
                                      <MaterialIcon name="content_copy" />
                                    )}
                                  </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                  <Tooltip.Content side="top" sideOffset={6} className="z-9999 rounded-md bg-black dark:bg-black/90 px-2.5 py-1.5 text-xs text-white shadow-lg">
                                    {copiedMessageId === msg.id ? 'Copied!' : 'Copy message'}
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                              <Tooltip.Root delayDuration={300}>
                                <Tooltip.Trigger asChild>
                                  <button
                                    type="button"
                                    onClick={onRetry}
                                    className="aspect-square size-10 flex items-center justify-center rounded-lg text-black/50 hover:text-black hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10"
                                    aria-label="Retry"
                                  >
                                    <MaterialIcon name="refresh" />
                                  </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                  <Tooltip.Content side="top" sideOffset={6} className="z-9999 rounded-md bg-black dark:bg-black/90 px-2.5 py-1.5 text-xs text-white shadow-lg">
                                    Retry
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              </Tooltip.Root>
                            </div>
                          )}
                      </>
                    )}
                  </>
                )}
              </div>
            )
          })}
          <SelectionPopup
            rect={explainPopoverState.open ? explainPopoverState.rect : selectionState.rect}
            open={
              (selectionState.rect && !!selectionState.text?.trim()) ||
              explainPopoverState.open
            }
            selectedText={
              explainPopoverState.open ? explainPopoverState.selectedText : selectionState.text
            }
            onExplain={handleExplain}
            onAsk={handleAsk}
            onClose={clearSelection}
            onApplyHighlight={applySelectionHighlight}
            explainMode={
              explainPopoverState.open
                ? {
                    explanation: explainPopoverState.explanation,
                    loading: explainPopoverState.loading,
                    selectedText: explainPopoverState.selectedText,
                  }
                : null
            }
            onExplainClose={handleExplainPopoverClose}
            onAskFollowUp={handleAskFollowUp}
          />
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        tabIndex={-1}
        className="nodrag"
      >
        {(mentionedNodes.length > 0 || responseFormatRequest) && (
          <div className="flex flex-wrap gap-1.5 px-1 pb-2 items-center">
            {mentionedNodes.map((n) => (
              <span
                key={n.id}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-black/5 dark:bg-white/10 text-black/80 dark:text-white/90 text-sm"
              >
                <span className="truncate max-w-30">{n.title || '(Untitled)'}</span>
                <button
                  type="button"
                  onClick={() => onRemoveMention?.(n.id)}
                  className="shrink-0 aspect-square size-6 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/20 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
                  aria-label={`Remove ${n.title || 'untitled'} from context`}
                >
                  <MaterialIcon name="close" />
                </button>
              </span>
            ))}
            {responseFormatRequest && (
              <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm">
                <span>
                  {responseFormatRequest === 'list'
                    ? 'List'
                    : responseFormatRequest === 'table'
                      ? 'Table'
                      : 'One line'}
                </span>
                <button
                  type="button"
                  onClick={() => setResponseFormatRequest(null)}
                  className="shrink-0 aspect-square size-6 flex items-center justify-center rounded-full hover:bg-amber-200 dark:hover:bg-amber-800/60 text-amber-600 dark:text-amber-300"
                  aria-label="Clear response format"
                >
                  <MaterialIcon name="close" />
                </button>
              </span>
            )}
          </div>
        )}
        <div className="chat-input-group relative z-10 rounded-xl overflow-hidden bg-white/5 dark:bg-white/5 border border-black/10 dark:border-white/20">
          {mentionState.active && mentionOptions.length > 0 && (
            <div className="flex flex-col border-b border-black/10 dark:border-white/20 bg-white dark:bg-black/95 max-h-72 overflow-y-auto">
              {linkOptions.length > 0 && (
                <>
                  <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-black/40 dark:text-white/40">
                    Link to note
                  </p>
                  <div className="py-1">
                    {linkOptions.map((option, idx) => (
                      <button
                        key={`link-${option.id}`}
                        ref={(el) => { mentionItemRefs.current[idx] = el }}
                        type="button"
                        onClick={() => applyMentionSelection(option)}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${idx === mentionHighlightIndex
                          ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white'
                          : 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
                          }`}
                      >
                        <MaterialIcon
                          name={option.type === 'all' ? 'hub' : 'note'}
                          className="shrink-0 size-4 text-black/40 dark:text-white/40"
                        />
                        <span className="truncate">
                          {option.type === 'all' ? 'All notes' : (option.title || '(Untitled)')}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {filteredFormatOptions.length > 0 && (
                <>
                  <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-black/40 dark:text-white/40">
                    Response format
                  </p>
                  <div className="py-1">
                    {filteredFormatOptions.map((option, idx) => {
                      const flatIdx = linkOptions.length + idx
                      return (
                        <button
                          key={`format-${option.id}`}
                          ref={(el) => { mentionItemRefs.current[flatIdx] = el }}
                          type="button"
                          onClick={() => applyMentionSelection(option)}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${flatIdx === mentionHighlightIndex
                            ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white'
                            : 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
                            }`}
                        >
                          <MaterialIcon
                            name={option.id === 'list' ? 'format_list_bulleted' : option.id === 'table' ? 'table_chart' : 'wrap_text'}
                            className="shrink-0 size-4 text-black/40 dark:text-white/40"
                          />
                          <span className="truncate">{option.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
          <div className="relative overflow-hidden">
            {suggestionSuffix && !editingMessageId && (
              <div
                className="absolute inset-0 pl-3 pr-24 py-3 text-[16px] whitespace-pre-wrap break-words pointer-events-none overflow-hidden text-transparent font-inherit leading-normal"
                aria-hidden
              >
                <span className="text-transparent">{inputValue.slice(0, selectionStart)}</span>
                <span className="text-black/30 dark:text-white/30">
                  {suggestionSuffix}
                </span>
                <span className="text-transparent">{inputValue.slice(selectionStart)}</span>
              </div>
            )}
            <TextareaAutosize
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onSelect={(e: React.SyntheticEvent<HTMLTextAreaElement>) => {
                const target = e.target as HTMLTextAreaElement
                setSelectionStart(target.selectionStart ?? 0)
              }}
              placeholder={editingMessageId ? 'Editing above...' : 'Type a message...'}
              minRows={3}
              maxRows={8}
              disabled={!!editingMessageId}
              className="block w-full resize-none rounded-none border-0 pl-3 pr-24 py-3 text-[16px] bg-transparent text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 disabled:opacity-60 disabled:cursor-not-allowed focus:ring-0 focus:outline-none relative z-[1]"
              spellCheck={false}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === 'Tab' && !mentionState.active && wordSuggestion) {
                  e.preventDefault()
                  acceptWordSuggestion()
                  return
                }
                if (mentionState.active) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setMentionHighlightIndex((i) =>
                      i < mentionOptions.length - 1 ? i + 1 : 0
                    )
                    return
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setMentionHighlightIndex((i) =>
                      i > 0 ? i - 1 : mentionOptions.length - 1
                    )
                    return
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const option = mentionOptions[mentionHighlightIndex]
                    if (option) applyMentionSelection(option)
                    return
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    closeMentionDropdown()
                    return
                  }
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {!editingMessageId && (inputValue.trim() || responseFormatRequest) ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="aspect-square size-11 flex items-center justify-center rounded-full bg-black dark:bg-white/20 text-white font-medium hover:bg-black/80 dark:hover:bg-white/30 transition-colors select-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-black dark:disabled:hover:bg-white/20"
                  aria-label="Send"
                >
                  <MaterialIcon name="north" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
})

export default memo(ChatWindow)
