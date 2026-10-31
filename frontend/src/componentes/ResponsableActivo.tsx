import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { useSesion } from '../store/sesion'

export function ResponsableActivo() {
  const responsable = useSesion((estado) => estado.responsable)
  const establecerResponsable = useSesion((estado) => estado.establecerResponsable)
  const [borrador, setBorrador] = useState(responsable)

  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const limpio = borrador.trim()
    establecerResponsable(limpio)
    setBorrador(limpio)
    toast.success(limpio ? `Responsable activo: ${limpio}` : 'Se quitó el responsable activo.')
  }

  return (
    <form onSubmit={guardar} className="flex items-center gap-2">
      <label htmlFor="responsable-activo" className="text-xs font-medium text-teal-50">
        Responsable activo
      </label>
      <input
        id="responsable-activo"
        value={borrador}
        onChange={(evento) => setBorrador(evento.target.value)}
        placeholder="Tu nombre"
        className="w-36 rounded-md border border-teal-600 bg-teal-900/40 px-2 py-1 text-sm text-white placeholder:text-teal-200/70 focus:outline-none focus:ring-2 focus:ring-white/40 sm:w-44"
      />
      <button
        type="submit"
        className="rounded-md bg-white/15 px-2 py-1 text-xs font-medium text-white hover:bg-white/25"
      >
        Guardar
      </button>
    </form>
  )
}
