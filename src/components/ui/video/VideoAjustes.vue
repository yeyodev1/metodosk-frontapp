<script setup lang="ts">
/**
 * El menú del engranaje: velocidad y calidad, como en YouTube.
 *
 * Una lista principal que muestra lo elegido y abre cada opción en su propia
 * lista. En una clase de entrenamiento lo que más se usa es bajar la calidad
 * cuando el wifi del gimnasio no da.
 */
import { computed, ref } from 'vue'
import type { Calidad } from '@/composables/useHlsPlayer'
import { ICONOS } from './iconos'

const props = defineProps<{
  velocidad: number
  calidades: Calidad[]
  calidad: number
}>()

const emit = defineEmits<{
  velocidad: [valor: number]
  calidad: [indice: number]
  cerrar: []
}>()

const VELOCIDADES = [0.5, 0.75, 1, 1.25, 1.5, 2]
const vista = ref<'inicio' | 'velocidad' | 'calidad'>('inicio')

const textoVelocidad = computed(() => (props.velocidad === 1 ? 'Normal' : `${props.velocidad}×`))
const textoCalidad = computed(() => {
  if (props.calidad === -1) return 'Automática'
  const c = props.calidades.find((x) => x.indice === props.calidad)
  return c ? `${c.alto}p` : 'Automática'
})

function elegirVelocidad(v: number) {
  emit('velocidad', v)
  emit('cerrar')
}

function elegirCalidad(i: number) {
  emit('calidad', i)
  emit('cerrar')
}
</script>

<template>
  <div class="ajustes" role="menu" @click.stop>
    <template v-if="vista === 'inicio'">
      <button type="button" class="ajustes__fila" @click="vista = 'velocidad'">
        <span>Velocidad</span>
        <span class="ajustes__valor">{{ textoVelocidad }}</span>
        <svg viewBox="0 0 24 24"><path :d="ICONOS.adelante" /></svg>
      </button>
      <button
        v-if="calidades.length"
        type="button"
        class="ajustes__fila"
        @click="vista = 'calidad'"
      >
        <span>Calidad</span>
        <span class="ajustes__valor">{{ textoCalidad }}</span>
        <svg viewBox="0 0 24 24"><path :d="ICONOS.adelante" /></svg>
      </button>
    </template>

    <template v-else>
      <button type="button" class="ajustes__volver" @click="vista = 'inicio'">
        <svg viewBox="0 0 24 24"><path :d="ICONOS.atras" /></svg>
        {{ vista === 'velocidad' ? 'Velocidad' : 'Calidad' }}
      </button>

      <template v-if="vista === 'velocidad'">
        <button
          v-for="v in VELOCIDADES"
          :key="v"
          type="button"
          class="ajustes__opcion"
          @click="elegirVelocidad(v)"
        >
          <svg v-if="v === velocidad" viewBox="0 0 24 24"><path :d="ICONOS.check" /></svg>
          <span v-else class="ajustes__hueco" />
          {{ v === 1 ? 'Normal' : `${v}×` }}
        </button>
      </template>

      <template v-else>
        <button
          v-for="c in calidades"
          :key="c.indice"
          type="button"
          class="ajustes__opcion"
          @click="elegirCalidad(c.indice)"
        >
          <svg v-if="c.indice === calidad" viewBox="0 0 24 24"><path :d="ICONOS.check" /></svg>
          <span v-else class="ajustes__hueco" />
          {{ c.alto }}p<small v-if="c.alto >= 720">HD</small>
        </button>
        <button type="button" class="ajustes__opcion" @click="elegirCalidad(-1)">
          <svg v-if="calidad === -1" viewBox="0 0 24 24"><path :d="ICONOS.check" /></svg>
          <span v-else class="ajustes__hueco" />
          Automática
        </button>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.ajustes {
  position: absolute;
  right: 0.6rem;
  bottom: calc(100% + 0.4rem);
  z-index: 3;
  display: flex;
  flex-direction: column;
  min-width: 230px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 0.45rem 0;
  border-radius: 12px;
  background-color: rgba(#100c0b, 0.9);
  backdrop-filter: blur(8px);
  color: $cream;
}

%fila {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.6rem 1rem;
  border: none;
  background: none;
  font: inherit;
  font-size: 0.85rem;
  color: inherit;
  text-align: left;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    outline: none;
    background-color: rgba($cream, 0.12);
  }

  svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
}

.ajustes__fila {
  @extend %fila;

  span:first-child {
    flex: 1;
  }
}

.ajustes__valor {
  color: rgba($cream, 0.7);
}

.ajustes__volver {
  @extend %fila;
  margin-bottom: 0.3rem;
  border-bottom: 1px solid rgba($cream, 0.14);
  font-weight: 600;
}

.ajustes__opcion {
  @extend %fila;

  small {
    margin-left: 0.3rem;
    font-size: 0.6rem;
    font-weight: 700;
    color: $rose;
  }
}

.ajustes__hueco {
  width: 18px;
}
</style>
