export const config = { runtime: 'edge' }

const CABECERAS_EXCLUIDAS = new Set(['host', 'connection', 'content-length', 'accept-encoding'])

function respuestaError(mensaje: string, estado: number): Response {
  return Response.json({ mensaje }, { status: estado })
}

export default async function proxyApi(solicitud: Request): Promise<Response> {
  const base = process.env.API_URL
  if (!base) {
    return respuestaError('Falta configurar la variable API_URL en el proyecto del frontend.', 500)
  }

  const origen = new URL(solicitud.url)
  const ruta = origen.searchParams.get('ruta') ?? ''
  origen.searchParams.delete('ruta')
  const destino = new URL(`/api/${ruta}${origen.search}`, base)

  const cabeceras = new Headers()
  solicitud.headers.forEach((valor, clave) => {
    if (!CABECERAS_EXCLUIDAS.has(clave.toLowerCase())) {
      cabeceras.set(clave, valor)
    }
  })

  const tieneCuerpo = solicitud.method !== 'GET' && solicitud.method !== 'HEAD'

  try {
    const respuesta = await fetch(destino, {
      method: solicitud.method,
      headers: cabeceras,
      body: tieneCuerpo ? await solicitud.arrayBuffer() : null,
      redirect: 'manual',
    })
    const cabecerasRespuesta = new Headers(respuesta.headers)
    cabecerasRespuesta.delete('content-encoding')
    cabecerasRespuesta.delete('content-length')
    return new Response(respuesta.body, {
      status: respuesta.status,
      statusText: respuesta.statusText,
      headers: cabecerasRespuesta,
    })
  } catch {
    return respuestaError('No se pudo conectar con la API. Intenta de nuevo en unos momentos.', 502)
  }
}
