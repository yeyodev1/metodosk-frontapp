/**
 * El copy de la pre-venta, dentro de la app.
 *
 * Vive acá y no dentro de los componentes por la regla del proyecto: el texto
 * es configuración. Lo que dice esta pantalla cambia varias veces antes de que
 * abra el reto, y cambiarlo no debería obligar a tocar un `.vue`.
 *
 * Lo que se decide acá es una sola cosa: **quien ya pagó tiene que entender en
 * treinta segundos que compró un cupo, no un curso abierto.** Sin eso, entra,
 * ve cursos bloqueados y cree que le vendieron algo roto.
 */

/** Cuándo abre el contenido. El servidor manda; esto es el respaldo. */
export const APERTURA_TEXTO = '14 de septiembre'

/** Hasta cuándo comprar incluye la comunidad de Telegram. */
export const TELEGRAM_TEXTO = '14 de septiembre'

export const PREVENTA = {
  /** La franja de arriba, en toda la app. */
  banda: {
    titulo: 'Estás en la pre-venta',
    texto: `Tu cupo ya está pagado y asegurado. El contenido del reto se abre el ${APERTURA_TEXTO} — hasta entonces vas a ver secciones bloqueadas, y es normal.`,
  },

  /** La tarjeta grande de "qué pasa ahora". */
  explicacion: {
    eyebrow: 'Cómo funciona la pre-venta',
    titulo: 'Compraste tu cupo. El reto arranca en unos días.',
    texto:
      'Una pre-venta es exactamente esto: pagas antes, al precio más bajo que va a tener, y entras el día que abre. Lo que ves bloqueado no está roto ni te falta pagar nada — todavía no se publica.',
    puntos: [
      {
        icono: 'check',
        titulo: 'Ya está listo',
        texto: 'Tu cuenta, tu acceso de 3 meses y tu lugar en el reto.',
      },
      {
        icono: 'camera',
        titulo: 'Puedes empezar hoy',
        texto: 'Sube tus fotos de partida y tus medidas. Ese es tu punto cero.',
      },
      {
        icono: 'lock',
        titulo: 'Se abre el ' + APERTURA_TEXTO,
        texto: 'Entrenamientos, nutrición y la guía completa, mes por mes.',
      },
    ],
  },

  /** Los beneficios por haber comprado antes. */
  beneficios: {
    eyebrow: 'Por comprar en pre-venta',
    titulo: 'Lo que te llevas por haber entrado antes',

    telegram: {
      icono: 'comments',
      titulo: 'Comunidad masiva en Telegram',
      incluido: `Incluida. Compraste antes del ${TELEGRAM_TEXTO}, así que entras sin costo cuando se abra el grupo.`,
      fuera: `Tiene costo aparte. La comunidad de Telegram va incluida solo para quienes compraron hasta el ${TELEGRAM_TEXTO} — escríbenos y te contamos cómo sumarte.`,
      pie: 'El enlace de entrada llega por correo cuando abra.',
    },

    premium: {
      icono: 'users',
      titulo: 'Grupo premium con Scarlet y Karen',
      texto:
        'Un grupo aparte, mucho más chico, donde están ellas dos respondiendo. Se abre pronto y te avisamos por correo — no tienes que hacer nada para reservarlo.',
      pie: 'Solo para quienes compraron en pre-venta.',
    },
  },

  /** Lo que hace falta para entrenar en casa. */
  equipo: {
    icono: 'dumbbell',
    titulo: 'Ve consiguiendo tu equipo',
    texto:
      'El reto está armado para hacerse en casa. Para eso necesitas dos cosas, y conviene tenerlas antes del primer día:',
    lista: [
      'Un par de mancuernas',
      'Bandas de resistencia',
    ],
    pie: 'Nada más. Si entrenas en gimnasio, también funciona.',
  },
} as const
