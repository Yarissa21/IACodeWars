import { useEffect, useState } from 'react'

export function useValorDiferido<T>(valor: T, retrasoMs: number): T {
  const [diferido, setDiferido] = useState(valor)

  useEffect(() => {
    const temporizador = window.setTimeout(() => setDiferido(valor), retrasoMs)
    return () => window.clearTimeout(temporizador)
  }, [valor, retrasoMs])

  return diferido
}
