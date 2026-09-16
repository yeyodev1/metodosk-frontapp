<script setup lang="ts">
/**
 * La tienda de Scarlett, en la landing.
 *
 * Va abierta a todas —no hace falta haber comprado el reto para entrar— porque
 * es justo la pregunta que llega por Instagram de quien todavía no compró:
 * "¿qué banda usas?", "¿de dónde es esa botella?".
 *
 * Se coloca después de la nutrición y antes de la línea de tiempo: ahí ya se
 * vio qué implementos hacen falta, así que la tienda contesta una pregunta que
 * la lectora se acaba de hacer, en lugar de interrumpir la venta.
 */
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { TIENDA } from '@/config/tienda'
</script>

<template>
  <section id="tienda" class="tienda">
    <div class="tienda__inner">
      <SectionHeading :eyebrow="TIENDA.eyebrow" :title="TIENDA.titulo" align="center" tone="light">
        {{ TIENDA.intro }}
      </SectionHeading>

      <ul class="puntos">
        <li
          v-for="(p, index) in TIENDA.puntos"
          :key="p.titulo"
          v-reveal="index * 90"
          class="punto"
        >
          <span class="punto__icono" aria-hidden="true"><FaIcon :icon="p.icono" /></span>
          <h3 class="punto__titulo">{{ p.titulo }}</h3>
          <p class="punto__texto">{{ p.texto }}</p>
        </li>
      </ul>

      <div class="tienda__pie" v-reveal>
        <a class="tienda__cta" :href="TIENDA.url" target="_blank" rel="noopener">
          <FaIcon :icon="['fab', 'amazon']" />
          {{ TIENDA.cta }}
        </a>
        <p class="tienda__nota">{{ TIENDA.nota }}</p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.tienda {
  padding-block: $space-section;
  background-color: $ink;
  color: $cream;
}

.tienda__inner {
  @include container;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-lg;
}

.puntos {
  @include flex-cards(240px, 1.2rem);
  width: 100%;
  list-style: none;
}

.punto {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.6rem;
  border-radius: $radius-md;
  background-color: rgba($cream, 0.06);
}

.punto__icono {
  display: grid;
  place-items: center;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 50%;
  background-color: rgba($rose-soft, 0.16);
  color: $rose-soft;
  font-size: 0.85rem;
}

.punto__titulo {
  font-family: $font-display;
  font-size: $text-lg;
  color: $cream;
}

.punto__texto {
  font-size: $text-sm;
  line-height: 1.6;
  color: rgba($cream, 0.68);
}

.tienda__pie {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}

.tienda__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 2.2rem;
  border-radius: $radius-pill;
  background-color: $rose-deep;
  font-size: $text-sm;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: $cream;
  transition: background-color 0.28s $ease, transform 0.28s $ease;

  &:hover {
    background-color: $rose;
    transform: translateY(-2px);
  }

  @include focus-ring($rose-soft);
}

.tienda__nota {
  max-width: 48ch;
  font-size: $text-xs;
  line-height: 1.6;
  text-align: center;
  color: rgba($cream, 0.5);
}

@include reduced-motion {
  .tienda__cta:hover {
    transform: none;
  }
}
</style>
