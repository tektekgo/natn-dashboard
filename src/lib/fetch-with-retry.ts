/**
 * Fetch wrapper with exponential backoff retry for transient failures.
 */

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504]
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      if (response.ok || !RETRYABLE_STATUS_CODES.includes(response.status)) {
        return response
      }

      // Retryable status code
      if (attempt < maxRetries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt)
        await sleep(delay)
        continue
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt)
        await sleep(delay)
        continue
      }
    }
  }

  throw lastError || new Error(`Fetch failed after ${maxRetries + 1} attempts`)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
