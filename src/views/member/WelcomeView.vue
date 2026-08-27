<script setup lang="ts">
/**
 * El video de bienvenida, cuando ya no es obligatorio.
 *
 * Lo vio una vez al comprar; acá vive para volver a verlo. Sin autoplay: si
 * entró a este apartado ya sabe qué hay, y un video que arranca solo cuando no
 * lo pediste es una molestia, no un servicio.
 *
 * Alrededor del video va lo que responde la pregunta real de quien acaba de
 * pagar: quiénes son ellas, qué pasa ahora y qué hago hoy. Un reproductor
 * solo en medio de una pantalla vacía no contesta ninguna.
 */
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import VslPlayer from '@/components/ui/VslPlayer.vue'
import CommentThread from '@/components/ui/CommentThread.vue'
import CldImage from '@/components/ui/CldImage.vue'
import settingsService, { type Vsl } from '@/services/settingsService'
import { useSessionStore } from '@/stores/session'
import { CREATORS, BRAND } from '@/config/site'

const session = useSessionStore()
const vsl = ref<Vsl | null>(null)
const cargando = ref(true)

const nombre = computed(() => session.user?.name?.split(' ')[0] || '')

/** Los tres pasos de la primera semana: qué hago hoy, en concreto. */
onMounted(async () => {
  try {
    vsl.value = await settingsService.vsl()
  } catch {
    // Sin video la pantalla lo dice; no hay nada que reintentar.
  } finally {
    cargando.value = false
  }
})

const PRIMEROS_PASOS = [
  {
    icono: 'circle-play',
    title: 'Mira este video',
    text: 'Cinco minutos para entender cómo está armado el reto y por dónde se empieza.',
  },
  {
    icono: 'dumbbell',
    title: 'Abre tu reto',
    text: 'Ahí está tu ruta: entrenamiento, nutrición y la guía, en el orden en que se hacen.',
    to: '/academia',
    cta: 'Ir a mi reto',
  },
  {
    icono: 'calendar-check',
    title: 'Agenda tus días',
    text: 'Elige ahora qué días entrenas esta semana. La constancia se decide antes, no el mismo día.',
  },
]
</script>

<template>
  <div class="bienvenida">
    <header class="hero">
      <p class="hero__eyebrow"><FaIcon icon="play" /> Método SK</p>
      <h1 class="hero__title">
        Empieza aquí<span v-if="nombre">, {{ nombre }}</span>
      </h1>
      <p class="hero__sub">
        Antes de la primera rutina, míralo. Scarlet y Karen te cuentan cómo está armado el reto de
        3 meses, por qué el orden importa y qué esperar de cada mes. Es lo único que hay que ver
        completo — el resto se va abriendo a tu ritmo.
      </p>
    </header>

    <div class="cuerpo">
      <div class="principal">
        <div v-if="vsl" class="video">
          <VslPlayer
            :embed-url="vsl.embedUrl"
            :duration-seconds="vsl.durationSeconds"
            :autoplay="false"
          />
        </div>

        <p v-else-if="cargando" class="aviso">
          <FaIcon icon="spinner" spin /> Cargando el video…
        </p>
        <p v-else class="aviso">
          <FaIcon icon="film" /> El video de bienvenida se publica en breve. Mientras tanto, tu reto
          ya está abierto.
        </p>

        <!-- Los comentarios: lo que vuelve esto una academia y no un archivo -->
        <CommentThread
          course-id="vsl"
          lesson-id="vsl"
          titulo="Preguntas sobre el arranque"
        />
      </div>

      <aside class="lado">
        <section class="tarjeta">
          <h2 class="tarjeta__title"><FaIcon icon="check" /> Tus primeros pasos</h2>
          <ol class="pasos">
            <li v-for="(p, i) in PRIMEROS_PASOS" :key="p.title" class="paso">
              <span class="paso__icono"><FaIcon :icon="p.icono" /></span>
              <div>
                <p class="paso__title">{{ i + 1 }}. {{ p.title }}</p>
                <p class="paso__text">{{ p.text }}</p>
                <RouterLink v-if="p.to" :to="p.to" class="paso__cta">
                  {{ p.cta }} <FaIcon icon="arrow-right" />
                </RouterLink>
              </div>
            </li>
          </ol>
        </section>

        <section class="tarjeta">
          <h2 class="tarjeta__title"><FaIcon icon="users" /> Quiénes te acompañan</h2>
          <div v-for="c in CREATORS" :key="c.name" class="creadora">
            <div class="creadora__foto">
              <CldImage
                :public-id="`metodosk/${c.photo}`"
                :alt="c.name"
                ratio="1:1"
                gravity="face"
                sizes="72px"
              />
            </div>
            <div>
              <p class="creadora__nombre">{{ c.name }}</p>
              <p class="creadora__rol">{{ c.role }}</p>
              <p class="creadora__texto">{{ c.text }}</p>
            </div>
          </div>
        </section>

        <section class="tarjeta tarjeta--oscura">
          <h2 class="tarjeta__title"><FaIcon :icon="['fab', 'whatsapp']" /> ¿Algo no cuadra?</h2>
          <p class="tarjeta__text">
            Si tienes una duda del reto, pregúntala acá abajo en los comentarios — la ven todas y
            casi siempre alguien tenía la misma. Para temas de tu cuenta o tu pago, escríbenos.
          </p>
          <a class="tarjeta__cta" :href="BRAND.whatsapp" target="_blank" rel="noopener">
            Escribir por WhatsApp <FaIcon icon="arrow-right" />
          </a>
        </section>
      </aside>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bienvenida {
  padding: 4.2rem clamp(1rem, 3vw, 2.5rem) 4rem;

  @include from('lg') {
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
  }
}

/* ── Encabezado ── */
.hero {
  max-width: 70ch;
  margin-bottom: $space-md;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @include eyebrow;

  svg {
    font-size: 0.8em;
  }
}

.hero__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.hero__sub {
  margin-top: 0.5rem;
  font-size: $text-base;
  line-height: 1.6;
  color: $ink-soft;
}

/* ── Dos columnas en pantalla ancha; una sola en móvil ── */
.cuerpo {
  display: grid;
  grid-template-columns: 1fr;
  gap: $space-md;

  @include from('lg') {
    grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.9fr);
    align-items: start;
  }
}

.principal {
  display: flex;
  flex-direction: column;
  gap: $space-lg;
  min-width: 0;
}

.video {
  overflow: hidden;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
}

.lado {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  min-width: 0;
}

/* ── Tarjetas ── */
.tarjeta {
  padding: clamp(1.1rem, 3vw, 1.5rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.tarjeta__title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.8rem;
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;

  svg {
    font-size: 0.8em;
    color: $rose-deep;
  }
}

.tarjeta__text {
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.tarjeta--oscura {
  background-color: $ink;

  .tarjeta__title {
    color: $cream;

    svg {
      color: $rose-soft;
    }
  }

  .tarjeta__text {
    color: rgba($cream, 0.68);
  }
}

.tarjeta__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.8rem;
  padding: 0.55rem 1.1rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink;
  transition: background-color 0.28s $ease;

  &:hover {
    background-color: $cream;
  }
}

/* ── Primeros pasos ── */
.pasos {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  list-style: none;
}

.paso {
  display: flex;
  gap: 0.7rem;
}

.paso__icono {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
  font-size: 0.8rem;
}

.paso__title {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.paso__text {
  margin-top: 0.15rem;
  font-size: $text-xs;
  line-height: 1.55;
  color: $ink-soft;
}

.paso__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.4rem;
  font-size: $text-xs;
  font-weight: 600;
  color: $rose-deep;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

/* ── Creadoras ── */
.creadora {
  display: flex;
  gap: 0.7rem;
  padding-top: 0.8rem;

  & + .creadora {
    margin-top: 0.8rem;
    border-top: 1px solid rgba($ink, 0.07);
  }

  &:first-of-type {
    padding-top: 0;
  }
}

.creadora__foto {
  flex: none;
  width: 56px;
  overflow: hidden;
  border-radius: 50%;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.creadora__nombre {
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.creadora__rol {
  @include eyebrow;
  font-size: 0.66rem;
}

.creadora__texto {
  margin-top: 0.25rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;
}

.aviso {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: $space-md;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  color: $ink-soft;
}
</style>
