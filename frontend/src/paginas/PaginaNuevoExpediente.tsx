import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { Boton } from '../componentes/Boton'
import { Campo, estiloControl } from '../componentes/Campo'
import {
  esquemaApertura,
  type DatosFormularioApertura,
  type FormularioApertura,
} from '../esquemas/expediente'
import { useAbrirExpediente } from '../hooks/useExpedientes'
import { mensajeDeError } from '../lib/http'
import { useSesion } from '../store/sesion'
import { CATEGORIAS, ETIQUETAS_CATEGORIA } from '../tipos/expediente'

export function PaginaNuevoExpediente() {
  const responsableActivo = useSesion((estado) => estado.responsable)
  const abrir = useAbrirExpediente()
  const navegar = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormularioApertura, unknown, DatosFormularioApertura>({
    resolver: zodResolver(esquemaApertura),
    defaultValues: { solicitante: '', descripcion: '', responsable: responsableActivo, categoria: '' },
  })

  async function enviar(datos: DatosFormularioApertura) {
    try {
      const expediente = await abrir.mutateAsync(datos)
      toast.success(`Expediente ${expediente.id} abierto correctamente.`)
      reset({ solicitante: '', descripcion: '', responsable: responsableActivo, categoria: '' })
      void navegar(`/expedientes/${expediente.id}`)
    } catch (error) {
      const mensaje = mensajeDeError(error)
      setError('root.servidor', { message: mensaje })
      toast.error(mensaje)
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">Abrir expediente</h1>
      <p className="mt-1 text-sm text-slate-600">
        Solicitante, descripción y responsable son obligatorios y no pueden quedar vacíos ni con
        solo espacios. El expediente se abre en estado Abierto.
      </p>

      <form
        noValidate
        onSubmit={handleSubmit(enviar)}
        className="mt-6 space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <Campo id="solicitante" etiqueta="Solicitante (nombre o alias)" error={errors.solicitante?.message}>
          <input
            id="solicitante"
            className={estiloControl}
            aria-invalid={errors.solicitante ? true : undefined}
            aria-describedby={errors.solicitante ? 'solicitante-error' : undefined}
            {...register('solicitante')}
          />
        </Campo>

        <Campo id="descripcion" etiqueta="Descripción breve" error={errors.descripcion?.message}>
          <textarea
            id="descripcion"
            rows={3}
            className={estiloControl}
            aria-invalid={errors.descripcion ? true : undefined}
            aria-describedby={errors.descripcion ? 'descripcion-error' : undefined}
            {...register('descripcion')}
          />
        </Campo>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            id="responsable"
            etiqueta="Responsable"
            error={errors.responsable?.message}
            ayuda="Se completa con el responsable activo si lo guardaste arriba."
          >
            <input
              id="responsable"
              className={estiloControl}
              aria-invalid={errors.responsable ? true : undefined}
              aria-describedby={errors.responsable ? 'responsable-error' : undefined}
              {...register('responsable')}
            />
          </Campo>

          <Campo id="categoria" etiqueta="Categoría" opcional error={errors.categoria?.message}>
            <select id="categoria" className={estiloControl} {...register('categoria')}>
              <option value="">Sin categoría</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {ETIQUETAS_CATEGORIA[categoria]}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        {errors.root?.servidor ? (
          <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {errors.root.servidor.message}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Boton type="submit" cargando={abrir.isPending}>
            Abrir expediente
          </Boton>
        </div>
      </form>
    </section>
  )
}
