<script setup lang="ts">
/**
 * Mi progreso — fotos, medidas y el antes y después, en un solo sitio.
 *
 * Antes esto no existía: las fotos se pedían una vez, dentro del recorrido de
 * bienvenida, y después no había dónde volver a subirlas ni dónde verlas. Se
 * guardaba un histórico que nadie podía mirar.
 *
 * El orden de la pantalla es el de las preguntas que trae quien entra: cuándo
 * me toca, dónde subo la de hoy, qué cambió, y qué dicen los números.
 */
import { onMounted, ref } from 'vue'
import onboardingService, { type EstadoOnboarding } from '@/services/onboardingService'
import { useSessionStore } from '@/stores/session'
import NextShot from '@/components/progress/NextShot.vue'
import PhotoUploader from '@/components/progress/PhotoUploader.vue'
import BeforeAfter from '@/components/progress/BeforeAfter.vue'
import Measurements from '@/components/progress/Measurements.vue'
import '@/plugins/icons'

const session = useSessionStore()
const estado = ref<EstadoOnboarding | null>(null)
const cargando = ref(true)
const error = ref('')

const nombre = session.user?.name?.split(' ')[0] || ''

function actualizar(nuevo: EstadoOnboarding) {
  estado.value = nuevo
}

onMounted(async () => {
  try {
    estado.value = await onboardingService.estado()
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos cargar tu progreso'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="prog">
    <header class="hero">
      <p class="hero__eyebrow"><FaIcon icon="chart-line" /> Tu seguimiento</p>
      <h1 class="hero__title">
        Mi progreso<span v-if="nombre">, {{ nombre }}</span>
      </h1>
      <p class="hero__sub">
        Una foto y tus medidas cada mes. Es lo único que de verdad te va a mostrar lo que cambió —
        mucho más que la balanza sola, y mucho más que la memoria.
      </p>
    </header>

    <p v-if="cargando" class="aviso"><FaIcon icon="spinner" spin /> Cargando tu progreso…</p>

    <p v-else-if="error" class="aviso aviso--error">
      <FaIcon icon="triangle-exclamation" /> {{ error }}
    </p>

    <div v-else-if="estado" class="cuerpo">
      <NextShot :estado="estado" />
      <PhotoUploader :estado="estado" @actualizado="actualizar" />
      <BeforeAfter :comparativa="estado.comparativa" />
      <Measurements :estado="estado" @actualizado="actualizar" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.prog {
  padding: 4.2rem clamp(1rem, 3vw, 2.5rem) 4rem;

  @include from('lg') {
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
  }
}

.hero {
  max-width: 70ch;
  margin-bottom: $space-md;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @include eyebrow;

  svg {
    font-size: 0.8em;
  }
}

.hero__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.hero__sub {
  margin-top: 0.5rem;
  font-size: $text-base;
  line-height: 1.6;
  color: $ink-soft;
}

.cuerpo {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  max-width: 900px;
}

.aviso {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: $space-md;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  color: $ink-soft;
}

.aviso--error {
  color: $alert-error;
}
</style>
