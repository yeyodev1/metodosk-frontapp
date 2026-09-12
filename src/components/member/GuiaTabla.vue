<script setup lang="ts">
/**
 * Una tabla de equivalencias.
 *
 * Las cantidades van con cifras de ancho fijo para que las columnas se lean
 * de arriba abajo, y la tabla scrollea sola en horizontal: en un teléfono, tres
 * columnas con medidas caseras no entran sin romper la página.
 */
import type { TablaGuia } from '@/services/guiaService'

defineProps<{ tabla: TablaGuia }>()
</script>

<template>
  <section class="tabla">
    <h3 class="tabla__title">{{ tabla.titulo }}</h3>
    <p v-if="tabla.intro" class="tabla__intro">{{ tabla.intro }}</p>

    <div class="tabla__scroll">
      <table>
        <thead>
          <tr>
            <th v-for="c in tabla.columnas" :key="c">{{ c }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(fila, i) in tabla.filas" :key="i">
            <td v-for="(celda, j) in fila" :key="j">{{ celda }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-for="n in tabla.notas" :key="n" class="tabla__nota">{{ n }}</p>
  </section>
</template>

<style lang="scss" scoped>
.tabla {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tabla__title {
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.tabla__intro {
  font-size: $text-xs;
  color: $ink-soft;
}

.tabla__scroll {
  overflow-x: auto;
  border-radius: $radius-md;
  background-color: $cream;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: $text-xs;
  font-variant-numeric: tabular-nums;
}

th {
  padding: 0.7rem 0.9rem;
  background-color: $sand;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $ink-muted;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 0.6rem 0.9rem;
  border-top: 1px solid $bone;
  color: $ink;
}

td:first-child {
  font-weight: 500;
}

td:not(:first-child) {
  color: $ink-soft;
  white-space: nowrap;
}

.tabla__nota {
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-muted;
}
</style>
