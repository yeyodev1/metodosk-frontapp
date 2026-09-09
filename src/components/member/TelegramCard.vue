<script setup lang="ts">
/**
 * La puerta a los grupos de Telegram.
 *
 * La entrada la da el bot conversando: la alumna le escribe su correo y él,
 * si le toca, le manda un enlace personal de un solo uso. Esta tarjeta solo
 * le explica eso y la lleva al bot — nada de lo que decide pasa por acá.
 *
 * Quién ve qué lo decide el servidor: un grupo sin abrir no llega, y uno que
 * no le toca llega marcado para pintar el costo aparte.
 */
import { onMounted, ref } from 'vue'
import telegramService, { type EstadoTelegram } from '@/services/telegramService'
import { TELEGRAM, BOT_URL } from '@/config/telegram'

const estado = ref<EstadoTelegram | null>(null)

onMounted(async () => {
  try {
    estado.value = await telegramService.estado()
  } catch {
    estado.value = { vinculado: null, grupos: [] }
  }
})
</script>

<template>
  <section v-if="estado" class="tg">
    <header class="tg__head">
      <span class="tg__icono"><FaIcon :icon="['fab', 'telegram']" /></span>
      <div class="tg__texto">
        <p class="tg__eyebrow">{{ TELEGRAM.eyebrow }}</p>
        <h2 class="tg__title">{{ TELEGRAM.titulo }}</h2>
        <p class="tg__intro">{{ estado.grupos.length ? TELEGRAM.intro : TELEGRAM.cerrado }}</p>
      </div>
    </header>

    <template v-if="estado.grupos.length">
      <ul class="grupos">
        <li
          v-for="g in estado.grupos"
          :key="g.id"
          class="grupo"
          :class="{ 'grupo--vip': g.id === 'premium', 'grupo--fuera': !g.incluido }"
        >
          <p class="grupo__title">
            {{ g.titulo }}
            <span v-if="g.incluido" class="grupo__sello">Incluido</span>
            <span v-else class="grupo__sello grupo__sello--gris">Costo aparte</span>
          </p>
          <p class="grupo__texto">{{ g.incluido ? g.texto : TELEGRAM.fuera }}</p>
        </li>
      </ul>

      <!-- Le toca al menos uno: el camino es el bot -->
      <div v-if="estado.grupos.some((g) => g.incluido)" class="tg__accion">
        <ol class="pasos">
          <li v-for="paso in TELEGRAM.pasos" :key="paso">{{ paso }}</li>
        </ol>
        <a class="btn" :href="BOT_URL" target="_blank" rel="noopener">
          <FaIcon :icon="['fab', 'telegram']" /> {{ TELEGRAM.abrir }}
        </a>
        <p v-if="estado.vinculado" class="tg__vinculado">
          <FaIcon icon="check" /> {{ TELEGRAM.vinculado(estado.vinculado) }}
        </p>
      </div>

      <!-- No le toca ninguno -->
      <div v-else class="tg__accion">
        <a class="btn btn--suave" :href="TELEGRAM.fueraUrl" target="_blank" rel="noopener">
          <FaIcon :icon="['fab', 'instagram']" /> {{ TELEGRAM.fueraCta }}
        </a>
      </div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.tg {
  margin-bottom: $space-md;
  padding: 1.5rem;
  border-radius: $radius-lg;
  background-color: $cream;
}

.tg__head {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}

.tg__icono {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
  font-size: 1.1rem;
}

.tg__texto {
  min-width: 0;
}

.tg__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.tg__title {
  font-family: $font-display;
  font-size: 1.35rem;
  line-height: 1.2;
  color: $ink;
}

.tg__intro {
  max-width: 54ch;
  margin-top: 0.25rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.grupos {
  @include flex-cards(240px, 0.7rem);
  margin-top: 1.2rem;
  list-style: none;
}

.grupo {
  padding: 1rem 1.2rem;
  border-radius: $radius-md;
  background-color: $bone;
}

/* El grupo con ellas dos es el premio: se pinta como tal. */
.grupo--vip {
  background-color: $ink;

  .grupo__title {
    color: $cream;
  }

  .grupo__texto {
    color: rgba($cream, 0.7);
  }
}

.grupo--fuera {
  background-color: $sand;
}

.grupo__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.grupo__sello {
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

.grupo__sello--gris {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}

.grupo__texto {
  margin-top: 0.25rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.tg__accion {
  margin-top: 1.2rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba($ink, 0.08);
}

.pasos {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0 0 1rem;
  padding-left: 1.2rem;
  font-size: $text-sm;
  line-height: 1.5;
  color: $ink-soft;

  li::marker {
    font-weight: 600;
    color: $rose-deep;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.4rem;
  border-radius: $radius-pill;
  background-color: $rose-deep;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $cream;
  transition:
    background-color 0.26s $ease,
    transform 0.26s $ease;

  @include focus-ring;

  &:hover {
    background-color: $wine;
    transform: translateY(-1px);
  }
}

.btn--suave {
  background-color: $rose-soft;
  color: $ink;

  &:hover {
    background-color: $clay;
  }
}

.tg__vinculado {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  max-width: 54ch;
  margin-top: 0.8rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-muted;

  svg {
    margin-top: 0.2em;
    color: $rose-deep;
  }
}
</style>
