<script setup lang="ts">
/**
 * Selector con nuestros estilos.
 *
 * El `<select>` del navegador abre el menú del sistema operativo: gris,
 * cuadrado, con la tipografía del sistema. En medio de una pantalla en crema y
 * Fraunces se ve como un error, y no hay CSS que lo arregle — ese menú lo
 * dibuja el sistema, no la página.
 *
 * Esto es un listbox de verdad: teclado (flechas, Enter, Escape, Home/End),
 * roles ARIA y foco visible. En móvil las opciones suben desde abajo, que es
 * donde llega el pulgar.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

export interface Opcion {
  value: string
  label: string
  /** Segunda línea, para cuando la etiqueta sola no alcanza. */
  hint?: string
  /** Versión corta para el botón, cuando la etiqueta completa no cabe. */
  short?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: Opcion[]
    label?: string
    placeholder?: string
    /** Ocupa todo el ancho disponible. */
    block?: boolean
    disabled?: boolean
  }>(),
  { label: '', placeholder: 'Elegir…', block: false, disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const abierto = ref(false)
const raiz = ref<HTMLElement | null>(null)
const lista = ref<HTMLElement | null>(null)
const marcado = ref(0)

const elegida = computed(() => props.options.find((o) => o.value === props.modelValue) || null)

function abrir() {
  if (props.disabled) return
  abierto.value = true
  marcado.value = Math.max(
    props.options.findIndex((o) => o.value === props.modelValue),
    0,
  )
  nextTick(() => lista.value?.focus())
}

function cerrar() {
  abierto.value = false
}

function elegir(opcion: Opcion) {
  emit('update:modelValue', opcion.value)
  cerrar()
}

function teclas(evento: KeyboardEvent) {
  const total = props.options.length
  if (!total) return

  switch (evento.key) {
    case 'ArrowDown':
      evento.preventDefault()
      marcado.value = (marcado.value + 1) % total
      break
    case 'ArrowUp':
      evento.preventDefault()
      marcado.value = (marcado.value - 1 + total) % total
      break
    case 'Home':
      evento.preventDefault()
      marcado.value = 0
      break
    case 'End':
      evento.preventDefault()
      marcado.value = total - 1
      break
    case 'Enter':
    case ' ':
      evento.preventDefault()
      elegir(props.options[marcado.value]!)
      break
    case 'Escape':
      evento.preventDefault()
      cerrar()
      break
  }
}

function fuera(evento: MouseEvent) {
  if (abierto.value && raiz.value && !raiz.value.contains(evento.target as Node)) cerrar()
}

watch(abierto, (esta) => {
  if (esta) document.addEventListener('mousedown', fuera)
  else document.removeEventListener('mousedown', fuera)
})

onBeforeUnmount(() => document.removeEventListener('mousedown', fuera))
</script>

<template>
  <div ref="raiz" class="sel" :class="{ 'sel--block': block, 'sel--disabled': disabled }">
    <span v-if="label" class="sel__label">{{ label }}</span>

    <button
      type="button"
      class="sel__trigger"
      :disabled="disabled"
      :aria-expanded="abierto"
      aria-haspopup="listbox"
      @click="abierto ? cerrar() : abrir()"
    >
      <span class="sel__valor" :class="{ 'sel__valor--vacio': !elegida }">
        {{ elegida ? elegida.short || elegida.label : placeholder }}
      </span>
      <span class="sel__flecha" :class="{ 'sel__flecha--abierta': abierto }" aria-hidden="true" />
    </button>

    <Transition name="pop">
      <ul
        v-if="abierto"
        ref="lista"
        class="sel__lista"
        role="listbox"
        tabindex="-1"
        @keydown="teclas"
      >
        <li
          v-for="(o, i) in options"
          :key="o.value"
          class="sel__opcion"
          :class="{
            'sel__opcion--marcada': i === marcado,
            'sel__opcion--activa': o.value === modelValue,
          }"
          role="option"
          :aria-selected="o.value === modelValue"
          @click="elegir(o)"
          @mouseenter="marcado = i"
        >
          <span class="sel__tick" aria-hidden="true">
            <svg v-if="o.value === modelValue" viewBox="0 0 12 12" width="12" height="12">
              <path
                d="M1.5 6.2 4.4 9l6-6.4"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="sel__texto">
            <span class="sel__opcion-label">{{ o.label }}</span>
            <span v-if="o.hint" class="sel__opcion-hint">{{ o.hint }}</span>
          </span>
        </li>
      </ul>
    </Transition>

    <!-- En móvil el menú sube desde abajo; esto lo cierra al tocar fuera -->
    <Transition name="veil">
      <div v-if="abierto" class="sel__scrim" @click="cerrar" />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.sel {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  gap: 0.3rem;
}

.sel--block {
  display: flex;
  width: 100%;
}

.sel__label {
  font-size: $text-xs;
  letter-spacing: 0.06em;
  color: $ink-muted;
}

.sel__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid rgba($ink, 0.16);
  border-radius: $radius-pill;
  background-color: $cream;
  font-family: inherit;
  font-size: $text-sm;
  color: $ink;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.28s $ease, background-color 0.28s $ease;

  &:hover:not(:disabled) {
    border-color: rgba($ink, 0.35);
  }

  @include focus-ring;
}

.sel--disabled .sel__trigger {
  cursor: not-allowed;
  opacity: 0.55;
}

.sel__valor {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sel__valor--vacio {
  color: $ink-muted;
}

.sel__flecha {
  flex: none;
  width: 8px;
  height: 8px;
  border-right: 1.5px solid $ink-muted;
  border-bottom: 1.5px solid $ink-muted;
  transform: translateY(-2px) rotate(45deg);
  transition: transform 0.32s $ease;
}

.sel__flecha--abierta {
  transform: translateY(1px) rotate(-135deg);
}

/* Móvil primero: el menú sube desde abajo, al alcance del pulgar */
.sel__lista {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 200;
  max-height: 60vh;
  overflow-y: auto;
  padding: 0.5rem;
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  border-radius: $radius-lg $radius-lg 0 0;
  background-color: $cream;
  box-shadow: $shadow-lg;
  list-style: none;

  @include from('md') {
    position: absolute;
    inset: calc(100% + 6px) auto auto 0;
    min-width: 100%;
    width: max-content;
    max-width: 320px;
    max-height: 300px;
    border: 1px solid rgba($ink, 0.1);
    border-radius: $radius-md;
    box-shadow: $shadow-md;
  }

  &:focus {
    outline: none;
  }
}

.sel__opcion {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.75rem 0.7rem;
  border-radius: $radius-sm;
  font-size: $text-sm;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.2s $ease;

  @include from('md') {
    padding: 0.55rem 0.6rem;
  }
}

.sel__opcion--marcada {
  background-color: rgba($ink, 0.06);
}

.sel__opcion--activa {
  color: $wine;
}

.sel__tick {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 1.4em;
  color: $rose-deep;
}

.sel__texto {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.sel__opcion-hint {
  font-size: $text-xs;
  color: $ink-muted;
}

.sel__scrim {
  position: fixed;
  inset: 0;
  z-index: 190;
  background-color: rgba($ink, 0.4);

  @include from('md') {
    display: none;
  }
}

/* ── Transiciones ── */
.pop-enter-active {
  animation: subir 0.3s $ease;
}

.pop-leave-active {
  animation: subir 0.18s $ease reverse;
}

@keyframes subir {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}

@include from('md') {
  @keyframes subir {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.98);
    }
  }
}

.veil-enter-active,
.veil-leave-active {
  animation: veil 0.26s ease-out;
}

.veil-leave-active {
  animation-direction: reverse;
}

@keyframes veil {
  from {
    opacity: 0;
  }
}

@include reduced-motion {
  .pop-enter-active,
  .pop-leave-active,
  .veil-enter-active,
  .veil-leave-active {
    animation: none;
  }
}
</style>
