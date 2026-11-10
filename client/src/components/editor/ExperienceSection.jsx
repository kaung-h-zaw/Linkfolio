import { lazy } from 'react'
import EntrySection from './EntrySection'
import { newExperience, experienceDate } from '../../lib/experience'
const ExperienceEditor = lazy(() => import('./ExperienceEditor'))

export default function ExperienceSection({
  experience,
  onChange,
  onEditingChange,
  onRemove,
  editEntryId,
}) {
  return (
    <EntrySection
      editEntryId={editEntryId}
      onRemove={onRemove}
      section={experience}
      onChange={onChange}
      onEditingChange={onEditingChange}
      EntryEditor={ExperienceEditor}
      createEntry={newExperience}
      entryLabel={(entry) => entry.jobTitle || 'Add your role…'}
      entryDescription={(entry) =>
        [
          entry.company,
          [
            experienceDate(entry.startDate),
            entry.current ? 'Present' : experienceDate(entry.endDate),
          ]
            .filter(Boolean)
            .join(' — '),
        ]
          .filter(Boolean)
          .join(' · ')
      }
      kind="experience"
      icon="briefcase"
    />
  )
}
