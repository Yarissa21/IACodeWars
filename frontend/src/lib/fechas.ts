const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const formatoHora = new Intl.DateTimeFormat('es-GT', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function formatearFecha(iso: string): string {
  return formatoFecha.format(new Date(iso))
}

export function formatearHora(iso: string): string {
  return formatoHora.format(new Date(iso))
}

export function formatearFechaHora(iso: string): string {
  return `${formatearFecha(iso)} a las ${formatearHora(iso)}`
}
