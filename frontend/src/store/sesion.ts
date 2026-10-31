import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { almacenamientoCookies } from '../lib/cookies'

interface EstadoSesion {
  responsable: string
  establecerResponsable: (responsable: string) => void
}

export const useSesion = create<EstadoSesion>()(
  persist(
    (set) => ({
      responsable: '',
      establecerResponsable: (responsable) => set({ responsable: responsable.trim() }),
    }),
    {
      name: 'bufete-sesion',
      storage: createJSONStorage(() => almacenamientoCookies),
      partialize: (estado) => ({ responsable: estado.responsable }),
    },
  ),
)
