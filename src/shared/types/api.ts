export type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ApiErrorPayload {
  status: number
  message: string
  code?: string
  details?: unknown
}

export type ApiEnvelope<T> =
  | T
  | {
      data?: T
      result?: T
      results?: T
      item?: T
      items?: T
      message?: string
      error?: string
    }

export interface IdName {
  id: string
  nombre: string
}
