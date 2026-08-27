import { ref } from 'vue'
import * as tus from 'tus-js-client'
import courseService from '@/services/courseService'

/**
 * Sube un video directo del navegador a Bunny.
 *
 * El archivo no pasa por nuestro backend: una clase pesa cientos de megas y la
 * función de Vercel se corta muy por debajo de eso. El servidor solo firma la
 * subida, así que la API key de Bunny nunca llega al navegador.
 *
 * TUS reanuda: si se corta el internet a mitad de una subida larga, continúa
 * donde iba en vez de empezar de cero.
 */
export function useBunnyUpload() {
  const subiendo = ref(false)
  const progreso = ref(0)
  const error = ref('')

  async function subir(courseId: string, destino: string, archivo: File): Promise<boolean> {
    subiendo.value = true
    progreso.value = 0
    error.value = ''

    try {
      const firma = await courseService.prepararVideo(courseId, destino, archivo.name)

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(archivo, {
          endpoint: firma.uploadUrl,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            AuthorizationSignature: firma.signature,
            AuthorizationExpire: String(firma.expiration),
            VideoId: firma.videoId,
            LibraryId: firma.libraryId,
          },
          metadata: { filetype: archivo.type, title: archivo.name },
          onError: reject,
          onProgress: (subido, total) => {
            progreso.value = Math.round((subido / total) * 100)
          },
          onSuccess: () => resolve(),
        })

        upload.start()
      })

      return true
    } catch (e: unknown) {
      const mensaje = (e as { message?: string }).message
      error.value = mensaje?.includes('Bunny')
        ? mensaje
        : 'No pudimos subir el video. Revisa la conexión e intenta de nuevo.'
      return false
    } finally {
      subiendo.value = false
    }
  }

  return { subiendo, progreso, error, subir }
}
