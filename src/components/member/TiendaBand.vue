<script setup lang="ts">
/**
 * La franja de la tienda de Scarlett, arriba de toda la app.
 *
 * La tienda no se descubre sola: si solo viviera en Recursos, la vería quien
 * ya fue a buscar sus mancuernas y nadie más. Acá la ve cualquiera que entre,
 * esté en la guía, en su progreso o en la comunidad.
 *
 * Se puede cerrar y se recuerda cerrada —como la de pre-venta y la de
 * Telegram—, pero vuelve a las dos semanas: la tienda no es un aviso de una
 * sola vez que se agota al leerlo, se le van sumando cosas.
 */
import { computed, ref } from 'vue'
import { TIENDA } from '@/config/tienda'

const CLAVE = 'tienda_banda_cerrada'
/** Cuánto dura el silencio antes de volver a asomarse. */
const DESCANSO_MS = 14 * 24 * 60 * 60 * 1000

const cerradaEn = ref(leerCierre())

const visible = computed(
  () => cerradaEn.value === null || Date.now() - cerradaEn.value > DESCANSO_MS,
)

function leerCierre(): number | null {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (!guardado) return null
    const marca = Number(guardado)
    return Number.isFinite(marca) ? marca : null
  } catch {
    return null
  }
}

function cerrar() {
  const ahora = Date.now()
  cerradaEn.value = ahora
  try {
    localStorage.setItem(CLAVE, String(ahora))
  } catch {
    /* si no se puede recordar, vuelve en la siguiente carga */
  }
}
</script>

<template>
  <Transition name="banda">
    <div v-if="visible" class="banda">
      <span class="banda__icono" aria-hidden="true"><FaIcon :icon="['fab', 'amazon']" /></span>
      <p class="banda__texto">
        <strong>{{ TIENDA.banda.titulo }}.</strong>
        {{ TIENDA.banda.texto }}
      </p>
      <a class="banda__cta" :href="TIENDA.url" target="_blank" rel="noopener">
        {{ TIENDA.banda.cta }}
        <FaIcon icon="arrow-right" />
      </a>
      <button type="button" class="banda__cerrar" aria-label="Cerrar" @click="cerrar">
        <FaIcon icon="xmark" />
      </button>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.banda {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 0.9rem;
  /* Hueco a la izquierda para el botón de menú, que va fijo en móvil. */
  padding: 0.6rem 1rem 0.6rem 4rem;
  background-color: $clay;
  color: $ink;
  font-size: $text-xs;
  line-height: 1.5;

  @include from('lg') {
    padding: 0.6rem clamp(1rem, 3vw, 2.5rem);
  }
}

.banda__icono {
  flex: none;
  display: none;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: rgba($cream, 0.75);
  font-size: 0.8rem;

  @include from('sm') {
    display: flex;
  }
}

.banda__texto {
  flex: 1 1 auto;
  min-width: 0;
  color: $ink-soft;

  strong {
    font-weight: 600;
    color: $ink;
  }
}

.banda__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.95rem;
  border-radius: $radius-pill;
  background-color: $ink;
  font-weight: 600;
  color: $cream;
  white-space: nowrap;
  transition: background-color 0.26s $ease;

  &:hover {
    background-color: $wine;
  }

  @include focus-ring($rose-deep);
}

.banda__cerrar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background-color: rgba($ink, 0.08);
  font-size: 0.7rem;
  color: $ink-soft;
  cursor: pointer;
  transition: background-color 0.26s $ease;

  &:hover {
    background-color: rgba($ink, 0.16);
  }

  @include focus-ring($rose-deep);
}

.banda-leave-active {
  animation: subir 0.34s $ease;
}

@keyframes subir {
  to {
    opacity: 0;
    transform: translateY(-100%);
  }
}

@include reduced-motion {
  .banda-leave-active {
    animation: none;
  }
}
</style>
