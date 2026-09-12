<script setup lang="ts">
/**
 * El menú de la semana, un día a la vez.
 *
 * Se muestra un solo día y no los siete seguidos porque lo que se busca al
 * abrir esto es qué toca hoy, no leer el mes entero. Los días de pierna van
 * marcados: el menú se repite y conviene verlo antes de cocinar.
 */
import { ref } from 'vue'
import type { DiaGuia } from '@/services/guiaService'

const props = defineProps<{ dias: DiaGuia[]; diasDePierna: number[] }>()

const activo = ref(props.dias[0]?.numero ?? 1)

const esDePierna = (n: number) => props.diasDePierna.includes(n)
const dia = (): DiaGuia => props.dias.find((d) => d.numero === activo.value) ?? props.dias[0]!
</script>

<template>
  <div class="menu">
    <div class="menu__dias" role="tablist" aria-label="Días del menú">
      <button
        v-for="d in dias"
        :key="d.numero"
        type="button"
        role="tab"
        class="dia"
        :class="{ 'dia--activo': d.numero === activo }"
        :aria-selected="d.numero === activo"
        @click="activo = d.numero"
      >
        <span class="dia__num">{{ d.numero }}</span>
        <span v-if="esDePierna(d.numero)" class="dia__pierna" title="Día de pierna">·</span>
      </button>
    </div>

    <p v-if="esDePierna(activo)" class="menu__nota">
      <FaIcon icon="dumbbell" /> Día de pierna: se repite este mismo menú.
    </p>

    <div class="comidas">
      <article v-for="c in dia().comidas" :key="c.tipo" class="comida">
        <p class="comida__tipo">{{ c.tipo }}</p>
        <p class="comida__texto">{{ c.texto }}</p>
      </article>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.menu__dias {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.dia {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid $sand;
  border-radius: 50%;
  background-color: $cream;
  font-family: $font-display;
  font-size: $text-base;
  color: $ink-soft;
  cursor: pointer;
  transition: background-color 0.2s $ease, color 0.2s $ease;

  &:hover {
    background-color: $sand;
  }

  @include focus-ring;
}

.dia--activo {
  border-color: $ink;
  background-color: $ink;
  color: $cream;
}

.dia__pierna {
  position: absolute;
  bottom: 5px;
  font-size: 1.1rem;
  line-height: 0;
  color: $rose;
}

.dia--activo .dia__pierna {
  color: $rose-soft;
}

.menu__nota {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: $text-xs;
  color: $ink-muted;

  svg {
    color: $rose-deep;
  }
}

.comidas {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.comida {
  padding: 1rem 1.1rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.comida__tipo {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $rose-deep;
}

.comida__texto {
  margin-top: 0.3rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink;
}
</style>
