import APIBase from './httpBase'
import type { Angulo, Comparativa, Medida } from './onboardingService'

/** Con qué nombre puede firmar el equipo. Mismo catálogo que el backend. */
export type Firma = 'karen' | 'scarlett' | 'equipo'

export const FIRMAS: Record<Firma, { nombre: string; rol: string; inicial: string }> = {
  karen: { nombre: 'Karen López', rol: 'Nutrición', inicial: 'K' },
  scarlett: { nombre: 'Scarlett Córdova', rol: 'Entrenamiento', inicial: 'S' },
  equipo: { nombre: 'Equipo Método SK', rol: 'Método SK', inicial: 'SK' },
}

export interface Nota {
  id: string
  fromStaff: boolean
  autor: { nombre: string; rol: string; inicial: string; firma: Firma | null }
  body: string
  tomaDel: string | null
  createdAt: string
  /** Cuándo lo leyó la otra parte. */
  leidaEl: string | null
  /** Solo en el panel: cuándo salió el correo de aviso. */
  avisoEnviadoEl?: string | null
}

export interface ResumenAlumna {
  id: string
  nombre: string
  email: string
  reto: string | null
  miniatura: string | null
  tomas: number
  primeraToma: string
  ultimaToma: string
  diasDesdeInicio: number
  ultimoComentario: string | null
  porComentar: boolean
  respuestasNuevas: number
}

export interface Toma {
  dia: string
  fecha: string
  fotos: Array<{ angulo: Angulo; url: string; grande: string; createdAt: string }>
}

export interface FichaAlumna {
  alumna: { id: string; nombre: string; email: string; reto: string | null; accessUntil: string | null }
  tomas: Toma[]
  comparativa: Comparativa[]
  medidas: Medida[]
  notas: Nota[]
  fotosDisponibles: boolean
}

class AvancesService extends APIBase {
  /* ── Panel ── */

  async alumnas() {
    const { data } = await this.get<{ alumnas: ResumenAlumna[]; sinFotos: number }>('admin/avances')
    return data
  }

  async ficha(id: string) {
    const { data } = await this.get<FichaAlumna>(`admin/avances/${id}`)
    return data
  }

  async comentar(id: string, input: { body: string; firma: Firma; tomaDel?: string | null }) {
    const { data } = await this.post<{ notas: Nota[]; avisada: boolean }>(
      `admin/avances/${id}/notas`,
      input,
    )
    return data
  }

  async borrarNota(notaId: string) {
    await this.delete(`admin/avances/notas/${notaId}`)
  }

  /* ── La alumna ── */

  async misNotas() {
    const { data } = await this.get<{ notas: Nota[]; nuevas: number }>('onboarding/notas')
    return data
  }

  async marcarLeidas() {
    await this.post('onboarding/notas/leidas', {})
  }

  async responder(body: string) {
    const { data } = await this.post<{ notas: Nota[]; nuevas: number }>('onboarding/notas', { body })
    return data
  }
}

export default new AvancesService()
