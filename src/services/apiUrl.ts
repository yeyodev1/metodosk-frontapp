/**
 * A qué backend hablar, según desde dónde se esté sirviendo la web.
 *
 * Vive fuera de `httpBase.ts` porque la landing necesita esta resolución para
 * el espejo del pixel, y `httpBase` importa axios: dejarla ahí arrastraría
 * axios entero al bundle de una página que no hace ni una petición.
 */
export function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (hostname === 'metodosk.ec' || hostname === 'www.metodosk.ec') {
      return 'https://api.metodosk.ec/api'
    }
    if (hostname === 'dev-project-front.bakano.ec' || hostname.endsWith('.trycloudflare.com')) {
      return 'https://dev-project-back.bakano.ec/api'
    }
  }

  const raw = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8101/api'
  const trimmed = raw.replace(/\/+$/, '')
  return trimmed.endsWith('/api') || /\/api\//.test(trimmed) ? trimmed : `${trimmed}/api`
}
