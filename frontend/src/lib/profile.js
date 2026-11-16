export const emptyProfile = {
  personal: {
    fullName: '',
    photo: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: '',
    links: [],
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certificates: [],
  links: [],
}
export function hydrateProfile(document) {
  return {
    ...emptyProfile,
    ...document,
    personal: { ...emptyProfile.personal, ...document?.personal },
  }
}
