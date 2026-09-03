import APIBase from './httpBase'

export type Angulo = 'frente' | 'espalda' | 'lado'

/** Los que se piden en cada toma, en el orden en que se piden. */
export const ANGULOS_PEDIDOS: Angulo[] = ['frente', 'espalda']

export const ETIQUETA_ANGULO: Record<Angulo, string> = {
  frente: 'De frente',
  espalda: 'De espalda',
  lado: 'De perfil',
}

/** Una toma de medidas. Todos los campos son opcionales: se apunta lo que se midió. */
export interface Medida {
  pesoKg: number | null
  cinturaCm: number | null
  caderaCm: number | null
  pechoCm: number | null
  brazoCm: number | null
  piernaCm: number | null
  nota: string
  createdAt: string
}

/** La primera foto de un ángulo contra la más reciente. */
export interface Comparativa {
  angulo: Angulo
  antes: { url: string; createdAt: string }
  despues: { url: string; createdAt: string }
  diasEntre: number
}

/** Los campos de medidas que se piden, en el orden en que se piden. */
export const CAMPOS_MEDIDA = [
  { clave: 'pesoKg', label: 'Peso', unidad: 'kg', paso: '0.1' },
  { clave: 'cinturaCm', label: 'Cintura', unidad: 'cm', paso: '0.5' },
  { clave: 'caderaCm', label: 'Cadera', unidad: 'cm', paso: '0.5' },
  { clave: 'pechoCm', label: 'Pecho', unidad: 'cm', paso: '0.5' },
  { clave: 'brazoCm', label: 'Brazo', unidad: 'cm', paso: '0.5' },
  { clave: 'piernaCm', label: 'Pierna', unidad: 'cm', paso: '0.5' },
] as const

export type ClaveMedida = (typeof CAMPOS_MEDIDA)[number]['clave']

export interface EstadoOnboarding {
  videoSeen: boolean
  photosUploaded: boolean
  skipped: boolean
  completedAt: string | null
  done: boolean
  fotos: Array<{ angulo: Angulo; url: string; createdAt: string }>
  /** La última de cada ángulo: referencia para repetir la misma pose. */
  ultimas: Partial<Record<Angulo, { url: string; createdAt: string }>>
  proximaToma: string | null
  /** Días que faltan para la siguiente toma. 0 = hoy le toca. */
  diasParaProxima: number | null
  tomaPendiente: boolean
  /** Cada cuántos días se repite la toma. */
  diasEntreTomas: number
  /** Antes y después por ángulo. Vacío mientras solo haya una toma. */
  comparativa: Comparativa[]
  /** Sus medidas, de la más reciente a la más antigua. */
  medidas: Medida[]
  fotosDisponibles: boolean
}

export interface FirmaCloudinary {
  uploadUrl: string
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  publicId: string
  folder: string
  type: 'authenticated'
}

class OnboardingService extends APIBase {
  async estado() {
    const { data } = await this.get<EstadoOnboarding>('onboarding')
    return data
  }

  async videoVisto() {
    const { data } = await this.post<EstadoOnboarding>('onboarding/video-visto', {})
    return data
  }

  async firmarFoto(angulo: Angulo) {
    const { data } = await this.post<FirmaCloudinary>('onboarding/foto/firma', { angulo })
    return data
  }

  async guardarFoto(angulo: Angulo, publicId: string) {
    const { data } = await this.post<EstadoOnboarding>('onboarding/foto', { angulo, publicId })
    return data
  }

  async quitarFoto(angulo: Angulo) {
    const { data } = await this.delete<EstadoOnboarding>(`onboarding/foto/${angulo}`)
    return data
  }

  async guardarMedidas(medidas: Partial<Record<ClaveMedida, number | null>> & { nota?: string }) {
    const { data } = await this.post<EstadoOnboarding>('onboarding/medidas', medidas)
    return data
  }

  async quitarMedidas(fechaIso: string) {
    const { data } = await this.delete<EstadoOnboarding>(
      `onboarding/medidas/${encodeURIComponent(fechaIso)}`,
    )
    return data
  }

  async saltar() {
    const { data } = await this.post<EstadoOnboarding>('onboarding/saltar', {})
    return data
  }

  async reabrir() {
    const { data } = await this.post<EstadoOnboarding>('onboarding/reabrir', {})
    return data
  }

  /**
   * Sube la foto directo a Cloudinary con la firma del backend.
   *
   * El archivo no pasa por nuestro servidor: una foto de teléfono ronda los
   * 5 MB y no hay razón para hacerla dar la vuelta.
   */
  async subirACloudinary(firma: FirmaCloudinary, archivo: File): Promise<string> {
    const cuerpo = new FormData()
    cuerpo.append('file', archivo)
    cuerpo.append('api_key', firma.apiKey)
    cuerpo.append('timestamp', String(firma.timestamp))
    cuerpo.append('signature', firma.signature)
    cuerpo.append('folder', firma.folder)
    cuerpo.append('public_id', firma.publicId)
    cuerpo.append('type', firma.type)

    const r = await fetch(firma.uploadUrl, { method: 'POST', body: cuerpo })
    if (!r.ok) throw new Error('No pudimos subir la foto')

    const data = (await r.json()) as { public_id?: string }
    if (!data.public_id) throw new Error('No pudimos subir la foto')
    return data.public_id
  }
}

export default new OnboardingService()
