export interface SseEvent<T = unknown> {
  event: string
  data: T
}

export interface StreamSseOptions {
  url: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: BodyInit | null
  credentials?: RequestCredentials
  signal?: AbortSignal
  onEvent: (event: SseEvent) => void
  onError?: (error: Error) => void
  onOpen?: () => void
  onClose?: () => void
}

export interface SseConnection {
  stop: () => void
  finished: Promise<void>
}

export function streamSse({
  url,
  method = 'GET',
  headers = {},
  body = null,
  credentials = 'include',
  signal,
  onEvent,
  onError,
  onOpen,
  onClose,
}: StreamSseOptions): SseConnection {
  const controller = signal ? null : new AbortController()
  const abortSignal = signal ?? controller!.signal

  let isClosed = false
  let hasSettled = false
  let closeNotified = false

  const safeClose = () => {
    if (!closeNotified) {
      closeNotified = true
      onClose?.()
    }
  }

  const resolveOnce = (resolve: () => void) => {
    if (!hasSettled) {
      hasSettled = true
      resolve()
    }
  }

  const rejectOnce = (reject: (reason?: unknown) => void, error: Error) => {
    if (!hasSettled) {
      hasSettled = true
      reject(error)
    }
  }

  let finishedResolve!: () => void
  let finishedReject!: (reason?: unknown) => void

  const finished = new Promise<void>((resolve, reject) => {
    finishedResolve = () => resolveOnce(resolve)
    finishedReject = (error?: unknown) => rejectOnce(reject, (error as Error) ?? new Error('Streaming failed'))
  })

  const start = async () => {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...headers,
        },
        body,
        credentials,
        signal: abortSignal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      onOpen?.()

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let eventType = 'message'

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.substring(6).trim() || 'message'
            } else if (line.startsWith('data:')) {
              const dataText = line.substring(5).trim()
              let parsed: unknown = dataText

              if (dataText.length > 0) {
                try {
                  parsed = JSON.parse(dataText)
                } catch {
                  parsed = dataText
                }
              }

              onEvent({ event: eventType, data: parsed })
            } else if (line === '') {
              eventType = 'message'
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      safeClose()
      finishedResolve()
    } catch (rawError: any) {
      if (rawError?.name === 'AbortError') {
        safeClose()
        finishedResolve()
        return
      }

      const error = rawError instanceof Error ? rawError : new Error('Streaming failed')
      onError?.(error)
      safeClose()
      finishedReject(error)
    }
  }

  start()

  return {
    stop: () => {
      if (isClosed) return
      isClosed = true
      if (!signal) {
        controller?.abort()
      }
    },
    finished,
  }
}

