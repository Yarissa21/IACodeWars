import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Aviso } from '../componentes/Aviso'
import { BadgeEstado } from '../componentes/BadgeEstado'
import { Boton } from '../componentes/Boton'
import { estiloControl } from '../componentes/Campo'
import { useListaExpedientes } from '../hooks/useExpedientes'
import { useValorDiferido } from '../hooks/useValorDiferido'
import { mensajeDeError } from '../lib/http'

const estiloEnlaceBoton =
  'inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600'

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
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Expedientes</h1>
          <p className="text-sm text-slate-600">Consulta los expedientes y abre su detalle con el historial.</p>
        </div>
        <Link
          to="/expedientes/nuevo"
          className="inline-flex items-center rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Abrir expediente
        </Link>
      </div>

      <form role="search" onSubmit={(evento) => evento.preventDefault()} className="flex gap-2">
        <label htmlFor="busqueda" className="sr-only">
          Buscar por identificador o nombre
        </label>
        <input
          id="busqueda"
          type="search"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Buscar por identificador (EXP-0001) o por nombre o alias"
          className={estiloControl}
        />
        {texto ? (
          <Boton variante="secundario" onClick={() => setTexto('')}>
            Limpiar
          </Boton>
        ) : null}
      </form>

      {consulta.isPending ? (
        <p className="text-sm text-slate-600">Cargando expedientes…</p>
      ) : consulta.isError ? (
        <Aviso tono="error" titulo="No se pudieron cargar los expedientes.">
          <p>{mensajeDeError(consulta.error)}</p>
          <Boton variante="secundario" className="mt-3" onClick={() => void consulta.refetch()}>
            Reintentar
          </Boton>
        </Aviso>
      ) : expedientes.length === 0 ? (
        termino ? (
          <Aviso tono="info" titulo={`No se encontraron expedientes para «${termino}».`}>
            <p>
              Revisa que el identificador (por ejemplo, EXP-0001) o el nombre o alias estén bien
              escritos. La búsqueda no distingue mayúsculas.
            </p>
            <Boton variante="secundario" className="mt-3" onClick={() => setTexto('')}>
              Ver todos los expedientes
            </Boton>
          </Aviso>
        ) : (
          <Aviso tono="neutro" titulo="Todavía no hay expedientes registrados.">
            <p>
              Cuando abras uno aparecerá aquí.{' '}
              <Link to="/expedientes/nuevo" className="font-medium text-teal-700 underline underline-offset-2">
                Abrir el primer expediente
              </Link>
            </p>
          </Aviso>
        )
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <caption className="sr-only">Listado de expedientes</caption>
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3">Identificador</th>
                <th scope="col" className="px-4 py-3">Persona</th>
                <th scope="col" className="px-4 py-3">Responsable</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3 text-right">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expedientes.map((expediente) => (
                <tr key={expediente.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-900">{expediente.id}</td>
                  <td className="px-4 py-3 text-slate-800">{expediente.solicitante}</td>
                  <td className="px-4 py-3 text-slate-700">{expediente.responsable}</td>
                  <td className="px-4 py-3">
                    <BadgeEstado estado={expediente.estado} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      to={`/expedientes/${expediente.id}`}
                      className={estiloEnlaceBoton}
                      aria-label={`Ver detalle de ${expediente.id}`}
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
