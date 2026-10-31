import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link } from 'react-router'
import { Boton } from '../componentes/Boton'
import { Campo, estiloControl } from '../componentes/Campo'
import { LayoutAuth } from '../componentes/LayoutAuth'
import { esquemaIngreso, type DatosFormularioIngreso, type FormularioIngreso } from '../esquemas/auth'
import { useIngresar } from '../hooks/useAuth'
import { mensajeDeError } from '../lib/http'

export function PaginaIngreso() {
  const ingresar = useIngresar()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormularioIngreso, unknown, DatosFormularioIngreso>({
    resolver: zodResolver(esquemaIngreso),
    defaultValues: { nombre: '', contrasena: '' },
  })

  async function enviar(datos: DatosFormularioIngreso) {
    try {
      const usuario = await ingresar.mutateAsync(datos)
      toast.success(`Hola, ${usuario.nombre}.`)
    } catch (error) {
      setError('root.servidor', { message: mensajeDeError(error) })
    }
  }

  return (
    <LayoutAuth
      titulo="Iniciar sesión"
      subtitulo="Ingresa con tu nombre y contraseña para trabajar con los expedientes."
      pie={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-marca-700 hover:text-marca-900">
            Crear una cuenta
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(enviar)} className="space-y-5">
        <Campo id="ingreso-nombre" etiqueta="Nombre" error={errors.nombre?.message}>
          <input
            id="ingreso-nombre"
            autoComplete="username"
            autoFocus
            className={estiloControl}
            aria-invalid={errors.nombre ? true : undefined}
            aria-describedby={errors.nombre ? 'ingreso-nombre-error' : undefined}
            {...register('nombre')}
          />
        </Campo>
        <Campo id="ingreso-contrasena" etiqueta="Contraseña" error={errors.contrasena?.message}>
          <input
            id="ingreso-contrasena"
            type="password"
            autoComplete="current-password"
            className={estiloControl}
            aria-invalid={errors.contrasena ? true : undefined}
            aria-describedby={errors.contrasena ? 'ingreso-contrasena-error' : undefined}
            {...register('contrasena')}
          />
        </Campo>
        {errors.root?.servidor ? (
          <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {errors.root.servidor.message}
          </p>
        ) : null}
        <Boton type="submit" cargando={ingresar.isPending} className="w-full">
          Ingresar
        </Boton>
      </form>
    </LayoutAuth>
  )
}
