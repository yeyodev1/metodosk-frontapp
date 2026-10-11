<script setup lang="ts">
/**
 * Una página de la guía en imagen: miniatura primero, grande si la tocas.
 *
 * A tamaño completo una sola página ocupaba tres pantallas y había que
 * deslizar mucho para pasar de una marca a la siguiente. Así se ven todas de
 * un vistazo y se agranda la que interesa.
 *
 * Se cargan de inmediato, no perezosas: se piden al tocar "Ver las marcas", y
 * mientras llegan el hueco late — sin eso el botón parecía no hacer nada.
 *
 * Ampliada se ve entera, ajustada a la pantalla: antes se agrandaba al ancho y
 * la mitad de la página quedaba fuera, con lo que "ampliar" escondía marcas.
 * Tocarla la acerca al ancho para leer una etiqueta; tocarla otra vez la
 * vuelve a ajustar.
 *
 * El menú del clic derecho y el arrastre van bloqueados. No impide una captura
 * —nada lo impide— pero evita el "guardar imagen" de un gesto.
 */
import { onBeforeUnmount, ref, watch } from 'vue'

defineProps<{ src: string; alt: string }>()

const cargada = ref(false)
const fallo = ref(false)
const ampliada = ref(false)
/** Acercada: al ancho, con scroll, para leer el detalle de una marca. */
const cerca = ref(false)

function alTeclado(e: KeyboardEvent) {
  if (e.key === 'Escape') ampliada.value = false
}

watch(ampliada, (abierta) => {
  cerca.value = false
  document.body.style.overflow = abierta ? 'hidden' : ''
  if (abierta) window.addEventListener('keydown', alTeclado)
  else window.removeEventListener('keydown', alTeclado)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', alTeclado)
})
</script>

<template>
  <div class="hoja">
    <button
      type="button"
      class="hoja__mini"
      :class="{ 'hoja__mini--lista': cargada }"
      :aria-label="`Ampliar: ${alt}`"
      :disabled="!cargada"
      @click="ampliada = true"
    >
      <img
        :src="src"
        :alt="alt"
        loading="eager"
        decoding="async"
        draggable="false"
        @contextmenu.prevent
        @load="cargada = true"
        @error="fallo = true"
      />
      <span v-if="!cargada && !fallo" class="hoja__estado">Cargando…</span>
      <span v-else-if="fallo" class="hoja__estado hoja__estado--mal">
        No se pudo cargar. Revisa tu conexión.
      </span>
      <span v-else class="hoja__lupa"><FaIcon icon="book-open" /> Ampliar</span>
    </button>

    <Teleport to="body">
      <div
        v-if="ampliada"
        class="visor"
        :class="{ 'visor--cerca': cerca }"
        role="dialog"
        aria-modal="true"
        :aria-label="alt"
        @click.self="ampliada = false"
      >
        <button type="button" class="visor__cerrar" aria-label="Cerrar" @click="ampliada = false">
          <FaIcon icon="xmark" />
        </button>
        <img
          :src="src"
          :alt="alt"
          class="visor__img"
          draggable="false"
          @contextmenu.prevent
          @click="cerca = !cerca"
        />
        <p class="visor__pista">
          {{ cerca ? 'Toca la imagen para verla entera' : 'Toca la imagen para acercarte' }}
        </p>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.hoja {
  flex: 1 1 200px;
  max-width: 100%;
}

/* La miniatura: alta fija, para que ocho marcas quepan en una pantalla. */
.hoja__mini {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 190px;
  padding: 0;
  overflow: hidden;
  border: none;
  border-radius: $radius-sm;
  background-color: $bone;
  cursor: zoom-in;

  &:disabled {
    cursor: default;
  }

  @include focus-ring;
}

.hoja__mini:not(.hoja__mini--lista) {
  animation: latir 1.4s ease-in-out infinite;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  opacity: 0;
  user-select: none;
  -webkit-user-drag: none;
  transition: opacity 0.3s $ease, transform 0.4s $ease;
}

.hoja__mini--lista img {
  opacity: 1;
}

.hoja__mini--lista:hover img {
  transform: scale(1.03);
}

.hoja__estado {
  position: absolute;
  padding: 0 1rem;
  font-size: $text-xs;
  color: $ink-muted;
  text-align: center;
}

.hoja__estado--mal {
  color: $wine;
}

.hoja__lupa {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.82);
  font-size: 0.66rem;
  font-weight: 600;
  color: $cream;
}

/* ── A pantalla completa: entera, ajustada al alto y al ancho ── */
.visor {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 3.6rem 0.8rem 0.9rem;
  overflow: hidden;
  background-color: rgba($ink, 0.94);
}

.visor__img {
  flex: 0 1 auto;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: calc(100dvh - 6.2rem);
  min-height: 0;
  border-radius: $radius-sm;
  object-fit: contain;
  opacity: 1;
  background-color: $cream;
  cursor: zoom-in;
}

/* Acercada: al ancho de lectura, y se recorre con scroll. */
.visor--cerca {
  justify-content: flex-start;
  overflow-y: auto;

  .visor__img {
    flex: none;
    width: min(1200px, 100%);
    max-height: none;
    cursor: zoom-out;
  }
}

.visor__pista {
  flex: none;
  font-size: $text-xs;
  color: rgba($cream, 0.7);

  .visor--cerca & {
    position: fixed;
    bottom: 0.9rem;
    left: 50%;
    padding: 0.35rem 0.8rem;
    border-radius: $radius-pill;
    background-color: rgba($ink, 0.82);
    transform: translateX(-50%);
  }
}

.visor__cerrar {
  position: fixed;
  top: 0.9rem;
  right: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background-color: rgba($cream, 0.16);
  color: $cream;
  font-size: 1.05rem;
  cursor: pointer;

  &:hover {
    background-color: rgba($cream, 0.28);
  }

  @include focus-ring;
}

@keyframes latir {
  0%,
  100% {
    background-color: $bone;
  }
  50% {
    background-color: $sand;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hoja__mini:not(.hoja__mini--lista) {
    animation: none;
  }

  img {
    transition: none;
  }

  .hoja__mini--lista:hover img {
    transform: none;
  }
}
</style>
