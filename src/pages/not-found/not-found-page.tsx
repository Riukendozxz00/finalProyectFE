import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-sm font-semibold text-kleep-blue">404</p>
        <h1 className="mt-2 text-3xl font-bold text-kleep-ink">Página no encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">La ruta solicitada no existe.</p>
        <Button className="mt-6">
          <Link to="/">Volver al dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
