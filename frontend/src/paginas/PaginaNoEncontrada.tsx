import { Link } from 'react-router'
import { Icono } from '../componentes/Icono'

export function PaginaNoEncontrada() {
  return (
    <section className="mx-auto max-w-lg py-16 text-center">
      <p className="font-mono text-sm font-semibold text-acento-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">La dirección que abriste no existe en la aplicación.</p>
      <Link
        to="/expedientes"
        className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-marca-700 hover:text-marca-900"
      >
        <Icono nombre="flechaIzquierda" className="size-4" />
        Ir a los expedientes
      </Link>
    </section>
  )
}
