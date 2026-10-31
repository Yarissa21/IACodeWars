import { Link } from 'react-router'

export function PaginaNoEncontrada() {
  return (
    <section className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-600">La dirección que abriste no existe en la aplicación.</p>
      <Link
        to="/"
        className="mt-4 inline-block text-sm font-medium text-teal-700 underline-offset-2 hover:underline"
      >
        Ir al inicio
      </Link>
    </section>
  )
}
