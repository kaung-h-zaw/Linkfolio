const demoImages = ['/images/resume-demo.jpg', '/images/portfolio-workspace.jpg', '/images/portfolio-desk.jpg', '/images/portfolio-analytics.jpg']
export function portfolioImageSource(value) {
  return typeof value === 'string' && (demoImages.includes(value) || (value.length < 650_000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value))) ? value : ''
}
export function validPortfolioImages(value) {
  return value === undefined || (value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).every((key) => ['portrait','cover','projects','portraitSource','showPortrait'].includes(key)) &&
    (value.showPortrait === undefined || typeof value.showPortrait === 'boolean') &&
    (value.portraitSource === undefined || ['resume','custom'].includes(value.portraitSource)) &&
    ['portrait','cover'].every((key) => value[key] === undefined || value[key] === '' || !!portfolioImageSource(value[key])) &&
    (value.projects === undefined || (value.projects && typeof value.projects === 'object' && !Array.isArray(value.projects) && Object.keys(value.projects).length <= 20 && Object.entries(value.projects).every(([key, image]) => /^[\w-]{1,100}$/.test(key) && (image === '' || !!portfolioImageSource(image))))) && JSON.stringify(value).length < 3_500_000)
}
export async function readPortfolioImage(file) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP image.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Choose an image smaller than 5 MB.')
  const bitmap = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    const scale = Math.min(1,1200 / Math.max(bitmap.width,bitmap.height))
    canvas.width = Math.max(1,Math.round(bitmap.width * scale)); canvas.height = Math.max(1,Math.round(bitmap.height * scale))
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height)
    let result = canvas.toDataURL('image/jpeg',.82)
    if (result.length >= 650_000) result = canvas.toDataURL('image/jpeg',.55)
    if (result.length >= 650_000) throw new Error('This image is too detailed. Choose a smaller image.')
    return result
  } finally { bitmap.close() }
}
export const portfolioDemoImages = { portrait:demoImages[0], cover:demoImages[1], projectCovers:demoImages.slice(1) }

export function resolvePortfolioPortrait(settings, personal = {}) {
  const images = settings.images || {}
  if (images.showPortrait === false) return ''
  if (images.portraitSource === 'custom') return portfolioImageSource(images.portrait)
  if (images.portraitSource === 'resume') return portfolioImageSource(personal.photo)
  return portfolioImageSource(images.portrait) || portfolioImageSource(personal.photo)
}
