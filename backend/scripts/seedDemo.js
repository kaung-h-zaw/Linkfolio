// Seeds the existing local development SQLite database. Never creates a database.
const { DatabaseSync, backup } = require('node:sqlite')
const { createHash } = require('node:crypto')
const { existsSync, mkdirSync, readFileSync } = require('node:fs')
const { join, resolve } = require('node:path')
const { hashPassword } = require('../utils/security.js')
const { sqliteAdapter } = require('../database/adapter.js')
const createModels = require('../models')

const DB_PATH = resolve(__dirname, '../data/linkfolio.sqlite')
const LEGACY_APP_ID = 0x4c46444d
const DEMO_PASSWORD = 'LinkfolioDemo!2026'
const seedTime = new Date()
const isoDaysAgo = (days, hour = 12) => {
  const date = new Date(seedTime)
  date.setUTCDate(date.getUTCDate() - days)
  date.setUTCHours(hour, 0, 0, 0)
  return date.toISOString()
}
const createdAt = new Date(seedTime.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
const lastViewedAt = seedTime.toISOString()
const demoPortrait = (name) => {
  const file = resolve(__dirname, `../../frontend/public/images/demo-profiles/${name}.jpg`)
  if (!existsSync(file)) throw new Error(`Demo portrait is missing: ${file}`)
  return `data:image/jpeg;base64,${readFileSync(file).toString('base64')}`
}

const users = [
  { id:'a440c4e2-1a4a-4c66-8101-000000000001', fullName:'John Doe', email:'john.doe@example.com', plan:'free' },
  { id:'a440c4e2-1a4a-4c66-8101-000000000002', fullName:'Jane Smith', email:'jane.smith@example.com', plan:'free' },
  { id:'a440c4e2-1a4a-4c66-8101-000000000003', fullName:'Michael Johnson', email:'michael.johnson@example.com', plan:'free' },
  { id:'a440c4e2-1a4a-4c66-8101-000000000004', fullName:'Emily Davis', email:'emily.davis@example.com', plan:'premium' },
  { id:'a440c4e2-1a4a-4c66-8101-000000000005', fullName:'David Wilson', email:'david.wilson@example.com', plan:'premium' },
]
const docId = Object.fromEntries(users.map((user, index) => [user.fullName, `b550c4e2-1a4a-4c66-8201-${String(index + 1).padStart(12,'0')}`]))
const mid = (index) => `c660c4e2-1a4a-4c66-8301-${String(index).padStart(12,'0')}`
const richText = (...paragraphs) => ({ type:'doc', content:paragraphs.map(text=>({ type:'paragraph', content:[{ type:'text', text }] })) })
const entry = (id, fields) => ({ id, visible:true, ...fields })
const experienceEntry = (id, fields) => entry(id,{jobTitle:'',company:'',employerUrl:'',startDate:'',endDate:'',current:false,location:'',content:richText(''),...fields})
const educationEntry = (id, fields) => entry(id,{degree:'',school:'',schoolUrl:'',startDate:'',endDate:'',current:false,location:'',content:richText(''),...fields})
const skillEntry = (id, fields) => entry(id,{name:'',level:'Proficient',content:richText(''),...fields})
const projectEntry = (id, fields) => entry(id,{name:'',url:'',github:'',subtitle:'',startDate:'',endDate:'',current:false,content:richText(''),...fields})
const certificateEntry = (id, fields) => entry(id,{name:'',url:'',issuer:'',issueDate:'',expiryDate:'',noExpiry:false,content:richText(''),...fields})
const portfolio = (template,color,surface,headline,introduction,projectMedia) => ({
  template,color,surface,headline,introduction,availability:'Open to collaborations',
  contact:true,resumeDownload:true,about:true,projects:true,experience:true,education:true,skills:true,
  images:{showPortrait:true,portraitSource:'resume'},
  detailPages:Object.fromEntries(projectMedia.map(({id,image,description})=>[
    `projects:${id}`,{enabled:true,images:[image],description},
  ])),
})

const resumes = [
  {
    owner:'John Doe', name:'John Doe — Product Designer', templateId:'flowcv-classic-serif',
    personal:{ fullName:'John Doe', photo:demoPortrait('john'), headline:'Product Designer', email:'john.doe@example.com', phone:'+1 555 010 2001', location:'Portland, Oregon', summary:'Product designer shaping accessible workflows through user research, thoughtful interaction design, and close collaboration with engineering.' },
    experienceSection:{ heading:'Experience', entries:[
      experienceEntry('john-exp-1',{jobTitle:'Product Designer',company:'Northstar Learning',startDate:'2022-03',current:true,location:'Portland, OR',content:richText('Led discovery and prototyping for a course planning experience, helping adult learners compare programs by schedule, cost, and outcomes.','Partnered with engineering to ship accessible enrollment flows and maintained a shared component library across three product areas.') }),
      experienceEntry('john-exp-2',{jobTitle:'UX Designer',company:'Fieldnote Studio',startDate:'2020-06',endDate:'2022-02',location:'Portland, OR',content:richText('Ran moderated usability sessions for early stage web products and translated findings into practical design recommendations.','Created wireframes, responsive prototypes, and handoff notes for client teams in education and community services.') }),
    ]},
    educationSection:{ heading:'Education', entries:[educationEntry('john-edu-1',{degree:'BFA, Communication Design',school:'Pacific Arts College',startDate:'2017-09',endDate:'2021-06',location:'Portland, OR'})] },
    skillsSection:{ heading:'Skills', entries:[skillEntry('john-skill-1',{name:'Figma',level:'Expert'}),skillEntry('john-skill-2',{name:'User Research',level:'Expert'}),skillEntry('john-skill-3',{name:'Prototyping',level:'Proficient'}),skillEntry('john-skill-4',{name:'Accessibility',level:'Proficient'}),skillEntry('john-skill-5',{name:'Design Systems',level:'Proficient'})] },
    projectsSection:{ heading:'Projects', entries:[
      projectEntry('john-project-1',{name:'Course Compass',subtitle:'Course discovery for adult learners · Figma, research, prototyping',url:'https://john-doe.example.com/course-compass',startDate:'2024-02',endDate:'2024-08',content:richText('Designed a guided discovery flow that helps adult learners compare programs by schedule, cost, and outcomes.','Interviewed five learners, mapped decision points, and tested a clickable prototype before handing a reusable flow to the product team.') }),
      projectEntry('john-project-2',{name:'Access Pathway',subtitle:'A more inclusive enrollment journey · WCAG, Figma, usability testing',url:'https://john-doe.example.com/access-pathway',startDate:'2023-03',endDate:'2023-09',content:richText('Reviewed an enrollment journey for keyboard and screen reader barriers, then redesigned form states and progress guidance.','The final prototype documents focus order, error recovery, and accessible component behavior for engineering handoff.') }),
    ]},
    certificationsSection:{ heading:'Certifications', entries:[certificateEntry('john-cert-1',{name:'Accessibility Core Competencies',issuer:'International Association of Accessibility Professionals',issueDate:'2024-02',noExpiry:true})] },
    portfolio:portfolio('miniport','#2862d7','#f4f7fc','Thoughtful products for people learning at every stage.','I turn research into calm, accessible product experiences, from the first sketch through implementation.',[
      {id:'john-project-1',image:'/images/portfolio-desk.jpg',description:'Course Compass began with a recurring problem: prospective learners could not easily compare flexible programs. I mapped the decision journey, interviewed adult learners, and prototyped a guided comparison flow. Usability sessions informed clearer filters, program summaries, and a more accessible enrollment handoff.'},
      {id:'john-project-2',image:'/images/portfolio-workspace.jpg',description:'Access Pathway focused on reducing friction in a multi-step enrollment form. I audited keyboard and screen reader interactions, redesigned validation and progress states, and documented component behavior so the improvements could carry into implementation.'},
    ]),
  },
  {
    owner:'Jane Smith', name:'Jane Smith — Data Analyst', templateId:'flowcv-editorial-rule',
    personal:{ fullName:'Jane Smith', photo:demoPortrait('jane'), headline:'Data Analyst', email:'jane.smith@example.com', phone:'+1 555 010 2002', location:'Austin, Texas', summary:'Data analyst turning product and operations data into clear reporting and practical recommendations.' },
    experienceSection:{ heading:'Experience', entries:[
      experienceEntry('jane-exp-1',{jobTitle:'Data Analyst',company:'Cedar Ridge Analytics',startDate:'2021-08',current:true,location:'Austin, TX',content:richText('Built reusable SQL datasets and weekly reporting that gave product teams a consistent view of activation and retention.','Partnered with product managers to define event tracking, investigate funnel changes, and explain findings in planning reviews.') }),
      experienceEntry('jane-exp-2',{jobTitle:'Operations Analyst',company:'Beacon Retail Group',startDate:'2019-07',endDate:'2021-07',location:'Austin, TX',content:richText('Prepared weekly inventory and sales reports for regional teams using SQL and spreadsheet models.','Standardized store-level definitions and documented data checks that made recurring reports easier to maintain.') }),
    ]},
    educationSection:{ heading:'Education', entries:[educationEntry('jane-edu-1',{degree:'BS, Statistics',school:'Hill Country University',startDate:'2016-09',endDate:'2020-05',location:'Austin, TX'})] },
    skillsSection:{ heading:'Skills', entries:[skillEntry('jane-skill-1',{name:'SQL',level:'Expert'}),skillEntry('jane-skill-2',{name:'Tableau',level:'Proficient'}),skillEntry('jane-skill-3',{name:'Python',level:'Proficient'}),skillEntry('jane-skill-4',{name:'Data Modeling',level:'Proficient'}),skillEntry('jane-skill-5',{name:'Experiment Analysis',level:'Competent'})] },
    projectsSection:{ heading:'Projects', entries:[
      projectEntry('jane-project-1',{name:'Retail Demand Review',subtitle:'Seasonal inventory planning · SQL, Tableau, forecasting',url:'https://jane-smith.example.com/demand-review',startDate:'2024-01',endDate:'2024-06',content:richText('Analyzed sales history and seasonal patterns to give a retail team a more reliable monthly inventory planning view.','Built a Tableau dashboard with store and category filters, documented assumptions, and a review checklist for outlier weeks.') }),
      projectEntry('jane-project-2',{name:'Customer Retention Cohorts',subtitle:'A consistent view of early customer activity · SQL, Python',url:'https://jane-smith.example.com/retention-cohorts',startDate:'2023-03',endDate:'2023-08',content:richText('Created a cohort analysis to compare how customer groups returned after their first purchase.','Aligned event definitions with product partners and added notes that help readers distinguish seasonal movement from sustained changes.') }),
    ]},
    certificationsSection:{ heading:'Certifications', entries:[certificateEntry('jane-cert-1',{name:'Tableau Desktop Specialist',issuer:'Tableau',issueDate:'2023-04',noExpiry:true})] },
    portfolio:portfolio('bento','#345acb','#e6edf8','Clear data for better everyday decisions.','I build practical reporting that helps product and operations teams see what changed and decide what to do next.',[
      {id:'jane-project-1',image:'/images/portfolio-analytics.jpg',description:'Retail Demand Review combines seasonal sales patterns with store-level context. I prepared reusable SQL datasets, checked unusual weeks with operations partners, and designed a dashboard that lets planners move from a category overview to a specific store without losing the reporting definitions.'},
      {id:'jane-project-2',image:'/images/portfolio-workspace.jpg',description:'Customer Retention Cohorts makes repeat behavior easier to compare across signup periods. I defined cohort rules with product partners, built a compact analysis in SQL and Python, and wrote interpretation notes so seasonal changes are not mistaken for product effects.'},
    ]),
  },
  {
    owner:'Michael Johnson', name:'Michael Johnson — Software Engineer', templateId:'flowcv-precision-line',
    personal:{ fullName:'Michael Johnson', photo:demoPortrait('michael'), headline:'Software Engineer', email:'michael.johnson@example.com', phone:'+1 555 010 2003', location:'Seattle, Washington', summary:'Software engineer building reliable web services and developer tools, with an emphasis on observability and maintainable systems.' },
    experienceSection:{ heading:'Experience', entries:[
      experienceEntry('michael-exp-1',{jobTitle:'Software Engineer',company:'Harbor Systems',startDate:'2022-01',current:true,location:'Seattle, WA',content:richText('Improved service reliability by adding request tracing, clearer operational dashboards, and safer retry behavior to internal APIs.','Rotated through on-call support, wrote incident follow-ups, and worked with service owners to reduce noisy alerts.') }),
      experienceEntry('michael-exp-2',{jobTitle:'Backend Engineer',company:'Cloud Harbor Labs',startDate:'2019-06',endDate:'2021-12',location:'Seattle, WA',content:richText('Built and maintained Node.js services for account and notification workflows.','Added integration coverage and deployment checks that helped the team identify regressions before release.') }),
    ]},
    educationSection:{ heading:'Education', entries:[educationEntry('michael-edu-1',{degree:'BS, Computer Science',school:'Soundview Institute',startDate:'2017-09',endDate:'2021-06',location:'Seattle, WA'})] },
    skillsSection:{ heading:'Skills', entries:[skillEntry('michael-skill-1',{name:'TypeScript',level:'Expert'}),skillEntry('michael-skill-2',{name:'Node.js',level:'Expert'}),skillEntry('michael-skill-3',{name:'PostgreSQL',level:'Proficient'}),skillEntry('michael-skill-4',{name:'API Design',level:'Proficient'}),skillEntry('michael-skill-5',{name:'Observability',level:'Competent'})] },
    projectsSection:{ heading:'Projects', entries:[
      projectEntry('michael-project-1',{name:'Queue Monitor',subtitle:'Background job visibility for small teams · TypeScript, Node.js',url:'https://michael-johnson.example.com/queue-monitor',github:'https://github.com/michael-johnson/queue-monitor',startDate:'2024-01',endDate:'2024-07',content:richText('Built a compact dashboard to inspect job health, retry volume, and recent processing errors.','Added filterable status views and a retry history so developers can diagnose recurring failures without querying production logs by hand.') }),
      projectEntry('michael-project-2',{name:'API Reliability Toolkit',subtitle:'Tracing and safer retries for internal services · Node.js, OpenTelemetry',url:'https://michael-johnson.example.com/reliability-toolkit',github:'https://github.com/michael-johnson/reliability-toolkit',startDate:'2023-02',endDate:'2023-10',content:richText('Created a small set of service middleware for request IDs, structured logs, and bounded retry behavior.','The examples and operational notes make it easier for service owners to adopt consistent diagnostics without adding a large platform dependency.') }),
    ]},
    certificationsSection:{ heading:'Certifications', entries:[certificateEntry('michael-cert-1',{name:'AWS Certified Developer — Associate',issuer:'Amazon Web Services',issueDate:'2024-01',noExpiry:true})] },
    portfolio:portfolio('strata','#ac593f','#f1eae1','Reliable services, easier to operate.','I build backend systems and developer tools that make service behavior easier to understand and maintain.',[
      {id:'michael-project-1',image:'/images/portfolio-analytics.jpg',description:'Queue Monitor gives small engineering teams a shared view of background work. I designed the job summary and retry history around the questions that come up during support: what is delayed, what failed, and whether a retry is safe.'},
      {id:'michael-project-2',image:'/images/portfolio-workspace.jpg',description:'API Reliability Toolkit packages request tracing, structured logging, and bounded retries into lightweight Node.js examples. The project focuses on clear defaults and operational guidance that service teams can adopt incrementally.'},
    ]),
  },
  {
    owner:'Emily Davis', name:'Emily Davis — Marketing Strategist', templateId:'flowcv-rose-letter',
    personal:{ fullName:'Emily Davis', photo:demoPortrait('emily'), headline:'Marketing Strategist', email:'emily.davis@example.com', phone:'+1 555 010 2004', location:'Denver, Colorado', summary:'Marketing strategist connecting audience insight, useful content, and measurable campaign outcomes.' },
    experienceSection:{ heading:'Experience', entries:[
      experienceEntry('emily-exp-1',{jobTitle:'Marketing Strategist',company:'Juniper Works',startDate:'2021-04',current:true,location:'Denver, CO',content:richText('Planned integrated campaigns across email and web, improving qualified inquiries through audience segmentation and focused messaging.','Worked with program and design teams to align launch calendars, review campaign performance, and refine content for different audiences.') }),
      experienceEntry('emily-exp-2',{jobTitle:'Content Marketing Specialist',company:'Campfire Collective',startDate:'2019-03',endDate:'2021-03',location:'Denver, CO',content:richText('Produced editorial calendars, partner stories, and email content for community programs.','Used search and engagement reports to prioritize updates and keep campaign resources useful after launch.') }),
    ]},
    educationSection:{ heading:'Education', entries:[educationEntry('emily-edu-1',{degree:'BA, Communications',school:'Front Range College',startDate:'2016-09',endDate:'2020-05',location:'Denver, CO'})] },
    skillsSection:{ heading:'Skills', entries:[skillEntry('emily-skill-1',{name:'Content Strategy',level:'Expert'}),skillEntry('emily-skill-2',{name:'SEO',level:'Proficient'}),skillEntry('emily-skill-3',{name:'Campaign Reporting',level:'Proficient'}),skillEntry('emily-skill-4',{name:'Email Marketing',level:'Competent'}),skillEntry('emily-skill-5',{name:'Audience Research',level:'Proficient'})] },
    projectsSection:{ heading:'Projects', entries:[
      projectEntry('emily-project-1',{name:'Community Program Launch',subtitle:'A partner-ready campaign toolkit · content, email, coordination',url:'https://emily-davis.example.com/community-launch',startDate:'2024-03',endDate:'2024-08',content:richText('Created a launch calendar and partner toolkit that made sign-up information easier to share across local organizations.','Coordinated landing page copy, email messages, and reusable social assets so each partner could explain the program consistently.') }),
      projectEntry('emily-project-2',{name:'Member Welcome Series',subtitle:'A useful first month for new members · lifecycle email, analytics',url:'https://emily-davis.example.com/welcome-series',startDate:'2023-04',endDate:'2023-09',content:richText('Reworked onboarding emails around the questions new members ask most often.','Mapped messages to the first month, added clear next steps, and created a simple review plan for subject lines and engagement.') }),
    ]},
    certificationsSection:{ heading:'Certifications', entries:[certificateEntry('emily-cert-1',{name:'Google Analytics Certification',issuer:'Google',issueDate:'2024-05',noExpiry:true})] },
    portfolio:portfolio('freelancer','#ad7525','#eef2f8','Useful stories, built around real audience needs.','I bring research, content, and channel planning together to help people understand what to do next.',[
      {id:'emily-project-1',image:'/images/portfolio-desk.jpg',description:'The Community Program Launch brought partner organizations onto one clear campaign plan. I coordinated landing-page copy, email messages, and a reusable toolkit so local teams could share accurate sign-up information in their own channels.'},
      {id:'emily-project-2',image:'/images/portfolio-workspace.jpg',description:'Member Welcome Series reshaped the first month after signup around practical questions and timely next steps. I mapped the sequence, refined the message hierarchy, and set up a lightweight review plan for subject-line and engagement learning.'},
    ]),
  },
  {
    owner:'David Wilson', name:'David Wilson — Project Manager', templateId:'flowcv-atlantic-blue',
    personal:{ fullName:'David Wilson', photo:demoPortrait('david'), headline:'Project Manager', email:'david.wilson@example.com', phone:'+1 555 010 2005', location:'Minneapolis, Minnesota', summary:'Project manager coordinating cross-functional delivery, clear stakeholder communication, and steady operational improvement.' },
    experienceSection:{ heading:'Experience', entries:[
      experienceEntry('david-exp-1',{jobTitle:'Project Manager',company:'Lakeview Digital',startDate:'2020-11',current:true,location:'Minneapolis, MN',content:richText('Coordinated design, engineering, and operations teams through quarterly releases, keeping scope and delivery risks visible.','Maintained milestone plans, facilitated decision reviews, and shared concise status updates with product and leadership partners.') }),
      experienceEntry('david-exp-2',{jobTitle:'Project Coordinator',company:'Lakeside Property Group',startDate:'2018-05',endDate:'2020-10',location:'Minneapolis, MN',content:richText('Organized vendor schedules and internal handoffs for a portfolio of office renovation projects.','Tracked approvals and open risks in a shared project log, helping teams resolve dependencies before work reached site.') }),
    ]},
    educationSection:{ heading:'Education', entries:[educationEntry('david-edu-1',{degree:'BS, Business Administration',school:'North Lakes University',startDate:'2015-09',endDate:'2019-05',location:'Minneapolis, MN'})] },
    skillsSection:{ heading:'Skills', entries:[skillEntry('david-skill-1',{name:'Project Planning',level:'Expert'}),skillEntry('david-skill-2',{name:'Jira',level:'Proficient'}),skillEntry('david-skill-3',{name:'Stakeholder Communication',level:'Expert'}),skillEntry('david-skill-4',{name:'Risk Management',level:'Proficient'}),skillEntry('david-skill-5',{name:'Release Coordination',level:'Proficient'})] },
    projectsSection:{ heading:'Projects', entries:[
      projectEntry('david-project-1',{name:'Release Readiness Program',subtitle:'A shared delivery checklist for product teams · planning, Jira',url:'https://david-wilson.example.com/release-readiness',startDate:'2024-02',endDate:'2024-09',content:richText('Introduced a repeatable launch review that clarified owners, milestones, and rollout decisions for each release.','The checklist connected product, engineering, support, and operations work while leaving room for teams to record risks and go/no-go decisions.') }),
      projectEntry('david-project-2',{name:'Platform Migration Roadmap',subtitle:'A phased transition with visible dependencies · delivery planning',url:'https://david-wilson.example.com/platform-migration',startDate:'2023-01',endDate:'2023-11',content:richText('Coordinated a phased move from a legacy reporting platform to a shared service.','Mapped team dependencies, cutover milestones, and rollback owners into a roadmap that helped stakeholders review progress without losing operational detail.') }),
    ]},
    certificationsSection:{ heading:'Certifications', entries:[certificateEntry('david-cert-1',{name:'Certified ScrumMaster',issuer:'Scrum Alliance',issueDate:'2023-06',noExpiry:true})] },
    portfolio:portfolio('multiverse','#9055be','#f3e7fa','Clear plans for complex work.','I help cross-functional teams turn ambitious goals into visible milestones, thoughtful decisions, and steady delivery.',[
      {id:'david-project-1',image:'/images/portfolio-workspace.jpg',description:'Release Readiness Program introduced a shared launch review across product, engineering, support, and operations. The checklist made ownership, dependencies, risks, and rollout decisions visible while staying lightweight enough for teams to use every release.'},
      {id:'david-project-2',image:'/images/portfolio-analytics.jpg',description:'Platform Migration Roadmap organized a phased transition from a legacy reporting platform. I mapped dependencies and cutover milestones, clarified rollback ownership, and built a status view that gave stakeholders a practical picture of progress and risk.'},
    ]),
  },
]

const portfolioSlugs = {
  'John Doe':'john-doe-product-design', 'Jane Smith':'jane-smith-data',
  'Michael Johnson':'michael-johnson-software', 'Emily Davis':'emily-davis-marketing',
  'David Wilson':'david-wilson-project-management',
}
const messageData = [
  ['Jordan Lee','jordan.lee@example.net','Your Course Compass case study is relevant to a product design opening on our learning team. Would you be available to talk?'],
  ['Sam Rivera','sam.rivera@example.net','I appreciated the accessibility focus in your portfolio. Could you share how you ran the learner interviews?'],
  ['Taylor Brooks','taylor.brooks@example.net','We are looking for an analyst to improve our customer reporting. Your dashboard work caught my attention.'],
  ['Morgan Ellis','morgan.ellis@example.net','The Queue Monitor project maps closely to a platform role we are hiring for. May I send you the role details?'],
  ['Riley Chen','riley.chen@example.net','Your campaign launch example is thoughtful. Are you open to a short conversation about a contract project?'],
  ['Casey Patel','casey.patel@example.net','I would like to learn more about your release readiness program and how you brought teams on board.'],
]
const messageOwnerIndexes = [0, 0, 1, 2, 3, 4]
const dailyActivity = [
  { views:[3,2,1,1,1], clicks:[1,1,0,1,0] },
  { views:[2,1,1,1,0], clicks:[1,0,1,0,0] },
  { views:[1,1,1,1,0], clicks:[0,1,0,1,0] },
  { views:[1,1,1,0,0], clicks:[1,0,0,0,0] },
]

const legacyUsers = [
  ['demo-user-001','Aye Chan','aye.chan@example.test'],
  ['demo-user-002','Mya Thiri','mya.thiri@example.test'],
  ['demo-user-003','Ko Min','ko.min@example.test'],
  ['demo-user-004','Thant Zin','thant.zin@example.test'],
  ['demo-user-005','Ei Mon','ei.mon@example.test'],
  ['demo-admin-001','Demo Administrator','admin@example.test'],
]
const legacyDocumentOwners = Object.fromEntries(legacyUsers.slice(0,5).map(([id,,],index)=>[`demo-resume-00${index+1}`,id]))
const legacyMessageDocuments = [1,1,2,3,4,4].map((documentNumber)=>`demo-resume-00${documentNumber}`)
const legacyUserIds = legacyUsers.map(([id])=>id)
const legacyDocumentIds = Object.keys(legacyDocumentOwners)
const legacyMessageIds = Array.from({length:6},(_,index)=>`demo-message-00${index+1}`)
const seedUserIds = new Set(users.map(user=>user.id))
const seedDocumentIds = new Set(users.map(user=>docId[user.fullName]))
const seedMessageIds = new Set(Array.from({length:6},(_,index)=>mid(index+1)))

function requiredSchema(db) {
  const tables=new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row=>row.name))
  const required=['users','documents','templates','publications','analytics','analytics_daily','messages','plans','payments','relational_documents','resumes','portfolios','profiles','themes','portfolio_settings','document_sections','experiences','educations','skills','projects','certificates','links']
  const missing=required.filter(table=>!tables.has(table))
  if(missing.length)throw new Error(`The existing local SQLite database is missing required application tables: ${missing.join(', ')}`)
}

function collectLegacyRows(db) {
  const staleUsers=[]
  const byId=db.prepare('SELECT id,full_name,email FROM users WHERE id=?')
  const byEmail=db.prepare('SELECT id,full_name,email FROM users WHERE email=?')
  for(const [id,fullName,email] of legacyUsers){
    const row=byId.get(id)
    if(row&&(row.full_name!==fullName||row.email!==email))throw new Error(`Legacy seed ID ${id} exists with a different identity; refusing to clean it.`)
    const emailRow=byEmail.get(email)
    if(emailRow&&emailRow.id!==id)continue
    if(row)staleUsers.push(id)
  }
  const staleDocuments=[]
  for(const [id,userId] of Object.entries(legacyDocumentOwners)){
    const row=db.prepare('SELECT id,user_id,kind FROM documents WHERE id=?').get(id)
    if(row&&(row.user_id!==userId||row.kind!=='resume'))throw new Error(`Legacy seed document ${id} has unexpected ownership or kind; refusing to clean it.`)
    if(row)staleDocuments.push(id)
  }
  const staleMessages=[]
  for(let i=0;i<legacyMessageIds.length;i++){
    const row=db.prepare('SELECT id,document_id FROM messages WHERE id=?').get(legacyMessageIds[i])
    if(row&&row.document_id!==legacyMessageDocuments[i])throw new Error(`Legacy seed message ${row.id} has an unexpected owner; refusing to clean it.`)
    if(row)staleMessages.push(row.id)
  }
  return {staleUsers,staleDocuments,staleMessages}
}

async function makeSafetyBackup(db) {
  const dir=resolve(__dirname,'../data/backups')
  mkdirSync(dir,{recursive:true})
  const file=join(dir,`before-demo-cleanup-${new Date().toISOString().replace(/[:.]/g,'-')}.sqlite`)
  await backup(db,file)
  const copy=new DatabaseSync(file,{readOnly:true})
  try{if(copy.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw new Error('Safety backup integrity check failed.')}finally{copy.close()}
  return file
}

function assertSeedIdentityAvailability(db) {
  const idQuery=db.prepare('SELECT id,full_name,email,role FROM users WHERE id=?')
  const emailQuery=db.prepare('SELECT id,full_name,email FROM users WHERE email=?')
  for(const user of users){
    const idRow=idQuery.get(user.id)
    if(idRow&&(idRow.full_name!==user.fullName||idRow.email!==user.email||idRow.role!=='user'))throw new Error(`Seed account ID for ${user.email} is already used by a different account.`)
    const emailRow=emailQuery.get(user.email)
    if(emailRow&&emailRow.id!==user.id)throw new Error(`Email ${user.email} already belongs to a different existing account; no records were changed.`)
  }
  const requiredTemplates = resumes.flatMap(resume => [
    [resume.templateId, 'resume'],
    [resume.portfolio.template, 'portfolio'],
  ])
  for(const [id,kind] of requiredTemplates){
    const template=db.prepare('SELECT enabled FROM templates WHERE id=? AND kind=?').get(id,kind)
    if(!template?.enabled)throw new Error(`Required demo template ${id} (${kind}) is unavailable.`)
  }
  for(const user of users){
    const id=user.id
    const row=db.prepare('SELECT id,user_id,kind FROM documents WHERE id=?').get(docId[user.fullName])
    if(row&&(row.user_id!==id||row.kind!=='resume'))throw new Error(`Seed document ID for ${user.email} is already used by a different record.`)
    const slug=portfolioSlugs[user.fullName]
    if(slug){const conflict=db.prepare('SELECT document_id FROM publications WHERE slug=?').get(slug);if(conflict&&conflict.document_id!==docId[user.fullName])throw new Error(`Portfolio slug ${slug} is already in use.`)}
  }
}

function rowSnapshot(db) {
  const excludedUsers=new Set([...legacyUserIds,...seedUserIds])
  const excludedDocs=new Set([...legacyDocumentIds,...seedDocumentIds])
  const excludedMessages=new Set([...legacyMessageIds,...seedMessageIds])
  const tableFilters={
    users:row=>!excludedUsers.has(row.id),
    sessions:row=>!excludedUsers.has(row.user_id), password_resets:row=>!excludedUsers.has(row.user_id), payments:row=>!excludedUsers.has(row.user_id),
    documents:row=>!excludedDocs.has(row.id), publications:row=>!excludedDocs.has(row.document_id), analytics:row=>!excludedDocs.has(row.document_id), analytics_daily:row=>!excludedDocs.has(row.document_id),
    messages:row=>!excludedMessages.has(row.id)&&!excludedDocs.has(row.document_id),
    relational_documents:row=>!excludedDocs.has(row.document_id), resumes:row=>!excludedDocs.has(row.document_id), portfolios:row=>!excludedDocs.has(row.document_id), profiles:row=>!excludedDocs.has(row.document_id), themes:row=>!excludedDocs.has(row.document_id), portfolio_settings:row=>!excludedDocs.has(row.document_id), document_sections:row=>!excludedDocs.has(row.document_id), experiences:row=>!excludedDocs.has(row.document_id), educations:row=>!excludedDocs.has(row.document_id), skills:row=>!excludedDocs.has(row.document_id), projects:row=>!excludedDocs.has(row.document_id), certificates:row=>!excludedDocs.has(row.document_id), links:row=>!excludedDocs.has(row.document_id),
    templates:()=>true, plans:()=>true,
  }
  const snapshots={}
  for(const [table,keep] of Object.entries(tableFilters)){
    const rows=db.prepare(`SELECT * FROM ${table}`).all().filter(keep).map(row=>JSON.stringify(row)).sort()
    snapshots[table]=createHash('sha256').update(rows.join('\n')).digest('hex')
  }
  return snapshots
}

function legacyFileIsKnownDemo(file) {
  if(!existsSync(file)||resolve(file)===DB_PATH)return false
  const db=new DatabaseSync(file,{readOnly:true})
  try{
    if(Number(db.prepare('PRAGMA application_id').get().application_id)!==LEGACY_APP_ID)return false
    const userRows=db.prepare('SELECT id,full_name,email,role,plan FROM users ORDER BY id').all()
    if(userRows.length!==legacyUsers.length)return false
    for(const [id,fullName,email] of legacyUsers){const row=userRows.find(item=>item.id===id);if(!row||row.full_name!==fullName||row.email!==email)return false}
    const docs=db.prepare('SELECT id,user_id,kind FROM documents').all()
    if(docs.length!==legacyDocumentIds.length||docs.some(row=>legacyDocumentOwners[row.id]!==row.user_id||row.kind!=='resume'))return false
    const messages=db.prepare('SELECT id,document_id FROM messages').all()
    if(messages.length!==legacyMessageIds.length||messages.some(row=>legacyMessageDocuments[legacyMessageIds.indexOf(row.id)]!==row.document_id))return false
    if(Number(db.prepare('SELECT COALESCE(SUM(views),0) n FROM analytics').get().n)!==20)return false
    if(Number(db.prepare('SELECT COALESCE(SUM(clicks),0) n FROM analytics').get().n)!==8)return false
    return db.prepare('PRAGMA integrity_check').get().integrity_check==='ok'
  }finally{db.close()}
}

async function main(){
  if(!existsSync(DB_PATH))throw new Error(`Existing local database not found at ${DB_PATH}; refusing to create another database.`)
  const db=new DatabaseSync(DB_PATH)
  db.exec('PRAGMA foreign_keys=ON')
  try{
    if(Number(db.prepare('PRAGMA application_id').get().application_id)===LEGACY_APP_ID)throw new Error('The configured local database is the old isolated demo database. Refusing to seed it.')
    requiredSchema(db)
    const beforeAdmins=db.prepare("SELECT * FROM users WHERE role='admin' ORDER BY id").all()
    if(beforeAdmins.length<1)throw new Error('No existing admin account was found; refusing to proceed.')
    const legacy=collectLegacyRows(db)
    const cleanupCount=legacy.staleUsers.length+legacy.staleDocuments.length+legacy.staleMessages.length
    const safetyBackup=cleanupCount?await makeSafetyBackup(db):null
    assertSeedIdentityAvailability(db)
    const before=rowSnapshot(db)
    const hashes=await Promise.all(users.map(()=>hashPassword(DEMO_PASSWORD)))
    const [{getDesign,validDesign},{flowcvResumeTemplates},{validPortfolio},{validProjects},{validExperience},{validEducation},{validSkills},{validCertifications}]=await Promise.all([
      import('../../frontend/src/lib/resumeDesign.js'),
      import('../../frontend/src/lib/flowcvResumeTemplates.js'),
      import('../../frontend/src/lib/portfolio.js'),
      import('../../frontend/src/lib/additionalSections.js'),
      import('../../frontend/src/lib/experience.js'),
      import('../../frontend/src/lib/educationSkills.js'),
      import('../../frontend/src/lib/educationSkills.js'),
      import('../../frontend/src/lib/additionalSections.js'),
    ])
    const photoDesigns=Object.fromEntries([...new Set(resumes.map(resume=>resume.templateId))].map(templateId=>{
      const template=flowcvResumeTemplates.find(item=>item.id===templateId)
      if(!template)throw new Error(`Demo resume template ${templateId} is unavailable.`)
      const design=getDesign({...template.defaults,photoShow:true})
      if(!validDesign(design))throw new Error(`Generated demo design ${templateId} is invalid.`)
      return [templateId,design]
    }))
    for(const resume of resumes){
      const validity={experience:validExperience(resume.experienceSection),education:validEducation(resume.educationSection),skills:validSkills(resume.skillsSection),projects:validProjects(resume.projectsSection),certificates:validCertifications(resume.certificationsSection),portfolio:validPortfolio(resume.portfolio)}
      if(Object.values(validity).some(value=>!value))throw new Error(`Demo content is invalid for ${resume.owner}: ${JSON.stringify(validity)}`)
    }
    const models=createModels(sqliteAdapter(db))
    await models.transaction(async()=>{
      for(const id of legacy.staleMessages)await db.prepare('DELETE FROM messages WHERE id=?').run(id)
      for(const id of legacy.staleDocuments)await db.prepare('DELETE FROM documents WHERE id=?').run(id)
      for(const [id,fullName,email] of legacyUsers){if(!legacy.staleUsers.includes(id))continue;await db.prepare('DELETE FROM users WHERE id=? AND full_name=? AND email=?').run(id,fullName,email)}

      for(let index=0;index<users.length;index++){
        const user=users[index]
        if(!await models.User.findById(user.id))await models.User.create(user.id,user.fullName,user.email,hashes[index],createdAt)
        else await db.prepare("UPDATE users SET created_at=? WHERE id=? AND created_at='2025-06-01T09:00:00.000Z'").run(createdAt,user.id)
        if(user.plan==='premium')await models.User.upgrade(user.id)
      }
      for(const resume of resumes){
        const user=users.find(item=>item.fullName===resume.owner)
        const id=docId[resume.owner]
        const data={id,kind:'resume',name:resume.name,templateId:resume.templateId,personal:resume.personal,design:photoDesigns[resume.templateId],experienceSection:resume.experienceSection,educationSection:resume.educationSection,skillsSection:resume.skillsSection,projectsSection:resume.projectsSection,certificationsSection:resume.certificationsSection,...(resume.portfolio?{portfolio:{...resume.portfolio,sourceResume:{id,name:resume.name}}}:{})}
        const existing=await models.Document.findById(id)
        if(!existing)await models.Document.save(id,user.id,'resume',JSON.stringify(data),createdAt)
        else {
          if(existing.user_id!==user.id||existing.kind!=='resume')throw new Error(`Seed document ${id} has unexpected ownership; refusing to repair it.`)
          const stored=JSON.parse(existing.data)
          Object.assign(stored,{
            id,kind:'resume',name:resume.name,templateId:resume.templateId,
            design:photoDesigns[resume.templateId],
            personal:{...stored.personal,...resume.personal},
            experienceSection:resume.experienceSection,
            educationSection:resume.educationSection,
            skillsSection:resume.skillsSection,
            projectsSection:resume.projectsSection,
            certificationsSection:resume.certificationsSection,
            portfolio:{...resume.portfolio,sourceResume:{id,name:resume.name}},
          })
          await models.Document.updateData(JSON.stringify(stored),lastViewedAt,id)
        }
        if(resume.portfolio){
          if(!await models.Publication.findByDocumentId(id))await models.Publication.save(id,portfolioSlugs[resume.owner],'public',createdAt)
          else await db.prepare("UPDATE publications SET updated_at=? WHERE document_id=? AND updated_at='2025-06-01T09:00:00.000Z'").run(createdAt,id)
          const analyticsExists=await db.prepare('SELECT document_id FROM analytics WHERE document_id=?').get(id)
          const index=Object.keys(portfolioSlugs).indexOf(resume.owner);const activity=dailyActivity[index]
          if(!analyticsExists&&activity){
            const views=activity.views.reduce((sum,value)=>sum+value,0);const clicks=activity.clicks.reduce((sum,value)=>sum+value,0)
            await db.prepare('INSERT INTO analytics (document_id,views,clicks,last_viewed_at) VALUES (?,?,?,?)').run(id,views,clicks,lastViewedAt)
          }
          // These exact 2025 dates were written by the earlier demo seed. The
          // demo account IDs and known seed window let us safely remove them.
          await db.prepare("DELETE FROM analytics_daily WHERE document_id=? AND activity_date BETWEEN '2025-06-01' AND '2025-06-06'").run(id)
          for(let day=0;activity&&day<activity.views.length;day++){
            const views=activity.views[day],clicks=activity.clicks[day]
            if(views||clicks)await db.prepare('INSERT INTO analytics_daily (document_id,activity_date,views,clicks) VALUES (?,?,?,?) ON CONFLICT(document_id,activity_date) DO UPDATE SET views=excluded.views,clicks=excluded.clicks').run(id,isoDaysAgo(activity.views.length-1-day).slice(0,10),views,clicks)
          }
          if(activity)await db.prepare("UPDATE analytics SET last_viewed_at=? WHERE document_id=? AND (last_viewed_at IS NULL OR last_viewed_at='2025-06-05T12:00:00.000Z')").run(lastViewedAt,id)
        }
      }
      for(let index=0;index<messageData.length;index++){
        const messageId=mid(index+1);const existingMessage=await db.prepare('SELECT id,document_id,created_at FROM messages WHERE id=?').get(messageId)
        const owner=users[messageOwnerIndexes[index]];const targetDoc=docId[owner.fullName];const [senderName,senderEmail,body]=messageData[index]
        if(existingMessage){
          const previousTargetDoc = docId[users[index % 4].fullName]
          if(existingMessage.document_id!==targetDoc && existingMessage.document_id!==previousTargetDoc)throw new Error(`Seed message ${messageId} has unexpected ownership; refusing to update it.`)
          if(existingMessage.created_at>='2025-06-01T00:00:00.000Z'&&existingMessage.created_at<'2025-06-07T00:00:00.000Z')await db.prepare('UPDATE messages SET created_at=? WHERE id=?').run(isoDaysAgo(10-index,10),messageId)
        }else await models.Message.create(messageId,targetDoc,senderName,senderEmail,body,isoDaysAgo(10-index,10))
      }
    })
    if(db.prepare('PRAGMA foreign_key_check').all().length)throw new Error('Foreign-key verification failed.')
    const after=rowSnapshot(db)
    if(JSON.stringify(before)!==JSON.stringify(after))throw new Error('Pre-existing accounts or records changed during seeding.')
    const afterAdmins=db.prepare("SELECT * FROM users WHERE role='admin' ORDER BY id").all()
    if(JSON.stringify(beforeAdmins)!==JSON.stringify(afterAdmins))throw new Error('An existing admin account changed during seeding.')
    const finalCounts={
      users:Number(db.prepare('SELECT COUNT(*) n FROM users').get().n), admins:Number(db.prepare("SELECT COUNT(*) n FROM users WHERE role='admin'").get().n),
      newUsers:Number(db.prepare(`SELECT COUNT(*) n FROM users WHERE id IN (${users.map(()=>'?').join(',')})`).get(...users.map(user=>user.id)).n),
      newResumes:Number(db.prepare(`SELECT COUNT(*) n FROM resumes WHERE document_id IN (${users.map(()=>'?').join(',')})`).get(...users.map(user=>docId[user.fullName])).n),
      newPortfolios:Number(db.prepare(`SELECT COUNT(*) n FROM portfolios WHERE document_id IN (${users.map(()=>'?').join(',')})`).get(...users.map(user=>docId[user.fullName])).n),
      newEducation:Number(db.prepare(`SELECT COUNT(*) n FROM educations WHERE document_id IN (${users.map(()=>'?').join(',')})`).get(...users.map(user=>docId[user.fullName])).n),
      newExperience:Number(db.prepare(`SELECT COUNT(*) n FROM experiences WHERE document_id IN (${users.map(()=>'?').join(',')})`).get(...users.map(user=>docId[user.fullName])).n),
      newSkills:Number(db.prepare(`SELECT COUNT(*) n FROM skills WHERE document_id IN (${users.map(()=>'?').join(',')})`).get(...users.map(user=>docId[user.fullName])).n),
      newProjects:Number(db.prepare(`SELECT COUNT(*) n FROM projects WHERE document_id IN (${users.map(()=>'?').join(',')})`).get(...users.map(user=>docId[user.fullName])).n),
      newCertificates:Number(db.prepare(`SELECT COUNT(*) n FROM certificates WHERE document_id IN (${users.map(()=>'?').join(',')})`).get(...users.map(user=>docId[user.fullName])).n),
      newMessages:Number(db.prepare(`SELECT COUNT(*) n FROM messages WHERE id IN (${[...seedMessageIds].map(()=>'?').join(',')})`).get(...seedMessageIds).n),
      newViews:Number(db.prepare(`SELECT COALESCE(SUM(views),0) n FROM analytics WHERE document_id IN (${Object.keys(portfolioSlugs).map(()=>'?').join(',')})`).get(...Object.keys(portfolioSlugs).map(name=>docId[name])).n),
      newClicks:Number(db.prepare(`SELECT COALESCE(SUM(clicks),0) n FROM analytics WHERE document_id IN (${Object.keys(portfolioSlugs).map(()=>'?').join(',')})`).get(...Object.keys(portfolioSlugs).map(name=>docId[name])).n),
      totalMessages:Number(db.prepare('SELECT COUNT(*) n FROM messages').get().n), totalViews:Number(db.prepare('SELECT COALESCE(SUM(views),0) n FROM analytics').get().n), totalClicks:Number(db.prepare('SELECT COALESCE(SUM(clicks),0) n FROM analytics').get().n),
    }
    const expected={newUsers:5,newResumes:5,newPortfolios:5,newEducation:5,newExperience:10,newSkills:25,newProjects:10,newCertificates:5,newMessages:6,newViews:20,newClicks:8}
    for(const [key,value] of Object.entries(expected))if(finalCounts[key]!==value)throw new Error(`Expected ${key}=${value}, got ${finalCounts[key]}.`)
    if(new Set(resumes.map(resume=>resume.templateId)).size!==users.length||new Set(resumes.map(resume=>resume.portfolio.template)).size!==users.length)throw new Error('Every demo user must have distinct resume and portfolio templates.')
    for(const user of users){
      const stored=await models.User.findById(user.id);if(!stored||stored.full_name!==user.fullName||stored.email!==user.email||stored.role!=='user')throw new Error(`Could not verify seeded account ${user.email}.`)
      const docs=await models.Document.findByUserId(user.id);if(docs.length!==1)throw new Error(`Expected one resume for ${user.email}.`)
      const data=JSON.parse(docs[0].data)
      const spec=resumes.find(resume=>resume.owner===user.fullName)
      if(data.id!==docId[user.fullName]||data.kind!=='resume'||data.templateId!==spec.templateId||data.portfolio?.template!==spec.portfolio.template||data.projectsSection.entries.length<2)throw new Error(`Resume or portfolio content failed to load for ${user.email}.`)
      if(Object.keys(data.portfolio.detailPages||{}).length!==data.projectsSection.entries.length)throw new Error(`Project image/details are missing for ${user.email}.`)
      if(!validDesign(data.design)||!validExperience(data.experienceSection)||!validEducation(data.educationSection)||!validSkills(data.skillsSection)||!validProjects(data.projectsSection)||!validCertifications(data.certificationsSection)||!validPortfolio(data.portfolio))throw new Error(`Materialized demo content is not editable for ${user.email}.`)
      const messages=await models.Message.findByUserId(user.id)
      const analyticsRows=await models.Analytics.findByUserId(user.id)
      if(!(await models.Publication.findPublic(portfolioSlugs[user.fullName])))throw new Error(`Published portfolio failed to load for ${user.email}.`)
      if(user.fullName==='John Doe'&&messages.length<1)throw new Error('Sample contact messages failed to load.')
      if(user.fullName==='John Doe'&&analyticsRows.length<1)throw new Error('Sample analytics failed to load.')
    }
    console.log(JSON.stringify({database:DB_PATH,safetyBackup,cleanedLegacyRecords:cleanupCount,existingAdminPreserved:true,preExistingRowsPreserved:true,foreignKeyErrors:0,counts:finalCounts,demoPassword:DEMO_PASSWORD},null,2))
  }finally{db.close()}
  const oldDemo=resolve(__dirname,'../data/demo/linkfolio-demo.sqlite')
  const oldBackup=resolve(__dirname,'../demo-data/linkfolio-demo.sqlite')
  const oldSample=resolve(__dirname,'../demo-data/real-portfolio-sample.json')
  const removed=[]
  for(const file of [oldDemo,oldBackup])if(legacyFileIsKnownDemo(file)){
    const {unlinkSync}=require('node:fs')
    unlinkSync(file);for(const suffix of ['-wal','-shm'])if(existsSync(file+suffix))unlinkSync(file+suffix);removed.push(file)
  }
  if(existsSync(oldSample)){const {unlinkSync}=require('node:fs');unlinkSync(oldSample);removed.push(oldSample)}
  console.log(JSON.stringify({removedPreviousGeneratedFiles:removed},null,2))
}

main().catch(error=>{console.error(`Demo seed failed: ${error.message}`);process.exitCode=1})
