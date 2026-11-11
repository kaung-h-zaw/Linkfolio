// Editable Linkfolio adaptations of the six linked FlowCV gallery designs.
// The reference images were inspected; previews always render the user's own data.
const base = {
  fontSize:14, nameSize:30, lineHeight:1.35, margin:40, sectionGap:18,
  titleSize:18, headingSize:14, entrySize:14, entryGap:12,
  dateFormat:'short', header:'center', layout:'one', headings:'rule',
  accentName:false, accentTitle:false, accentHeadings:false,
  contactIcons:'plain', titleStyle:'italic', entryLayout:'columns',
  sectionStyles:{skills:{contentLayout:'list',rowBullets:true}},
}
const order = ['summary','experience','education','skills','projects','languages','certifications']
function template(id, name, category, description, slug, font, color, defaults = {}, extra = {}) {
  return {id, name, category, description, font, color, reference:id,
    source:{label:`FlowCV · ${name}`,url:`https://flowcv.com/resume-template/${slug}`},
    sectionOrder:order, searchablePdf:true, defaults:{...base,...defaults}, ...extra}
}
export const flowcvResumeTemplates = [
  template('flowcv-classic-serif','Classic Serif','Traditional',
    'Centered serif identity, bold black section rules, and a straightforward career history.',
    'classic-multi-column-serif-black-white','Georgia, serif','#151515',
    {margin:48,headings:'template',titleSize:19,headingSize:15}),
  template('flowcv-mercury-flow','Mercury Flow','Modern',
    'A pale grey photo header, centered section bands, and a left-hand date rail.',
    'classic-one-column-design-professionals','Georgia, serif','#484846',
    {header:'left',headings:'template',capitals:false,headerColor:'#e7e7e5',photoPosition:'left',photoSize:'xl',photoShape:'circle',metadataPosition:'left',contactArrangement:'columns',titleStyle:'normal',sectionGap:24,sectionStyles:{skills:{contentLayout:'columns',columns:3,rowBullets:true}}}, {photo:true}),
  template('flowcv-rose-letter','Rose Letter','Creative',
    'A soft rose page with a bold left-aligned name, stacked contacts, and a profile introduction.',
    'rose-letter','Arial, Helvetica, sans-serif','#222222',
    {header:'left',pageColor:'#fcf6f6',nameSize:36,titleSize:23,titleStyle:'normal',contactIcons:'none',contactArrangement:'stacked',capitals:false,headingCase:'capitalize',subtitlePlacement:'inline',sectionGap:22,sectionStyles:{summary:{summaryInHeader:true,hideHeading:true},skills:{contentLayout:'columns',columns:2,rowBullets:true}}}),
  template('flowcv-editorial-rule','Editorial Rule','Traditional',
    'An editorial serif layout with fine dividers, inline role details, and compact skill lists.',
    'editorial-rule','Georgia, serif','#151515',
    {margin:48,headings:'template',subtitlePlacement:'inline',sectionGap:24,sectionStyles:{skills:{contentLayout:'compact',compactSeparator:'pipe'},languages:{contentLayout:'compact',compactSeparator:'pipe'},certifications:{contentLayout:'compact',compactSeparator:'pipe'}}}),
  template('flowcv-precision-line','Precision Line','Compact',
    'Compact sans serif text, a navy name and rules, and multi-column skills for detailed resumes.',
    'precision-line','Arial, Helvetica, sans-serif','#153b4d',
    {fontSize:12,nameSize:29,margin:30,sectionGap:13,headingSize:12,entrySize:12,entryGap:8,lineHeight:1.25,accentName:true,accentHeadings:true,contactIcons:'none',subtitlePlacement:'inline',sectionStyles:{skills:{contentLayout:'columns',columns:4,rowBullets:true},languages:{contentLayout:'columns',columns:3},certifications:{contentLayout:'columns',columns:3,rowBullets:true}}}),
  template('flowcv-atlantic-blue','Atlantic Blue','Sidebar',
    'A deep blue identity sidebar with a portrait and profile beside a white career column.',
    'atlantic-blue-multi-column-sidebar-left','Georgia, serif','#193442',
    {layout:'template',header:'left',headings:'template',fontSize:13,nameSize:29,titleSize:20,entrySize:13,headingSize:13,headingIcons:'filled',contactArrangement:'stacked',photoSize:'xl',photoShape:'circle',entryLayout:'full',titleStyle:'normal',sectionGap:24}, {photo:true}),
]
