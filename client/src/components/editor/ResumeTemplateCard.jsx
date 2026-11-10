import Icon from '../Icon'
import ResumePreview from '../ResumePreview'
import { resumeTemplates, selectableResumeTemplates } from '../resumeTemplates'

export default function ResumeTemplateCard({ profile, templateId, onBrowse }) {
  const selected = resumeTemplates.find((item) => item.id === templateId) || selectableResumeTemplates[0]
  const previews = [selected, ...selectableResumeTemplates.filter((item) => item.id !== selected.id)].slice(0, 3)
  return <section data-design-group="templates" className="resume-design-card design-template-row resume-template-card" aria-labelledby="resume-templates-title">
    <div className="resume-design-card-heading"><h2 id="resume-templates-title">Templates</h2></div>
    <div className="resume-template-montage" aria-hidden="true" inert>
      {previews.map((template) => <div key={template.id} className="template-thumbnail">
        <div className="thumbnail-sheet absolute top-0 left-0"><ResumePreview profile={{ ...profile, design:undefined }} template={template} /></div>
      </div>)}
    </div>
    <div className="resume-template-card-footer">
      <span className="resume-template-current"><Icon name="check" className="h-4 w-4" /><span>{selected.name}</span></span>
      <button type="button" onClick={onBrowse} className="resume-template-browse"><Icon name="grid" className="h-4 w-4" /><span>Browse templates</span></button>
    </div>
  </section>
}
