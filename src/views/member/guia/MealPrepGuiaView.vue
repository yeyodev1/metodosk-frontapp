<script setup lang="ts">
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import GuiaFichas from '@/components/member/GuiaFichas.vue'
import { useGuia } from '@/composables/useGuia'

const { guia } = useGuia()
</script>

<template>
  <GuiaSeccion
    v-if="guia"
    titulo="Meal prep"
    sub="No se trata de cocinar perfecto, sino de que comer según tu plan sea fácil el martes a las nueve de la noche."
  >
    <GuiaFichas :fichas="guia.mealPrep" />
  </GuiaSeccion>
</template>
