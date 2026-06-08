import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorPayload } from '@/shared/types/api'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipUnauthorizedHandler?: boolean
  }
}

const API_URL = import.meta.env.VITE_API_URL ?? 'https://miguelbe.miguelcastilloba.com'
const TOKEN_KEY = 'app.accessToken'

let onUnauthorized: (() => void) | undefined

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const payload = normalizeHttpError(error)
    const skipUnauthorizedHandler = (
      error.config as { skipUnauthorizedHandler?: boolean } | undefined
    )?.skipUnauthorizedHandler
    if (payload.status === 401 && !skipUnauthorizedHandler) onUnauthorized?.()
    return Promise.reject(payload)
  },
)

export function setAccessToken(token?: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

export function normalizeHttpError(error: AxiosError): ApiErrorPayload {
  const status = error.response?.status ?? 0
  const data = error.response?.data as Record<string, unknown> | undefined
  const message =
    (typeof data?.message === 'string' && data.message) ||
    (typeof data?.error === 'string' && data.error) ||
    defaultMessageByStatus(status) ||
    error.message

  return {
    status,
    message,
    code: typeof data?.code === 'string' ? data.code : undefined,
    details: data,
  }
}

function defaultMessageByStatus(status: number) {
  const messages: Record<number, string> = {
    400: 'Solicitud inválida. Revisa la información capturada.',
    401: 'Tu sesión expiró o no está autorizada.',
    404: 'El recurso solicitado no existe.',
    500: 'El servidor no pudo procesar la solicitud.',
  }
  return messages[status]
}
