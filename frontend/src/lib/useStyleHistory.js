import { useCallback, useState } from 'react'

export default function useStyleHistory(initial, keys) {
  const [history, setHistory] = useState(() => ({ past: [], present: typeof initial === 'function' ? initial() : initial, future: [] }))
  const project = useCallback((value) => keys ? Object.fromEntries(keys.map((key) => [key, value[key]])) : value, [keys])
  const restore = (current, snapshot) => keys ? { ...current, ...project(snapshot) } : snapshot
  const set = useCallback((value) => {
    setHistory((current) => {
      const next = typeof value === 'function' ? value(current.present) : value
      if (JSON.stringify(project(next)) === JSON.stringify(project(current.present))) return { ...current, present: next }
      return { past: [...current.past, current.present].slice(-50), present: next, future: [] }
    })
  }, [project])
  function undo() {
    setHistory((current) => current.past.length ? { past: current.past.slice(0, -1), present: restore(current.present, current.past.at(-1)), future: [current.present, ...current.future] } : current)
  }
  function redo() {
    setHistory((current) => current.future.length ? { past: [...current.past, current.present], present: restore(current.present, current.future[0]), future: current.future.slice(1) } : current)
  }
  return [history.present, set, { undo, redo, canUndo: !!history.past.length, canRedo: !!history.future.length }]
}
