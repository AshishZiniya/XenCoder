/**
 * Parse, validate, and sanitize SVG content for safe rendering.
 * Returns sanitized SVG string or null if invalid/unsafe.
 */
export function parseAndSanitizeSvg(input: string | null | undefined): string | null {
  if (typeof input !== 'string' || !input.trim()) return null

  const trimmed = input.trim()

  // Must look like SVG (starts with <svg or has svg root)
  if (!/<\s*svg[\s>]/i.test(trimmed)) return null

  let doc: Document
  try {
    const parser = new DOMParser()
    doc = parser.parseFromString(trimmed, 'image/svg+xml')
  } catch {
    return null
  }

  const svg = doc.documentElement
  if (!svg || svg.tagName?.toLowerCase() !== 'svg') return null

  // Parse errors: DOMParser may put error content in the document
  const parseError = doc.querySelector('parsererror')
  if (parseError) return null

  // Sanitize: remove dangerous elements and attributes
  const walk = (el: Element) => {
    if (!el || !el.nodeType) return

    // Remove script and style (style can contain expression/behavior in some contexts)
    const tag = el.tagName?.toLowerCase()
    if (tag === 'script' || tag === 'object' || tag === 'embed' || tag === 'iframe') {
      el.remove()
      return
    }

    // Remove event handler attributes
    for (const attr of [...(el.attributes || [])]) {
      const name = attr.name?.toLowerCase()
      if (name.startsWith('on') && name.length > 2) {
        el.removeAttribute(attr.name)
      }
      // Remove javascript: URLs from href-like attributes
      if (['href', 'xlink:href'].includes(name)) {
        const val = (attr.value || '').trim().toLowerCase()
        if (val.startsWith('javascript:')) {
          el.removeAttribute(attr.name)
        }
      }
    }

    for (const child of [...el.childNodes]) {
      if (child.nodeType === 1) walk(child as Element)
    }
  }
  walk(svg)

  return svg.outerHTML
}
