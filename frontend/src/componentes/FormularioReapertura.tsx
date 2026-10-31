import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  esquemaReapertura,
  type DatosFormularioMotivo,
  type FormularioMotivo,
} from '../esquemas/expediente'
import { useReabrirExpediente } from '../hooks/useExpedientes'
import { mensajeDeError } from '../lib/http'
import type { Expediente } from '../tipos/expediente'
import { Boton } from './Boton'
import { Campo, estiloControl } from './Campo'

interface PropiedadesFormularioReapertura {
  expediente: Expediente
  alCancelar: () => void
  alReabrir: () => void
}

export function FormularioReapertura({ expediente, alCancelar, alReabrir }: PropiedadesFormularioReapertura) {
  const reabrir = useReabrirExpediente(expediente.id)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormularioMotivo, unknown, DatosFormularioMotivo>({
    resolver: zodResolver(esquemaReapertura),
    defaultValues: { motivo: '' },
  })

  async function enviar(datos: DatosFormularioMotivo) {
    try {
      await reabrir.mutateAsync(datos)
      toast.success(`Expediente ${expediente.id} reabierto: ahora está En seguimiento.`)
      alReabrir()
    } catch (error) {
      const mensaje = mensajeDeError(error)
      setError('root.servidor', { message: mensaje })
      toast.error(mensaje)
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(enviar)}
      className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4"
    >
      <p className="text-sm text-slate-700">
        El expediente pasará de Cerrado a En seguimiento. Se conservan sus datos, actividades y cierres
        anteriores, y el motivo quedará en el historial.
      </p>

      <Campo id="motivo-reapertura" etiqueta="Motivo de reapertura" error={errors.motivo?.message}>
        <textarea
          id="motivo-reapertura"
          rows={3}
          className={estiloControl}
          aria-invalid={errors.motivo ? true : undefined}
          aria-describedby={errors.motivo ? 'motivo-reapertura-error' : undefined}
          {...register('motivo')}
        />
      </Campo>

      {errors.root?.servidor ? (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {errors.root.servidor.message}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Boton variante="secundario" onClick={alCancelar} disabled={reabrir.isPending}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={reabrir.isPending}>
          Confirmar reapertura
        </Boton>
      </div>
    </form>
  )
}
