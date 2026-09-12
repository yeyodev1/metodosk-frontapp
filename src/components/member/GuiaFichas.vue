<script setup lang="ts">
/**
 * Lista de fichas: snacks, condimentos, meal prep.
 *
 * Todas tienen la misma forma —un título y una lista corta— así que comparten
 * componente. Se acomodan en columnas según el ancho, sin estirarse: una ficha
 * de dos líneas al lado de una de ocho se ve rota si se igualan las alturas.
 */
defineProps<{
  fichas: Array<{ titulo: string; items: string[]; pie?: string | null }>
  numeradas?: boolean
}>()
</script>

<template>
  <div class="fichas">
    <article v-for="(f, i) in fichas" :key="f.titulo + i" class="ficha">
      <p class="ficha__title">
        <span v-if="numeradas" class="ficha__num">{{ i + 1 }}</span>
        {{ f.titulo }}
      </p>
      <ul class="ficha__items">
        <li v-for="item in f.items" :key="item">{{ item }}</li>
      </ul>
      <p v-if="f.pie" class="ficha__pie">{{ f.pie }}</p>
    </article>
  </div>
</template>

<style lang="scss" scoped>
.fichas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.ficha {
  flex: 1 1 240px;
  align-self: flex-start;
  padding: 1rem 1.1rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.ficha__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.ficha__num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: $rose-soft;
  font-family: $font-principal;
  font-size: 0.7rem;
  font-weight: 600;
  color: $wine;
}

.ficha__items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
  list-style: none;

  li {
    font-size: $text-xs;
    line-height: 1.55;
    color: $ink-soft;
  }
}

.ficha__pie {
  margin-top: 0.6rem;
  padding-left: 0.7rem;
  border-left: 2px solid $rose;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-muted;
}
</style>
