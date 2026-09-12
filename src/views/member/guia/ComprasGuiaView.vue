<script setup lang="ts">
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import { useGuia } from '@/composables/useGuia'

const { guia } = useGuia()
</script>

<template>
  <GuiaSeccion v-if="guia" titulo="Lista de compras" :sub="guia.listaCompras.nota">
    <ul class="chips">
      <li v-for="c in guia.listaCompras.categorias" :key="c">{{ c }}</li>
    </ul>
    <p class="ayuda">{{ guia.listaCompras.ayuda }}</p>
  </GuiaSeccion>
</template>

<style lang="scss" scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  list-style: none;

  li {
    padding: 0.5rem 0.95rem;
    border-radius: $radius-pill;
    background-color: $cream;
    font-size: $text-xs;
    color: $ink;
  }
}

.ayuda {
  padding-left: 0.9rem;
  border-left: 2px solid $rose;
  font-size: $text-xs;
  line-height: 1.55;
  color: $ink-muted;
}
</style>
