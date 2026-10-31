import { useState } from 'react'
import toast from 'react-hot-toast'
import { usePasarASeguimiento } from '../hooks/useExpedientes'
import { mensajeDeError } from '../lib/http'
import type { Expediente } from '../tipos/expediente'
import { Boton } from './Boton'
import { FormularioCierre } from './FormularioCierre'
import { Icono } from './Icono'
import { FormularioReapertura } from './FormularioReapertura'

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

function AccionesCerrado({ expediente }: { expediente: Expediente }) {
  const [mostrarReapertura, setMostrarReapertura] = useState(false)

  return (
    <div className="space-y-4">
      <div role="status" className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
        <Icono nombre="candado" className="mt-0.5 size-4 shrink-0 text-slate-500" />
        <div>
          <p className="font-semibold">Este expediente está cerrado.</p>
          <p className="mt-0.5 text-slate-600">
            Solo se puede consultar y no admite actividades. Para continuar con el caso, reábrelo indicando
            un motivo.
          </p>
        </div>
      </div>
      {mostrarReapertura ? (
        <FormularioReapertura
          expediente={expediente}
          alCancelar={() => setMostrarReapertura(false)}
          alReabrir={() => setMostrarReapertura(false)}
        />
      ) : (
        <Boton onClick={() => setMostrarReapertura(true)} className="w-full">
          Reabrir expediente
        </Boton>
      )}
    </div>
  )
}

export function AccionesEstado({ expediente }: { expediente: Expediente }) {
  switch (expediente.estado) {
    case 'abierto':
      return <AccionesAbierto expediente={expediente} />
    case 'en_seguimiento':
      return <AccionesEnSeguimiento expediente={expediente} />
    case 'cerrado':
      return <AccionesCerrado expediente={expediente} />
  }
}
