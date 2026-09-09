import APIBase from './httpBase'

/**
 * La entrada a los grupos de Telegram.
 *
 * La da el bot, conversando: la alumna le escribe su correo y él decide. Acá
 * solo se pregunta qué grupos están abiertos, cuáles le tocan, y si ya pasó
 * por el bot — para que la pantalla le diga qué esperar antes de abrirlo.
 */
export type GrupoTelegram = 'comunidad' | 'premium'

export interface EstadoGrupo {
  id: GrupoTelegram
  titulo: string
  texto: string
  /** true si le toca por la fecha en que compró. */
  incluido: boolean
}

export interface EstadoTelegram {
  /** El nombre de la cuenta de Telegram vinculada, si ya pasó por el bot. */
  vinculado: string | null
  grupos: EstadoGrupo[]
}

class TelegramService extends APIBase {
  async estado() {
    const { data } = await this.get<EstadoTelegram>('telegram/grupos')
    return data
  }
}

export default new TelegramService()
