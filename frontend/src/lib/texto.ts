export function iniciales(nombre: string): string {
  const partes = nombre
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(' ')
    .filter((parte) => parte !== '')
  const primera = partes[0]?.[0] ?? ''
  const segunda = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : ''
  return `${primera}${segunda}`.toUpperCase() || '?'
}
