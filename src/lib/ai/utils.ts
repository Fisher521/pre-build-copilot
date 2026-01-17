/**
 * AI Request Utilities
 * Provides timeout and retry mechanisms for AI API calls
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  timeoutMs?: number
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 2,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  timeoutMs: 45000, // 45 seconds
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeout<T>(ms: number, message: string): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms)
  })
}

/**
 * Execute an async function with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Request timeout'
): Promise<T> {
  return Promise.race([
    fn(),
    createTimeout<T>(timeoutMs, timeoutMessage)
  ])
}

/**
 * Execute an async function with retry and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null
  let delay = opts.initialDelayMs

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Wrap the function call with timeout
      const result = await withTimeout(
        fn,
        opts.timeoutMs,
        `AI 请求超时 (${opts.timeoutMs / 1000}秒)`
      )
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Log the error
      console.warn(
        `AI request attempt ${attempt + 1}/${opts.maxRetries + 1} failed:`,
        lastError.message
      )

      // Don't retry on certain errors
      if (isNonRetryableError(lastError)) {
        throw lastError
      }

      // If this was the last attempt, throw
      if (attempt === opts.maxRetries) {
        throw lastError
      }

      // Wait before retrying with exponential backoff
      await sleep(delay)
      delay = Math.min(delay * 2, opts.maxDelayMs)
    }
  }

  throw lastError || new Error('Unknown error')
}

/**
 * Check if an error should not be retried
 */
function isNonRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()

  // Don't retry authentication errors
  if (message.includes('api key') || message.includes('unauthorized') || message.includes('401')) {
    return true
  }

  // Don't retry invalid request errors
  if (message.includes('invalid') || message.includes('400')) {
    return true
  }

  return false
}

/**
 * Parse AI error to user-friendly message
 */
export function parseAIError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('timeout') || message.includes('超时')) {
      return 'AI 响应超时，请重试'
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('load failed')) {
      return '网络连接失败，请检查网络后重试'
    }

    if (message.includes('api key') || message.includes('unauthorized')) {
      return 'AI 服务配置错误，请联系管理员'
    }

    if (message.includes('rate limit') || message.includes('429')) {
      return 'AI 服务繁忙，请稍后重试'
    }

    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'AI 服务暂时不可用，请稍后重试'
    }

    // Return original message if it's already user-friendly (Chinese)
    if (/[\u4e00-\u9fa5]/.test(error.message)) {
      return error.message
    }
  }

  return 'AI 服务异常，请稍后重试'
}

/**
 * Stream chunk timeout wrapper
 * Throws error if no chunk received within timeout period
 */
export class StreamTimeoutWrapper<T> {
  private timeoutId: NodeJS.Timeout | null = null
  private timeoutMs: number
  private onTimeout: () => void

  constructor(timeoutMs: number, onTimeout: () => void) {
    this.timeoutMs = timeoutMs
    this.onTimeout = onTimeout
  }

  resetTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    this.timeoutId = setTimeout(() => {
      this.onTimeout()
    }, this.timeoutMs)
  }

  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
}
