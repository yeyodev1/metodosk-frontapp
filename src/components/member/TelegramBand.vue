<script setup lang="ts">
/**
 * La franja "tu grupo ya está abierto", arriba de toda la app.
 *
 * Existe para que la entrada al grupo no dependa de que la alumna descubra
 * la pantalla de Recursos: el correo puede perderse, la app no. Se muestra
 * solo mientras haga falta —hay grupo abierto, le toca y todavía no vinculó
 * su Telegram— y desaparece sola cuando ya entró.
 *
 * Se puede cerrar y se recuerda cerrada, como la de pre-venta: repetirle lo
 * mismo en cada carga a quien ya decidió no entrar hoy es ruido.
 */
import { computed, onMounted, ref } from 'vue'
import telegramService, { type EstadoTelegram } from '@/services/telegramService'
import { TELEGRAM } from '@/config/telegram'

const CLAVE = 'telegram_banda_cerrada'

const estado = ref<EstadoTelegram | null>(null)
const cerrada = ref(leerCerrada())

const visible = computed(
  () =>
    !cerrada.value &&
    !!estado.value &&
    !estado.value.vinculado &&
    estado.value.grupos.some((g) => g.incluido),
)

function leerCerrada(): boolean {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
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

onMounted(async () => {
  try {
    estado.value = await telegramService.estado()
  } catch {
    estado.value = null
  }
})
</script>

<template>
  <Transition name="banda">
    <div v-if="visible && estado" class="banda">
      <p class="banda__texto">
        <strong>{{ TELEGRAM.banda.titulo }}.</strong>
        {{ TELEGRAM.banda.texto }}
      </p>
      <a class="banda__cta" :href="estado.botUrl" target="_blank" rel="noopener">
        <FaIcon :icon="['fab', 'telegram']" /> {{ TELEGRAM.banda.cta }}
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
  padding: 0.6rem 1rem 0.6rem 4rem;
  background-color: $ink;
  color: $cream;
  font-size: $text-xs;
  line-height: 1.5;

  @include from('lg') {
    padding: 0.6rem clamp(1rem, 3vw, 2.5rem);
  }
}

.banda__texto {
  flex: 1 1 auto;
  min-width: 0;

  strong {
    font-weight: 600;
  }
}

.banda__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.95rem;
  border-radius: $radius-pill;
  background-color: $rose-deep;
  font-weight: 600;
  color: $cream;
  white-space: nowrap;
  transition: background-color 0.26s $ease;

  &:hover {
    background-color: $wine;
  }

  @include focus-ring($rose-soft);
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
