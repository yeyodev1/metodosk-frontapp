<script setup lang="ts">
import { computed } from 'vue'
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import GuiaFichas from '@/components/member/GuiaFichas.vue'
import { useGuia } from '@/composables/useGuia'

const { guia } = useGuia()

const fichas = computed(() =>
  (guia.value?.condimentos ?? []).map((c) => ({
    titulo: c.proteina,
    items: c.items,
    pie: c.tip,
  })),
)
</script>

<template>
  <GuiaSeccion
    v-if="guia"
    titulo="Condimentos por proteína"
    sub="La misma proteína sabe distinta cada día según cómo la condimentes."
  >
    <ul class="tips">
      <li v-for="t in guia.tipsCondimentos" :key="t">{{ t }}</li>
    </ul>
    <GuiaFichas :fichas="fichas" />
  </GuiaSeccion>
</template>

<style lang="scss" scoped>
.tips {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  list-style: none;

  li {
    padding-left: 0.9rem;
    border-left: 2px solid $clay;
    font-size: $text-xs;
    line-height: 1.55;
    color: $ink-soft;
  }
}
</style>
