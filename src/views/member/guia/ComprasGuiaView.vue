<script setup lang="ts">
/**
 * La lista de compras: qué marca comprar, por país.
 *
 * Va en imagen y no en texto porque en la guía de Karen las marcas solo
 * existen como fotos de producto agrupadas bajo cada bandera. Recortarlas una
 * por una perdería a qué país corresponde cada una, que es justo lo que hace
 * falta saber parada en el supermercado.
 *
 * Se abre una categoría a la vez: son catorce y cada una son dos páginas, así
 * que mostrarlas todas juntas sería bajar medio metro de fotos para llegar al
 * hummus.
 *
 * Los productos que Karen suma con el menú de cada mes van primero, marcados
 * con su mes: son los que hacen falta para los platos nuevos. Llegan solo
 * cuando el menú de ese mes ya está abierto.
 */
import { computed, ref } from 'vue'
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import GuiaImagen from '@/components/member/GuiaImagen.vue'
import { useGuia, imagenDeCompras } from '@/composables/useGuia'

const { guia } = useGuia()
const abierta = ref<string | null>(null)

const categorias = computed(() => {
  const g = guia.value
  if (!g) return []
  const nuevas = [...(g.menus ?? [])]
    .sort((a, b) => b.mes - a.mes)
    .flatMap((m) => (m.compras ?? []).map((c) => ({ ...c, mes: m.mes as number | null })))
  return [...nuevas, ...g.listaCompras.categorias.map((c) => ({ ...c, mes: null }))]
})

const alternar = (titulo: string) => {
  abierta.value = abierta.value === titulo ? null : titulo
}
</script>

<template>
  <GuiaSeccion v-if="guia" titulo="Lista de compras" :sub="guia.listaCompras.nota">
    <ul class="categorias">
      <li v-for="c in categorias" :key="c.titulo">
        <button
          type="button"
          class="cat"
          :class="{ 'cat--abierta': abierta === c.titulo }"
          :aria-expanded="abierta === c.titulo"
          @click="alternar(c.titulo)"
        >
          <span class="cat__nombre">
            {{ c.titulo }}
            <span v-if="c.mes" class="cat__nuevo">Nuevo · Mes {{ c.mes }}</span>
          </span>
          <FaIcon :icon="abierta === c.titulo ? 'xmark' : 'arrow-right'" />
        </button>

        <div v-if="abierta === c.titulo" class="hojas">
          <GuiaImagen
            v-for="(id, i) in c.imagenes"
            :key="id"
            :src="imagenDeCompras(id)"
            :alt="`${c.titulo}, marcas recomendadas (${i + 1} de ${c.imagenes.length})`"
          />
        </div>
      </li>
    </ul>

    <p class="ayuda">{{ guia.listaCompras.ayuda }}</p>
  </GuiaSeccion>
</template>

<style lang="scss" scoped>
.categorias {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  list-style: none;
}

.cat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  width: 100%;
  padding: 0.9rem 1.1rem;
  border: none;
  border-radius: $radius-md;
  background-color: $cream;
  font-family: inherit;
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s $ease;

  &:hover {
    background-color: $sand;
  }

  svg {
    flex: none;
    color: $rose-deep;
  }

  @include focus-ring;
}

.cat__nombre {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.cat__nuevo {
  padding: 0.12rem 0.55rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: $ink;
}

.cat--abierta {
  border-radius: $radius-md $radius-md 0 0;
  background-color: $ink;
  color: $cream;

  svg {
    color: $rose-soft;
  }
}

.hojas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0 0 $radius-md $radius-md;
  background-color: $cream;

  img {
    flex: 1 1 260px;
    max-width: 100%;
    border-radius: $radius-sm;
    background-color: $bone;
  }
}

.ayuda {
  margin-top: 0.4rem;
  padding-left: 0.9rem;
  border-left: 2px solid $rose;
  font-size: $text-xs;
  line-height: 1.55;
  color: $ink-muted;
}
</style>
