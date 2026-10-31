import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  esquemaCierre,
  type DatosFormularioMotivo,
  type FormularioMotivo,
} from '../esquemas/expediente'
import { useCerrarExpediente } from '../hooks/useExpedientes'
import { mensajeDeError } from '../lib/http'
import { contarActividades, type Expediente } from '../tipos/expediente'
import { Boton } from './Boton'
import { Campo, estiloControl } from './Campo'

const MENSAJE_SIN_ACTIVIDADES =
  'Falta registrar al menos una actividad: agrégala en «Registrar actividad» antes de cerrar el expediente.'

interface PropiedadesFormularioCierre {
  expediente: Expediente
  alCancelar: () => void
  alCerrar: () => void
}

export function FormularioCierre({ expediente, alCancelar, alCerrar }: PropiedadesFormularioCierre) {
  const cerrar = useCerrarExpediente(expediente.id)
  const sinActividades = contarActividades(expediente) === 0
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormularioMotivo, unknown, DatosFormularioMotivo>({
    resolver: zodResolver(esquemaCierre),
    defaultValues: { motivo: '' },
  })

  function marcarSinActividades() {
    if (sinActividades) {
      setError('root.actividades', { message: MENSAJE_SIN_ACTIVIDADES })
    }
  }

  async function enviar(datos: DatosFormularioMotivo) {
    if (sinActividades) {
      marcarSinActividades()
      return
    }
    try {
      await cerrar.mutateAsync(datos)
      toast.success(`Expediente ${expediente.id} cerrado.`)
      alCerrar()
    } catch (error) {
      const mensaje = mensajeDeError(error)
      setError('root.servidor', { message: mensaje })
      toast.error(mensaje)
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(enviar, marcarSinActividades)}
      className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4"
    >
      <p className="text-sm text-slate-700">
        Para cerrar se necesita al menos una actividad registrada y un motivo de cierre. Se guardarán la
        fecha y la hora del cierre.
      </p>

      <Campo id="motivo-cierre" etiqueta="Motivo de cierre" error={errors.motivo?.message}>
        <textarea
          id="motivo-cierre"
          rows={3}
          className={estiloControl}
          aria-invalid={errors.motivo ? true : undefined}
          aria-describedby={errors.motivo ? 'motivo-cierre-error' : undefined}
          {...register('motivo')}
        />
      </Campo>

      {errors.root?.actividades ? (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {errors.root.actividades.message}
        </p>
      ) : null}

      {errors.root?.servidor ? (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {errors.root.servidor.message}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Boton variante="secundario" onClick={alCancelar} disabled={cerrar.isPending}>
          Cancelar
        </Boton>
        <Boton type="submit" variante="peligro" cargando={cerrar.isPending}>
          Confirmar cierre
        </Boton>
      </div>
    </form>
  )
}
