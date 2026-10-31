import axios, { isAxiosError } from 'axios'
import { useSesion } from '../store/sesion'

export class ErrorApi extends Error {
  readonly estado: number | null

  constructor(mensaje: string, estado: number | null) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
  }
}

const MENSAJES_POR_ESTADO: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Revisa el formulario.',
  404: 'No se encontró lo que buscas.',
  409: 'La acción no está permitida en el estado actual del expediente.',
  500: 'El servidor tuvo un problema. Intenta de nuevo más tarde.',
  502: 'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.',
  503: 'El servicio no está disponible en este momento. Intenta de nuevo en unos momentos.',
  504: 'El servidor tardó demasiado en responder. Intenta de nuevo.',
}

function tieneMensaje(datos: unknown): datos is { mensaje: string } {
  return (
    typeof datos === 'object' &&
    datos !== null &&
    'mensaje' in datos &&
    typeof datos.mensaje === 'string' &&
    datos.mensaje.trim() !== ''
  )
}

export function convertirError(error: unknown): ErrorApi {
  if (error instanceof ErrorApi) {
    return error
  }
  if (isAxiosError(error)) {
    if (error.response) {
      const estado = error.response.status
      const datos: unknown = error.response.data
      if (tieneMensaje(datos)) {
        return new ErrorApi(datos.mensaje, estado)
      }
      return new ErrorApi(
        MENSAJES_POR_ESTADO[estado] ?? `La solicitud falló con el código ${estado}.`,
        estado,
      )
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ErrorApi('El servidor tardó demasiado en responder. Intenta de nuevo.', null)
    }
    return new ErrorApi(
      'No se pudo conectar con el servidor. Revisa tu conexión y que la API esté en ejecución.',
      null,
    )
  }
  return new ErrorApi('Ocurrió un error inesperado. Intenta de nuevo.', null)
}

export function mensajeDeError(error: unknown): string {
  return convertirError(error).message
}

export const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((configuracion) => {
  configuracion.headers.set('Accept', 'application/json')
  configuracion.headers.set('Accept-Language', 'es')
  return configuracion
})

http.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    const convertido = convertirError(error)
    const ruta = isAxiosError(error) ? (error.config?.url ?? '') : ''
    if (convertido.estado === 401 && !ruta.startsWith('/auth/')) {
      useSesion.getState().limpiarSesion()
    }
    return Promise.reject(convertido)
  },
)
