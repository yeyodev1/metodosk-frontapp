import APIBase from './httpBase'

export type TipoPost = 'logro' | 'pregunta' | 'motivacion' | 'receta' | 'general'
export type TipoReaccion = 'fuerza' | 'fuego' | 'aplauso'

/** Un mensaje del muro, ya listo para pintar. */
export interface MensajeComunidad {
  id: string
  authorName: string
  /** URL de su foto de perfil, o null si no puso. */
  avatarUrl: string | null
  /** La inicial, para el círculo cuando no hay foto. */
  inicial: string
  body: string
  fromStaff: boolean
  createdAt: string
  mine: boolean
  tipo: TipoPost
  imagenUrl: string | null
  reacciones: Record<TipoReaccion, number>
  misReacciones: TipoReaccion[]
  /** Su nivel en el reto. null para el equipo. */
  nivel: { nivel: number; nombre: string } | null
}

export interface Nivel {
  nivel: number
  nombre: string
  desde: number
  siguiente: { nivel: number; nombre: string; desde: number } | null
}

export interface Insignia {
  id: string
  nombre: string
  como: string
  icono: string
  ganada?: boolean
}

/** Lo que pinta la pantalla de puntos. Lo calcula el servidor. */
export interface MisPuntos {
  mes: string
  premio: string
  yo: {
    total: number
    mes: number
    posicion: number | null
    participantes: number
    nivel: Nivel
    porAccion: Record<string, number>
    insignias: Insignia[]
  } | null
  ranking: Array<{
    posicion: number
    nombre: string
    inicial: string
    avatarUrl: string | null
    puntos: number
    nivel: string
    yo: boolean
  }>
  reglas: Array<{
    accion: string
    puntos: number
    topeDiario: number | null
    titulo: string
    detalle: string
    icono: string
  }>
  niveles: Array<{ nivel: number; nombre: string; desde: number }>
}

export interface MiPerfil {
  avatarUrl: string | null
  publicId: string | null
  nombre: string
  inicial: string
}

export interface FirmaAvatar {
  uploadUrl: string
  apiKey: string
  timestamp: number
  signature: string
  publicId: string
  folder: string
  transformation: string
}

/** Un mensaje de chat, no un ensayo. Igual que el límite del servidor. */
export const MAX_LARGO_MENSAJE = 1000

class CommunityService extends APIBase {
  /**
   * El muro. Con `desde` trae solo lo que llegó después de ese momento — el
   * refresco automático no necesita volver a bajar los sesenta de siempre.
   */
  async listar(opciones: { desde?: string; antes?: string; tipo?: TipoPost | null } = {}) {
    const params = new URLSearchParams()
    if (opciones.desde) params.set('desde', opciones.desde)
    if (opciones.antes) params.set('antes', opciones.antes)
    if (opciones.tipo) params.set('tipo', opciones.tipo)
    const query = params.toString() ? `?${params}` : ''
    const { data } = await this.get<{ mensajes: MensajeComunidad[]; hayMas: boolean }>(
      `comunidad${query}`,
    )
    return data
  }

  async publicar(input: { body: string; tipo: TipoPost; imagen?: string | null }) {
    const { data } = await this.post<MensajeComunidad>('comunidad', input)
    return data
  }

  /** Pone o quita la reacción. Devuelve la publicación con los números al día. */
  async reaccionar(id: string, tipo: TipoReaccion) {
    const { data } = await this.post<MensajeComunidad>(`comunidad/${id}/reaccion`, { tipo })
    return data
  }

  async firmarImagen() {
    const { data } = await this.post<FirmaAvatar>('comunidad/imagen/firma', {})
    return data
  }

  async puntos() {
    const { data } = await this.get<MisPuntos>('comunidad/puntos')
    return data
  }

  async borrar(id: string) {
    const { data } = await this.delete<{ ok: boolean }>(`comunidad/${id}`)
    return data
  }

  /* ── Foto de perfil ── */

  async miPerfil() {
    const { data } = await this.get<MiPerfil>('comunidad/avatar')
    return data
  }

  async firmarAvatar() {
    const { data } = await this.post<FirmaAvatar>('comunidad/avatar/firma', {})
    return data
  }

  async guardarAvatar(publicId: string) {
    const { data } = await this.post<{ avatarUrl: string | null; publicId: string | null }>(
      'comunidad/avatar',
      { publicId },
    )
    return data
  }

  async quitarAvatar() {
    const { data } = await this.delete<{ avatarUrl: null; publicId: null }>('comunidad/avatar')
    return data
  }

  /**
   * Sube la foto directo a Cloudinary con la firma del backend.
   *
   * No pasa por nuestro servidor: una foto de teléfono ronda los 5 MB y no hay
   * razón para hacerla dar la vuelta. Se recorta al subir, así que lo que
   * queda guardado ya es el cuadrado que se pinta.
   */
  async subirAvatar(firma: FirmaAvatar, archivo: File): Promise<string> {
    return this.subir(firma, archivo)
  }

  /** La foto de un logro: mismo camino que el avatar, otra carpeta. */
  async subirImagen(firma: FirmaAvatar, archivo: File): Promise<string> {
    return this.subir(firma, archivo)
  }

  private async subir(firma: FirmaAvatar, archivo: File): Promise<string> {
    const cuerpo = new FormData()
    cuerpo.append('file', archivo)
    cuerpo.append('api_key', firma.apiKey)
    cuerpo.append('timestamp', String(firma.timestamp))
    cuerpo.append('signature', firma.signature)
    cuerpo.append('folder', firma.folder)
    cuerpo.append('public_id', firma.publicId)
    cuerpo.append('transformation', firma.transformation)

    const r = await fetch(firma.uploadUrl, { method: 'POST', body: cuerpo })
    if (!r.ok) throw new Error('No pudimos subir la foto')

    const data = (await r.json()) as { public_id?: string }
    if (!data.public_id) throw new Error('No pudimos subir la foto')
    return data.public_id
  }
}

export default new CommunityService()
