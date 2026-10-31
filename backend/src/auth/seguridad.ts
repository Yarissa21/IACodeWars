import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const LONGITUD_CLAVE = 64

function derivar(contrasena: string, sal: Buffer): Promise<Buffer> {
  return new Promise((resolver, rechazar) => {
    scrypt(contrasena, sal, LONGITUD_CLAVE, (error, clave) => {
      if (error) {
        rechazar(error)
        return
      }
      resolver(clave)
    })
  })
}

export async function generarHashContrasena(contrasena: string): Promise<string> {
  const sal = randomBytes(16)
  const clave = await derivar(contrasena, sal)
  return `scrypt$${sal.toString('hex')}$${clave.toString('hex')}`
}

export async function verificarContrasena(contrasena: string, hashGuardado: string): Promise<boolean> {
  const [algoritmo, salHex, claveHex] = hashGuardado.split('$')
  if (algoritmo !== 'scrypt' || !salHex || !claveHex) {
    return false
  }
  const esperada = Buffer.from(claveHex, 'hex')
  const calculada = await derivar(contrasena, Buffer.from(salHex, 'hex'))
  return esperada.length === calculada.length && timingSafeEqual(esperada, calculada)
}

export function generarTokenSesion(): string {
  return randomBytes(32).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
