import APIBase from './httpBase'

export type Audiencia = 'recomposicion' | 'volumen' | 'ambas'
export type EstadoCurso = 'borrador' | 'proximamente' | 'publicado'

export interface VideoBunny {
  bunnyId: string
  title: string
  status: 'subiendo' | 'procesando' | 'listo' | 'error'
  durationSeconds: number | null
  thumbnail: string | null
}

/** Lo que ve la alumna. */
export interface CursoAlumna {
  id: string
  title: string
  slug: string
  summary: string
  order: number
  unlockMonth: number
  coverPhoto: string | null
  /** A qué reto pertenece, para agruparlos si compró los dos. */
  challenge: Audiencia
  estado: 'abierto' | 'proximamente' | 'cerrado'
  welcomeVideo: { embedUrl: string; thumbnail: string | null; completed: boolean } | null
  lessons: Array<{
    id: string
    title: string
    summary: string | null
    order: number
    embedUrl: string | null
    fileUrl: string | null
    durationSeconds: number | null
    /** Dónde se quedó y si ya la terminó. */
    seconds: number
    completed: boolean
  }>
  /** Las guías que le tocan. El archivo vive en el servidor, no acá. */
  guias: Array<{ audiencia: Audiencia; titulo: string; paginas: number }>
}

/** Lo que ve la administración: incluye borradores y el estado del video. */
export interface CursoAdmin {
  id: string
  title: string
  slug: string
  summary: string
  challenge: Audiencia
  order: number
  unlockMonth: number
  status: EstadoCurso
  coverPhoto: string | null
  welcomeVideo: VideoBunny | null
  guias: Array<{ audiencia: Audiencia; titulo: string; publicId: string; paginas: number }>
  lessons: Array<{
    id: string
    title: string
    summary: string | null
    order: number
    video: VideoBunny | null
    fileUrl: string | null
  }>
  updatedAt: string
}

/** Firma para subir un PDF a Cloudinary, igual que la de las fotos. */
export interface FirmaGuia {
  uploadUrl: string
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  publicId: string
  folder: string
  type: 'authenticated'
}

export interface GuiaAbierta {
  titulo: string
  paginas: number
  /** Una URL firmada por página, ya con su correo marcado encima. */
  urls: string[]
}

export interface SubidaFirmada {
  videoId: string
  libraryId: string
  uploadUrl: string
  signature: string
  expiration: number
}

class CourseService extends APIBase {
  /** La ruta de la alumna, filtrada por su reto y el mes en que va. */
  async mios(mes: number) {
    const { data } = await this.get<{ cursos: CursoAlumna[] }>(`courses?mes=${mes}`)
    return data.cursos
  }

  async listar() {
    const { data } = await this.get<{ cursos: CursoAdmin[]; bunnyListo: boolean }>('admin/courses')
    return data
  }

  async crear(curso: Partial<CursoAdmin>) {
    const { data } = await this.post<{ id: string; slug: string }>('admin/courses', curso)
    return data
  }

  async actualizar(id: string, curso: Partial<CursoAdmin>) {
    const { data } = await this.put<{ id: string }>(`admin/courses/${id}`, curso)
    return data
  }

  async reordenar(ids: string[]) {
    await this.put('admin/courses/orden', { ids })
  }

  async eliminar(id: string) {
    await this.delete(`admin/courses/${id}`)
  }

  async agregarClase(courseId: string, title: string, summary?: string) {
    const { data } = await this.post<{ id: string }>(`admin/courses/${courseId}/lessons`, {
      title,
      summary,
    })
    return data
  }

  async eliminarClase(courseId: string, lessonId: string) {
    await this.delete(`admin/courses/${courseId}/lessons/${lessonId}`)
  }

  /** Pide la firma para subir. El archivo va directo del navegador a Bunny. */
  async prepararVideo(courseId: string, destino: string, titulo: string) {
    const { data } = await this.post<SubidaFirmada>(`admin/courses/${courseId}/video`, {
      destino,
      titulo,
    })
    return data
  }

  /** Su guía, página por página. */
  async guia(courseId: string, audiencia: Audiencia, mes: number) {
    const { data } = await this.get<GuiaAbierta>(`courses/${courseId}/guia/${audiencia}?mes=${mes}`)
    return data
  }

  /** Pide la firma para subir el PDF de una guía. */
  async prepararGuia(courseId: string, audiencia: Audiencia) {
    const { data } = await this.post<FirmaGuia>(`admin/courses/${courseId}/guia/subida`, {
      audiencia,
    })
    return data
  }

  /**
   * Sube el PDF directo a Cloudinary y devuelve cuántas páginas tiene.
   *
   * Cloudinary las cuenta al recibirlo; sin ese número no se sabe cuántas
   * páginas pedir después.
   */
  async subirGuiaACloudinary(firma: FirmaGuia, archivo: File) {
    const cuerpo = new FormData()
    cuerpo.append('file', archivo)
    cuerpo.append('api_key', firma.apiKey)
    cuerpo.append('timestamp', String(firma.timestamp))
    cuerpo.append('signature', firma.signature)
    cuerpo.append('folder', firma.folder)
    cuerpo.append('public_id', firma.publicId)
    cuerpo.append('type', firma.type)

    const r = await fetch(firma.uploadUrl, { method: 'POST', body: cuerpo })
    const data = (await r.json()) as { public_id?: string; pages?: number; error?: { message: string } }
    if (!r.ok || !data.public_id) {
      throw new Error(data.error?.message || 'Cloudinary rechazó el archivo')
    }
    return { publicId: data.public_id, paginas: data.pages ?? 1 }
  }

  async guardarGuia(courseId: string, guia: { audiencia: Audiencia; titulo: string; publicId: string; paginas: number }) {
    const { data } = await this.put<{ cursos: CursoAdmin[] }>(`admin/courses/${courseId}/guia`, guia)
    return data.cursos
  }

  async eliminarGuia(courseId: string, audiencia: Audiencia) {
    const { data } = await this.delete<{ cursos: CursoAdmin[] }>(`admin/courses/${courseId}/guia/${audiencia}`)
    return data.cursos
  }

  /** Bunny codifica en background: esto pregunta si ya se puede ver. */
  async estadoVideo(courseId: string, destino: string) {
    const { data } = await this.get<{
      status: VideoBunny['status']
      durationSeconds: number | null
      thumbnail: string | null
    }>(`admin/courses/${courseId}/video?destino=${destino}`)
    return data
  }
}

export default new CourseService()
