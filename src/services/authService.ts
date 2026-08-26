import APIBase from './httpBase'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

class AuthService extends APIBase {
  async login(email: string, password: string) {
    const response = await this.post<{ token: string; user: SessionUser }>('auth/login', {
      email,
      password,
    })
    return response.data
  }

  /** Valida el token guardado; si caducó, el backend responde 401. */
  async me() {
    const response = await this.get<{ user: SessionUser }>('auth/me')
    return response.data.user
  }
}

export default new AuthService()
