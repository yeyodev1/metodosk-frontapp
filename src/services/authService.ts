import APIBase from './httpBase'

export type UserRole = 'admin' | 'member'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  challenge: string | null
  /** Todos los retos comprados. Puede tener los dos. */
  challenges: string[]
  accessUntil: string | null
  /** true si el acceso sigue vigente hoy. */
  accessActive: boolean
  mustChangePassword: boolean
}

export interface EmailStatus {
  /** Hay una compra aprobada con ese correo. */
  hasPurchase: boolean
  /** Ya tiene contraseña creada. */
  hasAccount: boolean
  challenge: string | null
}

class AuthService extends APIBase {
  async login(email: string, password: string) {
    const r = await this.post<{ token: string; user: SessionUser }>('auth/login', { email, password })
    return r.data
  }

  /** Antes de pedir contraseña: ¿este correo compró? ¿ya tiene cuenta? */
  async checkEmail(email: string) {
    const r = await this.post<EmailStatus>('auth/check-email', { email })
    return r.data
  }

  async register(email: string, password: string) {
    const r = await this.post<{ token: string; user: SessionUser }>('auth/register', { email, password })
    return r.data
  }

  async me() {
    const r = await this.get<{ user: SessionUser }>('auth/me')
    return r.data.user
  }

  async changePassword(current: string, next: string) {
    const r = await this.put<{ user: SessionUser }>('auth/password', { current, next })
    return r.data.user
  }
}

export default new AuthService()
