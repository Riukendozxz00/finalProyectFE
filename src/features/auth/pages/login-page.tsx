import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { endpoints } from '@/shared/api/endpoints'
import { httpClient } from '@/shared/api/httpClient'
import { parseApiData } from '@/shared/api/response'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { useSessionStore, type SessionUser } from '../session'

const loginSchema = z.object({
  user: z.string().min(1, 'Captura el usuario'),
  pass: z.string().min(1, 'Captura la contrasena'),
})

type LoginForm = z.infer<typeof loginSchema>

interface LoginResponse {
  id?: string | number
  ownId?: string | number
  idUsuario?: string | number
  usuarioId?: string | number
  empleadoId?: string | number
  empleado_id?: string | number
  nombre?: string
  name?: string
  usuario?: LoginResponse
  user?: LoginResponse
  data?: LoginResponse
  ejecutivo?: LoginResponse
  personal?: LoginResponse
  rol?: string
  posicionId?: string | number
  posicion_id?: string | number
  token?: string
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value)
    }
  }
  return ''
}

function normalizeLoginResponse(data: LoginResponse, fallbackUser: string): SessionUser {
  const nested =
    data.usuario ?? data.user ?? data.data ?? data.ejecutivo ?? data.personal ?? data
  const id = firstString(
    nested.ownId,
    nested.empleadoId,
    nested.empleado_id,
    nested.idUsuario,
    nested.usuarioId,
    nested.id,
    data.ownId,
    data.empleadoId,
    data.empleado_id,
    data.idUsuario,
    data.usuarioId,
    data.id,
    fallbackUser,
  )

  return {
    id,
    nombre:
      nested.nombre ??
      nested.name ??
      data.nombre ??
      data.name ??
      `Usuario ${fallbackUser}`,
    rol: nested.rol ?? data.rol,
    posicionId:
      firstString(
        nested.posicionId,
        nested.posicion_id,
        data.posicionId,
        data.posicion_id,
      ) || undefined,
    token: nested.token ?? data.token,
  }
}

function mergeSession(base: SessionUser, next: LoginResponse): SessionUser {
  const normalized = normalizeLoginResponse(next, base.id)
  return {
    ...base,
    ...normalized,
    id: normalized.id || base.id,
    token: normalized.token ?? base.token,
  }
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const user = useSessionStore((state) => state.user)
  const setUser = useSessionStore((state) => state.setUser)
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      user: '',
      pass: '',
    },
  })

  const login = useMutation({
    mutationFn: async (payload: LoginForm) => {
      const response = await httpClient.post(endpoints.auth.login, payload)
      const session = normalizeLoginResponse(
        parseApiData<LoginResponse>(response.data),
        payload.user,
      )

      try {
        const userInfoResponse = await httpClient.get(
          endpoints.usuarios.detalle(session.id),
        )
        return mergeSession(session, parseApiData<LoginResponse>(userInfoResponse.data))
      } catch {
        return session
      }
    },
    onSuccess: (session) => {
      setUser(session)
      navigate(from, { replace: true })
    },
  })

  if (user) return <Navigate to="/" replace />

  return (
    <main className="grid min-h-screen bg-[#f6f8ff] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden min-h-screen bg-kleep-ink px-10 py-10 text-white lg:flex lg:flex-col">
        <div className="flex items-center">
          <img
            src="/favicon.png"
            alt="KLEEP"
            width="1024"
            height="1024"
            className="h-24 w-24 object-contain"
          />
        </div>

        <div className="mt-auto max-w-xl pb-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-kleep-soft">
            Operacion comercial
          </p>
          <h1 className="mt-4 text-5xl font-black leading-tight">
            Control centralizado para equipos, clientes y credito.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/65">
            Administra usuarios, permisos, cartera, bases, cotizaciones y facturas desde
            una consola pensada para trabajo diario.
          </p>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {['Usuarios', 'Clientes', 'Facturas'].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/10 bg-white/[0.08] p-4"
              >
                <p className="text-sm font-semibold text-white">{item}</p>
                <p className="mt-1 text-xs text-white/45">Modulo activo</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid min-h-screen place-items-center px-4 py-10">
        <Card className="w-full max-w-md p-7">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-kleep-blue">
                Acceso seguro
              </p>
              <h1 className="mt-2 text-3xl font-black text-kleep-ink">Iniciar sesion</h1>
              <p className="mt-2 text-sm text-slate-500">
                Entra con tus credenciales de ejecutivo.
              </p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-kleep-soft text-kleep-blue">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>

          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((data) => login.mutate(data))}
          >
            <Input
              label="Empleado"
              placeholder="Ej. 12345"
              {...form.register('user')}
              error={form.formState.errors.user?.message}
            />
            <Input
              label="Contrasena"
              type={showPassword ? 'text' : 'password'}
              {...form.register('pass')}
              error={form.formState.errors.pass?.message}
              rightSlot={
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  className="rounded p-1 text-slate-500 hover:bg-kleep-soft"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />
            {login.error ? (
              <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {login.error.message}
              </p>
            ) : null}
            <Button type="submit" isLoading={login.isPending} className="w-full">
              Entrar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </section>
    </main>
  )
}
