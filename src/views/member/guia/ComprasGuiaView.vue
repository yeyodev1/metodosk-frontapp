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
 */
import { ref } from 'vue'
import GuiaSeccion from '@/components/member/GuiaSeccion.vue'
import { useGuia, imagenDeCompras } from '@/composables/useGuia'

const { guia } = useGuia()
const abierta = ref<string | null>(null)

const alternar = (titulo: string) => {
  abierta.value = abierta.value === titulo ? null : titulo
}
</script>

<template>
  <GuiaSeccion v-if="guia" titulo="Lista de compras" :sub="guia.listaCompras.nota">
    <ul class="categorias">
      <li v-for="c in guia.listaCompras.categorias" :key="c.titulo">
        <button
          type="button"
          class="cat"
          :class="{ 'cat--abierta': abierta === c.titulo }"
          :aria-expanded="abierta === c.titulo"
          @click="alternar(c.titulo)"
        >
          <span>{{ c.titulo }}</span>
          <FaIcon :icon="abierta === c.titulo ? 'xmark' : 'arrow-right'" />
        </button>

        <div v-if="abierta === c.titulo" class="hojas">
          <img
            v-for="(id, i) in c.imagenes"
            :key="id"
            :src="imagenDeCompras(id)"
            :alt="`${c.titulo}, marcas recomendadas (${i + 1} de ${c.imagenes.length})`"
            loading="lazy"
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
