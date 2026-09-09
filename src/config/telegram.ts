/**
 * El copy de la entrada a los grupos de Telegram.
 *
 * Los títulos de cada grupo vienen del servidor, que es quien sabe cuáles
 * están abiertos. Acá va lo que rodea al bot: qué es, qué le va a pedir y
 * qué hacer si algo no cuadra.
 */

/** El bot que da la entrada. El `start` es para que salude apenas se abra. */
export const BOT_URL = 'https://t.me/metodosk_bot?start=app'

export const TELEGRAM = {
  eyebrow: 'Tu grupo',
  titulo: 'Entra a la comunidad',
  intro:
    'La entrada te la da nuestro bot de Telegram. Ábrelo, escríbele el correo con el que te inscribiste, y si te toca te manda tu enlace personal al instante.',

  abrir: 'Abrir el bot en Telegram',
  pasos: [
    'Toca el botón: se abre un chat con @metodosk_bot.',
    'Toca "Iniciar" y escríbele tu correo de la compra.',
    'Te manda tu enlace. Es personal y sirve una sola vez.',
  ],

  /** Ya pasó por el bot. */
  vinculado: (nombre: string) =>
    `Ya vinculaste tu Telegram (${nombre}). Si perdiste el enlace, vuelve a escribirle tu correo al bot y te manda otro.`,

  /** A quien no le toca. Hoy no hay WhatsApp de soporte: se manda a Instagram. */
  fuera: 'No está incluido en tu compra. Escríbenos por Instagram y te contamos cómo sumarte.',
  fueraCta: 'Escribir por Instagram',
  fueraUrl: 'https://www.instagram.com/scarlettcordova9',

  /** Nada abierto todavía. */
  cerrado: 'Los grupos se abren pronto. Cuando estén listos, la entrada va a aparecer aquí.',
} as const
