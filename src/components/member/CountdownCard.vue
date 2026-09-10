<script setup lang="ts">
/**
 * El contador hacia el día que abre el reto.
 *
 * Existe por los comentarios: "ya pagué y no me sale nada", "¿empieza hoy?".
 * La franja de arriba lo dice en una línea y se cierra; esto no se cierra y
 * se ve desde lejos. Una fecha quieta se lee y se olvida; un reloj corriendo
 * hacia "lunes 14 de septiembre" se entiende sin leer nada.
 *
 * La fecha la manda el servidor (viene con los beneficios); lo de acá es el
 * respaldo para que el reloj no quede en cero si esa llamada falla. Pasada
 * la fecha, el bloque desaparece solo: nadie debe ver una cuenta regresiva
 * vencida anunciándose.
 */
import { computed } from 'vue'
import { useCuentaRegresiva } from '@/composables/useCuentaRegresiva'
import { APERTURA_ISO, PREVENTA } from '@/config/preventa'

const props = defineProps<{
  /** ISO de apertura, del servidor. Si no llega, se usa el de configuración. */
  apertura?: string | null
  /** Versión en una franja, para la cabecera de "Mi reto". */
  compacto?: boolean
}>()

const iso = props.apertura || APERTURA_ISO

const { cerrada, dias, horas, minutos, segundos } = useCuentaRegresiva(iso)

/**
 * "Lunes 14 de septiembre", derivado de la fecha y no escrito a mano: si la
 * apertura se mueve en el servidor, el título se mueve solo. Se fija la zona
 * de Ecuador para que el día de la semana no cambie según dónde esté ella.
 */
const fechaLarga = computed(() => {
  const texto = new Date(iso)
    .toLocaleDateString('es-EC', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Guayaquil',
    })
    .replace(',', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
})

const dosDigitos = (n: number) => String(n).padStart(2, '0')

const E = PREVENTA.contador.etiquetas

/** Los días se muestran siempre, aunque sean 0: acá el cero cuenta. */
const cajas = computed(() => [
  { valor: String(dias.value), etiqueta: dias.value === 1 ? E.dia : E.dias },
  { valor: dosDigitos(horas.value), etiqueta: E.horas },
  { valor: dosDigitos(minutos.value), etiqueta: E.minutos },
  { valor: dosDigitos(segundos.value), etiqueta: E.segundos },
])
</script>

<template>
  <section
    v-if="!cerrada"
    class="cuenta"
    :class="{ 'cuenta--compacta': compacto }"
    aria-live="off"
  >
    <div class="cuenta__texto">
      <p class="cuenta__eyebrow">
        <FaIcon icon="calendar-check" /> {{ PREVENTA.contador.eyebrow }}
      </p>
      <h2 class="cuenta__fecha">{{ fechaLarga }}</h2>
      <p class="cuenta__nota">
        {{ compacto ? PREVENTA.contador.textoCorto : PREVENTA.contador.texto }}
      </p>
    </div>

    <ol class="cajas" :aria-label="`Faltan ${dias} días, ${horas} horas y ${minutos} minutos`">
      <li v-for="c in cajas" :key="c.etiqueta" class="caja">
        <span class="caja__valor">{{ c.valor }}</span>
        <span class="caja__etiqueta">{{ c.etiqueta }}</span>
      </li>
    </ol>
  </section>
</template>

<style lang="scss" scoped>
/*
 * Siempre en columna: la fecha arriba, las cajas debajo. Ponerlas lado a lado
 * en escritorio dejaba el titular en una columna estrecha y "septiembre" se
 * montaba encima de los números. Solo la versión compacta va en fila, porque
 * su fecha es chica y cabe.
 */
.cuenta {
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
  padding: clamp(1.4rem, 3.5vw, 2rem);
  border-radius: $radius-lg;
  background-color: $ink;
  color: $cream;
}

.cuenta__texto {
  min-width: 0;
}

.cuenta__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @include eyebrow;
  color: $rose-soft;

  svg {
    font-size: 0.85em;
  }
}

/* La fecha es el mensaje: se pinta con el tamaño de un titular. */
.cuenta__fecha {
  margin-top: 0.3rem;
  font-family: $font-display;
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  line-height: 1.05;
  color: $cream;
}

.cuenta__nota {
  max-width: 44ch;
  margin-top: 0.6rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: rgba($cream, 0.72);
}

/* ── Las cuatro cajas ── */
.cajas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  list-style: none;

  @include from('sm') {
    flex-wrap: nowrap;
  }
}

.caja {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* En móvil, dos por fila; en ancho, las cuatro seguidas. */
  flex: 1 1 calc(50% - 0.3rem);
  min-width: 0;
  padding: 0.9rem 0.6rem;
  border-radius: $radius-md;
  background-color: rgba($cream, 0.08);

  @include from('sm') {
    flex: 1 1 calc(25% - 0.45rem);
  }

  @include from('lg') {
    flex: 0 1 7rem;
    padding: 1.1rem 0.6rem;
  }
}

/* Tabular: sin esto el ancho baila a cada tic del segundero. */
.caja__valor {
  font-family: $font-display;
  font-size: clamp(2rem, 6vw, 2.8rem);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: $cream;
}

.caja__etiqueta {
  margin-top: 0.4rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $rose-soft;
}

/*
 * Compacta: una franja para la cabecera de "Mi reto". Va clara, no oscura:
 * ahí debajo ya hay un bloque oscuro (el avance) y dos seguidos se funden en
 * uno solo. El contraste es lo que hace que se lea como un aviso aparte.
 */
.cuenta--compacta {
  gap: 1rem;
  padding: clamp(1rem, 2.5vw, 1.3rem) clamp(1.1rem, 3vw, 1.6rem);
  background-color: $sand;
  color: $ink;

  @include from('lg') {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  .cuenta__texto {
    flex: 1 1 auto;
  }

  .cajas {
    flex: none;
  }

  .cuenta__eyebrow {
    color: $rose-deep;
  }

  .cuenta__fecha {
    font-size: $text-xl;
    color: $ink;
  }

  .cuenta__nota {
    margin-top: 0.3rem;
    font-size: $text-xs;
    color: $ink-soft;
  }

  .caja {
    padding: 0.6rem 0.4rem;
    background-color: $cream;

    @include from('lg') {
      flex: none;
      width: 4.4rem;
    }
  }

  .caja__valor {
    font-size: clamp(1.4rem, 4vw, 1.8rem);
    color: $ink;
  }

  .caja__etiqueta {
    color: $rose-deep;
  }

  .caja__etiqueta {
    margin-top: 0.25rem;
    font-size: 0.58rem;
  }
}
</style>
