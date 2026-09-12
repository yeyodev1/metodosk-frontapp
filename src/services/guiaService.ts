import APIBase from './httpBase'

/**
 * La guía de nutrición, como contenido y no como archivo.
 *
 * Llega del servidor y no viaja en el bundle: es material que se compró, y en
 * el bundle lo podría leer cualquiera. Por eso tampoco se cachea en disco.
 */

export type AudienciaGuia = 'recomposicion' | 'volumen'

export interface ComidaGuia {
  tipo: string
  texto: string
}

export interface DiaGuia {
  numero: number
  comidas: ComidaGuia[]
}

export interface TablaGuia {
  id: string
  titulo: string
  intro: string | null
  columnas: string[]
  filas: string[][]
  notas: string[]
}

export interface Guia {
  audiencia: AudienciaGuia
  reto: string
  titulo: string
  intro: string[]
  comoUsar: string[]
  diasDePierna: number[]
  dias: DiaGuia[]
  snacks: Array<{ numero: number; titulo: string | null; items: string[] }>
  condimentos: Array<{ proteina: string; items: string[]; tip: string | null }>
  tipsCondimentos: string[]
  armaTuPlato: {
    intro: string
    pasos: Array<{ titulo: string; texto: string; porcion: string }>
    ejemplo: string[]
  }
  tablas: TablaGuia[]
  listaCompras: { nota: string; ayuda: string; categorias: string[] }
  mealPrep: Array<{ titulo: string; items: string[] }>
  suplementos: Array<{
    nombre: string
    paraQuien: string[]
    cuando: string
    precaucion: string
  }>
}

class GuiaService extends APIBase {
  /** Las guías que le tocan por su reto. Puede ser una o las dos. */
  async mias() {
    const { data } = await this.get<{ guias: Guia[] }>('guias')
    return data.guias
  }
}

export default new GuiaService()
