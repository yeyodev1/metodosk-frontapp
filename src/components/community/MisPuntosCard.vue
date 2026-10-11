<script setup lang="ts">
/**
 * Sus puntos: nivel, cuánto le falta para el siguiente, su lugar del mes y
 * las insignias — las ganadas a color y las que faltan con su "cómo".
 *
 * Una insignia apagada con la meta escrita al lado es la que hace volver: le
 * dice exactamente qué hacer mañana.
 */
import { computed } from 'vue'
import type { MisPuntos } from '@/services/communityService'

const props = defineProps<{ datos: MisPuntos }>()

const yo = computed(() => props.datos.yo!)

const avance = computed(() => {
  const n = yo.value.nivel
  if (!n.siguiente) return 100
  return Math.round(((yo.value.total - n.desde) / (n.siguiente.desde - n.desde)) * 100)
})

const ganadas = computed(() => yo.value.insignias.filter((i) => i.ganada).length)
</script>

<template>
  <section class="card">
    <p class="card__eyebrow"><FaIcon icon="star" /> Tus puntos</p>

    <div class="nivel">
      <span class="nivel__num">{{ yo.nivel.nivel }}</span>
      <div class="nivel__texto">
        <p class="nivel__nombre">{{ yo.nivel.nombre }}</p>
        <p class="nivel__total">{{ yo.total.toLocaleString('es-EC') }} puntos en total</p>
      </div>
    </div>

    <div class="barra" role="progressbar" :aria-valuenow="avance" aria-valuemin="0" aria-valuemax="100">
      <span class="barra__relleno" :style="{ width: `${avance}%` }" />
    </div>
    <p class="barra__pie">
      <template v-if="yo.nivel.siguiente">
        Te faltan <strong>{{ yo.nivel.siguiente.desde - yo.total }} pts</strong> para
        «{{ yo.nivel.siguiente.nombre }}»
      </template>
      <template v-else>Llegaste al nivel más alto. Eres leyenda. ✨</template>
    </p>

    <div class="mes">
      <div class="mes__dato">
        <p class="mes__valor">{{ yo.mes }}</p>
        <p class="mes__label">pts en {{ datos.mes }}</p>
      </div>
      <div class="mes__dato">
        <p class="mes__valor">{{ yo.posicion ? `#${yo.posicion}` : '—' }}</p>
        <p class="mes__label">
          {{ yo.posicion ? `de ${yo.participantes} en el ranking` : 'Suma puntos para entrar' }}
        </p>
      </div>
    </div>

    <div class="insignias">
      <p class="insignias__title">Insignias · {{ ganadas }} de {{ yo.insignias.length }}</p>
      <ul class="insignias__lista">
        <li
          v-for="i in yo.insignias"
          :key="i.id"
          class="insignia"
          :class="{ 'insignia--ganada': i.ganada }"
          :title="i.ganada ? i.nombre : `${i.nombre}: ${i.como}`"
        >
          <span class="insignia__icono"><FaIcon :icon="i.ganada ? i.icono : 'lock'" /></span>
          <span class="insignia__texto">
            <span class="insignia__nombre">{{ i.nombre }}</span>
            <span v-if="!i.ganada" class="insignia__como">{{ i.como }}</span>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.2rem;
  border-radius: $radius-lg;
  background-color: $ink;
  color: $cream;
}

.card__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: $rose-soft;
}

.nivel {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.nivel__num {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, $rose-soft, $rose);
  font-family: $font-display;
  font-size: 1.5rem;
  color: $ink;
}

.nivel__nombre {
  font-family: $font-display;
  font-size: 1.35rem;
  line-height: 1.1;
}

.nivel__total {
  margin-top: 0.15rem;
  font-size: $text-xs;
  color: rgba($cream, 0.7);
}

.barra {
  height: 8px;
  overflow: hidden;
  border-radius: $radius-pill;
  background-color: rgba($cream, 0.14);
}

.barra__relleno {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, $rose, $rose-soft);
  transition: width 0.6s $ease;
}

.barra__pie {
  margin-top: -0.4rem;
  font-size: $text-xs;
  color: rgba($cream, 0.75);

  strong {
    color: $cream;
  }
}

.mes {
  display: flex;
  gap: 0.6rem;
}

.mes__dato {
  flex: 1 1 0;
  padding: 0.7rem 0.8rem;
  border-radius: $radius-md;
  background-color: rgba($cream, 0.08);
}

.mes__valor {
  font-family: $font-display;
  font-size: 1.35rem;
  line-height: 1.1;
}

.mes__label {
  margin-top: 0.15rem;
  font-size: 0.7rem;
  color: rgba($cream, 0.7);
}

.insignias__title {
  font-size: $text-xs;
  font-weight: 600;
  color: rgba($cream, 0.8);
}

.insignias__lista {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.5rem;
  list-style: none;
}

.insignia {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.5rem;
  border-radius: $radius-sm;
  opacity: 0.6;
}

.insignia--ganada {
  background-color: rgba($rose-soft, 0.12);
  opacity: 1;
}

.insignia__icono {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba($cream, 0.1);
  font-size: 0.8rem;

  .insignia--ganada & {
    background-color: $rose-soft;
    color: $wine;
  }
}

.insignia__texto {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.insignia__nombre {
  font-size: $text-xs;
  font-weight: 600;
}

.insignia__como {
  font-size: 0.68rem;
  color: rgba($cream, 0.65);
}

@include reduced-motion {
  .barra__relleno {
    transition: none;
  }
}
</style>
