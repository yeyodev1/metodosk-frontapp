/**
 * Los implementos que necesita una alumna para hacer el reto.
 *
 * Lo definió Scarlett: en casa hacen falta mancuernas, banda y colchoneta; en
 * el gimnasio la banda basta, porque el resto ya está ahí.
 *
 * Espejo de metodosk-backapp/src/config/recursos.ts, que es de donde sale el
 * correo de compra — si cambia una lista, cambia la otra.
 */

export interface Recurso {
  nombre: string
  detalle: string
  /**
   * Foto del implemento, servida desde `public/recursos/`.
   *
   * No pasa por CldImage —la regla del proyecto— porque estas tres también
   * viajan dentro del correo de compra, y un correo necesita una URL absoluta
   * y estable que no dependa de las transformaciones de Cloudinary. Servirlas
   * desde nuestro propio dominio es lo que hace que la misma foto funcione en
   * los dos sitios.
   */
  foto: string
}

export interface GrupoRecursos {
  id: 'casa' | 'gym'
  titulo: string
  intro: string
  icono: string
  recursos: Recurso[]
}

export const GRUPOS_RECURSOS: GrupoRecursos[] = [
  {
    id: 'casa',
    titulo: 'Si entrenas en casa',
    intro: 'Con estas tres cosas haces el reto completo sin salir de tu sala.',
    icono: 'house',
    recursos: [
      {
        nombre: 'Mancuernas',
        foto: '/recursos/mancuernas.jpg',
        detalle:
          'Un par. Si es tu primera vez, entre 3 y 5 kg cada una te va a servir para casi todo. Puedes empezar con menos e ir subiendo.',
      },
      {
        nombre: 'Banda de resistencia',
        foto: '/recursos/banda.jpg',
        detalle:
          'De tela, de las que se ponen sobre el pantalón y no se enrollan. Suelen venir en tres intensidades y las vas a usar todas.',
      },
      {
        nombre: 'Mat o colchoneta',
        foto: '/recursos/mat.jpg',
        detalle:
          'Para el trabajo de piso. Mientras más gruesa, más cómodas las rodillas y la espalda.',
      },
    ],
  },
  {
    id: 'gym',
    titulo: 'Si entrenas en el gimnasio',
    intro: 'Solo tienes que llevar una cosa: el resto ya lo tienes ahí.',
    icono: 'dumbbell',
    recursos: [
      {
        nombre: 'Banda de resistencia',
        foto: '/recursos/banda.jpg',
        detalle:
          'De tela. Es la única que no vas a encontrar en la mayoría de gimnasios, y la vas a necesitar en casi todos los bloques de piernas y glúteo.',
      },
    ],
  },
]
