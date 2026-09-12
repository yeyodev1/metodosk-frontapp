<script setup lang="ts">
/**
 * Tu guía de nutrición.
 *
 * Es el material de Karen convertido en pantallas, no en un archivo: cada
 * sección es su propia ruta y se entra directo a la que hace falta. Antes era
 * un scroll de siete secciones seguidas y encontrar la tabla de carbohidratos
 * costaba medio minuto.
 *
 * Qué guía se muestra lo decide el servidor por el reto comprado; esta vista
 * solo elige cuál de las dos ver si compró las dos.
 */
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useGuia } from '@/composables/useGuia'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const { guias, guia, elegida, cargando, error, cargar } = useGuia()

const SECCIONES = [
  { to: '/guia/menu', nombre: 'Menú' },
  { to: '/guia/snacks', nombre: 'Snacks' },
  { to: '/guia/arma-tu-plato', nombre: 'Arma tu plato' },
  { to: '/guia/intercambios', nombre: 'Intercambios' },
  { to: '/guia/condimentos', nombre: 'Condimentos' },
  { to: '/guia/compras', nombre: 'Compras' },
  { to: '/guia/meal-prep', nombre: 'Meal prep' },
  { to: '/guia/suplementos', nombre: 'Suplementos' },
]

onMounted(cargar)
</script>

<template>
  <div class="guia">
    <p v-if="cargando" class="aviso">Abriendo tu guía…</p>
    <p v-else-if="error" class="aviso">{{ error }}</p>
    <p v-else-if="!guia" class="aviso">Todavía no hay una guía para tu reto.</p>

    <template v-else>
      <header class="cab">
        <p class="cab__eyebrow">{{ guia.reto }}</p>
        <h1 class="cab__title">{{ guia.titulo }}</h1>

        <div v-if="guias.length > 1" class="cab__cambio">
          <button
            v-for="(g, i) in guias"
            :key="g.audiencia"
            type="button"
            class="cab__reto"
            :class="{ 'cab__reto--activo': i === elegida }"
            @click="elegida = i"
          >
            {{ g.reto }}
          </button>
        </div>
      </header>

      <nav class="nav" aria-label="Secciones de la guía">
        <RouterLink v-for="s in SECCIONES" :key="s.to" :to="s.to" class="nav__item">
          {{ s.nombre }}
        </RouterLink>
      </nav>

      <RouterView />

      <p class="firma">Tu copia · {{ session.user?.email }} — es tuya, no la compartas.</p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.guia {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  max-width: 62rem;
  padding: 4.2rem clamp(1rem, 3vw, 2.5rem) 4rem;

  @include from('lg') {
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
  }
}

.aviso {
  padding: 2rem 0;
  font-size: $text-sm;
  color: $ink-muted;
}

.cab__eyebrow {
  @include eyebrow;
}

.cab__title {
  margin-top: 0.3rem;
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.cab__cambio {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.8rem;
}

.cab__reto {
  padding: 0.45rem 1rem;
  border: 1px solid $sand;
  border-radius: $radius-pill;
  background-color: transparent;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-soft;
  cursor: pointer;
}

.cab__reto--activo {
  border-color: $ink;
  background-color: $ink;
  color: $cream;
}

/* La barra de secciones: en el teléfono se desliza, no se apila. */
.nav {
  display: flex;
  gap: 0.4rem;
  margin: 0.4rem -1rem 0.6rem;
  padding: 0 1rem 0.3rem;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.nav__item {
  flex: none;
  padding: 0.45rem 0.95rem;
  border-radius: $radius-pill;
  background-color: $cream;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-soft;
  white-space: nowrap;
  transition: background-color 0.2s $ease, color 0.2s $ease;

  &:hover {
    background-color: $sand;
  }

  @include focus-ring;
}

.nav__item.router-link-active {
  background-color: $ink;
  color: $cream;
}

.firma {
  margin-top: $space-md;
  padding-top: 1rem;
  border-top: 1px solid $sand;
  font-size: $text-xs;
  color: $ink-muted;
}
</style>
