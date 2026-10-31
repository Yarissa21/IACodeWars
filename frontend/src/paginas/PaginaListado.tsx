import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Aviso } from '../componentes/Aviso'
import { BadgeEstado } from '../componentes/BadgeEstado'
import { Boton } from '../componentes/Boton'
import { EncabezadoPagina } from '../componentes/EncabezadoPagina'
import { Icono } from '../componentes/Icono'
import { useListaExpedientes } from '../hooks/useExpedientes'
import { useValorDiferido } from '../hooks/useValorDiferido'
import { formatearFecha } from '../lib/fechas'
import { mensajeDeError } from '../lib/http'
import { iniciales } from '../lib/texto'
import type { Estado, ResumenExpediente } from '../tipos/expediente'

interface Indicador {
  etiqueta: string
  valor: number
  punto: string
}

function calcularIndicadores(expedientes: ResumenExpediente[]): Indicador[] {
  const contar = (estado: Estado) => expedientes.filter((expediente) => expediente.estado === estado).length
  return [
    { etiqueta: 'Total', valor: expedientes.length, punto: 'bg-marca-700' },
    { etiqueta: 'Abiertos', valor: contar('abierto'), punto: 'bg-sky-500' },
    { etiqueta: 'En seguimiento', valor: contar('en_seguimiento'), punto: 'bg-amber-500' },
    { etiqueta: 'Cerrados', valor: contar('cerrado'), punto: 'bg-slate-500' },
  ]
}

function Indicadores() {
  const consulta = useListaExpedientes('')
  const indicadores = calcularIndicadores(consulta.data ?? [])
  return (
    <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {indicadores.map((indicador) => (
        <div
          key={indicador.etiqueta}
          className="rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        >
          <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span aria-hidden="true" className={`size-2 rounded-full ${indicador.punto}`} />
            {indicador.etiqueta}
          </dt>
          <dd className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
            {consulta.isPending ? '—' : indicador.valor}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function PaginaListado() {
  const [parametros, setParametros] = useSearchParams()
  const terminoUrl = parametros.get('q') ?? ''
  const [texto, setTexto] = useState(terminoUrl)
  const termino = useValorDiferido(texto.trim(), 300)
  const consulta = useListaExpedientes(termino)

  useEffect(() => {
    if (termino === terminoUrl) {
      return
    }
    setParametros(termino ? { q: termino } : {}, { replace: true })
  }, [termino, terminoUrl, setParametros])

  const expedientes = consulta.data ?? []

  return (
    <>
      <EncabezadoPagina
        titulo="Expedientes"
        descripcion="Consulta los casos del bufete, busca por identificador o persona y abre su detalle."
        acciones={
          <Link
            to="/expedientes/nuevo"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-marca-800 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-marca-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500 focus-visible:ring-offset-2"
          >
            <Icono nombre="mas" className="size-4" />
            Abrir expediente
          </Link>
        }
      />

      <Indicadores />

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <form
          role="search"
          onSubmit={(evento) => evento.preventDefault()}
          className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-6"
        >
          <label htmlFor="busqueda" className="sr-only">
            Buscar por identificador o nombre
          </label>
          <div className="relative min-w-0 flex-1">
            <Icono
              nombre="buscar"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              id="busqueda"
              type="search"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Buscar por identificador (EXP-0001) o por nombre o alias"
              className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-marca-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-marca-500/15"
            />
          </div>
          {texto ? (
            <Boton variante="fantasma" onClick={() => setTexto('')}>
              Limpiar
            </Boton>
          ) : null}
        </form>

        {consulta.isPending ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">Cargando expedientes…</p>
        ) : consulta.isError ? (
          <div className="p-6">
            <Aviso tono="error" titulo="No se pudieron cargar los expedientes.">
              <p>{mensajeDeError(consulta.error)}</p>
              <Boton variante="secundario" className="mt-3" onClick={() => void consulta.refetch()}>
                Reintentar
              </Boton>
            </Aviso>
          </div>
        ) : expedientes.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Icono nombre={termino ? 'buscar' : 'carpeta'} className="size-6" />
            </span>
            {termino ? (
              <div role="status">
                <p className="mt-4 font-semibold text-slate-900">No se encontraron expedientes para «{termino}».</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Revisa que el identificador (por ejemplo, EXP-0001) o el nombre o alias estén bien escritos. La
                  búsqueda no distingue mayúsculas.
                </p>
                <Boton variante="secundario" className="mt-4" onClick={() => setTexto('')}>
                  Ver todos los expedientes
                </Boton>
              </div>
            ) : (
              <div role="status">
                <p className="mt-4 font-semibold text-slate-900">Todavía no hay expedientes registrados.</p>
                <p className="mt-1 text-sm text-slate-500">Cuando abras uno aparecerá aquí.</p>
                <Link
                  to="/expedientes/nuevo"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-marca-700 hover:text-marca-900"
                >
                  Abrir el primer expediente
                  <Icono nombre="flechaDerecha" className="size-4" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="min-w-full text-sm">
              <caption className="sr-only">Listado de expedientes</caption>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-6 py-3">Identificador</th>
                  <th scope="col" className="px-6 py-3">Persona</th>
                  <th scope="col" className="hidden px-6 py-3 md:table-cell">Responsable</th>
                  <th scope="col" className="hidden px-6 py-3 lg:table-cell">Apertura</th>
                  <th scope="col" className="px-6 py-3">Estado</th>
                  <th scope="col" className="px-6 py-3 text-right">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expedientes.map((expediente) => (
                  <tr key={expediente.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-[13px] font-semibold text-marca-800">
                      {expediente.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-marca-100 text-xs font-semibold text-marca-800">
                          {iniciales(expediente.solicitante)}
                        </span>
                        <span className="font-medium text-slate-900">{expediente.solicitante}</span>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-slate-600 md:table-cell">{expediente.responsable}</td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-slate-500 lg:table-cell">
                      {formatearFecha(expediente.abiertoEn)}
                    </td>
                    <td className="px-6 py-4">
                      <BadgeEstado estado={expediente.estado} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        to={`/expedientes/${expediente.id}`}
                        aria-label={`Ver detalle de ${expediente.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-marca-700 transition-colors hover:bg-marca-50 hover:text-marca-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-500"
                      >
                        Ver detalle
                        <Icono nombre="flechaDerecha" className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
