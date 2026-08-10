/**
 * Todo el copy de la landing vive acá para que se pueda editar sin tocar
 * componentes. Los componentes solo lo consumen y lo pintan.
 */
import { PRICES } from './payment'

export interface Creator {
  name: string
  role: string
  /** Qué aporta al método. */
  text: string
  instagram: string
  handle: string
  /** Slug de la foto en Cloudinary (ver config/photos.ts). */
  photo: string
}

/** El Método SK lo crean dos: entrenamiento y nutrición. */
export const CREATORS: Creator[] = [
  {
    name: 'Scarlet Córdova',
    role: 'Entrenamiento',
    text: 'Arma las rutinas, la progresión de cargas y la técnica de cada ejercicio.',
    instagram: 'https://www.instagram.com/scarlettcordova9',
    handle: '@scarlettcordova9',
    photo: 'sk-13',
  },
  {
    name: 'Karen López',
    role: 'Nutrición',
    text: 'Arma el plan de comidas, las porciones y los intercambios de los 3 meses.',
    instagram: 'https://www.instagram.com/nutricionistakarenlopez',
    handle: '@nutricionistakarenlopez',
    photo: 'sk-06',
  },
]

export const BRAND = {
  name: 'Método SK',
  authors: CREATORS.map((creator) => creator.name).join(' & '),
  tagline: 'Reto de 3 meses',
  whatsapp: 'https://wa.me/593999999999',
  email: 'hola@metodosk.com',
}

export const HERO = {
  eyebrow: 'Reto Método SK · 3 meses',
  title: 'Tu cuerpo cambia\ncuando el plan\ntiene método.',
  subtitle:
    'Entrenamiento en casa o en gimnasio y un plan de nutrición pensados para 3 meses. Sin improvisar, sin dietas imposibles, sin depender de la motivación.',
  primaryCta: 'Quiero mi cupo',
  secondaryCta: 'Ver qué incluye',
  stats: [
    { value: '3', label: 'meses de plan' },
    { value: '2', label: 'retos a elegir' },
    { value: 'Casa', label: 'o gimnasio' },
  ],
}

export const PROMISE = {
  eyebrow: 'Qué es el Método SK',
  title: 'No es una rutina suelta. Es un método de 3 meses.',
  paragraphs: [
    'La mayoría empieza con toda la energía y a las tres semanas ya no sabe qué toca hacer. El Método SK existe justo para eso: tienes los 3 meses completos organizados desde el día uno — qué entrenar, cómo calentar, cómo moverte y cómo comer.',
    'Cada ejercicio está pensado para que lo pueda hacer alguien que recién empieza y también alguien intermedio o avanzado. Tú eliges el nivel; el método se adapta, tú no te quedas fuera.',
  ],
  highlights: [
    'Progresión planificada mes a mes',
    'Versión para casa y versión para gimnasio',
    'Niveles: principiante · intermedio · avanzado',
  ],
}

export interface Challenge {
  id: 'recomposicion' | 'volumen'
  name: string
  claim: string
  description: string
  bullets: string[]
  forWho: string
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'recomposicion',
    name: 'SK Recomposición',
    claim: 'Quema grasa y construye músculo',
    description:
      'Bajas grasa mientras construyes músculo, para que el cambio se note en la forma y no solo en la balanza.',
    bullets: [
      'Déficit calórico calculado, sin pasar hambre',
      'Fuerza + trabajo metabólico en la misma semana',
      'Proteína suficiente para no perder lo ganado',
      'Medidas y fotos como referencia real de avance',
    ],
    forWho: 'Para ti si quieres verte más definida y firme.',
  },
  {
    id: 'volumen',
    name: 'SK Volumen',
    claim: 'Aumenta músculo con estrategia',
    description:
      'Subes de peso con estrategia: músculo real, con una progresión de cargas que sí avanza cada mes.',
    bullets: [
      'Superávit controlado, sin subir de cualquier forma',
      'Progresión de cargas semana a semana',
      'Enfoque en glúteo, pierna y espalda',
      'Descansos y volumen de trabajo planificados',
    ],
    forWho: 'Para ti si te cuesta subir de peso y quieres más curvas.',
  },
]

export const INCLUDES = {
  eyebrow: 'Qué incluye',
  title: 'Todo lo que necesitas durante los 3 meses',
  items: [
    {
      icon: '⌂',
      title: 'Entrena en casa o en el gym',
      text: 'Las dos versiones de cada rutina, con el mismo objetivo. Entrenas donde puedas esa semana.',
    },
    {
      icon: '◇',
      title: 'Movilidad y calentamiento',
      text: 'Cada sesión arranca con movilidad y calentamiento guiados. Menos molestias, mejor técnica.',
    },
    {
      icon: '↑',
      title: 'Rutina progresiva',
      text: 'La rutina completa mes a mes, con series, repeticiones y descansos definidos.',
    },
    {
      icon: '☰',
      title: 'Tres niveles',
      text: 'Principiante, intermedio y avanzado. Cada ejercicio trae su variante más fácil y su versión exigente.',
    },
    {
      icon: '◐',
      title: 'Plan de nutrición 3 meses',
      text: 'Estructura de comidas, porciones e intercambios según tu reto. Comida real, de la que se consigue acá.',
    },
    {
      icon: '✎',
      title: 'Guía y seguimiento',
      text: 'La guía del Método SK con el registro de tus cargas, medidas y avance del reto.',
    },
  ],
}

export const TIMELINE = {
  eyebrow: 'Cómo funciona',
  title: 'Tres meses, tres etapas',
  steps: [
    {
      month: 'Mes 01',
      title: 'Base y técnica',
      text: 'Aprendes los patrones de movimiento, ordenas tus comidas y armas el hábito. Sin cargas heroicas: primero la técnica.',
    },
    {
      month: 'Mes 02',
      title: 'Progresión',
      text: 'Suben las cargas y el volumen de trabajo. Acá empieza a notarse el cambio en la fuerza y en la ropa.',
    },
    {
      month: 'Mes 03',
      title: 'Consolidación',
      text: 'Se afina el plan según tu reto y cierras con resultados medibles y un hábito que ya es tuyo.',
    },
  ],
}

export const FOR_WHO = {
  eyebrow: 'Para quién es',
  title: 'Seamos claras antes de que pagues',
  yes: {
    title: 'Es para ti si…',
    items: [
      'Quieres un plan completo y no rutinas sueltas de internet',
      'Entrenas en casa, en el gym, o vas cambiando entre los dos',
      'Recién empiezas o ya tienes experiencia: hay nivel para cada una',
      'Quieres entender qué comer, no solo que te den una dieta',
      'Puedes darle 3 meses de constancia',
    ],
  },
  no: {
    title: 'No es para ti si…',
    items: [
      'Buscas bajar 10 kilos en dos semanas',
      'No estás dispuesta a entrenar de forma constante',
      'Esperas resultados sin cambiar nada de tu alimentación',
    ],
  },
}

export const COMMUNITY = {
  eyebrow: 'Quiénes lo crearon',
  title: 'Un método hecho\npor dos.',
  text: 'Entrenar sin comer bien no funciona, y comer bien sin entrenar tampoco. Por eso el Método SK lo armamos entre una entrenadora y una nutricionista, trabajando sobre el mismo plan de 3 meses.',
  closing: {
    title: 'Y no lo haces sola.',
    text: 'Arrancas el mismo día que todas las que entran a este reto, con el mismo plan y el mismo calendario.',
  },
}

export const PRICING = {
  eyebrow: 'Pre-venta abierta',
  title: 'Un solo pago. Los 3 meses completos.',
  presale: PRICES.presale,
  regular: PRICES.regular,
  /** Cupos a precio de pre-venta. */
  spots: { total: 100, taken: 63 },
  note: 'Precio final, un solo pago. Acceso a los 3 meses del reto.',
  cta: 'Reservar mi cupo',
  includes: [
    'Plan de entrenamiento de 3 meses (casa y gimnasio)',
    'Movilidad y calentamiento en cada sesión',
    'Tres niveles: principiante, intermedio y avanzado',
    'Plan de nutrición de 3 meses según tu reto',
    'Guía del Método SK para registrar tu avance',
    'Acceso a la comunidad del reto',
  ],
  guarantees: ['Pago seguro con PayPhone', 'Visa · Mastercard · Diners · Discover'],
}

export const FAQ = {
  eyebrow: 'Preguntas',
  title: 'Lo que todas preguntan',
  items: [
    {
      q: '¿Necesito ir al gimnasio?',
      a: 'No. Cada rutina viene en dos versiones: una para casa, con equipo mínimo, y otra para gimnasio. Puedes cambiar de una a otra la semana que necesites.',
    },
    {
      q: 'Nunca he entrenado, ¿puedo hacerlo?',
      a: 'Sí. Cada ejercicio tiene su variante para principiante y su progresión para intermedio y avanzado. Arrancas donde estás hoy.',
    },
    {
      q: '¿Cuál reto elijo?',
      a: 'SK Recomposición si quieres quemar grasa y construir músculo. SK Volumen si te cuesta subir de peso y quieres aumentar músculo con estrategia. Si dudas, escríbenos antes de comprar y te ayudamos a elegir.',
    },
    {
      q: '¿Cuánto tiempo toma cada sesión?',
      a: 'Entre 45 y 60 minutos, incluyendo movilidad y calentamiento.',
    },
    {
      q: '¿La nutrición es una dieta estricta?',
      a: 'No. Es una estructura de comidas con porciones e intercambios, hecha con comida que se consigue acá. Aprendes a armar tu plato, no a depender de una lista cerrada.',
    },
    {
      q: '¿Cómo recibo el acceso?',
      a: 'Apenas se confirma tu pago recibes el acceso en tu correo, junto con las instrucciones para arrancar el reto.',
    },
    {
      q: '¿El precio de pre-venta se mantiene?',
      a: `No. La pre-venta es por cupos limitados: al llenarse, el reto vuelve a su precio de $${PRICES.regular / 100}.`,
    },
  ],
}

export const FINAL_CTA = {
  eyebrow: 'Última llamada',
  title: 'En 3 meses vas a estar igual\no vas a estar distinta.',
  text: 'La diferencia no es la motivación. Es tener un método y seguirlo.',
  cta: 'Empezar el reto',
}
