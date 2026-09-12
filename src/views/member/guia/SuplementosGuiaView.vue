<script setup lang="ts">
/**
 * Los suplementos: para qué sirven, cuándo tomarlos y dónde conseguirlos.
 *
 * Las marcas van en foto porque en la guía de Karen solo existen así, igual
 * que en la lista de compras. La precaución se pinta aparte y en vino: es lo
 * único de esta pantalla que puede hacer daño si se pasa por alto.
 */
import { ref } from 'vue'
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import GuiaImagen from '@/components/member/GuiaImagen.vue'
import { useGuia, imagenDeCompras } from '@/composables/useGuia'

const { guia } = useGuia()
const abierto = ref<string | null>(null)

const alternar = (nombre: string) => {
  abierto.value = abierto.value === nombre ? null : nombre
}
</script>

<template>
  <GuiaSeccion
    v-if="guia"
    titulo="Suplementación"
    sub="Se individualiza según tu alimentación, tus antecedentes y, cuando corresponda, exámenes y valoración profesional."
  >
    <article v-for="s in guia.suplementos" :key="s.nombre" class="supl">
      <h2 class="supl__nombre">{{ s.nombre }}</h2>

      <p class="supl__label">¿Para quién puede ser útil?</p>
      <ul class="supl__lista">
        <li v-for="q in s.paraQuien" :key="q">{{ q }}</li>
      </ul>

      <p class="supl__label">¿Cuándo tomarlo?</p>
      <p class="supl__texto">{{ s.cuando }}</p>

      <p class="supl__precaucion">
        <FaIcon icon="circle-exclamation" />
        {{ s.precaucion }}
      </p>

      <div v-if="s.dondeComprar.length" class="tiendas">
        <span v-for="t in s.dondeComprar" :key="t">{{ t }}</span>
      </div>

      <template v-if="s.imagenes.length">
        <button type="button" class="marcas" @click="alternar(s.nombre)">
          <FaIcon :icon="abierto === s.nombre ? 'xmark' : 'book-open'" />
          {{ abierto === s.nombre ? 'Cerrar' : 'Ver las marcas' }}
        </button>

        <div v-if="abierto === s.nombre" class="hojas">
          <GuiaImagen
            v-for="(id, i) in s.imagenes"
            :key="id"
            :src="imagenDeCompras(id)"
            :alt="`Marcas de ${s.nombre} (${i + 1} de ${s.imagenes.length})`"
          />
        </div>
      </template>
    </article>
  </GuiaSeccion>
</template>

<style lang="scss" scoped>
.supl {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.1rem 1.2rem;
  border-radius: $radius-md;
  background-color: $cream;

  & + & {
    margin-top: 0.6rem;
  }
}

.supl__nombre {
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.supl__label {
  margin-top: 0.5rem;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $ink-muted;
}

.supl__lista {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  list-style: none;

  li {
    font-size: $text-xs;
    line-height: 1.5;
    color: $ink-soft;
  }
}

.supl__texto {
  font-size: $text-xs;
  line-height: 1.55;
  color: $ink-soft;
}

.supl__precaucion {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px solid $bone;
  font-size: $text-xs;
  line-height: 1.5;
  color: $wine;

  svg {
    flex: none;
    margin-top: 0.2em;
  }
}

.tiendas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.7rem;

  span {
    padding: 0.25rem 0.7rem;
    border-radius: $radius-pill;
    background-color: $bone;
    font-size: 0.68rem;
    font-weight: 600;
    color: $ink-soft;
  }
}

.marcas {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  align-self: flex-start;
  margin-top: 0.7rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $cream;
  cursor: pointer;

  svg {
    color: $rose-soft;
  }

  @include focus-ring;
}

.hojas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.6rem;

  img {
    flex: 1 1 240px;
    max-width: 100%;
    border-radius: $radius-sm;
    background-color: $bone;
  }
}
</style>
