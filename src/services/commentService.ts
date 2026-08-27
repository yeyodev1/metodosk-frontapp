import APIBase from './httpBase'

export interface Comentario {
  id: string
  authorName: string
  body: string
  fromStaff: boolean
  createdAt: string
  mine: boolean
  respuestas: Comentario[]
}

export interface ComentarioAdmin {
  id: string
  authorName: string
  body: string
  courseId: string
  lessonId: string
  hidden: boolean
  fromStaff: boolean
  createdAt: string
  respuestas: number
}

class CommentService extends APIBase {
  async listar(courseId: string, lessonId: string) {
    const { data } = await this.get<{ comentarios: Comentario[] }>(
      `comments?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(lessonId)}`,
    )
    return data.comentarios
  }

  async crear(courseId: string, lessonId: string, body: string, parent?: string) {
    const { data } = await this.post<Comentario>('comments', { courseId, lessonId, body, parent })
    return data
  }

  async borrar(id: string) {
    await this.delete(`comments/${id}`)
  }

  /* ── Administración ── */

  async listarAdmin(soloPendientes = false) {
    const { data } = await this.get<{ comentarios: ComentarioAdmin[] }>(
      `admin/comments${soloPendientes ? '?pendientes=1' : ''}`,
    )
    return data.comentarios
  }

  async ocultar(id: string, hidden: boolean) {
    await this.put(`admin/comments/${id}/hidden`, { hidden })
  }

  async eliminar(id: string) {
    await this.delete(`admin/comments/${id}`)
  }
}

export default new CommentService()
