<script setup lang="ts">
/**
 * El menú de la semana, un día a la vez.
 *
 * Se muestra un solo día y no los siete seguidos porque lo que se busca al
 * abrir esto es qué toca hoy, no leer el mes entero. Los días de pierna van
 * marcados: el menú se repite y conviene verlo antes de cocinar.
 *
 * La foto es la del PDF de Karen, una por día.
 */
import { computed, ref } from 'vue'
import type { DiaGuia } from '@/services/guiaService'
import { fotoDelDia } from '@/composables/useGuia'

const props = defineProps<{ dias: DiaGuia[]; diasDePierna: number[] }>()

const activo = ref(props.dias[0]?.numero ?? 1)

const esDePierna = (n: number) => props.diasDePierna.includes(n)
const dia = computed<DiaGuia>(
  () => props.dias.find((d) => d.numero === activo.value) ?? props.dias[0]!,
)
</script>

<template>
  <div class="menu">
    <div class="menu__dias" role="tablist" aria-label="Días del menú">
      <button
        v-for="d in dias"
        :key="d.numero"
        type="button"
        role="tab"
        class="dia"
        :class="{ 'dia--activo': d.numero === activo }"
        :aria-selected="d.numero === activo"
        @click="activo = d.numero"
      >
        <span>{{ d.numero }}</span>
        <span v-if="esDePierna(d.numero)" class="dia__pierna" aria-hidden="true">·</span>
      </button>
    </div>

    <article class="tarjeta">
      <img
        :src="fotoDelDia(activo)"
        :alt="`Uno de los platos del día ${activo}`"
        class="tarjeta__foto"
        loading="lazy"
      />

      <div class="tarjeta__cuerpo">
        <p class="tarjeta__dia">
          Día {{ activo }}
          <span v-if="esDePierna(activo)" class="tarjeta__pierna">
            <FaIcon icon="dumbbell" /> Día de pierna
          </span>
        </p>

        <div v-for="c in dia.comidas" :key="c.tipo" class="comida">
          <p class="comida__tipo">{{ c.tipo }}</p>
          <p class="comida__texto">{{ c.texto }}</p>
        </div>
      </div>
    </article>
  </div>
</template>

<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.menu__dias {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.dia {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid $sand;
  border-radius: 50%;
  background-color: $cream;
  font-family: $font-display;
  font-size: $text-base;
  color: $ink-soft;
  cursor: pointer;
  transition: background-color 0.2s $ease, color 0.2s $ease;

  &:hover {
    background-color: $sand;
  }

  @include focus-ring;
}

.dia--activo {
  border-color: $ink;
  background-color: $ink;
  color: $cream;
}

.dia__pierna {
  position: absolute;
  bottom: 5px;
  font-size: 1.1rem;
  line-height: 0;
  color: $rose;
}

.dia--activo .dia__pierna {
  color: $rose-soft;
}

/* La foto manda arriba en el teléfono y a la izquierda cuando hay ancho. */
.tarjeta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: $radius-lg;
  background-color: $cream;

  @include from('md') {
    flex-direction: row;
    align-items: stretch;
  }
}

.tarjeta__foto {
  width: 100%;
  height: 200px;
  object-fit: cover;

  @include from('md') {
    flex: 0 0 38%;
    height: auto;
    max-width: 38%;
  }
}

.tarjeta__cuerpo {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.75rem;
  padding: clamp(1rem, 3vw, 1.4rem);
}

.tarjeta__dia {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.tarjeta__pierna {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  font-family: $font-principal;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $wine;
}

.comida__tipo {
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $rose-deep;
}

.comida__texto {
  margin-top: 0.2rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink;
}
</style>
