import React, { memo, useState, useEffect, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { useTypewriter } from '../../hooks/useTypewriter'

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  content?: string;
  errorCode?: string;
}

interface AssistantMessageProps {
  msg: Message;
  seenAnimatedIdsRef: React.MutableRefObject<Set<string>>;
  idx: number;
  lastAssistantIdx: number;
}

function P5SketchBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])

  const P5_CDN_URL = 'https://cdn.jsdelivr.net/npm/p5@1.7.0/lib/p5.min.js'
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

function CodeBlock({ children, ...props }: { children?: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const getCodeText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node
    if (node == null) return ''
    if (Array.isArray(node)) return node.map(getCodeText).join('')
    if (React.isValidElement(node) && node.props && typeof node.props === 'object' && 'children' in node.props) {
      return getCodeText((node.props as { children?: React.ReactNode }).children as React.ReactNode)
    }
    return String(node ?? '')
  }

  const codeText = getCodeText(children)
  const classNames = React.isValidElement(children) && children.props && typeof children.props === 'object' && 'className' in children.props 
    ? (children.props as { className?: string }).className 
    : undefined
  const lang =
    Array.isArray(classNames)
      ? classNames.find((c) => typeof c === 'string' && c.startsWith('language-'))
      : typeof classNames === 'string' && classNames.startsWith('language-')
        ? classNames
        : null
  const langStr = typeof lang === 'string' ? lang.replace('language-', '') : ''

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [codeText])

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
              {copied ? '✓' : '📋'}
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
            onClick={handleCopy}
            className="markdown-control-btn markdown-copy-btn"
            aria-label="Copy code"
            title="Copy code"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  )
}

const AssistantMessageContent = memo(function AssistantMessageContent({ 
  text, 
  animate, 
  onAnimateComplete 
}: { 
  text: string, 
  animate: boolean, 
  onAnimateComplete: () => void 
}) {
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

function AssistantThinkingMessage() {
  const options = ['Hmm...', 'Umm...', 'So...']
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

const AssistantMessageBlock = memo(function AssistantMessageBlock({
  msg,
  seenAnimatedIdsRef,
  idx,
  lastAssistantIdx,
}: AssistantMessageProps) {
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

  if (msg.text === '…') {
    return (
      <div className="markdown-content" data-message-body={msg.id}>
        <AssistantThinkingMessage />
      </div>
    )
  }

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

export default AssistantMessageBlock
