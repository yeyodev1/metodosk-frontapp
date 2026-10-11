<script setup lang="ts">
/**
 * La franja de la administración: está mirando, no cursando — y mirando a quién.
 *
 * Elegir reto y semana acá cambia Mi reto y Tu guía a la vez. Con la semana
 * se revisa lo que de otra forma no se ve nunca: qué tiene con candado una
 * alumna que acaba de comprar, y cuándo se le abre.
 *
 * Los selectores son los nuestros (BaseSelect), en su versión para fondo
 * oscuro: el menú del sistema operativo no tiene lugar en la app.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { CHALLENGES } from '@/config/site'
import { OPCIONES_SEMANA, useVistaPrevia } from '@/composables/useVistaPrevia'

const { reto, semana, bloque } = useVistaPrevia()

const OPCIONES_RETO = CHALLENGES.map((c) => ({ value: c.name, label: c.name, hint: c.claim }))

const semanaTexto = computed({
  get: () => String(semana.value),
  set: (v: string) => (semana.value = Number(v)),
})

const resumen = computed(() =>
  bloque.value === 1
    ? 'Tiene abierto el bloque 1. El bloque 2 y el menú del mes 2 le aparecen con candado hasta su semana 5.'
    : `Tiene abiertos los bloques 1 a ${bloque.value} y los menús hasta el mes ${bloque.value}.`,
)
</script>

<template>
  <div class="franja">
    <div class="franja__cuerpo">
      <p class="franja__eyebrow">
        <span class="franja__dot" aria-hidden="true" /> Vista de alumna
      </p>

      <div class="franja__controles">
        <BaseSelect v-model="reto" :options="OPCIONES_RETO" class="franja__select" />
        <BaseSelect v-model="semanaTexto" :options="OPCIONES_SEMANA" class="franja__select" />
      </div>

      <p class="franja__resumen">{{ resumen }}</p>
    </div>

    <RouterLink to="/admin" class="franja__back">
      <FaIcon icon="arrow-left" /> Volver al panel
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.franja {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.8rem;
  padding: 0.6rem 1rem 0.6rem 4rem;
  background-color: $wine;
  color: $cream;
  font-size: $text-xs;

  @include from('lg') {
    padding: 0.6rem clamp(1rem, 3vw, 2.5rem);
  }
}

.franja__dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: $rose-soft;
  animation: latir 2.4s infinite;
}

.franja__cuerpo {
  display: flex;
  flex: 1 1 22rem;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
}

.franja__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba($cream, 0.75);
}

.franja__controles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* BaseSelect sobre el vino: el disparador se vuelve translúcido y crema. */
.franja__select {
  :deep(.sel__trigger) {
    padding: 0.5rem 0.95rem;
    border-color: rgba($cream, 0.35);
    background-color: rgba($cream, 0.1);
    font-weight: 600;
    color: $cream;

    &:hover:not(:disabled) {
      border-color: rgba($cream, 0.7);
      background-color: rgba($cream, 0.16);
    }
  }

  :deep(.sel__flecha) {
    border-color: $cream;
  }

  :deep(.sel__lista) {
    z-index: 210;
    color: $ink;
  }
}

.franja__resumen {
  font-size: $text-xs;
  line-height: 1.45;
  color: rgba($cream, 0.8);
}

.franja__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.8rem;
  border: 1px solid rgba($cream, 0.35);
  border-radius: $radius-pill;
  color: $cream;
  white-space: nowrap;
  transition: background-color 0.28s $ease;

  &:hover {
    background-color: rgba($cream, 0.14);
  }
}


@include reduced-motion {
  .franja__dot {
    animation: none;
  }
}

@keyframes latir {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}
</style>
