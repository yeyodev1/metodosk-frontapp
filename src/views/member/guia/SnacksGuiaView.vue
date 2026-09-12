<script setup lang="ts">
import { computed } from 'vue'
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import GuiaFichas from '@/components/member/GuiaFichas.vue'
import { useGuia } from '@/composables/useGuia'

const { guia } = useGuia()

const fichas = computed(() =>
  (guia.value?.snacks ?? []).map((s) => ({
    titulo: s.titulo || `Opción ${s.numero}`,
    items: s.items,
  })),
)
</script>

<template>
  <GuiaSeccion
    v-if="guia"
    titulo="Ideas de snacks"
    sub="Son opcionales: los incluyes según tu día. No hace falta comerlos todos."
  >
    <GuiaFichas :fichas="fichas" numeradas />
  </GuiaSeccion>
</template>
