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

  /** El bloque de medidas: la cinta métrica, junto a las fotos. */
  medidas: {
    eyebrow: 'Con la cinta métrica',
    titulo: 'Tus medidas',
    ultimaToma: (fecha: string) => `Última toma: ${fecha}`,
    sinTomas: 'Todavía no has apuntado ninguna.',
    ctaPrimera: 'Apuntar mis medidas',
    ctaNueva: 'Nueva toma',
    /** El estado vacío, cuando no hay ninguna toma. */
    vacio: {
      titulo: 'Tu primera toma es tu punto cero',
      texto:
        'Apunta lo que tengas a mano: peso, cintura, cadera. No hace falta llenar todo. Dentro de un mes, este número es el que te va a decir lo que cambió cuando la balanza no se mueva.',
    },
    form: {
      titulo: 'Apunta lo que mediste hoy',
      nota: 'Deja en blanco lo que no midas. No hace falta llenar todo.',
      guardar: 'Guardar toma',
      guardando: 'Guardando…',
      cancelar: 'Cancelar',
      errorGenerico: 'No pudimos guardarlas. Intenta de nuevo.',
    },
    cifras: {
      titulo: 'Tu última toma',
      primera: 'Primera toma',
      sinDato: 'Sin apuntar',
      igual: 'Igual que antes',
    },
    historial: {
      titulo: 'Tomas anteriores',
      verTodas: (n: number) => `Ver las ${n} tomas`,
      verMenos: 'Ver menos',
      borrar: 'Borrar esta toma',
      borrando: 'Borrando…',
      confirmar: '¿Borrar esta toma? No se puede deshacer.',
    },
  },
} as const
