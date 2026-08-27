import APIBase from './httpBase'
import type { SubidaFirmada, VideoBunny } from './courseService'

/** El video de bienvenida que ve quien acaba de comprar. */
export interface Vsl {
  embedUrl: string
  durationSeconds: number | null
  thumbnail: string | null
}

class SettingsService extends APIBase {
  /** Público: se pide en la pantalla de resultado del pago, sin sesión. */
  async vsl() {
    const { data } = await this.get<{ vsl: Vsl | null }>('settings/vsl')
    return data.vsl
  }

  async vslAdmin() {
    const { data } = await this.get<{ vsl: VideoBunny | null; bunnyListo: boolean }>('admin/vsl')
    return data
  }

  async prepararVsl(titulo: string) {
    const { data } = await this.post<SubidaFirmada>('admin/vsl/video', { titulo })
    return data
  }

  async estadoVsl() {
    const { data } = await this.get<VideoBunny>('admin/vsl/estado')
    return data
  }

  async borrarVsl() {
    await this.delete('admin/vsl')
  }
}

export default new SettingsService()
