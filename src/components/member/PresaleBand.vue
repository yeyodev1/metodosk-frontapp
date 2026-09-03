<script setup lang="ts">
/**
 * La franja de pre-venta, arriba de toda la app.
 *
 * Existe por una sola razón: quien acaba de pagar entra, ve cursos con candado
 * y concluye que le vendieron algo roto. No lo está — todavía no abre. Decirlo
 * en la pantalla donde se ven los candados es más barato que contestarlo una
 * por una por WhatsApp.
 *
 * Se puede cerrar, y se recuerda cerrada: repetirle lo mismo en cada carga a
 * quien ya lo entendió es ruido.
 */
import { ref } from 'vue'
import { PREVENTA } from '@/config/preventa'

defineProps<{ apertura?: string | null }>()

const CLAVE = 'preventa_banda_cerrada'

const cerrada = ref(leerCerrada())

function leerCerrada(): boolean {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    // Modo privado: se muestra siempre, que es el lado seguro del error.
    return false
  }
}

function cerrar() {
  cerrada.value = true
  try {
    localStorage.setItem(CLAVE, '1')
  } catch {
    /* si no se puede recordar, vuelve en la siguiente carga */
  }
}
</script>

<template>
  <Transition name="banda">
    <div v-if="!cerrada" class="banda">
      <span class="banda__dot" aria-hidden="true" />
      <p class="banda__texto">
        <strong>{{ PREVENTA.banda.titulo }}.</strong>
        {{ PREVENTA.banda.texto }}
      </p>
      <button type="button" class="banda__cerrar" aria-label="Entendido, cerrar" @click="cerrar">
        <FaIcon icon="xmark" />
      </button>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.banda {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem 0.6rem 4rem;
  background-color: $wine;
  color: $cream;
  font-size: $text-xs;
  line-height: 1.5;

  @include from('lg') {
    padding: 0.6rem clamp(1rem, 3vw, 2.5rem);
  }
}

.banda__dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: $rose-soft;
  animation: latir 2.4s infinite;
}

.banda__texto {
  flex: 1 1 auto;
  min-width: 0;

  strong {
    font-weight: 600;
  }
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
  background-color: rgba($cream, 0.14);
  font-size: 0.7rem;
  color: $cream;
  cursor: pointer;
  transition: background-color 0.26s $ease;

  &:hover {
    background-color: rgba($cream, 0.26);
  }

  @include focus-ring($rose-soft);
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
  .banda__dot,
  .banda-leave-active {
    animation: none;
  }
}
</style>
