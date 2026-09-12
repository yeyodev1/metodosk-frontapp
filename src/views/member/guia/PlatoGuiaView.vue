<script setup lang="ts">
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import { useGuia } from '@/composables/useGuia'

const { guia } = useGuia()
</script>

<template>
  <GuiaSeccion
    v-if="guia"
    titulo="Arma tu plato"
    :sub="guia.armaTuPlato.intro"
  >
    <ol class="pasos">
      <li v-for="(p, i) in guia.armaTuPlato.pasos" :key="p.titulo">
        <span class="pasos__num">{{ i + 1 }}</span>
        <span class="pasos__cuerpo">
          <strong>{{ p.titulo }}</strong>
          <span class="pasos__texto">{{ p.texto }}</span>
          <span class="pasos__porcion">{{ p.porcion }}</span>
        </span>
      </li>
    </ol>

    <div class="ejemplo">
      <p class="ejemplo__title">Un ejemplo</p>
      <p v-for="e in guia.armaTuPlato.ejemplo" :key="e">{{ e }}</p>
    </div>
  </GuiaSeccion>
</template>

<style lang="scss" scoped>
.pasos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;

  li {
    display: flex;
    gap: 0.8rem;
    padding: 0.9rem 1.1rem;
    border-radius: $radius-md;
    background-color: $cream;
  }
}

.pasos__num {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: $ink;
  font-size: 0.72rem;
  font-weight: 600;
  color: $cream;
}

.pasos__cuerpo {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  strong {
    font-size: $text-sm;
    color: $ink;
  }
}

.pasos__texto {
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;
}

.pasos__porcion {
  margin-top: 0.2rem;
  font-size: $text-xs;
  font-weight: 600;
  color: $rose-deep;
}

.ejemplo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.4rem;
  padding: 1rem 1.1rem;
  border-radius: $radius-md;
  background-color: $sand;

  p {
    font-size: $text-xs;
    line-height: 1.55;
    color: $ink-soft;
  }
}

.ejemplo__title {
  font-family: $font-display;
  font-size: $text-sm;
  color: $ink !important;
}
</style>
