<script setup lang="ts">
/**
 * Mes 1 · Mes 2: qué menú está mirando.
 *
 * Solo aparece cuando tiene más de uno abierto. Con uno solo, un selector de
 * una opción es ruido.
 */
import { useGuia } from '@/composables/useGuia'

const { menus, menu, mesElegido } = useGuia()
</script>

<template>
  <div v-if="menus.length > 1" class="meses" role="tablist" aria-label="Menú de qué mes">
    <button
      v-for="m in menus"
      :key="m.mes"
      type="button"
      role="tab"
      class="mes"
      :class="{ 'mes--activo': m.mes === menu?.mes }"
      :aria-selected="m.mes === menu?.mes"
      @click="mesElegido = m.mes"
    >
      Mes {{ m.mes }}
      <span v-if="m.mes === menus[menus.length - 1]!.mes" class="mes__nuevo">nuevo</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.meses {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.9rem;
}

.mes {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1rem;
  border: 1px solid $sand;
  border-radius: $radius-pill;
  background-color: transparent;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-soft;
  cursor: pointer;
  transition: background-color 0.2s $ease, color 0.2s $ease;

  @include focus-ring;
}

.mes--activo {
  border-color: $ink;
  background-color: $ink;
  color: $cream;
}

.mes__nuevo {
  padding: 0.05rem 0.45rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  font-size: 0.65rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: $ink;
}
</style>
