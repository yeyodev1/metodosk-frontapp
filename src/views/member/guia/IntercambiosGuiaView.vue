<script setup lang="ts">
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import GuiaTabla from '@/components/member/GuiaTabla.vue'
import { useGuia } from '@/composables/useGuia'

const { guia } = useGuia()
</script>

<template>
  <GuiaSeccion
    v-if="guia"
    titulo="Equivalencias y sustituciones"
    sub="Para variar sin salirte de tu objetivo: cambia dentro del mismo grupo y respeta la porción."
  >
    <div class="tablas">
      <GuiaTabla v-for="t in guia.tablas" :key="t.id" :tabla="t" />
    </div>
  </GuiaSeccion>
</template>

<style lang="scss" scoped>
.tablas {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}
</style>
