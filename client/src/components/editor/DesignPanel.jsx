import ResumeStylePresets from './ResumeStylePresets'
import ResumeDocumentSettings from './ResumeDocumentSettings'
import ResumeTemplateCard from './ResumeTemplateCard'
import ResumeLayoutCard from './ResumeLayoutCard'
import ResumeSizeSpacingCards from './ResumeSizeSpacingCards'
import ResumeEntryLayoutCard from './ResumeEntryLayoutCard'
import ResumeHeadingFontCards from './ResumeHeadingFontCards'
import ResumeColorsCard from './ResumeColorsCard'
import ResumeHeaderPhotoCards from './ResumeHeaderPhotoCards'
import ResumeLinksFooterCards from './ResumeLinksFooterCards'
import { DesignHistory } from './DesignStartingPoints'
import { useState } from 'react'
import DesignTemplatePicker from './DesignTemplatePicker'
import ResumeCustomizationGroups from './ResumeCustomizationGroups'
import ResumeSectionDesigns from './ResumeSectionDesigns'
import { getDesign } from '../../lib/resumeDesign'
import { resumeTemplates } from '../resumeTemplates'
export default function DesignPanel({ profile, onEditPersonal, design, onChange, templateId, onTemplateChange, styleHistory, customizationTab, onCustomizationTabChange, selectedSection, onSelectSection }) {
  const [picker, setPicker] = useState(false)
  return (
    <>
      <div className="sr-only">
        <h1 className="mt-2 text-2xl font-semibold">Design</h1>
      </div>
    <div className="editor-panel-body mx-auto w-full max-w-2xl space-y-4 px-4 py-7 lg:px-8">
      <div className="resume-design-groups">
      {styleHistory && <DesignHistory {...styleHistory} />}
      <ResumeCustomizationGroups value={customizationTab} onChange={onCustomizationTabChange} sections={<ResumeSectionDesigns profile={profile} design={design} onChange={onChange} selected={selectedSection} onSelect={onSelectSection} />}>
      <ResumeDocumentSettings design={design} onChange={onChange} template={resumeTemplates.find((item) => item.id === templateId)} />
      <ResumeTemplateCard profile={profile} templateId={templateId} onBrowse={() => setPicker(true)} />
      <ResumeStylePresets design={design} template={resumeTemplates.find(item => item.id === templateId)} onChange={onChange} />
      {picker && <DesignTemplatePicker profile={profile} selected={templateId} onSelect={onTemplateChange} onClose={() => setPicker(false)} />}
      <ResumeLayoutCard profile={profile} design={design} onChange={onChange} template={resumeTemplates.find((item) => item.id === templateId)} />
      <ResumeSizeSpacingCards design={design} onChange={onChange} template={resumeTemplates.find((item) => item.id === templateId)} />
      <ResumeEntryLayoutCard design={design} onChange={onChange} template={resumeTemplates.find((item) => item.id === templateId)} />
      <ResumeHeadingFontCards design={design} onChange={onChange} template={resumeTemplates.find((item) => item.id === templateId)} />
      <ResumeColorsCard design={design} onChange={onChange} template={resumeTemplates.find((item) => item.id === templateId)} />
      <ResumeHeaderPhotoCards personal={profile.personal} onEditPersonal={onEditPersonal} design={design} onChange={onChange} template={resumeTemplates.find((item) => item.id === templateId)} />
      <ResumeLinksFooterCards design={design} onChange={onChange} />
      </ResumeCustomizationGroups>
      <button
        type="button"
        onClick={() => onChange(getDesign(resumeTemplates.find((item) => item.id === templateId)?.defaults))}
        className="min-h-11 rounded-md border border-line bg-white px-4 text-sm font-medium"
      >
        Reset design settings
      </button>
      </div>
    </div>
    </>
  )
}
