import { lazy } from 'react'
import EntrySection from './EntrySection'
import { summaryText, textDocument } from '../../lib/summary'
const SummaryEditor = lazy(() => import('./SummaryEditor'))

export default function SummarySection({ summary, onChange, onEditingChange, onRemove, editEntryId }) {
  return (
    <EntrySection
      editEntryId={editEntryId}
      onRemove={onRemove}
      section={summary}
      onChange={onChange}
      onEditingChange={onEditingChange}
      EntryEditor={SummaryEditor}
      createEntry={() => ({
        id: crypto.randomUUID(),
        visible: true,
        content: textDocument(),
      })}
      entryLabel={(entry) =>
        summaryText(entry.content).trim() || 'Write your professional summary…'
      }
      kind="summary"
      icon="file"
    />
  )
}
