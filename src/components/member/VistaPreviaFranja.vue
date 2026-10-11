<script setup lang="ts">
/**
 * La franja de la administración: está mirando, no cursando — y mirando a quién.
 *
 * Elegir reto y semana acá cambia Mi reto y Tu guía a la vez. Con la semana
 * se revisa lo que de otra forma no se ve nunca: qué tiene con candado una
 * alumna que acaba de comprar, y cuándo se le abre.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { CHALLENGES } from '@/config/site'
import { OPCIONES_SEMANA, useVistaPrevia } from '@/composables/useVistaPrevia'

const { reto, semana, bloque } = useVistaPrevia()

const semanaTexto = computed({
  get: () => String(semana.value),
  set: (v: string) => (semana.value = Number(v)),
})

const resumen = computed(() =>
  bloque.value === 1
    ? 'Tiene abierto el bloque 1. El bloque 2 y el menú del mes 2 los ve con candado hasta su semana 5.'
    : `Tiene abiertos los bloques 1 a ${bloque.value} y los menús hasta el mes ${bloque.value}.`,
)
</script>

<template>
  <div class="franja">
    <span class="franja__dot" aria-hidden="true" />

    <div class="franja__cuerpo">
      <p class="franja__text">
        Vista de alumna:
        <label class="campo">
          <span class="sr-only">Reto</span>
          <select v-model="reto" class="campo__select">
            <option v-for="c in CHALLENGES" :key="c.id" :value="c.name">{{ c.name }}</option>
          </select>
        </label>
        en su
        <label class="campo">
          <span class="sr-only">Semana del reto</span>
          <select v-model="semanaTexto" class="campo__select">
            <option v-for="s in OPCIONES_SEMANA" :key="s.value" :value="s.value">
              {{ s.label }} · {{ s.hint }}
            </option>
          </select>
        </label>
      </p>
      <p class="franja__resumen">{{ resumen }}</p>
    </div>

    <RouterLink to="/admin" class="franja__back">
      <span aria-hidden="true">←</span>
      Volver al panel
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
  flex: 1 1 18rem;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.franja__text {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
}

.franja__resumen {
  color: rgba($cream, 0.75);
}

.campo__select {
  padding: 0.22rem 0.5rem;
  border: 1px solid rgba($cream, 0.4);
  border-radius: $radius-pill;
  background-color: rgba($cream, 0.12);
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $cream;
  cursor: pointer;

  option {
    color: $ink;
  }

  @include focus-ring;
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
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
