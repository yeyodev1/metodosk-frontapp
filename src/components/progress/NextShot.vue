<script setup lang="ts">
/**
 * "En cuánto tiempo" — lo primero que se pregunta al entrar acá.
 *
 * La cuenta la hace el servidor, no esta pantalla: si la hiciera el navegador,
 * el reloj del teléfono decidiría cuándo toca la siguiente foto.
 */
import { computed } from 'vue'
import type { EstadoOnboarding } from '@/services/onboardingService'

const props = defineProps<{ estado: EstadoOnboarding }>()

const dias = computed(() => props.estado.diasParaProxima)

/** Sin ninguna foto todavía no hay cuenta que hacer: hoy es el día uno. */
const arrancando = computed(() => dias.value === null)

const toca = computed(() => props.estado.tomaPendiente || dias.value === 0)

const titulo = computed(() => {
  if (arrancando.value) return 'Hoy es tu punto de partida'
  if (toca.value) return 'Hoy te toca tu foto del mes'
  return dias.value === 1 ? 'Tu próxima foto es mañana' : `Faltan ${dias.value} días`
})

const texto = computed(() => {
  if (arrancando.value) {
    return 'Sube tus primeras fotos y tus medidas. Es contra esto que vas a comparar dentro de tres meses.'
  }
  if (toca.value) {
    return 'Pasó el mes. Misma ropa, mismo lugar, misma luz — eso es lo que hace que las dos fotos se puedan comparar.'
  }
  return `Se repiten cada ${props.estado.diasEntreTomas} días. Igual puedes subir una hoy si quieres.`
})

/** La barra: cuánto del mes va corrido. */
const avance = computed(() => {
  if (arrancando.value) return 0
  if (toca.value) return 100
  const total = props.estado.diasEntreTomas
  return Math.round(((total - (dias.value ?? 0)) / total) * 100)
})

const fecha = computed(() => {
  if (!props.estado.proximaToma) return null
  return new Date(props.estado.proximaToma).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
  })
})
</script>

<template>
  <section class="toma" :class="{ 'toma--toca': toca || arrancando }">
    <span class="toma__icono">
      <FaIcon :icon="toca || arrancando ? 'camera' : 'clock'" />
    </span>

    <div class="toma__texto">
      <p class="toma__title">{{ titulo }}</p>
      <p class="toma__sub">{{ texto }}</p>
    </div>

    <div v-if="!arrancando" class="toma__barra" role="presentation">
      <span class="toma__relleno" :style="{ width: `${avance}%` }" />
      <span v-if="fecha" class="toma__fecha">Toca el {{ fecha }}</span>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.toma {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.9rem;
  padding: clamp(1.1rem, 3vw, 1.5rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.toma--toca {
  background-color: $ink;

  .toma__title {
    color: $cream;
  }

  .toma__sub {
    color: rgba($cream, 0.68);
  }

  .toma__icono {
    background-color: $rose-soft;
    color: $ink;
  }

  .toma__fecha {
    color: rgba($cream, 0.6);
  }

  .toma__barra {
    background-color: rgba($cream, 0.16);
  }
}

.toma__icono {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
}

.toma__texto {
  flex: 1 1 240px;
  min-width: 0;
}

.toma__title {
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.toma__sub {
  margin-top: 0.2rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.toma__barra {
  position: relative;
  flex: 1 1 100%;
  height: 6px;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.09);
}

.toma__relleno {
  display: block;
  height: 100%;
  border-radius: $radius-pill;
  background-color: $rose;
  transition: width 0.6s $ease;
}

.toma__fecha {
  position: absolute;
  top: 0.6rem;
  right: 0;
  font-size: $text-xs;
  color: $ink-muted;
}
</style>
