import type { StateStorage } from 'zustand/middleware'

const SIETE_DIAS_EN_SEGUNDOS = 60 * 60 * 24 * 7

function escribirCookie(nombre: string, valor: string, maxAge: number): void {
  document.cookie = `${encodeURIComponent(nombre)}=${encodeURIComponent(valor)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export const almacenamientoCookies: StateStorage = {
  getItem: (nombre) => {
    const prefijo = `${encodeURIComponent(nombre)}=`
    const par = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefijo))
    return par ? decodeURIComponent(par.slice(prefijo.length)) : null
  },
  setItem: (nombre, valor) => {
    escribirCookie(nombre, valor, SIETE_DIAS_EN_SEGUNDOS)
  },
  removeItem: (nombre) => {
    escribirCookie(nombre, '', 0)
  },
}
