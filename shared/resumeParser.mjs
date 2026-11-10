// Conservative structure extraction shared by the browser and optional server parser.
export function cleanResumeText(value) {
  return String(value || '').normalize('NFKC').replace(/\r\n?/g, '\n').replaceAll('\0', '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[ \t]+/g, ' ')
    .split('\n').map((line) => line.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
const headings = {
  summary: ['summary', 'professional summary', 'profile', 'professional profile', 'about me', 'objective', 'career objective', 'personal profile'],
  experience: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'career history', 'work & experience'],
  education: ['education', 'academic background', 'qualifications', 'educational background', 'academic qualifications'],
  skills: ['skills', 'technical skills', 'key skills', 'core competencies', 'expertise', 'skills & expertise', 'professional skills', 'skills and abilities'],
  projects: ['projects', 'personal projects', 'selected projects', 'key projects'],
  certifications: ['certifications', 'certificates', 'licenses and certifications', 'certifications & licenses', 'licenses', 'professional certifications'],
  languages: ['languages', 'language', 'language skills'], interests: ['interests', 'hobbies', 'hobbies & interests'],
  courses: ['courses', 'training', 'professional development'], awards: ['awards', 'achievements', 'honors', 'honours'],
  organisations: ['organisations', 'organizations', 'volunteering', 'volunteer experience', 'leadership & activities', 'activities'],
  custom: ['custom', 'additional information', 'additional details'], publications: ['publications'], references: ['references'],
}
export function sectionHeading(line) {
  const cleaned = line.replace(/^[^\p{L}\p{N}]+/u, '').trim()
  const colon = cleaned.indexOf(':')
  const key = (colon >= 0 ? cleaned.slice(0, colon) : cleaned).toLowerCase().replace(/\s+/g, ' ').trim()
  const type = Object.entries(headings).find(([, names]) => names.includes(key))?.[0]
  return type ? { type, rest: colon >= 0 ? cleaned.slice(colon + 1).trim() : '' } : null
}
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const phonePattern = /(?:\+?\d[\d ().-]{6,}\d)/
const bullet = /^[•●▪◦‣*–-]\s*/
const action = /^(?:led|built|developed|designed|created|managed|implemented|improved|delivered|supported|collaborated|responsible|worked|assisted|conducted|achieved|increased|reduced|maintained|coordinated|oversaw|launched|established|performed|prepared|analy[sz]ed|provided|helped|organized|organised|trained|taught|partnered)\b/i
const role = /\b(?:engineer|developer|designer|manager|analyst|director|consultant|specialist|coordinator|assistant|intern|officer|lead|architect|administrator|executive|associate|accountant|teacher|professor|researcher|technician|supervisor|founder|president|head|sales|nurse|chef)\b/i
const degree = /\b(?:bachelor|master|doctor|phd|ph\.d|bsc|b\.sc|msc|m\.sc|mba|b\.a|ba|bs|ms|beng|meng|diploma|certificate|degree|associate|high school)\b/i
const school = /\b(?:university|college|institute|school|academy|polytechnic)\b/i
const month = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
const date = `(?:${month}\\.?\\s+\\d{4}|\\d{4}[-/]\\d{1,2}|\\d{1,2}/\\d{4}|\\d{4})`
const dateRange = new RegExp(`(${date})\\s*(?:[-–—]|\\bto\\b)\\s*(${date}|present|current|now|ongoing)`, 'i')
const dateOnly = new RegExp(`^${date}$`, 'i')
function normalizedDate(value) {
  const input = value.trim().replaceAll('.', '')
  if (/^\d{4}$/.test(input)) return input
  let match = /^(\d{4})[-/](\d{1,2})$/.exec(input)
  if (match) return `${match[1]}-${match[2].padStart(2, '0')}`
  match = /^(\d{1,2})\/(\d{4})$/.exec(input)
  if (match) return `${match[2]}-${match[1].padStart(2, '0')}`
  match = /^(\w+)\s+(\d{4})$/.exec(input)
  if (!match) return value
  const index = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(match[1].slice(0, 3).toLowerCase())
  return index < 0 ? value : `${match[2]}-${String(index + 1).padStart(2, '0')}`
}
function dateDetails(line) {
  const match = line.match(dateRange)
  if (!match) return null
  const current = /^(present|current|now|ongoing)$/i.test(match[2])
  return { startDate: normalizedDate(match[1]), endDate: current ? '' : normalizedDate(match[2]), current,
    remaining: line.replace(match[0], '').replace(/^[\s|,–—-]+|[\s|,–—-]+$/g, '').trim() }
}
const footer = /^(?:page\s*)?\d+\s*(?:of|\/)\s*\d+$|^page\s+\d+$|^(?:references?\s+)?available\s+(?:up)?on\s+request\.?$/i
export function suggestPersonalDetails(text) {
  text = cleanResumeText(text).replace(/([\w.%+-]+)\s+(@[\w.-]+\.[a-z]{2,})/gi, '$1$2')
  const lines = text.split('\n').filter(Boolean)
  const firstHeading = lines.findIndex((line) => sectionHeading(line))
  const header = lines.slice(0, firstHeading < 0 ? Math.min(lines.length, 8) : firstHeading)
  let name = header.find((line) => line.length < 90 && !/[@\d|:/]/.test(line) &&
    !/^(resume|curriculum vitae|cv|contact|personal details)$/i.test(line) && !action.test(line) && line.split(/\s+/).length <= 6) || ''
  const combined = name.match(/^([A-Z][A-Z .'-]+)\s+((?:Junior|Senior|Lead|Full[ -]Stack|Software|Frontend|Backend|Product)\b.+)$/)
  const next = combined ? combined[2] : name ? header[header.indexOf(name) + 1] || '' : ''
  if (combined) name = combined[1].trim()
  const headline = next.length < 120 && !/[@\d|:/]/.test(next) && !/\b(?:street|road|avenue|city)\b/i.test(next) &&
    !next.includes(',') && !action.test(next) && !sectionHeading(next) ? next : ''
  const contact = header.join('\n')
  const links = [...text.matchAll(/(?:https?:\/\/|www\.)[^\s|<>]+|(?:linkedin\.com|github\.com)\/[^\s|<>]+|[\w-]+(?:\.[\w-]+)*\.(?:dev|com|io|net|org)\/[^\s|<>]*|[\w-]+(?:\.[\w-]+)*\.(?:dev|io)|\bin\/[\w-]+/gi)]
    .map(([url]) => ({ label: /linkedin|^in\//i.test(url) ? 'LinkedIn' : /github/i.test(url) ? 'GitHub' : 'Website', url: /^in\//.test(url) ? `https://linkedin.com/${url}` : url.replace(/[.,;]+$/, '') }))
  const location = header.map((line) => line.replace(emailPattern, '').replace(phonePattern, '').split(/[|•]/)).flat().map((line) => line.trim()).find((line) =>
    line !== name && line !== headline && line.includes(',') && !/[@\d:/]/.test(line) && line.length < 100) || ''
  return { fullName: name, headline, email: text.match(emailPattern)?.[0] || '', phone: contact.match(phonePattern)?.[0]?.trim() || '', location, links }
}
function stripContact(line, personal, section) {
  if (footer.test(line)) return ''
  if (section === 'references') return line
  if (/^(resume|curriculum vitae|cv|contact|personal details)$/i.test(line)) return ''
  const known = section === 'header' ? [personal.fullName, personal.headline, personal.email, personal.phone, personal.location] : [personal.fullName, personal.email, personal.phone]
  if (known.filter(Boolean).some((value) => line.toLowerCase() === value.toLowerCase())) return ''
  if (emailPattern.test(line) && line.split(/\s+/).length < 16) return ''
  if (/^(?:phone|email|mobile|tel|location|address|linkedin|website|github)\s*:/i.test(line)) return ''
  if (/^(?:https?:\/\/|www\.|linkedin\.com|github\.com)/i.test(line)) return ''
  return line
}
function entryChunks(lines, type) {
  const relevant = type === 'education' ? (line) => degree.test(line) || school.test(line) : (line) => role.test(line) || /\s(?:at|@)\s/.test(line)
  const starts = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line || bullet.test(line) || action.test(line) || line.length > 160 || /^[a-z]/.test(line) || !relevant(line)) continue
    let start = i
    // A school/company and its degree/role are one heading block, not two entries.
    if (starts.length && lines.slice(starts.at(-1), i).every((value) => !value || (!action.test(value) && !bullet.test(value))) && (type === 'education' ? !degree.test(line) || !lines.slice(starts.at(-1), i).some((value) => degree.test(value)) : i - starts.at(-1) <= 2)) continue
    if (type === 'experience' && i > 0 && lines[i - 1] && !bullet.test(lines[i - 1]) && !action.test(lines[i - 1]) && !relevant(lines[i - 1]) && !dateDetails(lines[i - 1]) && lines[i - 1].length < 85 && (i === 1 || !lines[i - 2] || bullet.test(lines[i - 2]) || action.test(lines[i - 2]))) start = i - 1
    starts.push(start)
  }
  if (!starts.length || starts[0] > 0) starts.unshift(0)
  return starts.map((start, index) => lines.slice(start, starts[index + 1] ?? lines.length)).filter((chunk) => chunk.some(Boolean))
}
function splitLocation(value) {
  const match = value.match(/(?:^|\s+|\s*[|]\s*)([\p{Lu}][\p{L}.'-]*(?: [\p{Lu}][\p{L}.'-]*){0,2},\s*(?:Australia|Thailand|Myanmar|Canada|United States|United Kingdom|USA|UK|Germany|France|Singapore|India|Japan|New Zealand|[A-Z]{2}))$/u)
  return match ? { text: value.slice(0, match.index).trim().replace(/[|,]+$/, '').trim(), location: match[1] } : { text: value, location: '' }
}
function parseEntry(chunk, type) {
  const entry = type === 'education'
    ? { degree: '', school: '', location: '', startDate: '', endDate: '', current: false, description: '' }
    : { jobTitle: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' }
  const body = []
  let headerOpen = true
  for (let original of chunk.filter(Boolean)) {
    const location = splitLocation(original)
    if (location.location) {
      entry.location ||= location.location
      original = location.text
      if (!original) continue
    }
    if (headerOpen && !bullet.test(original) && !action.test(original)) {
      const details = dateDetails(original)
      if (details && original.length < 160) {
        Object.assign(entry, { startDate: details.startDate, endDate: details.endDate, current: details.current })
        original = details.remaining
        if (!original) continue
      } else if (dateOnly.test(original)) {
        entry.endDate = normalizedDate(original)
        continue
      }
      const match = original.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i)
      if (match && !entry[type === 'education' ? 'degree' : 'jobTitle']) {
        entry[type === 'education' ? 'degree' : 'jobTitle'] = match[1]
        entry[type === 'education' ? 'school' : 'company'] = match[2]
        continue
      }
      const titleKey = type === 'education' ? 'degree' : 'jobTitle'
      const orgKey = type === 'education' ? 'school' : 'company'
      if (!entry[titleKey]) {
        const comma = type === 'education' ? original.search(/,\s*(?=[^,]*(?:University|College|Institute|School)\b)/i) : original.indexOf(',')
        if (comma > 0) {
          entry[titleKey] = original.slice(0, comma).trim().replace(/,$/, '')
          entry[orgKey] = original.slice(comma + 1).trim()
          continue
        }
      }
      const parts = original.split(/\s*[|•]\s*/).filter(Boolean)
      const main = parts[0]
      if (parts.length > 1 && !entry.location && /,/.test(parts.at(-1))) entry.location = parts.pop()
      if (!entry[titleKey] && (type === 'education' ? degree.test(main) : role.test(main))) {
        entry[titleKey] = main.replace(/,\s*$/, '')
        if (parts[1]) entry[orgKey] = parts[1]
        continue
      }
      if (!entry[orgKey] && original.length < 110 && (type === 'education' ? school.test(main) : entry.jobTitle || (chunk.find((line) => role.test(line) && !bullet.test(line) && !action.test(line))))) {
        entry[orgKey] = main
        continue
      }
      if (entry[orgKey] && original.includes(',') && original.length < 70 && !action.test(original)) { entry.location ||= original; continue }
    }
    headerOpen = false
    body.push(original)
  }
  entry.description = body.reduce((lines, line) => {
    if (lines.length && !bullet.test(line) && !action.test(line) && line) lines[lines.length - 1] += ' ' + line
    else lines.push(line)
    return lines
  }, []).join('\n')
  return entry
}
function namedEntries(lines, type) {
  const chunks = []
  let current = []
  for (const line of lines) {
    if (!line) { if (current.length) chunks.push(current); current = []; continue }
    if (type === 'certifications' && current.length && ((bullet.test(line) && !/^[-–—]\s*(?:completed|issued|awarded)\b/i.test(line)) || current.some((value) => /\b(?:completed|issued|awarded)\b/i.test(value) && new RegExp(date, 'i').test(value)))) { chunks.push(current); current = [] }
    current.push(line)
  }
  if (current.length) chunks.push(current)
  return chunks.map((chunk) => {
    const first = chunk[0].replace(bullet, '')
    return type === 'projects'
      ? { name: first.length < 140 && !action.test(first) ? first : '', description: (first.length < 140 && !action.test(first) ? chunk.slice(1) : chunk).join('\n'), url: '', subtitle: '', startDate: '', endDate: '', current: false }
      : parseCertificate(chunk)
  })
}
function parseCertificate(chunk) {
  let issueDate = ''
  const lines = chunk.map((line) => line.replace(bullet, '').replace(new RegExp(`(?:[-–—]\\s*)?(?:completed|issued|awarded)(?:\\s+on)?\\s+(${date})`, 'i'), (_, value) => { issueDate = normalizedDate(value); return '' }).trim()).filter(Boolean)
  const pieces = (lines[0] || '').split(/\s+[—–]\s+/)
  let name = pieces[0], issuer = pieces.slice(1).join(' — ')
  const body = lines.slice(1)
  // A wrapped certificate title is part of the name; its awarding body follows.
  if (body[0] && /^(?:professional certificate|certificate|\(advanced\))/i.test(body[0])) name += ' ' + body.shift()
  if (!issuer && body[0]) issuer = body.shift().replace(/^[-–—]\s*|\s*[-–—]$/g, '')
  return { name, issuer, issueDate, description: body.join('\n') }
}
function parseSkills(lines) {
  const result = []
  let group
  for (const raw of lines.filter(Boolean)) {
    const line = raw.replace(bullet, '')
    const inline = line.match(/^(.{1,45}?)\s*(?::| [—–] )\s*(.+)$/)
    if (inline && !/^(?:Languages|Programming languages)$/i.test(inline[1])) {
      group = { name: inline[1].trim(), level: '', description: inline[2].trim() }; result.push(group); continue
    }
    if (!/[,;|•·]/.test(line) && /\b(?:frameworks|tools|workflow|styling|competencies|technologies|databases|frontend|backend|design|development)\b|&/i.test(line) && line.length < 50) {
      group = { name: line, level: '', description: '' }; result.push(group); continue
    }
    if (group) { group.description += (group.description ? ' ' : '') + line; continue }
    result.push(...line.replace(/^[^:]{1,35}:\s*/, '').split(/[,;|•·]/).map((name) => ({ name: name.trim(), level: '', description: '' })).filter((item) => item.name))
  }
  return result.filter((value,index,all) => all.findIndex((item) => item.name.toLowerCase() === value.name.toLowerCase()) === index)
}
function parseLanguages(lines) {
  const result = []
  for (const raw of lines.filter(Boolean)) {
    for (const line of raw.replace(bullet, '').split(/[|;•]/)) {
      const match = line.trim().match(/^(.+?)\s*(?:[—–:-]\s*|\()((?:(?:upper |lower )?intermediate|native|bilingual|fluent|proficient|conversational|basic|beginner|advanced|expert)[^)]*\)?)/i)
      if (match) result.push({ name: match[1].trim(), level: match[2].replace(/\)$/, (value) => match[2].includes('(') ? value : '').trim() })
      else if (result.length && /^(?:native|fluent|upper intermediate|intermediate|advanced|basic)/i.test(line.trim())) result.at(-1).level = line.trim()
      else result.push({ name: line.trim(), level: '' })
    }
  }
  return result
}
export function parseResumeText(source) {
  const text = cleanResumeText(source)
  const personal = suggestPersonalDetails(text)
  const bodies = { header: [] }
  let current = 'header'
  const sectionOrder = []
  for (const raw of text.split('\n')) {
    const heading = sectionHeading(raw)
    if (heading && !(current === 'skills' && heading.type === 'languages' && heading.rest && /\b(?:python|java|javascript|typescript|sql|c\+\+|ruby|rust|golang)\b/i.test(heading.rest))) {
      current = heading.type
      bodies[current] ||= []
      if (!sectionOrder.includes(current)) sectionOrder.push(current)
      if (heading.rest) bodies[current].push(heading.rest)
    } else bodies[current].push(stripContact(raw, personal, current))
  }
  const headerProse = (bodies.header || []).filter((line) => line && (line.length > 100 || action.test(line) || line.split(/\s+/).length >= 5)).join('\n')
  const extras = Object.entries(bodies).filter(([type]) => !['header','summary','experience','education','skills','languages','projects','certifications'].includes(type))
    .map(([type, lines]) => ({ type, heading: type[0].toUpperCase() + type.slice(1), description: lines.filter((line) => !footer.test(line)).join('\n').trim() })).filter((entry) => entry.description)
  const summary = (bodies.summary || []).join('\n').trim() || headerProse
  const warnings = []
  if (!sectionOrder.length) warnings.push('No section headings were detected. Check the summary and add sections in the editor.')
  const experience = entryChunks(bodies.experience || [], 'experience').map((chunk) => parseEntry(chunk, 'experience'))
  const education = entryChunks(bodies.education || [], 'education').map((chunk) => parseEntry(chunk, 'education'))
  if (experience.some((entry) => !entry.jobTitle || !entry.company)) warnings.push('Some job titles or employers need a quick review.')
  if (education.some((entry) => !entry.degree || !entry.school)) warnings.push('Some qualifications or schools need a quick review.')
  return { personal, summary, experience, education, skills: parseSkills(bodies.skills || []), languages: parseLanguages(bodies.languages || []),
    projects: namedEntries(bodies.projects || [], 'projects'), certifications: namedEntries(bodies.certifications || [], 'certifications'), extras, sectionOrder, warnings }
}
