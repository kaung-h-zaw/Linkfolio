import { flowcvResumeTemplates } from '../lib/flowcvResumeTemplates.js'
import { resumeTemplateIds } from '../lib/templateCatalog.js'
import { textDocument } from '../lib/summary'

// Linkfolio resume types, with source references retained for their design foundations.
const documentDefaults = {
  fontSize: 14, nameSize: 28, lineHeight: 1.35, sectionGap: 16,
  titleSize: 13, headingSize: 13, entrySize: 14, entryGap: 10,
  dateFormat: 'short', accentTitle: false, accentHeadings: false,
  entryLayout: 'columns',
}

// Stable IDs preserve saved resumes, template access, and existing links.
const legacyResumeTemplates = [
  {
    id:'classic', name:'Classic Resume', category:'Traditional', reference:'harvard',
    description:'Traditional serif typography, a centered name, and clear ruled sections.',
    color:'#222222', font:'"Times New Roman", Times, serif',
    source:{label:'Harvard Mignone Center for Career Success',url:'https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/'},
    sectionOrder:['summary','experience','education','projects','skills','certifications'],
    defaults:{...documentDefaults,header:'center'},
  },
  {
    id:'slate', name:'Modern Resume', category:'Modern', reference:'awesome',
    description:'A confident sans serif heading, crisp accent rules, and a balanced single column.',
    color:'#28647a', font:'Arial, Helvetica, sans-serif',
    source:{label:'Claud D. Park · Awesome CV',url:'https://github.com/posquit0/Awesome-CV'},
    sectionOrder:['summary','experience','projects','education','skills','certifications'],
    defaults:{...documentDefaults,header:'left',nameSize:34,accentName:true,accentTitle:true,accentHeadings:true,capitals:false,headings:'short'},
  },
  {
    id:'essential', name:'Minimal Resume', category:'Clean', reference:'mit',
    description:'A quiet text-first layout with generous spacing and understated headings.',
    color:'#30363c', font:'Arial, Helvetica, sans-serif',
    source:{label:'MIT Career Advising & Professional Development',url:'https://capd.mit.edu/resources/resumes/'},
    sectionOrder:['summary','experience','education','projects','skills','certifications'],
    defaults:{...documentDefaults,header:'left',nameSize:30,sectionGap:22,headings:'plain',capitals:false,contactIcons:'none'},
  },
  {
    id:'canvas', name:'Creative Resume', category:'Creative', reference:'alta', photo:true,
    description:'Expressive plum accents, an optional portrait, and an asymmetric two-column body.',
    color:'#753c64', font:'Arial, Helvetica, sans-serif',
    source:{label:'LianTze Lim · AltaCV',url:'https://github.com/liantze/AltaCV'},
    sectionOrder:['summary','experience','education','skills','projects','certifications'],
    defaults:{...documentDefaults,header:'left',fontSize:13,accentName:true,accentTitle:true,accentHeadings:true,entryLayout:'full',headingIcons:'outline'},
  },
  {
    id:'studio', name:'Executive Resume', category:'Professional', reference:'modern-banking',
    description:'A composed leadership profile with a strong masthead and structured career history.',
    color:'#28483e', font:'Georgia, serif',
    source:{label:'ModernCV maintainers',url:'https://github.com/moderncv/moderncv'},
    sectionOrder:['summary','experience','education','skills','projects','certifications'],
    defaults:{...documentDefaults,header:'center',nameSize:32,accentHeadings:true,capitals:false,sectionGap:20},
  },
  {
    id:'editorial', name:'Academic Resume', category:'Academic', reference:'academic',
    description:'Education and publications come first in an orderly serif layout with room for research.',
    color:'#283a53', font:'"Times New Roman", Times, serif',
    source:{label:'Sourabh Bajaj · resume typography reference',url:'https://github.com/sb2nov/resume'},
    sectionOrder:['education','publications','experience','projects','certifications','skills','summary'],
    defaults:{...documentDefaults,header:'left',nameSize:30,sectionGap:20,lineHeight:1.45,accentHeadings:true,capitals:false,dateFormat:'year'},
  },
  {
    id:'grid', name:'Technical Resume', category:'Technical', reference:'deedy',
    description:'A compact skills and education rail beside detailed experience and engineering projects.',
    color:'#314d6a', font:'Arial, Helvetica, sans-serif',
    source:{label:'Debarghya Das · Deedy Resume',url:'https://github.com/deedy/Deedy-Resume'},
    sectionOrder:['summary','experience','education','skills','projects','certifications'],
    defaults:{...documentDefaults,header:'left',nameSize:32,fontSize:13,entryLayout:'full',accentHeadings:true,capitals:true},
  },
  {
    id:'avenue', name:'Elegant Resume', category:'Traditional', reference:'elegant', photo:true,
    description:'Refined serif typography, a warm wine accent, and delicate section dividers.',
    color:'#794658', font:'Georgia, serif',
    source:{label:'ModernCV maintainers',url:'https://github.com/moderncv/moderncv'},
    sectionOrder:['summary','experience','education','projects','skills','certifications'],
    defaults:{...documentDefaults,header:'center',nameSize:34,lineHeight:1.45,sectionGap:20,accentName:true,accentHeadings:true,capitals:false,photoShow:false},
  },
  {
    id:'folio', name:'ATS-Friendly Resume', category:'Clean', reference:'ats',
    description:'One column, standard headings, plain contact details, and a straightforward reading order.',
    color:'#222222', font:'Arial, Helvetica, sans-serif',
    source:{label:'MIT Career Advising & Professional Development',url:'https://capd.mit.edu/resources/resumes/'},
    sectionOrder:['summary','experience','education','skills','projects','certifications'],
    defaults:{...documentDefaults,header:'left',layout:'one',headerPosition:'top',headings:'plain',nameSize:28,entryLayout:'full',photoShow:false,contactIcons:'none',headingIcons:'none',linkIcon:false,linkBlue:false,underline:false,accentName:false,accentTitle:false,accentHeadings:false,sectionStyles:{skills:{contentLayout:'list'},languages:{contentLayout:'list'},certifications:{contentLayout:'list'}}},
  },
]

export const resumeTemplates = [...legacyResumeTemplates, ...flowcvResumeTemplates]
export const selectableResumeTemplates = resumeTemplateIds.map(id => resumeTemplates.find(template => template.id === id))

export const sampleProfile = {
  personal: {
    fullName: 'Alex Morgan',
    photo: '/images/resume-demo.jpg',
    headline: 'Product Designer',
    email: 'alex@example.com',
    phone: '+1 555 012 3456',
    location: 'Portland, OR',
    website: 'alexmorgan.example',
    summary:
      'Thoughtful product designer with five years of experience turning complex challenges into simple, accessible digital experiences. A collaborative approach, from first sketch to final delivery.',
  },
  experience: [
    {
      id: 'sample-1',
      jobTitle: 'Senior Product Designer',
      company: 'North Studio',
      location: 'Portland',
      startDate: '2023-01',
      current: true,
      description:
        'Redesigned onboarding after 18 customer interviews, reducing setup time from 12 to 7 minutes.\nDelivered a 40-component design system used by four product teams.\nPartnered with six engineers to ship accessible account and billing workflows.',
    },
    {
      id: 'sample-2',
      jobTitle: 'Product Designer',
      company: 'Fieldwork Digital',
      startDate: '2020-06',
      endDate: '2022-12',
      description:
        'Designed checkout flows for three retail clients, increasing completed purchases by 14% in an A/B test.\nRan usability sessions with 24 participants and translated findings into tested prototypes.',
    },
  ],
  education: [
    {
      id: 'sample-3',
      institution: 'Pacific Design College',
      degree: 'BA',
      field: 'Communication Design',
      startDate: '2016-09',
      endDate: '2020-05',
    },
  ],
  skills: [
    'Product design',
    'User research',
    'Figma',
    'Prototyping',
    'Design systems',
    'Accessibility',
  ],
  projects: [
    {
      id: 'sample-4',
      name: 'Everyday Notes',
      description: 'A calmer space to capture ideas and organize daily work.',
      technologies: 'Research · Interaction design · Prototyping',
    },
  ],
  certificates: [
    {
      id: 'sample-5',
      name: 'Accessible Digital Design',
      issuer: 'Design Learning Academy',
      issueDate: '2024-03',
    },
  ],
  links: [],
}

// Fictional demo achievements show the structure without reusing anyone’s personal data.
sampleProfile.personal.summary = ''
sampleProfile.experienceSection = {
  heading: 'Experience',
  entries: sampleProfile.experience.map((entry) => ({
    ...entry, visible: true, employerUrl: '',
    location: entry.location || '', endDate: entry.endDate || '',
    current: Boolean(entry.current),
    content: {
      type: 'doc',
      content: [{ type: 'bulletList', content: entry.description.split('\n').map((text) => ({
        type: 'listItem', content: textDocument(text).content,
      })) }],
    },
  })),
}
