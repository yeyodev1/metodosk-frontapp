<script setup lang="ts">
/**
 * Las clases del curso, al lado del video: como la lista de YouTube.
 *
 * Cada una es un enlace y no un botón: abre su propia página, se puede
 * compartir y el atrás del teléfono vuelve a la anterior.
 */
import { RouterLink } from 'vue-router'
import { duracion } from '@/composables/useCursos'

export interface ItemClase {
  id: string
  /** Lo que va en la URL: el id de la clase, o "bienvenida". */
  ruta: string
  title: string
  summary: string | null
  embedUrl: string | null
  hlsUrl: string | null
  thumbnail: string | null
  durationSeconds: number | null
  seconds: number
  completed: boolean
}

defineProps<{
  slug: string
  titulo: string
  items: ItemClase[]
  actualId: string | null
  vistas: number
}>()
</script>

<template>
  <section class="lista">
    <header class="lista__cab">
      <p class="lista__curso">{{ titulo }}</p>
      <p class="lista__cuenta">{{ vistas }} de {{ items.length }} vistas</p>
    </header>

    <ol class="lista__items">
      <li v-for="(it, i) in items" :key="it.id">
        <RouterLink
          v-if="it.embedUrl"
          :to="`/academia/${slug}/${it.ruta}`"
          class="item"
          :class="{ 'item--actual': it.id === actualId, 'item--vista': it.completed }"
          :aria-current="it.id === actualId ? 'page' : undefined"
        >
          <span class="item__num">
            <FaIcon v-if="it.id === actualId" icon="play" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span class="item__mini">
            <img v-if="it.thumbnail" :src="it.thumbnail" alt="" loading="lazy" />
            <span v-if="duracion(it.durationSeconds)" class="item__dur">
              {{ duracion(it.durationSeconds) }}
            </span>
            <span v-if="it.completed" class="item__visto"><FaIcon icon="check" /></span>
            <span
              v-else-if="it.seconds > 10 && it.durationSeconds"
              class="item__barra"
              :style="{ width: `${Math.min(100, (it.seconds / it.durationSeconds) * 100)}%` }"
            />
          </span>
          <span class="item__texto">
            <span class="item__title">{{ it.title }}</span>
            <span v-if="it.summary" class="item__sum">{{ it.summary }}</span>
          </span>
        </RouterLink>

        <!-- Sin video todavía: en su lugar y en gris, para que se vea que viene. -->
        <div v-else class="item item--pendiente">
          <span class="item__num"><FaIcon icon="lock" /></span>
          <span class="item__mini" />
          <span class="item__texto">
            <span class="item__title">{{ it.title }}</span>
            <span class="item__sum">Próximamente</span>
          </span>
        </div>
      </li>
    </ol>
  </section>
</template>

<style lang="scss" scoped>
.lista {
  overflow: hidden;
  border: 1px solid $sand;
  border-radius: $radius-lg;
  background-color: $white;
}

.lista__cab {
  padding: 0.95rem 1rem 0.8rem;
  border-bottom: 1px solid $sand;
}

.lista__curso {
  font-family: $font-display;
  font-size: $text-base;
  line-height: 1.2;
  color: $ink;
}

.lista__cuenta {
  margin-top: 0.2rem;
  font-size: $text-xs;
  color: $ink-muted;
}

.lista__items {
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  overflow-y: auto;
  padding: 0.35rem;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem;
  border-radius: $radius-md;
  color: $ink;
  transition: background-color 0.2s $ease;

  &:hover {
    background-color: $cream;
  }

  @include focus-ring;
}

.item--actual {
  background-color: $cream;
}

.item--pendiente {
  opacity: 0.55;

  &:hover {
    background-color: transparent;
  }
}

.item__num {
  flex: none;
  width: 1.1rem;
  font-size: $text-xs;
  text-align: center;
  color: $ink-muted;

  .item--actual & {
    color: $wine;
  }
}

.item__mini {
  position: relative;
  flex: none;
  width: 7.5rem;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: $radius-sm;
  background-color: $sand;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.item__dur {
  position: absolute;
  right: 0.25rem;
  bottom: 0.25rem;
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
  background-color: rgba($ink, 0.82);
  font-size: 0.66rem;
  font-weight: 600;
  color: $cream;
}

.item__visto {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background-color: $wine;
  font-size: 0.6rem;
  color: $cream;
}

.item__barra {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  background-color: $wine;
}

.item__texto {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.item__title {
  font-size: $text-sm;
  font-weight: 600;
  line-height: 1.25;
}

.item__sum {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: $text-xs;
  line-height: 1.35;
  color: $ink-muted;
}
</style>
