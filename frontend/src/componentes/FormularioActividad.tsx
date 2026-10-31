import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  esquemaActividad,
  type DatosFormularioActividad,
  type FormularioActividad as ValoresFormularioActividad,
} from '../esquemas/expediente'
import { useRegistrarActividad } from '../hooks/useExpedientes'
import { mensajeDeError } from '../lib/http'
import { Boton } from './Boton'
import { Campo, estiloControl } from './Campo'

const TIPOS_SUGERIDOS = ['Entrevista', 'Llamada', 'Documento', 'Reunión', 'Audiencia', 'Otro']

const VALORES_INICIALES: ValoresFormularioActividad = { descripcion: '', tipo: '' }

export function FormularioActividad({ codigo }: { codigo: string }) {
  const registrar = useRegistrarActividad(codigo)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ValoresFormularioActividad, unknown, DatosFormularioActividad>({
    resolver: zodResolver(esquemaActividad),
    defaultValues: VALORES_INICIALES,
  })

  async function enviar(datos: DatosFormularioActividad) {
    try {
      await registrar.mutateAsync(datos)
      toast.success(`Actividad registrada en ${codigo}.`)
      reset(VALORES_INICIALES)
    } catch (error) {
      const mensaje = mensajeDeError(error)
      setError('root.servidor', { message: mensaje })
      toast.error(mensaje)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(enviar)} className="space-y-4">
      <Campo id="actividad-descripcion" etiqueta="Descripción de la actividad" error={errors.descripcion?.message}>
        <textarea
          id="actividad-descripcion"
          rows={3}
          className={estiloControl}
          aria-invalid={errors.descripcion ? true : undefined}
          aria-describedby={errors.descripcion ? 'actividad-descripcion-error' : undefined}
          {...register('descripcion')}
        />
      </Campo>

      <Campo
        id="actividad-tipo"
        etiqueta="Tipo"
        opcional
        error={errors.tipo?.message}
        ayuda="Por ejemplo: entrevista, llamada o documento."
      >
        <input
          id="actividad-tipo"
          list="tipos-actividad"
          className={estiloControl}
          aria-invalid={errors.tipo ? true : undefined}
          {...register('tipo')}
        />
        <datalist id="tipos-actividad">
          {TIPOS_SUGERIDOS.map((tipo) => (
            <option key={tipo} value={tipo} />
          ))}
        </datalist>
      </Campo>

      {errors.root?.servidor ? (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {errors.root.servidor.message}
        </p>
      ) : null}

      <Boton type="submit" cargando={registrar.isPending} className="w-full">
        Registrar actividad
      </Boton>
    </form>
  )
}
