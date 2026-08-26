/**
 * La academia por dentro: qué recibe la alumna durante los 3 meses.
 *
 * El copy sale del mismo método que promete la landing (`site.ts`), para que
 * lo que se vendió y lo que se entrega no se separen nunca. Acá vive la
 * estructura; los enlaces al material se cargan en `url` cuando existan —
 * mientras estén en null, la vista lo dice en vez de fingir que hay algo.
 */
import { PHOTO, GALLERY, type Photo } from './photos'

export type Entrega = 'inmediata' | 'mes-1' | 'mes-2' | 'mes-3' | 'semanal'

export interface Recurso {
  titulo: string
  /** Qué es: un PDF, un video, un enlace al grupo… */
  tipo: 'PDF' | 'Video' | 'Enlace' | 'Masterclass'
  /** null mientras no esté cargado. La vista muestra el estado real. */
  url: string | null
  entrega: Entrega
}

export interface Modulo {
  id: string
  /** Número visible: la alumna sigue un orden, no un menú suelto. */
  orden: string
  eyebrow: string
  title: string
  /** Una línea: qué resuelve este módulo. */
  claim: string
  text: string
  items: string[]
  photo: Photo
  recursos: Recurso[]
}

export const MODULOS: Modulo[] = [
  {
    id: 'entrenamiento',
    orden: '01',
    eyebrow: 'Scarlet Córdova',
    title: 'Tu entrenamiento',
    claim: 'La rutina completa de los 3 meses, en casa o en el gym.',
    text: 'Cada semana trae sus sesiones con series, repeticiones y descansos definidos. La misma rutina viene en dos versiones — casa y gimnasio — para que entrenes donde puedas esa semana sin salirte del plan.',
    items: [
      'Versión casa y versión gimnasio de cada sesión',
      'Series, repeticiones y descansos definidos',
      'Progresión de cargas semana a semana',
      'Principiante, intermedio y avanzado en cada ejercicio',
    ],
    photo: PHOTO.training,
    recursos: [
      { titulo: 'Rutina · Mes 1 — Base y técnica', tipo: 'PDF', url: null, entrega: 'inmediata' },
      { titulo: 'Rutina · Mes 2 — Progresión', tipo: 'PDF', url: null, entrega: 'mes-2' },
      { titulo: 'Rutina · Mes 3 — Consolidación', tipo: 'PDF', url: null, entrega: 'mes-3' },
      { titulo: 'Biblioteca de ejercicios en video', tipo: 'Video', url: null, entrega: 'inmediata' },
    ],
  },
  {
    id: 'movilidad',
    orden: '02',
    eyebrow: 'Antes de cada sesión',
    title: 'Movilidad y calentamiento',
    claim: 'Los diez minutos que deciden cómo te sientes al día siguiente.',
    text: 'Cada sesión arranca con movilidad y calentamiento guiados. No es relleno: es lo que baja las molestias y hace que la técnica aguante cuando suben las cargas.',
    items: [
      'Calentamiento guiado por grupo muscular',
      'Movilidad de cadera, hombro y columna',
      'Qué hacer si algo molesta durante la sesión',
    ],
    photo: GALLERY[3]!,
    recursos: [
      { titulo: 'Rutina de movilidad guiada', tipo: 'Video', url: null, entrega: 'inmediata' },
      { titulo: 'Calentamientos por sesión', tipo: 'PDF', url: null, entrega: 'inmediata' },
    ],
  },
  {
    id: 'nutricion',
    orden: '03',
    eyebrow: 'Karen López',
    title: 'Tu nutrición',
    claim: 'Comida real, de la que se consigue acá, con porciones que se entienden.',
    text: 'El plan de las 12 semanas según tu objetivo, con porciones e intercambios. No es una lista cerrada que se abandona a la tercera semana: es aprender a armar tu plato.',
    items: [
      'Plan de alimentación de los 3 meses',
      'Porciones e intercambios por comida',
      'Fotos de productos disponibles en tu ciudad',
      'Recomendaciones de suplementación según tu reto',
    ],
    photo: PHOTO.nutrition,
    recursos: [
      { titulo: 'Plan de alimentación · Mes 1', tipo: 'PDF', url: null, entrega: 'inmediata' },
      { titulo: 'Plan de alimentación · Mes 2', tipo: 'PDF', url: null, entrega: 'mes-2' },
      { titulo: 'Plan de alimentación · Mes 3', tipo: 'PDF', url: null, entrega: 'mes-3' },
      { titulo: 'Lista de intercambios', tipo: 'PDF', url: null, entrega: 'inmediata' },
      { titulo: 'Fotos de productos por ciudad', tipo: 'PDF', url: null, entrega: 'inmediata' },
    ],
  },
  {
    id: 'masterclasses',
    orden: '04',
    eyebrow: 'Una por mes',
    title: 'Masterclasses',
    claim: 'Tres clases para manejar la alimentación en la vida real.',
    text: 'Comer fuera, un viaje, un cumpleaños. Una masterclass cada mes con herramientas para los días que no salen como el plan, más los videos educativos para sostener la constancia.',
    items: [
      'Masterclass 01 — Ordenar tus comidas del día',
      'Masterclass 02 — Comer fuera sin perder el plan',
      'Masterclass 03 — Sostenerlo después del reto',
      'Videos educativos durante las 12 semanas',
    ],
    photo: GALLERY[9]!,
    recursos: [
      { titulo: 'Masterclass 01', tipo: 'Masterclass', url: null, entrega: 'mes-1' },
      { titulo: 'Masterclass 02', tipo: 'Masterclass', url: null, entrega: 'mes-2' },
      { titulo: 'Masterclass 03', tipo: 'Masterclass', url: null, entrega: 'mes-3' },
    ],
  },
  {
    id: 'guia',
    orden: '05',
    eyebrow: 'Tu registro',
    title: 'La guía del Método SK',
    claim: 'Donde se ve el avance que la balanza no muestra.',
    text: 'Anotas cargas, medidas y fotos. Al mes tres no dependes de cómo te sentiste esa mañana: tienes el registro de lo que levantabas en la semana 1 y de lo que levantas ahora.',
    items: [
      'Registro de cargas por ejercicio',
      'Medidas y fotos de referencia',
      'Checklist semanal del reto',
    ],
    photo: PHOTO.guide,
    recursos: [
      { titulo: 'Guía del Método SK', tipo: 'PDF', url: null, entrega: 'inmediata' },
      { titulo: 'Planilla de medidas', tipo: 'PDF', url: null, entrega: 'inmediata' },
    ],
  },
  {
    id: 'comunidad',
    orden: '06',
    eyebrow: 'No lo haces sola',
    title: 'La comunidad',
    claim: 'Arrancas el mismo día que todas las que entran a este reto.',
    text: 'El grupo privado de Telegram durante las 12 semanas: dudas, avances y las dos que armaron el método respondiendo del otro lado.',
    items: [
      'Grupo privado de Telegram por las 12 semanas',
      'Dudas de entrenamiento y de nutrición',
      'El mismo calendario para todas',
    ],
    photo: GALLERY[0]!,
    recursos: [{ titulo: 'Grupo privado de Telegram', tipo: 'Enlace', url: null, entrega: 'inmediata' }],
  },
]

/** En qué mes del reto se abre cada entrega. */
export const MES_DE_ENTREGA: Record<Entrega, number> = {
  inmediata: 1,
  'mes-1': 1,
  'mes-2': 2,
  'mes-3': 3,
  semanal: 1,
}

export const ETAPAS = [
  { mes: 1, title: 'Base y técnica', text: 'Patrones de movimiento, comidas ordenadas, hábito armado.' },
  { mes: 2, title: 'Progresión', text: 'Suben las cargas y el volumen. Acá empieza a notarse.' },
  { mes: 3, title: 'Consolidación', text: 'Se afina según tu reto y cierras con resultados medibles.' },
]

/** Semanas totales del reto — 3 meses. */
export const SEMANAS = 12
