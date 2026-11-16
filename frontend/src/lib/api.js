export async function api(path, { method = 'GET', body, signal, cache } = {}) {
  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      signal,
      ...(cache ? { cache } : {}),
      headers: { 'Content-Type': 'application/json', 'X-Linkfolio-Request': '1' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error(
      'Could not reach Linkfolio. Check your connection and that the server is running.',
      { cause: error },
    )
  }
  const data = await response.json().catch(() => null)
  if (!response.ok || !data) {
    const error = new Error(data?.error || 'The Linkfolio server is unavailable. Please try again.')
    error.status = response.status
    error.code = data?.code
    const retryAfter = Number(response.headers.get('Retry-After') || data?.retryAfter)
    if (Number.isFinite(retryAfter) && retryAfter > 0) error.retryAfterSeconds = retryAfter
    throw error
  }
  return data
}
