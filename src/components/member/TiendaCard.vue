<script setup lang="ts">
/**
 * La tienda de Scarlett, en tarjeta.
 *
 * Va donde la alumna ya está pensando en comprar algo —Recursos, junto a la
 * lista de implementos— y también en la bienvenida, que es donde llega el
 * primer día sin saber qué necesita.
 *
 * La comisión se dice en la propia tarjeta, no en una nota al pie: es la clase
 * de cosa que, si se descubre después, hace dudar de todo lo demás.
 */
import { TIENDA } from '@/config/tienda'

withDefaults(defineProps<{ compacta?: boolean }>(), { compacta: false })
</script>

<template>
  <section class="tienda" :class="{ 'tienda--compacta': compacta }">
    <header class="tienda__head">
      <span class="tienda__icono" aria-hidden="true">
        <FaIcon :icon="['fab', 'amazon']" />
      </span>
      <div class="tienda__texto">
        <p class="tienda__eyebrow">{{ TIENDA.eyebrow }}</p>
        <h2 class="tienda__title">{{ TIENDA.titulo }}</h2>
        <p class="tienda__intro">{{ TIENDA.intro }}</p>
      </div>
    </header>

    <ul v-if="!compacta" class="puntos">
      <li v-for="p in TIENDA.puntos" :key="p.titulo" class="punto">
        <span class="punto__icono" aria-hidden="true"><FaIcon :icon="p.icono" /></span>
        <span class="punto__titulo">{{ p.titulo }}</span>
        <span class="punto__texto">{{ p.texto }}</span>
      </li>
    </ul>

    <a class="tienda__cta" :href="TIENDA.url" target="_blank" rel="noopener">
      {{ TIENDA.cta }}
      <FaIcon icon="arrow-right" />
    </a>

    <p class="tienda__nota">{{ TIENDA.nota }}</p>
  </section>
</template>

<style lang="scss" scoped>
.tienda {
  margin-bottom: $space-md;
  padding: 1.5rem;
  border-radius: $radius-lg;
  background-color: $ink;
  color: $cream;
}

.tienda__head {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}

.tienda__icono {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $ink;
  font-size: 1rem;
}

.tienda__texto {
  min-width: 0;
}

.tienda__eyebrow {
  @include eyebrow;
  color: $rose;
}

.tienda__title {
  margin-top: 0.15rem;
  font-family: $font-display;
  font-size: 1.35rem;
  line-height: 1.2;
  color: $cream;
}

.tienda__intro {
  max-width: 52ch;
  margin-top: 0.4rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: rgba($cream, 0.72);
}

/* ── Qué se va a encontrar ── */
.puntos {
  /* Nada de CSS Grid en este proyecto: "grillas" con el mixin de flex. */
  @include flex-cards(200px, 0.9rem);
  margin-top: 1.3rem;
  list-style: none;
}

.punto {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem;
  border-radius: $radius-md;
  background-color: rgba($cream, 0.07);
}

.punto__icono {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 50%;
  background-color: rgba($rose-soft, 0.18);
  color: $rose-soft;
  font-size: 0.75rem;
}

.punto__titulo {
  font-size: $text-sm;
  font-weight: 600;
  color: $cream;
}

.punto__texto {
  font-size: $text-xs;
  line-height: 1.55;
  color: rgba($cream, 0.65);
}

.tienda__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.3rem;
  padding: 0.95rem 1.4rem;
  border-radius: $radius-pill;
  background-color: $rose-deep;
  font-size: $text-sm;
  font-weight: 600;
  color: $cream;
  transition: background-color 0.26s $ease;

  &:hover {
    background-color: $rose;
  }

  @include focus-ring($rose-soft);
}

.tienda--compacta .tienda__cta {
  margin-top: 1.1rem;
}

.tienda__nota {
  margin-top: 0.85rem;
  font-size: $text-xs;
  line-height: 1.6;
  text-align: center;
  color: rgba($cream, 0.5);
}
</style>
