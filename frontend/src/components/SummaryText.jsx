import { Fragment } from 'react'
import { profileLinkHref } from '../lib/profileLinks'

// Render supported document nodes as React elements, never saved HTML.
function Node({ node }) {
  if (!node || typeof node !== 'object') return null
  if (node.type === 'text') {
    return (node.marks || []).reduce((text, mark, index) => {
      if (mark.type === 'bold') return <strong key={index}>{text}</strong>
      if (mark.type === 'italic') return <em key={index}>{text}</em>
      if (mark.type === 'underline') return <u key={index}>{text}</u>
      if (mark.type === 'link') {
        const href = profileLinkHref(mark.attrs?.href)
        return href ? (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : (
          text
        )
      }
      return text
    }, node.text || '')
  }
  const children = (node.content || []).map((child, index) => (
    <Node key={index} node={child} />
  ))
  if (node.type === 'hardBreak') return <br />
  if (node.type === 'paragraph')
    return (
      <p
        style={{
          textAlign: ['left', 'center', 'right', 'justify'].includes(
            node.attrs?.textAlign,
          )
            ? node.attrs.textAlign
            : undefined,
        }}
      >
        {children.length ? children : <br />}
      </p>
    )
  if (node.type === 'bulletList') return <ul>{children}</ul>
  if (node.type === 'orderedList') return <ol>{children}</ol>
  if (node.type === 'listItem') return <li>{children}</li>
  return <Fragment>{children}</Fragment>
}
export default function SummaryText({ content }) {
  return (
    <div className="summary-rich-text">
      <Node node={content} />
    </div>
  )
}
