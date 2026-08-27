<script setup lang="ts">
/**
 * El video de bienvenida, cuando ya no es obligatorio.
 *
 * Lo vio una vez al comprar; acá vive para volver a verlo. Sin autoplay: si
 * entró a este apartado ya sabe qué hay, y un video que arranca solo cuando no
 * lo pediste es una molestia, no un servicio.
 */
import { onMounted, ref } from 'vue'
import VslPlayer from '@/components/ui/VslPlayer.vue'
import settingsService, { type Vsl } from '@/services/settingsService'

const vsl = ref<Vsl | null>(null)
const cargando = ref(true)

onMounted(async () => {
  try {
    vsl.value = await settingsService.vsl()
  } catch {
    // Sin video la pantalla lo dice; no hay nada que reintentar.
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="bienvenida">
    <header class="bienvenida__head">
      <p class="bienvenida__eyebrow">Método SK</p>
      <h1 class="bienvenida__title">Empieza aquí</h1>
      <p class="bienvenida__sub">
        El video con el que arranca tu reto. Vuelve cuando quieras.
      </p>
    </header>

    <div v-if="vsl" class="bienvenida__video">
      <VslPlayer
        :embed-url="vsl.embedUrl"
        :duration-seconds="vsl.durationSeconds"
        :autoplay="false"
      />
    </div>

    <p v-else-if="cargando" class="aviso">Cargando…</p>
    <p v-else class="aviso">Todavía no hay video de bienvenida cargado.</p>
  </div>
</template>

<style lang="scss" scoped>
.bienvenida {
  padding: 4.2rem clamp(1rem, 3vw, 2.5rem) 4rem;

  @include from('lg') {
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
  }
}

.bienvenida__head {
  margin-bottom: $space-md;
}

.bienvenida__eyebrow {
  @include eyebrow;
}

.bienvenida__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.bienvenida__sub {
  margin-top: 0.3rem;
  font-size: $text-sm;
  color: $ink-soft;
}

.bienvenida__video {
  max-width: 900px;
}

.aviso {
  padding: $space-md;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  color: $ink-soft;
}
</style>
