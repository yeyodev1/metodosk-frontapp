<script setup lang="ts">
/**
 * "Compraste un cupo, no un curso abierto."
 *
 * La franja de arriba lo dice en una línea; acá se explica. Es la respuesta a
 * la pregunta que llega por WhatsApp el día después de cada compra: pagué, y
 * adentro está casi todo bloqueado, ¿me falta algo?
 *
 * No le falta nada. Decirlo con claridad —y decir qué sí puede hacer hoy—
 * cuesta una tarjeta y ahorra la conversación entera.
 */
import { PREVENTA } from '@/config/preventa'
</script>

<template>
  <section class="expl">
    <p class="expl__eyebrow">{{ PREVENTA.explicacion.eyebrow }}</p>
    <h2 class="expl__title">{{ PREVENTA.explicacion.titulo }}</h2>
    <p class="expl__texto">{{ PREVENTA.explicacion.texto }}</p>

    <ul class="expl__puntos">
      <li v-for="p in PREVENTA.explicacion.puntos" :key="p.titulo" class="punto">
        <span class="punto__icono"><FaIcon :icon="p.icono" /></span>
        <div>
          <p class="punto__title">{{ p.titulo }}</p>
          <p class="punto__texto">{{ p.texto }}</p>
        </div>
      </li>
    </ul>

    <RouterLink to="/mi-progreso" class="expl__cta">
      Subir mis fotos de partida <FaIcon icon="arrow-right" />
    </RouterLink>
  </section>
</template>

<style lang="scss" scoped>
.expl {
  padding: clamp(1.2rem, 3.5vw, 1.8rem);
  border-radius: $radius-lg;
  background-color: $sand;
}

.expl__eyebrow {
  @include eyebrow;
}

.expl__title {
  margin-top: 0.15rem;
  font-family: $font-display;
  font-size: $text-xl;
  line-height: 1.15;
  color: $ink;
}

.expl__texto {
  max-width: 62ch;
  margin-top: 0.5rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

/* "Grilla" con flex-wrap: en este proyecto no se usa CSS Grid. */
.expl__puntos {
  @include flex-cards(200px, 0.9rem);
  margin-top: 1.1rem;
  list-style: none;
}

.punto {
  display: flex;
  gap: 0.6rem;
  padding: 0.85rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.punto__icono {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
  font-size: 0.75rem;
}

.punto__title {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.punto__texto {
  margin-top: 0.15rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;
}

.expl__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  border-radius: $radius-pill;
  background-color: $ink;
  font-size: $text-xs;
  font-weight: 600;
  color: $cream;
  transition: background-color 0.28s $ease;

  &:hover {
    background-color: $wine;
  }

  @include focus-ring;
}
</style>
