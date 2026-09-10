/**
 * El copy de "Mi progreso": la próxima toma y lo que rodea al contador.
 *
 * Vive acá y no en el componente por la regla del proyecto: el texto es
 * configuración. Lo que se decide es una sola cosa: que quien entra sepa en
 * un vistazo si hoy le toca subir fotos, y si no, cuánto falta.
 */
export const PROGRESO = {
  /** Sin ninguna foto todavía: hoy es el día uno. */
  arrancando: {
    eyebrow: 'Tu punto de partida',
    titulo: 'Hoy es tu punto de partida',
    texto:
      'Sube tus primeras fotos y tus medidas. Es contra esto que vas a comparar dentro de tres meses.',
    cta: 'Subir mis fotos y medidas',
  },

  /** Pasó el mes: toca la siguiente. */
  toca: {
    eyebrow: 'Hoy te toca',
    titulo: 'Hoy te toca tu foto del mes',
    texto:
      'Misma ropa, mismo lugar, misma luz — eso es lo que hace que las dos fotos se puedan comparar.',
    cta: 'Subir mis fotos y medidas',
  },

  /** Todavía falta: el reloj corriendo hacia la próxima. */
  faltan: {
    eyebrow: 'Tu próxima toma',
    titulo: 'Tu próxima foto es el',
    texto: (dias: number) =>
      `Se repite cada ${dias} días. Mientras tanto, entrena tranquila: la comparación de verdad se hace mes a mes.`,
    ctaSecundario: 'Subir una foto igual',
    etiquetas: { dias: 'días', dia: 'día', horas: 'horas', minutos: 'min', segundos: 'seg' },
    barra: (avance: number) => `${avance}% del mes corrido`,
  },
} as const
