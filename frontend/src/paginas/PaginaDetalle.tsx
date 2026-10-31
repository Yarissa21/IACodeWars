import { Link, useParams } from 'react-router'
import { Aviso } from '../componentes/Aviso'
import { BadgeEstado } from '../componentes/BadgeEstado'
import { Boton } from '../componentes/Boton'
import { Historial } from '../componentes/Historial'
import { ListaCierres } from '../componentes/ListaCierres'
import { Tarjeta } from '../componentes/Tarjeta'
import { useExpediente } from '../hooks/useExpedientes'
import { formatearFechaHora } from '../lib/fechas'
import { ErrorApi, mensajeDeError } from '../lib/http'
import { ETIQUETAS_CATEGORIA, type Expediente } from '../tipos/expediente'

const estiloVolver = 'text-sm font-medium text-teal-700 underline-offset-2 hover:underline'

function DatosExpediente({ expediente }: { expediente: Expediente }) {
  const filas = [
    { termino: 'Solicitante', valor: expediente.solicitante },
    { termino: 'Responsable', valor: expediente.responsable },
    {
      termino: 'Categoría',
      valor: expediente.categoria ? ETIQUETAS_CATEGORIA[expediente.categoria] : 'Sin categoría',
    },
    { termino: 'Apertura', valor: formatearFechaHora(expediente.abiertoEn) },
  ]

  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {filas.map((fila) => (
        <div key={fila.termino}>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{fila.termino}</dt>
          <dd className="mt-0.5 break-words text-sm text-slate-900">{fila.valor}</dd>
        </div>
      ))}
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Estado actual</dt>
        <dd className="mt-1">
          <BadgeEstado estado={expediente.estado} />
        </dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Descripción</dt>
        <dd className="mt-0.5 whitespace-pre-line break-words text-sm text-slate-900">
          {expediente.descripcion}
        </dd>
      </div>
    </dl>
  )
}

export function PaginaDetalle() {
  const { codigo = '' } = useParams()
  const codigoNormalizado = codigo.trim().toUpperCase()
  const consulta = useExpediente(codigoNormalizado)

  if (consulta.isPending) {
    return <p className="text-sm text-slate-600">Cargando expediente…</p>
  }

  if (consulta.isError) {
    const noExiste = consulta.error instanceof ErrorApi && consulta.error.estado === 404
    return (
      <div className="mx-auto max-w-xl space-y-4">
        {noExiste ? (
          <Aviso tono="info" titulo={`No existe el expediente «${codigoNormalizado}».`}>
            <p>Revisa el identificador o búscalo en el listado.</p>
          </Aviso>
        ) : (
          <Aviso tono="error" titulo="No se pudo cargar el expediente.">
            <p>{mensajeDeError(consulta.error)}</p>
            <Boton variante="secundario" className="mt-3" onClick={() => void consulta.refetch()}>
              Reintentar
            </Boton>
          </Aviso>
        )}
        <Link to="/expedientes" className={estiloVolver}>
          ← Volver al listado de expedientes
        </Link>
      </div>
    )
  }

  const expediente = consulta.data

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link to="/expedientes" className={estiloVolver}>
          ← Volver al listado
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold text-slate-900">{expediente.id}</h1>
          <BadgeEstado estado={expediente.estado} />
        </div>
      </div>

      <Tarjeta titulo="Datos del expediente">
        <DatosExpediente expediente={expediente} />
      </Tarjeta>

      <Tarjeta titulo="Cierres" descripcion="Del más antiguo al más reciente.">
        <ListaCierres cierres={expediente.cierres} />
      </Tarjeta>

      <Tarjeta titulo="Historial" descripcion="En orden cronológico.">
        <Historial entradas={expediente.historial} />
      </Tarjeta>
    </div>
  )
}
