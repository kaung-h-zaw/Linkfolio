export function sameResumeProfile(left, right, contentOnly = false) {
  if (left === right) return true
  const keys = object => Object.keys(object).filter(key => !contentOnly || !['design','templateId'].includes(key))
  const leftKeys = keys(left), rightKeys = keys(right)
  return leftKeys.length === rightKeys.length && leftKeys.every(key => left[key] === right[key])
}
