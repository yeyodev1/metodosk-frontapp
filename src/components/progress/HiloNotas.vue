<script setup lang="ts">
/**
 * La conversación sobre el avance: lo que escribe el equipo y lo que contesta
 * ella.
 *
 * La misma pieza la ven las dos partes, desde su lado. Lo del equipo se pinta
 * como una carta firmada —es una recomendación personal, no un comentario de
 * muro— y lo de ella como una respuesta más liviana, del otro lado.
 *
 * `resaltada` es la nota a la que llevó el correo: se marca para que al
 * llegar se vea cuál es, sin tener que buscarla.
 */
import type { Nota } from '@/services/avancesService'
import '@/plugins/icons'

const props = defineProps<{
  notas: Nota[]
  /** Desde qué lado se mira: cambia qué es "nuevo" y qué se puede hacer. */
  lado: 'alumna' | 'equipo'
  resaltada?: string | null
}>()

const emit = defineEmits<{ borrar: [nota: Nota] }>()

function cuando(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function dia(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'long' })
}

/** Nuevo = lo escribió la otra parte y todavía no lo abrió quien mira. */
function esNueva(n: Nota) {
  if (n.leidaEl) return false
  return props.lado === 'alumna' ? n.fromStaff : !n.fromStaff
}
</script>

<template>
  <ol class="hilo">
    <li
      v-for="n in notas"
      :id="`nota-${n.id}`"
      :key="n.id"
      class="nota"
      :class="{
        'nota--equipo': n.fromStaff,
        'nota--ella': !n.fromStaff,
        'nota--resaltada': n.id === resaltada,
      }"
    >
      <template v-if="n.fromStaff">
        <header class="nota__head">
          <span class="firma" :class="{ 'firma--larga': n.autor.inicial.length > 1 }">
            {{ n.autor.inicial }}
          </span>
          <span class="nota__quien">
            <strong>{{ n.autor.nombre }}</strong>
            <span>{{ n.autor.rol }} · {{ cuando(n.createdAt) }}</span>
          </span>
          <span v-if="esNueva(n)" class="nueva">Nuevo</span>
        </header>

        <p v-if="n.tomaDel" class="nota__toma">
          <FaIcon icon="camera" />
          {{ lado === 'alumna' ? 'Sobre tus fotos' : 'Sobre sus fotos' }} del {{ dia(n.tomaDel) }}
        </p>

        <p class="nota__texto">{{ n.body }}</p>

        <footer v-if="lado === 'equipo'" class="nota__pie">
          <span v-if="n.avisoEnviadoEl" class="estado estado--ok">
            <FaIcon icon="envelope" /> Correo enviado
          </span>
          <span v-else class="estado estado--espera">
            <FaIcon icon="clock" /> Correo pendiente, se reintenta solo
          </span>
          <span v-if="n.leidaEl" class="estado estado--ok">
            <FaIcon icon="check-double" /> Lo leyó el {{ dia(n.leidaEl) }}
          </span>
          <span v-else class="estado">Sin leer todavía</span>
          <button type="button" class="quitar" @click="emit('borrar', n)">
            <FaIcon icon="trash" /> Quitar
          </button>
        </footer>
      </template>

      <template v-else>
        <p class="nota__quien nota__quien--ella">
          <strong>{{ lado === 'alumna' ? 'Tú' : n.autor.nombre }}</strong>
          <span>{{ cuando(n.createdAt) }}</span>
          <span v-if="esNueva(n)" class="nueva">Nueva</span>
        </p>
        <p class="nota__texto">{{ n.body }}</p>
      </template>
    </li>
  </ol>
</template>

<style lang="scss" scoped>
.hilo {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  list-style: none;
}

.nota {
  scroll-margin-top: 5.5rem;
  border-radius: $radius-md;
  transition: box-shadow 0.4s $ease;
}

/* ── La carta del equipo ── */
.nota--equipo {
  position: relative;
  padding: clamp(1.1rem, 3vw, 1.5rem);
  border: 1px solid rgba($rose, 0.22);
  background: linear-gradient(180deg, rgba($rose-soft, 0.55), $cream 70%);
}

.nota__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.firma {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: $ink;
  color: $rose-soft;
  font-family: $font-display;
  font-size: 1.15rem;
  font-style: italic;
}

.firma--larga {
  font-size: 0.8rem;
}

.nota__quien {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  font-size: $text-sm;
  color: $ink;

  span {
    font-size: $text-xs;
    color: $ink-muted;
  }
}

.nota__quien--ella {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.6rem;
}

.nueva {
  margin-left: auto;
  padding: 0.15rem 0.6rem;
  border-radius: $radius-pill;
  background-color: $wine;
  color: $cream !important;
  font-size: 0.66rem !important;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.nota__toma {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.85rem;
  padding: 0.2rem 0.7rem;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.05);
  font-size: $text-xs;
  color: $ink-soft;
}

.nota__texto {
  margin-top: 0.7rem;
  font-size: $text-base;
  line-height: 1.65;
  color: $ink-soft;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.nota__pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  margin-top: 0.9rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba($ink, 0.07);
}

.estado {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: $text-xs;
  color: $ink-muted;
}

.estado--ok {
  color: #4a7a45;
}

.estado--espera {
  color: #8a6410;
}

.quitar {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: auto;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink-muted;
  cursor: pointer;
  transition: color 0.24s $ease;

  &:hover {
    color: $alert-error;
  }

  @include focus-ring;
}

/* ── Su respuesta ── */
.nota--ella {
  align-self: flex-end;
  width: min(100%, 520px);
  padding: 0.9rem 1.1rem;
  background-color: $sand;

  .nota__texto {
    margin-top: 0.35rem;
    font-size: $text-sm;
  }
}

/* ── La nota a la que llevó el correo ── */
.nota--resaltada {
  box-shadow: 0 0 0 2px $rose, 0 18px 40px rgba($rose-deep, 0.18);
  animation: llegada 1.6s $ease 0.3s both;
}

@keyframes llegada {
  0% {
    box-shadow: 0 0 0 0 rgba($rose, 0.6);
  }
  40% {
    box-shadow: 0 0 0 10px rgba($rose, 0);
  }
  100% {
    box-shadow: 0 0 0 2px $rose, 0 18px 40px rgba($rose-deep, 0.18);
  }
}

@include reduced-motion {
  .nota--resaltada {
    animation: none;
  }
}
</style>
