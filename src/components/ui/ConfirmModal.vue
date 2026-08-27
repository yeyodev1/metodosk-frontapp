<script setup lang="ts">
/**
 * Confirmación de una acción.
 *
 * Reemplaza al `confirm()` del navegador, que dibuja el sistema operativo:
 * gris, cuadrado, con la tipografía del sistema, y además congela la página
 * entera mientras está abierto.
 *
 * El botón que confirma dice qué va a pasar —"Eliminar el curso", no "Aceptar"—
 * porque quien lo lee con prisa solo lee ese botón. Y el foco arranca en
 * Cancelar: si alguien abrió esto sin querer, la tecla Enter no debería borrar
 * nada.
 */
import { nextTick, ref, watch } from 'vue'
// El catálogo se importa acá y no en quien lo use: este modal aparece también
// en la pantalla de pago, que vive fuera de los marcos privados.
import '@/plugins/icons'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    /** Texto del botón que confirma. Que diga la acción, no "Aceptar". */
    confirmLabel?: string
    cancelLabel?: string
    /** Rojo y advertencia: para lo que no se puede deshacer. */
    danger?: boolean
    /** Bloquea los botones mientras la acción corre. */
    loading?: boolean
    icono?: string
  }>(),
  {
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    danger: false,
    loading: false,
    icono: '',
  },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()

const cancelar = ref<HTMLButtonElement | null>(null)

function cerrar() {
  if (props.loading) return
  emit('cancel')
}

function teclas(evento: KeyboardEvent) {
  if (evento.key === 'Escape') cerrar()
}

// El scroll del fondo se congela: si no, la página de atrás sigue moviéndose
// bajo el diálogo y da la sensación de que el clic no hizo nada.
watch(
  () => props.open,
  async (abierto) => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    if (abierto) {
      await nextTick()
      cancelar.value?.focus()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="confirmar">
      <div
        v-if="open"
        class="confirmar"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click.self="cerrar"
        @keydown="teclas"
      >
        <div class="confirmar__caja">
          <span class="confirmar__icono" :class="{ 'confirmar__icono--danger': danger }">
            <FaIcon :icon="icono || (danger ? 'triangle-exclamation' : 'circle-question')" />
          </span>

          <h2 class="confirmar__title">{{ title }}</h2>
          <p class="confirmar__texto">{{ message }}</p>

          <div class="confirmar__acciones">
            <button
              ref="cancelar"
              type="button"
              class="btn"
              :disabled="loading"
              @click="cerrar"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="btn btn--solid"
              :class="{ 'btn--danger': danger }"
              :disabled="loading"
              @click="emit('confirm')"
            >
              <FaIcon v-if="loading" icon="spinner" spin />
              {{ loading ? 'Un momento…' : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.confirmar {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  background-color: rgba($ink, 0.55);
  backdrop-filter: blur(3px);

  @include from('md') {
    align-items: center;
    padding: 1.5rem;
  }
}

.confirmar__caja {
  width: min(430px, 100%);
  padding: clamp(1.4rem, 5vw, 2rem);
  padding-bottom: max(clamp(1.4rem, 5vw, 2rem), env(safe-area-inset-bottom));
  border-radius: $radius-lg $radius-lg 0 0;
  background-color: $bone;
  text-align: center;

  @include from('md') {
    border-radius: $radius-lg;
  }
}

.confirmar__icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 0.9rem;
  border-radius: 50%;
  background-color: $rose-soft;
  font-size: 1.1rem;
  color: $wine;
}

.confirmar__icono--danger {
  background-color: $alert-error-bg;
  color: $alert-error;
}

.confirmar__title {
  font-family: $font-display;
  font-size: $text-xl;
  line-height: 1.2;
  color: $ink;
}

.confirmar__texto {
  max-width: 40ch;
  margin: 0.5rem auto 0;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.confirmar__acciones {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.6rem;
  margin-top: $space-md;

  @include from('md') {
    flex-direction: row;
    justify-content: center;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba($ink, 0.2);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-sm;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.28s $ease, border-color 0.28s $ease, color 0.28s $ease;

  &:hover:not(:disabled) {
    border-color: $ink;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @include focus-ring;
}

.btn--solid {
  border-color: $ink;
  background-color: $ink;
  color: $cream;

  &:hover:not(:disabled) {
    background-color: $wine;
    border-color: $wine;
  }
}

.btn--danger {
  border-color: $alert-error;
  background-color: $alert-error;

  &:hover:not(:disabled) {
    background-color: #a8443f;
    border-color: #a8443f;
  }
}

/* ── Transición ── */
.confirmar-enter-active,
.confirmar-leave-active {
  animation: velo 0.26s ease-out;
}

.confirmar-leave-active {
  animation-direction: reverse;
}

.confirmar-enter-active .confirmar__caja {
  animation: caja 0.32s $ease;
}

.confirmar-leave-active .confirmar__caja {
  animation: caja 0.2s $ease reverse;
}

@keyframes velo {
  from {
    opacity: 0;
  }
}

@keyframes caja {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

@include from('md') {
  @keyframes caja {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.97);
    }
  }
}

@include reduced-motion {
  .confirmar-enter-active,
  .confirmar-leave-active,
  .confirmar-enter-active .confirmar__caja,
  .confirmar-leave-active .confirmar__caja {
    animation: none;
  }
}
</style>
