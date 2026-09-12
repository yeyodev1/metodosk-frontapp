<script setup lang="ts">
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import { useGuia } from '@/composables/useGuia'

const { guia } = useGuia()
</script>

<template>
  <GuiaSeccion
    v-if="guia"
    titulo="Suplementación"
    sub="Se individualiza según tu alimentación, tus antecedentes y, cuando corresponda, exámenes y valoración profesional."
  >
    <article v-for="s in guia.suplementos" :key="s.nombre" class="supl">
      <h2 class="supl__nombre">{{ s.nombre }}</h2>

      <p class="supl__label">¿Para quién puede ser útil?</p>
      <ul class="supl__lista">
        <li v-for="q in s.paraQuien" :key="q">{{ q }}</li>
      </ul>

      <p class="supl__label">¿Cuándo tomarlo?</p>
      <p class="supl__texto">{{ s.cuando }}</p>

      <p class="supl__precaucion">
        <FaIcon icon="circle-exclamation" />
        {{ s.precaucion }}
      </p>
    </article>
  </GuiaSeccion>
</template>

<style lang="scss" scoped>
.supl {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.1rem 1.2rem;
  border-radius: $radius-md;
  background-color: $cream;

  & + & {
    margin-top: 0.6rem;
  }
}

.supl__nombre {
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.supl__label {
  margin-top: 0.5rem;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $ink-muted;
}

.supl__lista {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  list-style: none;

  li {
    font-size: $text-xs;
    line-height: 1.5;
    color: $ink-soft;
  }
}

.supl__texto {
  font-size: $text-xs;
  line-height: 1.55;
  color: $ink-soft;
}

.supl__precaucion {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px solid $bone;
  font-size: $text-xs;
  line-height: 1.5;
  color: $wine;

  svg {
    flex: none;
    margin-top: 0.2em;
  }
}
</style>
