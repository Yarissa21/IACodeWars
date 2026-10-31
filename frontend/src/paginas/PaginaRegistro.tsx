import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link } from 'react-router'
import { Boton } from '../componentes/Boton'
import { Campo, estiloControl } from '../componentes/Campo'
import { LayoutAuth } from '../componentes/LayoutAuth'
import { esquemaRegistro, type DatosFormularioRegistro, type FormularioRegistro } from '../esquemas/auth'
import { useRegistrar } from '../hooks/useAuth'
import { mensajeDeError } from '../lib/http'

export function PaginaRegistro() {
  const registrar = useRegistrar()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormularioRegistro, unknown, DatosFormularioRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: { nombre: '', contrasena: '', confirmacion: '' },
  })

  async function enviar(datos: DatosFormularioRegistro) {
    try {
      const usuario = await registrar.mutateAsync({ nombre: datos.nombre, contrasena: datos.contrasena })
      toast.success(`Cuenta creada. Te damos la bienvenida, ${usuario.nombre}.`)
    } catch (error) {
      setError('root.servidor', { message: mensajeDeError(error) })
    }
  }

  return (
    <LayoutAuth
      titulo="Crear una cuenta"
      subtitulo="Tu nombre aparecerá en el historial de cada acción que realices."
      pie={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/ingresar" className="font-semibold text-marca-700 hover:text-marca-900">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(enviar)} className="space-y-5">
        <Campo
          id="registro-nombre"
          etiqueta="Nombre"
          error={errors.nombre?.message}
          ayuda="Con este nombre iniciarás sesión. Entre 3 y 60 caracteres."
        >
          <input
            id="registro-nombre"
            autoComplete="username"
            autoFocus
            className={estiloControl}
            aria-invalid={errors.nombre ? true : undefined}
            aria-describedby={errors.nombre ? 'registro-nombre-error' : undefined}
            {...register('nombre')}
          />
        </Campo>
        <Campo
          id="registro-contrasena"
          etiqueta="Contraseña"
          error={errors.contrasena?.message}
          ayuda="Al menos 8 caracteres."
        >
          <input
            id="registro-contrasena"
            type="password"
            autoComplete="new-password"
            className={estiloControl}
            aria-invalid={errors.contrasena ? true : undefined}
            aria-describedby={errors.contrasena ? 'registro-contrasena-error' : undefined}
            {...register('contrasena')}
          />
        </Campo>
        <Campo id="registro-confirmacion" etiqueta="Repite la contraseña" error={errors.confirmacion?.message}>
          <input
            id="registro-confirmacion"
            type="password"
            autoComplete="new-password"
            className={estiloControl}
            aria-invalid={errors.confirmacion ? true : undefined}
            aria-describedby={errors.confirmacion ? 'registro-confirmacion-error' : undefined}
            {...register('confirmacion')}
          />
        </Campo>
        {errors.root?.servidor ? (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {errors.root.servidor.message}
          </p>
        ) : null}
        <Boton type="submit" cargando={registrar.isPending} className="w-full">
          Crear cuenta
        </Boton>
      </form>
    </LayoutAuth>
  )
}
