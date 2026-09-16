/**
 * La tienda de Scarlett en Amazon.
 *
 * Todo lo que usa —lo del reto y lo de su vida diaria— ya está reunido en un
 * solo enlace, así que la pregunta que más llega por WhatsApp ("¿qué banda
 * compraste?", "¿de dónde es esa botella?") tiene una sola respuesta y no hay
 * que contestarla una por una.
 *
 * Vive acá, y no dentro de los componentes, por la regla del proyecto: el copy
 * es configuración. Espejo de metodosk-backapp/src/config/tienda.ts, que es de
 * donde sale el bloque de los correos — si cambia una, cambia la otra.
 */

export const TIENDA = {
  url: 'https://www.amazon.com/shop/scarlettcordova9',

  eyebrow: 'La tienda de Scarlett',
  titulo: 'Todo lo que usa Scarlett, en un solo lugar',
  intro:
    'Sus mancuernas, su banda, su mat, su botella, lo de la cocina y lo que usa fuera del gym. Lo que le preguntan todos los días, reunido en su tienda de Amazon.',
  cta: 'Ver la tienda de Scarlett',

  /**
   * Lo que se va a encontrar, en tres líneas.
   *
   * Se nombran cosas concretas a propósito: "sus implementos" no le dice nada
   * a nadie, "la banda de tela que usa en los bloques de glúteo" sí.
   */
  puntos: [
    {
      icono: 'dumbbell',
      titulo: 'Lo del reto',
      texto: 'Las mancuernas, la banda de tela y el mat con los que ella entrena.',
    },
    {
      icono: 'utensils',
      titulo: 'Lo de la cocina',
      texto: 'Botellas, tuppers y lo que le hace fácil el meal prep de la semana.',
    },
    {
      icono: 'heart-pulse',
      titulo: 'Lo del día a día',
      texto: 'Su rutina, su skincare y lo que más le preguntan en Instagram.',
    },
  ],

  /**
   * Si compras desde su enlace, Amazon le reconoce una comisión y a ti no te
   * cuesta un centavo más. Se dice de frente: ocultarlo es lo que haría que
   * dejara de ser una recomendación honesta.
   */
  nota: 'Amazon le reconoce una pequeña comisión por cada compra hecha desde su tienda. A ti no te cuesta nada más, y con eso nos ayudas a seguir haciendo esto. 💖',

  /** La franja de arriba de la app. Tiene que caber en una línea en el móvil. */
  banda: {
    titulo: 'La tienda de Scarlett ya está abierta',
    texto: 'Todo lo que usa ella, del reto y de su día a día, en un solo lugar.',
    cta: 'Ver la tienda',
  },
} as const
