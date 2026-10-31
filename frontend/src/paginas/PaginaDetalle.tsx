import { Link, useParams } from 'react-router'
import { AccionesEstado } from '../componentes/AccionesEstado'
import { Aviso } from '../componentes/Aviso'
import { BadgeEstado } from '../componentes/BadgeEstado'
import { Boton } from '../componentes/Boton'
import { EncabezadoPagina } from '../componentes/EncabezadoPagina'
import { FormularioActividad } from '../componentes/FormularioActividad'
import { Historial } from '../componentes/Historial'
import { Icono, type NombreIcono } from '../componentes/Icono'
import { ListaCierres } from '../componentes/ListaCierres'
import { Tarjeta } from '../componentes/Tarjeta'
import { useExpediente } from '../hooks/useExpedientes'
import { formatearFechaHora } from '../lib/fechas'
import { ErrorApi, mensajeDeError } from '../lib/http'
import { ETIQUETAS_CATEGORIA, contarActividades, type Expediente } from '../tipos/expediente'

function Migas({ codigo }: { codigo: string }) {
  return (
    <nav aria-label="Ruta" className="flex items-center gap-1.5 text-sm text-slate-500">
      <Link to="/expedientes" className="font-medium hover:text-marca-800">
        Expedientes
      </Link>
      <Icono nombre="flechaDerecha" className="size-3.5 text-slate-400" />
      <span className="font-mono text-slate-700">{codigo}</span>
    </nav>
  )
}

function Dato({ icono, termino, children }: { icono: NombreIcono; termino: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icono nombre={icono} className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-slate-500">{termino}</dt>
        <dd className="mt-0.5 break-words text-sm font-medium text-slate-900">{children}</dd>
      </div>
    </div>
  )
}

function DatosExpediente({ expediente }: { expediente: Expediente }) {
  return (
    <div className="space-y-6">
      <dl className="grid gap-5 sm:grid-cols-2">
        <Dato icono="usuario" termino="Solicitante">
          {expediente.solicitante}
        </Dato>
        <Dato icono="usuario" termino="Responsable">
          {expediente.responsable}
        </Dato>
        <Dato icono="etiqueta" termino="Categoría">
          {expediente.categoria ? ETIQUETAS_CATEGORIA[expediente.categoria] : 'Sin categoría'}
        </Dato>
        <Dato icono="calendario" termino="Apertura">
          {formatearFechaHora(expediente.abiertoEn)}
        </Dato>
      </dl>
      <div className="border-t border-slate-100 pt-5">
        <p className="text-xs font-medium text-slate-500">Descripción</p>
        <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-slate-800">
          {expediente.descripcion}
        </p>
      </div>
    </div>
  )
}

export function PaginaDetalle() {
  const { codigo = '' } = useParams()
  const codigoNormalizado = codigo.trim().toUpperCase()
  const consulta = useExpediente(codigoNormalizado)

  if (consulta.isPending) {
    return <p className="py-10 text-center text-sm text-slate-500">Cargando expediente…</p>
  }

  if (consulta.isError) {
    const noExiste = consulta.error instanceof ErrorApi && consulta.error.estado === 404
    return (
      <div className="mx-auto max-w-xl space-y-5 py-6">
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
        <Link
          to="/expedientes"
          className="inline-flex items-center gap-1 text-sm font-semibold text-marca-700 hover:text-marca-900"
        >
          <Icono nombre="flechaIzquierda" className="size-4" />
          Volver al listado de expedientes
        </Link>
      </div>
    )
  }

  const expediente = consulta.data
  const actividades = contarActividades(expediente)

  return (
    <>
      <EncabezadoPagina
        superior={<Migas codigo={expediente.id} />}
        titulo={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-mono">{expediente.id}</span>
            <BadgeEstado estado={expediente.estado} />
          </span>
        }
        descripcion={
          <span>
            {expediente.solicitante} · {actividades} {actividades === 1 ? 'actividad' : 'actividades'} ·{' '}
            {expediente.cierres.length} {expediente.cierres.length === 1 ? 'cierre' : 'cierres'}
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tarjeta titulo="Datos del expediente">
            <DatosExpediente expediente={expediente} />
          </Tarjeta>

          <Tarjeta titulo="Cierres" descripcion="Del más antiguo al más reciente.">
            <ListaCierres cierres={expediente.cierres} />
          </Tarjeta>

          <Tarjeta titulo="Historial" descripcion="En orden cronológico, con quién realizó cada acción.">
            <Historial entradas={expediente.historial} />
          </Tarjeta>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <Tarjeta titulo="Estado del expediente">
            <AccionesEstado key={expediente.estado} expediente={expediente} />
          </Tarjeta>
          {expediente.estado === 'cerrado' ? null : (
            <Tarjeta titulo="Registrar actividad" descripcion="La fecha, la hora y tu nombre se guardan automáticamente.">
              <FormularioActividad codigo={expediente.id} />
            </Tarjeta>
          )}
        </aside>
      </div>
    </>
  )
}
