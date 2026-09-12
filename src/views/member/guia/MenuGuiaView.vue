<script setup lang="ts">
/**
 * El menú de la semana: un día a la vez, con la foto de su plato.
 *
 * Es la pantalla a la que se entra, así que abre en el día 1 y no pide elegir
 * nada. Las instrucciones van al final: se leen una vez y después estorban.
 */
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import GuiaMenu from '@/components/member/GuiaMenu.vue'
import { useGuia } from '@/composables/useGuia'

const { guia } = useGuia()
</script>

<template>
  <GuiaSeccion
    v-if="guia"
    titulo="Tu menú de la semana"
    sub="Siete días, y se repiten durante el mes. Los de pierna van marcados."
  >
    <GuiaMenu :dias="guia.dias" :dias-de-pierna="guia.diasDePierna" />

    <section class="comousar">
      <h2 class="comousar__title">Cómo usar tu menú</h2>
      <ul class="comousar__lista">
        <li v-for="r in guia.comoUsar" :key="r">{{ r }}</li>
      </ul>
    </section>
  </GuiaSeccion>
</template>

<style lang="scss" scoped>
.comousar {
  margin-top: $space-md;
  padding-top: $space-sm;
  border-top: 1px solid $sand;
}

.comousar__title {
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.comousar__lista {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.6rem;
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
