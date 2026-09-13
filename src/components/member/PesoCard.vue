<script setup lang="ts">
/**
 * Qué peso usar.
 *
 * Los tres niveles se leen en paralelo —la alumna se ubica en uno y compara
 * con el de al lado— así que van en columnas de igual peso visual, no en una
 * lista donde el primero parece el importante.
 *
 * El "recuerda" va aparte y en oscuro: es lo que de verdad responde la
 * pregunta, porque no hay un número exacto y la respuesta real es aprender a
 * leer las últimas repeticiones.
 */
import CldImage from '@/components/ui/CldImage.vue'
import { NIVELES_DE_PESO, RECUERDA_PESO } from '@/config/peso'
import { PHOTO } from '@/config/photos'
</script>

<template>
  <section class="peso">
    <div class="peso__head">
      <span class="peso__icono"><FaIcon icon="dumbbell" /></span>
      <div>
        <h2 class="peso__title">¿Qué peso debo utilizar?</h2>
        <p class="peso__intro">
          La misma rutina se hace con pesos distintos según dónde estés. Ubícate en tu nivel.
        </p>
      </div>
    </div>

    <div class="niveles">
      <article v-for="n in NIVELES_DE_PESO" :key="n.nivel" class="nivel">
        <h3 class="nivel__nombre">{{ n.nivel }}</h3>
        <p class="nivel__texto">{{ n.texto }}</p>
      </article>
    </div>

    <div class="recuerda">
      <div class="recuerda__foto">
        <CldImage
          :public-id="PHOTO.training.id"
          :alt="PHOTO.training.alt"
          ratio="4:3"
          sizes="(min-width: 900px) 260px, 100vw"
        />
      </div>
      <div class="recuerda__texto">
        <p class="recuerda__title">Recuerda</p>
        <p v-for="linea in RECUERDA_PESO" :key="linea">{{ linea }}</p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.peso {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  margin-bottom: $space-md;
}

.peso__head {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}

.peso__icono {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
  font-size: 0.9rem;
}

.peso__title {
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;
}

.peso__intro {
  max-width: 60ch;
  margin-top: 0.15rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.niveles {
  @include flex-cards(220px, 0.7rem);
}

.nivel {
  padding: 1.1rem 1.2rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.nivel__nombre {
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.nivel__texto {
  margin-top: 0.4rem;
  font-size: $text-xs;
  line-height: 1.6;
  color: $ink-soft;
}

/* Lo que de verdad contesta la pregunta: va en oscuro, no se salta. */
.recuerda {
  display: flex;
  overflow: hidden;
  border-radius: $radius-lg;
  background-color: $ink;

  @include until('md') {
    flex-direction: column;
  }
}

.recuerda__foto {
  flex: 0 0 34%;
  max-width: 34%;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @include until('md') {
    flex: none;
    max-width: 100%;
    max-height: 180px;
  }
}

.recuerda__texto {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
  padding: clamp(1.1rem, 3vw, 1.5rem);

  p {
    font-size: $text-xs;
    line-height: 1.6;
    color: rgba($cream, 0.78);
  }
}

.recuerda__title {
  font-family: $font-display;
  font-size: $text-base;
  color: $cream !important;
}
</style>
