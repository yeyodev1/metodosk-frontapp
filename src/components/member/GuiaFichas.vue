<script setup lang="ts">
/**
 * Lista de fichas: snacks, condimentos, meal prep.
 *
 * Todas tienen la misma forma —un encabezado y una lista corta— así que
 * comparten componente, pero no se ven iguales: el número manda cuando la
 * ficha no tiene nombre propio (los snacks sin receta) y el nombre manda
 * cuando sí lo tiene. Antes todas decían "Opción 3" en grande, que no es un
 * título: es un número disfrazado.
 *
 * Cada renglón es un ingrediente o un paso, con su marca al costado, para que
 * se lea como lista y no como un párrafo apretado.
 */
defineProps<{
  fichas: Array<{ titulo: string; items: string[]; pie?: string | null }>
  /** Muestra el orden. Solo donde el orden significa algo. */
  numeradas?: boolean
  /** El nombre de las que no traen uno propio: "Snack", "Paso"… */
  generico?: string
}>()

/** "Opción 5" no es un nombre: es el número otra vez. */
const tieneNombre = (titulo: string) => !/^opci[óo]n\s*\d+$/i.test(titulo.trim())
</script>

<template>
  <div class="fichas">
    <article
      v-for="(f, i) in fichas"
      :key="f.titulo + i"
      class="ficha"
      :class="{ 'ficha--con-nombre': tieneNombre(f.titulo) }"
    >
      <header class="ficha__head">
        <span v-if="numeradas" class="ficha__num">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="ficha__titulos">
          <span v-if="!tieneNombre(f.titulo) && generico" class="ficha__generico">
            {{ generico }} {{ i + 1 }}
          </span>
          <h3 v-if="tieneNombre(f.titulo)" class="ficha__nombre">{{ f.titulo }}</h3>
        </span>
      </header>

      <ul class="ficha__items">
        <li v-for="item in f.items" :key="item">{{ item }}</li>
      </ul>

      <p v-if="f.pie" class="ficha__pie">{{ f.pie }}</p>
    </article>
  </div>
</template>

<style lang="scss" scoped>
.fichas {
  @include flex-cards(260px, 0.7rem);

  > * {
    align-self: flex-start;
  }
}

.ficha {
  padding: 1.1rem 1.2rem;
  border-radius: $radius-md;
  background-color: $cream;
}

/* La que tiene receta propia se distingue del resto con un filo de color. */
.ficha--con-nombre {
  border-left: 3px solid $rose;
}

.ficha__head {
  display: flex;
  align-items: baseline;
  gap: 0.65rem;
}

.ficha__num {
  flex: none;
  font-family: $font-display;
  font-size: 1.35rem;
  line-height: 1;
  color: $clay;
}

.ficha__titulos {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ficha__generico {
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $ink-muted;
}

.ficha__nombre {
  font-family: $font-display;
  font-size: $text-base;
  line-height: 1.2;
  color: $ink;
  text-wrap: balance;
}

.ficha__items {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.6rem;
  list-style: none;

  li {
    position: relative;
    padding-left: 0.85rem;
    font-size: $text-xs;
    line-height: 1.5;
    color: $ink-soft;

    /* Un guion en lugar de viñeta: la lista es de ingredientes, no de pasos. */
    &::before {
      content: '';
      position: absolute;
      top: 0.65em;
      left: 0;
      width: 5px;
      height: 1px;
      background-color: $clay;
    }
  }
}

.ficha__pie {
  margin-top: 0.7rem;
  padding-left: 0.75rem;
  border-left: 2px solid $sage;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-muted;
}
</style>
