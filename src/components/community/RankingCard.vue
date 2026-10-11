<script setup lang="ts">
/**
 * Las destacadas del mes: el top 10 por puntos del mes, con el premio arriba.
 *
 * Por mes y no de todo el reto: si el ranking fuera del total, quien entra en
 * noviembre nunca alcanzaría a quien empezó en septiembre, y un ranking que no
 * se puede ganar no motiva a nadie. Cada mes arranca en cero.
 */
import type { MisPuntos } from '@/services/communityService'

defineProps<{ datos: MisPuntos }>()

const MEDALLAS = ['🥇', '🥈', '🥉']
</script>

<template>
  <section class="card">
    <header class="card__cab">
      <p class="card__eyebrow"><FaIcon icon="trophy" /> Destacadas de {{ datos.mes }}</p>
      <p class="card__premio">{{ datos.premio }}</p>
    </header>

    <ol v-if="datos.ranking.length" class="lista">
      <li
        v-for="r in datos.ranking"
        :key="r.posicion"
        class="fila"
        :class="{ 'fila--yo': r.yo, 'fila--podio': r.posicion <= 3 }"
      >
        <span class="fila__pos">{{ MEDALLAS[r.posicion - 1] ?? r.posicion }}</span>
        <span class="fila__avatar">
          <img v-if="r.avatarUrl" :src="r.avatarUrl" :alt="`Foto de ${r.nombre}`" />
          <span v-else>{{ r.inicial }}</span>
        </span>
        <span class="fila__quien">
          <span class="fila__nombre">{{ r.nombre }}<template v-if="r.yo"> (tú)</template></span>
          <span class="fila__nivel">{{ r.nivel }}</span>
        </span>
        <span class="fila__pts">{{ r.puntos }}</span>
      </li>
    </ol>
    <p v-else class="vacio">Todavía nadie suma puntos este mes. Termina una clase y estrena el ranking.</p>
  </section>
</template>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.2rem;
  border: 1px solid $sand;
  border-radius: $radius-lg;
  background-color: $white;
}

.card__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-family: $font-display;
  font-size: 1.2rem;
  color: $ink;

  &::first-letter {
    text-transform: uppercase;
  }

  svg {
    color: $wine;
    font-size: 0.85em;
  }
}

.card__premio {
  margin-top: 0.3rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  list-style: none;
}

.fila {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.5rem;
  border-radius: $radius-md;
}

.fila--podio {
  background-color: $cream;
}

.fila--yo {
  box-shadow: inset 0 0 0 1.5px $wine;
}

.fila__pos {
  flex: none;
  width: 1.6rem;
  font-size: $text-sm;
  font-weight: 600;
  text-align: center;
  color: $ink-muted;
}

.fila--podio .fila__pos {
  font-size: 1.15rem;
}

.fila__avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 50%;
  background-color: $rose-soft;
  font-family: $font-display;
  font-size: $text-sm;
  color: $wine;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.fila__quien {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.fila__nombre {
  overflow: hidden;
  font-size: $text-sm;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: $ink;
}

.fila__nivel {
  font-size: 0.68rem;
  color: $ink-muted;
}

.fila__pts {
  flex: none;
  font-family: $font-display;
  font-size: $text-base;
  color: $wine;

  &::after {
    content: ' pts';
    font-family: $font-principal;
    font-size: 0.68rem;
    color: $ink-muted;
  }
}

.vacio {
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-muted;
}
</style>
