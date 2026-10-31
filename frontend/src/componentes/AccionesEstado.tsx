import { useState } from 'react'
import toast from 'react-hot-toast'
import { usePasarASeguimiento } from '../hooks/useExpedientes'
import { mensajeDeError } from '../lib/http'
import type { Expediente } from '../tipos/expediente'
import { Boton } from './Boton'
import { FormularioCierre } from './FormularioCierre'

function AccionesAbierto({ expediente }: { expediente: Expediente }) {
  const pasar = usePasarASeguimiento(expediente.id)

  async function pasarASeguimiento() {
    try {
      await pasar.mutateAsync()
      toast.success(`${expediente.id} pasó a En seguimiento.`)
    } catch (error) {
      toast.error(mensajeDeError(error))
    }
  }

  return (
    <div className="space-y-2">
      <Boton onClick={() => void pasarASeguimiento()} cargando={pasar.isPending} className="w-full">
        Pasar a En seguimiento
      </Boton>
      <p className="text-xs text-slate-500">Para poder cerrarlo, primero debe estar En seguimiento.</p>
    </div>
  )
}

function AccionesEnSeguimiento({ expediente }: { expediente: Expediente }) {
  const [mostrarCierre, setMostrarCierre] = useState(false)

  if (mostrarCierre) {
    return (
      <FormularioCierre
        expediente={expediente}
        alCancelar={() => setMostrarCierre(false)}
        alCerrar={() => setMostrarCierre(false)}
      />
    )
  }

  return (
    <Boton variante="peligro" onClick={() => setMostrarCierre(true)} className="w-full">
      Cerrar expediente
    </Boton>
  )
}

export function AccionesEstado({ expediente }: { expediente: Expediente }) {
  switch (expediente.estado) {
    case 'abierto':
      return <AccionesAbierto expediente={expediente} />
    case 'en_seguimiento':
      return <AccionesEnSeguimiento expediente={expediente} />
    case 'cerrado':
      return null
  }
}
