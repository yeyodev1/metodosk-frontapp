/**
 * Términos y condiciones del Reto Método SK. Se aceptan al pagar: el
 * checkout enlaza a esta página antes del botón de pago.
 */
import { BRAND } from './site'

export interface LegalSection {
  title: string
  paragraphs: string[]
}

export const TERMS = {
  title: 'Términos y condiciones',
  intro: `Estos términos regulan la compra y el uso del Reto ${BRAND.name}. Al completar el pago aceptas todo lo que se indica en esta página. Si no estás de acuerdo con alguno de los puntos, no realices la compra.`,
  sections: [
    {
      title: '1. Aceptación con el pago',
      paragraphs: [
        'El pago del reto equivale a la aceptación expresa e integral de estos términos y condiciones, incluida la cláusula de salud y lesiones (punto 4). No hace falta firmar nada adicional: pagar es aceptar.',
        'Al pagar declaras que eres mayor de edad, que la información que entregas es verdadera y que leíste estos términos antes de comprar.',
      ],
    },
    {
      title: '2. Qué incluye el reto',
      paragraphs: [
        'El reto es un programa digital de 3 meses con rutinas de entrenamiento, un plan de nutrición y el contenido publicado en la plataforma. El acceso es personal e intransferible y se entrega al correo registrado en la compra.',
        'Los resultados dependen de cada persona: de su constancia, su alimentación, su descanso y su condición de partida. No se garantiza un resultado específico de peso, medidas o apariencia.',
      ],
    },
    {
      title: '3. Pagos y reembolsos',
      paragraphs: [
        'Los pagos se procesan a través de PayPhone. Por tratarse de un producto digital con acceso inmediato al contenido, una vez entregado el acceso no se realizan reembolsos.',
      ],
    },
    {
      title: '4. Salud, ejercicio y lesiones',
      paragraphs: [
        'Antes de empezar el reto debes consultar con tu médico, sobre todo si tienes alguna condición de salud, lesión previa, embarazo, enfermedad cardíaca, presión alta o cualquier otra situación que pueda verse afectada por el ejercicio o por un cambio en la alimentación.',
        'Cada ejercicio se explica con su técnica correcta. Es tu responsabilidad realizarlo tal como se indica, elegir pesos y cargas adecuados a tu nivel, calentar, respetar los descansos y detenerte ante cualquier dolor, mareo o molestia.',
        `Cualquier lesión, dolor o problema de salud que se produzca durante el reto se entiende como consecuencia de haber realizado mal el ejercicio, de usar una carga inadecuada o de no seguir las indicaciones, y es responsabilidad exclusiva de quien entrena. ${BRAND.name}, ${BRAND.authors} y su equipo no se hacen responsables por lesiones, daños o afecciones de salud derivados de la práctica de los ejercicios o del seguimiento del plan de alimentación.`,
        'Entrenas de forma voluntaria y bajo tu propio riesgo. El contenido del reto es informativo y no reemplaza la valoración ni el tratamiento de un médico, fisioterapeuta o nutricionista que te atienda de forma presencial.',
      ],
    },
    {
      title: '5. Uso del contenido',
      paragraphs: [
        'Los videos, rutinas, planes y materiales del reto son propiedad de sus autoras. No se pueden compartir, revender, grabar ni publicar. Compartir la cuenta o el contenido es motivo para retirar el acceso sin reembolso.',
      ],
    },
    {
      title: '6. Contacto',
      paragraphs: [
        `Para cualquier duda sobre estos términos escríbenos a ${BRAND.email}.`,
      ],
    },
  ] as LegalSection[],
}
