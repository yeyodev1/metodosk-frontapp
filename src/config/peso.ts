/**
 * Qué peso usar, por nivel. Lo escribió Scarlet.
 *
 * Vive en configuración como el resto del copy. Se muestra en Recursos, que
 * es donde la alumna ya está mirando qué necesita para entrenar: la pregunta
 * "¿y con cuánto peso?" llega justo después de "¿qué mancuernas compro?".
 */
export interface NivelDePeso {
  nivel: string
  texto: string
}

export const NIVELES_DE_PESO: NivelDePeso[] = [
  {
    nivel: 'Principiante',
    texto:
      'Utiliza un peso que te permita realizar todas las repeticiones con buena técnica y control. Las últimas repeticiones deben sentirse desafiantes, pero sin perder la correcta ejecución.',
  },
  {
    nivel: 'Intermedio',
    texto:
      'Elige un peso que haga que las últimas repeticiones sean difíciles, manteniendo siempre una buena técnica.',
  },
  {
    nivel: 'Avanzado',
    texto:
      'Trabaja con un peso que te exija al máximo según las repeticiones indicadas, sin comprometer la técnica.',
  },
]

export const RECUERDA_PESO = [
  'No existe un peso exacto para cada nivel. El peso ideal dependerá de tu fuerza, tu experiencia y del ejercicio que estés realizando.',
  'Si puedes terminar todas las repeticiones fácilmente, probablemente es momento de aumentar el peso.',
  'Si no puedes completar las repeticiones con buena técnica, disminúyelo.',
]
