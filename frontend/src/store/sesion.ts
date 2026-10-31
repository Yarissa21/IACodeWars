import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { almacenamientoCookies } from '../lib/cookies'
import type { Usuario } from '../tipos/usuario'

interface EstadoSesion {
  usuario: Usuario | null
  establecerUsuario: (usuario: Usuario) => void
  limpiarSesion: () => void
}

export const useSesion = create<EstadoSesion>()(
  persist(
    (set) => ({
      usuario: null,
      establecerUsuario: (usuario) => set({ usuario }),
      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: 'bufete-sesion',
      storage: createJSONStorage(() => almacenamientoCookies),
      partialize: (estado) => ({ usuario: estado.usuario }),
      version: 1,
      migrate: () => ({ usuario: null }),
    },
  ),
)
