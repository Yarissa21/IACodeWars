export type TipoErrorDominio = 'validacion' | 'no_autenticado' | 'no_encontrado' | 'regla_negocio'

export class ErrorDominio extends Error {
  readonly tipo: TipoErrorDominio

  constructor(tipo: TipoErrorDominio, mensaje: string) {
    super(mensaje)
    this.name = 'ErrorDominio'
    this.tipo = tipo
  }
}
