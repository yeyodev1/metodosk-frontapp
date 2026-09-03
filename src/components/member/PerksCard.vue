<script setup lang="ts">
/**
 * Lo que se lleva por haber comprado en pre-venta.
 *
 * Se pinta distinto según **cuándo** compró, y ese corte lo decide el servidor:
 * si lo decidiera esta pantalla, bastaría cambiar el reloj del teléfono para
 * reclamar un beneficio de pre-venta comprando en diciembre.
 *
 * Lo que hoy está prometido se dice como promesa con fecha, no como si ya
 * estuviera abierto. Un beneficio que se anuncia disponible y no lo está es
 * peor que no anunciarlo.
 */
import { PREVENTA } from '@/config/preventa'
import type { Beneficios } from '@/services/perksService'
import { BRAND } from '@/config/site'

defineProps<{ beneficios: Beneficios }>()
</script>

<template>
  <section class="ben">
    <header class="ben__head">
      <p class="ben__eyebrow">{{ PREVENTA.beneficios.eyebrow }}</p>
      <h2 class="ben__title">{{ PREVENTA.beneficios.titulo }}</h2>
    </header>

    <div class="ben__lista">
      <!-- Telegram: incluido o con costo, según cuándo compró -->
      <article class="perk" :class="{ 'perk--fuera': !beneficios.telegramIncluido }">
        <span class="perk__icono"><FaIcon :icon="PREVENTA.beneficios.telegram.icono" /></span>
        <div class="perk__cuerpo">
          <p class="perk__title">
            {{ PREVENTA.beneficios.telegram.titulo }}
            <span v-if="beneficios.telegramIncluido" class="perk__sello">Incluido</span>
            <span v-else class="perk__sello perk__sello--gris">Costo aparte</span>
          </p>
          <p class="perk__texto">
            {{
              beneficios.telegramIncluido
                ? PREVENTA.beneficios.telegram.incluido
                : PREVENTA.beneficios.telegram.fuera
            }}
          </p>
          <p v-if="beneficios.telegramIncluido" class="perk__pie">
            <FaIcon icon="clock" /> {{ PREVENTA.beneficios.telegram.pie }}
          </p>
          <a
            v-else
            class="perk__cta"
            :href="BRAND.whatsapp"
            target="_blank"
            rel="noopener"
          >
            Preguntar cómo sumarme <FaIcon icon="arrow-right" />
          </a>
        </div>
      </article>

      <!-- El grupo con ellas dos: solo si compró en pre-venta -->
      <article v-if="beneficios.grupoPremium" class="perk perk--destacada">
        <span class="perk__icono"><FaIcon :icon="PREVENTA.beneficios.premium.icono" /></span>
        <div class="perk__cuerpo">
          <p class="perk__title">
            {{ PREVENTA.beneficios.premium.titulo }}
            <span class="perk__sello">Se abre pronto</span>
          </p>
          <p class="perk__texto">{{ PREVENTA.beneficios.premium.texto }}</p>
          <p class="perk__pie"><FaIcon icon="lock" /> {{ PREVENTA.beneficios.premium.pie }}</p>
        </div>
      </article>

      <!-- Lo que hace falta para entrenar en casa -->
      <article class="perk">
        <span class="perk__icono"><FaIcon :icon="PREVENTA.equipo.icono" /></span>
        <div class="perk__cuerpo">
          <p class="perk__title">{{ PREVENTA.equipo.titulo }}</p>
          <p class="perk__texto">{{ PREVENTA.equipo.texto }}</p>
          <ul class="perk__equipo">
            <li v-for="item in PREVENTA.equipo.lista" :key="item">
              <FaIcon icon="check" /> {{ item }}
            </li>
          </ul>
          <p class="perk__pie">{{ PREVENTA.equipo.pie }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.ben__head {
  margin-bottom: 0.9rem;
}

.ben__eyebrow {
  @include eyebrow;
}

.ben__title {
  font-family: $font-display;
  font-size: $text-xl;
  line-height: 1.15;
  color: $ink;
}

.ben__lista {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.perk {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: clamp(1rem, 3vw, 1.35rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

/* El grupo con ellas dos es el que importa: se pinta como el premio que es. */
.perk--destacada {
  background-color: $ink;

  .perk__title {
    color: $cream;
  }

  .perk__texto {
    color: rgba($cream, 0.7);
  }

  .perk__pie {
    color: rgba($cream, 0.5);
  }

  .perk__icono {
    background-color: $rose-soft;
    color: $ink;
  }
}

.perk--fuera .perk__icono {
  background-color: $sand;
  color: $ink-muted;
}

.perk__icono {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
  font-size: 0.9rem;
}

.perk__cuerpo {
  min-width: 0;
}

.perk__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.perk__sello {
  padding: 0.1rem 0.55rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  font-family: $font-principal;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $wine;
}

.perk__sello--gris {
  background-color: $sand;
  color: $ink-muted;
}

.perk__texto {
  margin-top: 0.25rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.perk__equipo {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.6rem;
  list-style: none;

  li {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.75rem;
    border-radius: $radius-pill;
    background-color: $bone;
    font-size: $text-xs;
    font-weight: 600;
    color: $ink;

    svg {
      font-size: 0.7em;
      color: $rose-deep;
    }
  }
}

.perk__pie {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.55rem;
  font-size: $text-xs;
  color: $ink-muted;

  svg {
    font-size: 0.9em;
  }
}

.perk__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.6rem;
  padding: 0.45rem 1rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink;
  transition: background-color 0.26s $ease;

  &:hover {
    background-color: $clay;
  }
}
</style>
