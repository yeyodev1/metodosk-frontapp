<script setup lang="ts">
/**
 * La puerta a los grupos de Telegram.
 *
 * La entrada la da el bot: el botón lo abre con la llave de la alumna, así
 * que la reconoce al primer toque y le manda su enlace sin pedirle nada.
 * Por si abre Telegram por su cuenta, se le muestra el correo exacto que el
 * bot espera — el de la compra, que no siempre es el que usa a diario.
 *
 * Quién ve qué lo decide el servidor: un grupo sin abrir no llega, y uno que
 * no le toca llega marcado para pintar el costo aparte.
 */
import { onMounted, ref } from 'vue'
import telegramService, { type EstadoTelegram } from '@/services/telegramService'
import { TELEGRAM, BOT_URL_GENERICO } from '@/config/telegram'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()

/**
 * La tarjeta se pinta desde el primer cuadro, con su esqueleto, y se rellena
 * cuando llega el servidor. Antes esperaba la respuesta para aparecer: la
 * alumna veía primero las mancuernas y la puerta al grupo "no cargaba".
 */
const estado = ref<EstadoTelegram | null>(null)
const cargando = ref(true)

onMounted(async () => {
  try {
    estado.value = await telegramService.estado()
  } catch {
    // Si el servidor no responde, la puerta sigue abierta: el bot sin llave
    // hace el mismo trabajo, solo que le pide el correo.
    estado.value = {
      vinculado: null,
      correo: session.user?.email ?? '',
      botUrl: BOT_URL_GENERICO,
      grupos: [
        {
          id: 'comunidad',
          titulo: 'Comunidad en Telegram',
          texto: 'El grupo grande del reto: todas las alumnas, el equipo y los avisos de cada semana.',
          incluido: true,
        },
      ],
    }
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <section class="tg" :class="{ 'tg--cerrado': estado && !estado.grupos.length }">
    <header class="tg__head">
      <span class="tg__icono"><FaIcon :icon="['fab', 'telegram']" /></span>
      <div class="tg__texto">
        <p class="tg__eyebrow">{{ TELEGRAM.eyebrow }}</p>
        <h2 class="tg__title">{{ TELEGRAM.titulo }}</h2>
        <p class="tg__intro">
          {{ !estado || estado.grupos.length ? TELEGRAM.intro : TELEGRAM.cerrado }}
        </p>
      </div>
    </header>

    <!-- Esqueleto mientras llega el servidor: ocupa el sitio, nada salta -->
    <div v-if="cargando" class="esqueleto" aria-hidden="true">
      <span class="esqueleto__linea" />
      <span class="esqueleto__boton" />
      <span class="esqueleto__linea esqueleto__linea--corta" />
    </div>

    <Transition name="aparece" appear>
    <div v-if="estado && estado.grupos.length" class="tg__cuerpo">
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
        <a class="cta" :href="estado.botUrl" target="_blank" rel="noopener">
          <span class="cta__icono"><FaIcon :icon="['fab', 'telegram']" /></span>
          <span class="cta__texto">
            <span class="cta__label">{{ TELEGRAM.abrir }}</span>
            <span class="cta__hint">Se abre @metodosk_bot en Telegram</span>
          </span>
          <FaIcon icon="arrow-right" class="cta__flecha" />
        </a>

        <div class="correo">
          <p class="correo__titulo">{{ TELEGRAM.correoTitulo }}</p>
          <p class="correo__valor">{{ estado.correo }}</p>
          <p class="correo__nota">{{ TELEGRAM.correoNota }}</p>
        </div>

        <ol class="pasos">
          <li v-for="paso in TELEGRAM.pasos" :key="paso">{{ paso }}</li>
        </ol>

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
    </div>
    </Transition>
  </section>
</template>

<style lang="scss" scoped>
/* La tarjeta que más se busca en esta pantalla: se pinta como el premio. */
.tg {
  margin-bottom: $space-md;
  padding: clamp(1.4rem, 3vw, 2rem);
  border-radius: $radius-lg;
  background-color: $ink;
  color: $cream;
}

.tg--cerrado {
  background-color: $cream;
  color: $ink;

  .tg__title {
    color: $ink;
  }

  .tg__intro {
    color: $ink-soft;
  }
}

.tg__head {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.tg__icono {
  display: grid;
  place-items: center;
  flex: none;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $ink;
  font-size: 1.35rem;
}

.tg__texto {
  min-width: 0;
}

.tg__eyebrow {
  @include eyebrow;
  color: $rose-soft;
}

.tg__title {
  font-family: $font-display;
  font-size: clamp(1.5rem, 3vw, 1.9rem);
  line-height: 1.1;
  color: $cream;
}

.tg__intro {
  max-width: 54ch;
  margin-top: 0.4rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: rgba($cream, 0.75);
}

.grupos {
  @include flex-cards(240px, 0.7rem);
  margin-top: 1.3rem;
  list-style: none;
}

.grupo {
  padding: 1rem 1.2rem;
  border-radius: $radius-md;
  background-color: rgba($cream, 0.08);
}

.grupo--vip {
  background-color: rgba($rose-soft, 0.16);
}

.grupo--fuera {
  background-color: rgba($cream, 0.04);
}

.grupo__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  font-family: $font-display;
  font-size: $text-base;
  color: $cream;
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
  color: $ink;
}

.grupo__sello--gris {
  background-color: rgba($cream, 0.14);
  color: rgba($cream, 0.7);
}

.grupo__texto {
  margin-top: 0.25rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: rgba($cream, 0.7);
}

.tg__accion {
  margin-top: 1.4rem;
}

/* ── El botón grande ── */
.cta {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  padding: 1rem 1.2rem;
  border-radius: $radius-lg;
  background-color: $rose-deep;
  color: $cream;
  transition:
    background-color 0.26s $ease,
    transform 0.26s $ease,
    box-shadow 0.26s $ease;

  @include focus-ring($rose-soft);

  &:hover {
    background-color: $wine;
    transform: translateY(-2px);
    box-shadow: 0 14px 30px -12px rgba($rose-deep, 0.7);
  }
}

.cta__icono {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background-color: rgba($cream, 0.16);
  font-size: 1.2rem;
}

.cta__texto {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
}

.cta__label {
  font-family: $font-display;
  font-size: 1.2rem;
  line-height: 1.15;
}

.cta__hint {
  margin-top: 0.15rem;
  font-size: $text-xs;
  color: rgba($cream, 0.75);
}

.cta__flecha {
  flex: none;
  font-size: 1rem;
  transition: transform 0.26s $ease;

  .cta:hover & {
    transform: translateX(4px);
  }
}

/* ── El correo exacto ── */
.correo {
  margin-top: 1rem;
  padding: 1rem 1.2rem;
  border-radius: $radius-md;
  background-color: rgba($cream, 0.08);
}

.correo__titulo {
  font-size: $text-sm;
  font-weight: 600;
  color: $cream;
}

.correo__valor {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: $radius-sm;
  background-color: $cream;
  font-size: $text-base;
  font-weight: 600;
  color: $ink;
  word-break: break-all;
  user-select: all;
}

.correo__nota {
  margin-top: 0.5rem;
  font-size: $text-xs;
  color: rgba($cream, 0.6);
}

.pasos {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 1rem 0 0;
  padding-left: 1.2rem;
  font-size: $text-sm;
  line-height: 1.5;
  color: rgba($cream, 0.75);

  li::marker {
    font-weight: 600;
    color: $rose-soft;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.4rem;
  border-radius: $radius-pill;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition:
    background-color 0.26s $ease,
    transform 0.26s $ease;

  @include focus-ring($rose-soft);

  &:hover {
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
  margin-top: 1rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: rgba($cream, 0.6);

  svg {
    margin-top: 0.2em;
    color: $rose-soft;
  }
}

/* ── Esqueleto ── */
.esqueleto {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1.4rem;
}

.esqueleto__linea,
.esqueleto__boton {
  display: block;
  border-radius: $radius-md;
  background-color: rgba($cream, 0.1);
  animation: respirar 1.4s ease-in-out infinite;
}

.esqueleto__linea {
  height: 3.6rem;
}

.esqueleto__linea--corta {
  width: 70%;
  height: 2.6rem;
}

.esqueleto__boton {
  height: 4.4rem;
  border-radius: $radius-lg;
  background-color: rgba($rose-deep, 0.45);
}

@keyframes respirar {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

/* ── Entrada del contenido real ── */
.aparece-enter-active {
  transition:
    opacity 0.45s $ease,
    transform 0.45s $ease;
}

.aparece-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@include reduced-motion {
  .esqueleto__linea,
  .esqueleto__boton {
    animation: none;
  }

  .aparece-enter-active {
    transition: none;
  }
}
</style>
