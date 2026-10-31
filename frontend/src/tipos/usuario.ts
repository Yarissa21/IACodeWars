export interface Usuario {
  id: number
  nombre: string
}

export interface RespuestaSesion {
  usuario: Usuario
}

export interface DatosIngreso {
  nombre: string
  contrasena: string
}
