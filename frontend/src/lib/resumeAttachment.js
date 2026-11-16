export function validResumeAttachment(file) {
  return file === null || (
    file && typeof file === 'object' &&
    typeof file.name === 'string' && file.name.length > 0 && file.name.length <= 255 &&
    typeof file.data === 'string' && file.data.length <= 2800000 &&
    /^data:application\/pdf;base64,JVBERi0[A-Za-z0-9+/]*={0,2}$/.test(file.data)
  )
}
