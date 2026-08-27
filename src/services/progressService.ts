import APIBase from './httpBase'

export interface AvanceVideo {
  courseId: string
  lessonId: string
  seconds: number
  duration: number | null
  completed: boolean
}

export interface ResumenCurso {
  courseId: string
  vistos: number
  total: number
  porcentaje: number
}

export interface MiAvance {
  videos: AvanceVideo[]
  cursos: ResumenCurso[]
  porcentajeTotal: number
}

class ProgressService extends APIBase {
  async mio() {
    const { data } = await this.get<MiAvance>('progress')
    return data
  }

  async guardar(input: {
    courseId: string
    lessonId: string
    seconds: number
    duration?: number | null
    completed?: boolean
  }) {
    const { data } = await this.put<AvanceVideo>('progress', input)
    return data
  }

  async marcarVista(courseId: string, lessonId: string) {
    const { data } = await this.post<AvanceVideo>('progress/vista', { courseId, lessonId })
    return data
  }
}

export default new ProgressService()
