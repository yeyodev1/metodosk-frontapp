/**
 * El copy de la entrada a los grupos de Telegram.
 *
 * Los títulos de cada grupo vienen del servidor, que es quien sabe cuáles
 * están abiertos. Acá va lo que rodea al bot: qué es, qué le va a pedir y
 * qué hacer si algo no cuadra.
 */

export const TELEGRAM = {
  /** La franja de arriba, en toda la app, mientras no haya entrado. */
  banda: {
    titulo: '🎉 Tu grupo de Telegram ya está abierto',
    texto: 'Scarlett y Karen te esperan adentro.',
    cta: 'Ingresa por aquí',
  },

  eyebrow: 'Tu grupo',
  titulo: 'Ingresa a tu grupo de Telegram',
  intro:
    'Tu entrada es personal y ya está lista. Tocas el botón, se abre nuestro bot en Telegram, tocas Iniciar y te manda tu enlace al instante. ✨',

  abrir: 'Ingresa por aquí',
  correoTitulo: 'Si el bot te pide el correo, escríbele exactamente este:',
  correoNota: 'Es el correo con el que compraste. Con otro no te va a encontrar.',
  pasos: [
    'Toca "Ingresa por aquí": se abre @metodosk_bot en Telegram.',
    'Toca Iniciar. El bot te reconoce y te manda tu enlace.',
    'Toca el enlace y ya estás dentro. Sirve una sola vez.',
  ],

  /** Ya pasó por el bot. */
  vinculado: (nombre: string) =>
    `Ya vinculaste tu Telegram (${nombre}). Si no encuentras el grupo, búscalo en tus chats; si perdiste el enlace antes de entrar, vuelve al bot y te manda otro.`,

  /** A quien no le toca. Hoy no hay WhatsApp de soporte: se manda a Instagram. */
  fuera: 'No está incluido en tu compra. Escríbenos por Instagram y te contamos cómo sumarte.',
  fueraCta: 'Escribir por Instagram',
  fueraUrl: 'https://www.instagram.com/scarlettcordova9',

  /** Nada abierto todavía. */
  cerrado: 'Los grupos se abren pronto. Cuando estén listos, la entrada va a aparecer aquí.',
} as const
