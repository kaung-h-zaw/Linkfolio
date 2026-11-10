const string = { type: 'string' }
const bool = { type: 'boolean' }
const object = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false })
const strings = (...keys) => Object.fromEntries(keys.map((key) => [key, string]))
const array = (items) => ({ type: 'array', items })
const dated = { ...strings('location', 'startDate', 'endDate', 'description'), current: bool }
export const resumeSchema = object({
  personal: object({ ...strings('fullName','headline','email','phone','location'), links: array(object(strings('label','url'))) }),
  summary: string,
  experience: array(object({ ...strings('jobTitle','company'), ...dated })),
  education: array(object({ ...strings('degree','school'), ...dated })),
  skills: array(object(strings('name','level','description'))), languages: array(object(strings('name','level'))),
  projects: array(object({ ...strings('name','url','subtitle','startDate','endDate','description'), current: bool })),
  certifications: array(object(strings('name','issuer','issueDate','description'))),
  extras: array(object({ type: { type: 'string', enum: ['interests','courses','awards','organisations','publications','references','declaration','custom'] }, ...strings('heading','description') })),
  sectionOrder: array(string), warnings: array(string),
})
export function validParsedResume(value, schema = resumeSchema) {
  if (schema.type === 'string') return typeof value === 'string' && value.length <= 60_000 && (!schema.enum || schema.enum.includes(value))
  if (schema.type === 'boolean') return typeof value === 'boolean'
  if (schema.type === 'array') return Array.isArray(value) && value.length <= 100 && value.every((item) => validParsedResume(item, schema.items))
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).every((key) => key in schema.properties) &&
    schema.required.every((key) => validParsedResume(value[key], schema.properties[key]))
}
