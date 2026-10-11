<script setup lang="ts">
/**
 * Lo que va debajo del video: título, en qué clase va, marcar como vista,
 * la siguiente y el texto del curso.
 */
import { RouterLink } from 'vue-router'
import type { CursoAlumna } from '@/services/courseService'
import type { ItemClase } from '@/components/member/ClaseLista.vue'
import { duracion } from '@/composables/useCursos'

defineProps<{
  curso: CursoAlumna
  actual: ItemClase
  posicion: number
  total: number
  siguiente: ItemClase | null
  terminado: boolean
  marcando: boolean
}>()

const emit = defineEmits<{ marcar: [] }>()
</script>

<template>
  <div class="info">
    <h1 class="titulo">{{ actual.title }}</h1>

    <div class="barra">
      <p class="barra__meta">
        {{ curso.title }} · Clase {{ posicion }} de {{ total }}
        <template v-if="duracion(actual.durationSeconds)">
          · {{ duracion(actual.durationSeconds) }}
        </template>
      </p>

      <div class="barra__acciones">
        <button
          type="button"
          class="boton"
          :class="{ 'boton--hecho': actual.completed }"
          :disabled="marcando || actual.completed"
          @click="emit('marcar')"
        >
          <template v-if="actual.completed"><FaIcon icon="check" /> Vista</template>
          <template v-else-if="marcando">Marcando…</template>
          <template v-else>Marcar como vista</template>
        </button>
        <RouterLink
          v-if="siguiente"
          :to="`/academia/${curso.slug}/${siguiente.ruta}`"
          class="boton boton--oscuro"
        >
          Siguiente <FaIcon icon="arrow-right" />
        </RouterLink>
      </div>
    </div>

    <!-- Terminó el video: lo que sigue, sin tener que buscarlo. -->
    <RouterLink
      v-if="terminado && siguiente"
      :to="`/academia/${curso.slug}/${siguiente.ruta}`"
      class="fin"
    >
      <span>
        <small>¡Terminaste esta clase! Sigue con</small>
        {{ siguiente.title }}
      </span>
      <FaIcon icon="circle-play" />
    </RouterLink>

    <section v-if="actual.summary || curso.notas?.length || curso.slug === 'nutricion'" class="detalle">
      <p v-if="actual.summary" class="detalle__resumen">{{ actual.summary }}</p>

      <!-- El video de Karen cuenta cómo comer; la guía es el cómo. -->
      <RouterLink v-if="curso.slug === 'nutricion'" to="/guia" class="detalle__guia">
        <FaIcon icon="book-open" /> Abrir tu guía de nutrición <FaIcon icon="arrow-right" />
      </RouterLink>

      <div v-for="n in curso.notas || []" :key="n.titulo" class="nota">
        <h2 class="nota__title">{{ n.titulo }}</h2>
        <p v-for="linea in n.cuerpo" :key="linea">{{ linea }}</p>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.info {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.titulo {
  font-family: $font-display;
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  line-height: 1.1;
  color: $ink;
}

.barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
}

.barra__meta {
  font-size: $text-sm;
  color: $ink-muted;
}

.barra__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.boton {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1.1rem;
  border: 1px solid $sand;
  border-radius: $radius-pill;
  background-color: $white;
  font-family: inherit;
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.2s $ease;

  &:hover:not(:disabled) {
    background-color: $cream;
  }

  &:disabled {
    cursor: default;
  }

  @include focus-ring;
}

.boton--hecho {
  border-color: $sage;
  color: $ink-soft;
}

.boton--oscuro {
  border-color: $ink;
  background-color: $ink;
  color: $cream;

  &:hover:not(:disabled) {
    background-color: $wine;
  }
}

.fin {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1.1rem;
  border-radius: $radius-md;
  background-color: $wine;
  font-weight: 600;
  color: $cream;

  small {
    display: block;
    font-size: $text-xs;
    font-weight: 400;
    color: rgba($cream, 0.75);
  }

  svg {
    font-size: 1.6rem;
  }

  @include focus-ring;
}

.detalle {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem 1.1rem;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

.detalle__guia {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: $wine;
}

.nota__title {
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}
</style>
