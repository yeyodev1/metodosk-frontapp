<script setup lang="ts">
/**
 * Lista de entradas: snacks, condimentos, meal prep.
 *
 * Va en una columna con filetes entre entradas, no en tarjetas. Con cajas, un
 * snack de dos líneas junto a una receta de ocho dejaba huecos blancos enormes
 * debajo de la corta: el problema no era el color del hueco, era meter en
 * cajas de la misma fila textos de alturas muy distintas. En lista no hay
 * hueco posible y se lee de corrido.
 *
 * El nombre manda cuando la entrada tiene uno propio; cuando no —los snacks
 * sin receta— el número queda de etiqueta y el contenido ocupa su lugar.
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
  <ul class="lista">
    <li v-for="(f, i) in fichas" :key="f.titulo + i" class="entrada">
      <p class="entrada__marca">
        <span v-if="numeradas" class="entrada__num">{{ String(i + 1).padStart(2, '0') }}</span>
        <span v-else-if="generico" class="entrada__generico">{{ generico }} {{ i + 1 }}</span>
      </p>

      <div class="entrada__cuerpo">
        <h3 v-if="tieneNombre(f.titulo)" class="entrada__nombre">{{ f.titulo }}</h3>

        <ul class="entrada__items">
          <li v-for="item in f.items" :key="item">{{ item }}</li>
        </ul>

        <p v-if="f.pie" class="entrada__pie">{{ f.pie }}</p>
      </div>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.lista {
  list-style: none;
}

/* Marca a la izquierda, contenido a la derecha; en el teléfono se apila. */
.entrada {
  display: flex;
  gap: 1rem;
  padding: 1.1rem 0;

  & + & {
    border-top: 1px solid $sand;
  }

  @include until('md') {
    flex-direction: column;
    gap: 0.35rem;
  }
}

.entrada__marca {
  flex: none;
  width: 5.5rem;
  padding-top: 0.1rem;

  @include until('md') {
    width: auto;
    padding-top: 0;
  }
}

.entrada__num {
  font-family: $font-display;
  font-size: 1.5rem;
  line-height: 1;
  color: $clay;
}

.entrada__generico {
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $ink-muted;
}

.entrada__cuerpo {
  min-width: 0;
  max-width: 62ch;
}

.entrada__nombre {
  margin-bottom: 0.35rem;
  font-family: $font-display;
  font-size: $text-base;
  line-height: 1.25;
  color: $ink;
  text-wrap: balance;
}

.entrada__items {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  list-style: none;

  li {
    position: relative;
    padding-left: 0.9rem;
    font-size: $text-sm;
    line-height: 1.55;
    color: $ink-soft;

    /* Un guion, no una viñeta: son ingredientes, no pasos numerados. */
    &::before {
      content: '';
      position: absolute;
      top: 0.7em;
      left: 0;
      width: 6px;
      height: 1px;
      background-color: $clay;
    }
  }
}

/* Una sola línea no necesita marca de lista. */
.entrada__items li:only-child {
  padding-left: 0;

  &::before {
    display: none;
  }
}

.entrada__pie {
  margin-top: 0.5rem;
  padding-left: 0.75rem;
  border-left: 2px solid $sage;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-muted;
}
</style>
