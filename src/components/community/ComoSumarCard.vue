<script setup lang="ts">
/**
 * Cómo se suman puntos y los niveles. Las reglas llegan del servidor, que es
 * el que cuenta: si cambian allá, esto se actualiza solo.
 */
import { ref } from 'vue'
import type { MisPuntos } from '@/services/communityService'

defineProps<{ datos: MisPuntos }>()

const abierta = ref(false)
</script>

<template>
  <section class="card">
    <button type="button" class="card__cab" :aria-expanded="abierta" @click="abierta = !abierta">
      <span class="card__title"><FaIcon icon="bolt" /> Cómo sumar puntos</span>
      <FaIcon :icon="abierta ? 'xmark' : 'arrow-right'" class="card__flecha" />
    </button>

    <div v-if="abierta" class="card__cuerpo">
      <ul class="reglas">
        <li v-for="r in datos.reglas" :key="r.accion" class="regla">
          <span class="regla__icono"><FaIcon :icon="r.icono" /></span>
          <span class="regla__texto">
            <span class="regla__title">{{ r.titulo }}</span>
            <span class="regla__detalle">{{ r.detalle }}</span>
          </span>
          <span class="regla__pts">+{{ r.puntos }}</span>
        </li>
      </ul>

      <p class="niveles__title">Niveles</p>
      <ol class="niveles">
        <li v-for="n in datos.niveles" :key="n.nivel" class="nivel">
          <span class="nivel__num">{{ n.nivel }}</span>
          <span class="nivel__nombre">{{ n.nombre }}</span>
          <span class="nivel__desde">{{ n.desde }} pts</span>
        </li>
      </ol>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.card {
  overflow: hidden;
  border: 1px solid $sand;
  border-radius: $radius-lg;
  background-color: $white;
}

.card__cab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.2rem;
  border: none;
  background: none;
  font-family: inherit;
  cursor: pointer;

  @include focus-ring;
}

.card__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;

  svg {
    color: $wine;
  }
}

.card__flecha {
  color: $rose-deep;
}

.card__cuerpo {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0 1.2rem 1.2rem;
}

.reglas {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  list-style: none;
}

.regla {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.regla__icono {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: $cream;
  font-size: 0.8rem;
  color: $wine;
}

.regla__texto {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.regla__title {
  font-size: $text-xs;
  font-weight: 600;
  color: $ink;
}

.regla__detalle {
  font-size: 0.7rem;
  line-height: 1.4;
  color: $ink-muted;
}

.regla__pts {
  flex: none;
  font-family: $font-display;
  font-size: $text-base;
  color: $wine;
}

.niveles__title {
  margin-top: 0.3rem;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-soft;
}

.niveles {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  list-style: none;
}

.nivel {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: $text-xs;
  color: $ink;
}

.nivel__num {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: $rose-soft;
  font-size: 0.68rem;
  font-weight: 600;
  color: $wine;
}

.nivel__nombre {
  flex: 1 1 auto;
}

.nivel__desde {
  color: $ink-muted;
}
</style>
