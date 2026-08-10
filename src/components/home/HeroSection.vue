<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { cldPoster, cldVideo } from '@/composables/useCloudinary'
import { useCheckout } from '@/composables/useCheckout'
import { CREATORS, HERO, PRICING } from '@/config/site'
import { HERO_VIDEO } from '@/config/media'
import { formatUsd } from '@/config/payment'

const { open } = useCheckout()

const poster = cldPoster(HERO_VIDEO)
const video = ref<HTMLVideoElement | null>(null)
const videoSrc = ref('')
const playing = ref(false)

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // En móvil se sirve una versión más liviana: el video arranca antes y no se
  // come el plan de datos. El poster ya está pintado, así que no se ve el salto.
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  videoSrc.value = cldVideo(HERO_VIDEO, isMobile ? 640 : 1080)

  await nextTick()
  const element = video.value
  if (!element) return

  // iOS exige que muted esté puesto en el elemento antes de llamar a play().
  element.muted = true
  try {
    await element.play()
    playing.value = true
  } catch {
    // Modo de bajo consumo o autoplay bloqueado: se queda el poster.
    playing.value = false
  }
})
</script>

<template>
  <section id="top" class="hero">
    <div class="hero__media">
      <img class="hero__poster" :src="poster" alt="" aria-hidden="true" />
      <video
        v-if="videoSrc"
        ref="video"
        class="hero__video"
        :class="{ 'is-playing': playing }"
        :poster="poster"
        autoplay
        muted
        loop
        playsinline
        webkit-playsinline
        disablepictureinpicture
        disableremoteplayback
        preload="auto"
        @playing="playing = true"
      >
        <source :src="videoSrc" type="video/mp4" />
      </video>
      <div class="hero__scrim" />
    </div>

    <div class="hero__content">
      <p class="hero__eyebrow">{{ HERO.eyebrow }}</p>
      <h1 class="hero__title">{{ HERO.title }}</h1>
      <p class="hero__subtitle">{{ HERO.subtitle }}</p>

      <p class="hero__by">
        <span>Creado por</span>
        <span v-for="creator in CREATORS" :key="creator.name" class="hero__by-person">
          <strong>{{ creator.name }}</strong>
          <em>{{ creator.role.toLowerCase() }}</em>
        </span>
      </p>

      <div class="hero__actions">
        <BaseButton variant="light" size="lg" @click="open()">
          {{ HERO.primaryCta }}
        </BaseButton>
        <a class="hero__link" href="#incluye">{{ HERO.secondaryCta }}</a>
      </div>

      <p class="hero__price">
        Pre-venta
        <strong>{{ formatUsd(PRICING.presale) }}</strong>
        <s>{{ formatUsd(PRICING.regular) }}</s>
      </p>
    </div>

    <ul class="hero__stats">
      <li v-for="stat in HERO.stats" :key="stat.label">
        <span class="hero__stat-value">{{ stat.value }}</span>
        <span class="hero__stat-label">{{ stat.label }}</span>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 100svh;
  padding-block: 7rem $space-lg;
  overflow: hidden;
  color: $cream;
  isolation: isolate;
}

.hero__media {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.hero__poster,
.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 22%;
}

// El video solo se revela cuando de verdad está reproduciendo. Si iOS bloquea
// el autoplay (modo de bajo consumo), abajo queda el poster y no se nota.
.hero__video {
  opacity: 0;
  transition: opacity 0.9s $ease;
}

.hero__video.is-playing {
  opacity: 1;
}

.hero__scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(#100c0b, 0.92) 0%, rgba(#100c0b, 0.35) 48%, rgba(#100c0b, 0.6) 100%),
    radial-gradient(ellipse at 30% 80%, rgba($wine, 0.35), transparent 60%);
}

.hero__content {
  @include container;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $space-md;
  max-width: 1160px;
}

.hero__eyebrow {
  @include eyebrow;
  color: $rose-soft;
  padding: 0.4rem 0.9rem;
  border: 1px solid rgba($cream, 0.3);
  border-radius: $radius-pill;
  backdrop-filter: blur(6px);
}

.hero__title {
  @include display($display-lg);
  color: $cream;
  white-space: pre-line;
  max-width: 14ch;

  // Un toque editorial: la última línea en cursiva
  &::first-line {
    font-style: normal;
  }
}

.hero__subtitle {
  max-width: 46ch;
  font-size: $text-lg;
  color: rgba($cream, 0.82);
}

.hero__by {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.4rem 1.1rem;
  font-size: $text-xs;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba($cream, 0.55);
}

.hero__by-person {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;

  // Separador entre las dos creadoras
  & + &::before {
    content: '·';
    color: $rose;
    margin-right: 0.45rem;
  }

  strong {
    font-weight: 600;
    color: $cream;
  }

  em {
    font-style: normal;
    color: $rose;
  }
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-md;
}

.hero__link {
  position: relative;
  font-size: $text-sm;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba($cream, 0.85);
  padding-bottom: 0.25rem;
  border-bottom: 1px solid rgba($cream, 0.4);
  transition: border-color 0.3s $ease;

  &:hover {
    border-bottom-color: $rose;
  }
}

.hero__price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: $text-sm;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba($cream, 0.7);

  strong {
    font-family: $font-display;
    font-size: $text-xl;
    font-weight: 500;
    color: $cream;
  }

  s {
    color: rgba($cream, 0.45);
  }
}

.hero__stats {
  @include container;
  display: flex;
  flex-wrap: wrap;
  gap: $space-lg;
  list-style: none;
  margin-top: $space-xl;
  padding-top: $space-md;

  li {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }
}

.hero__stat-value {
  font-family: $font-display;
  font-size: $text-xl;
  color: $rose-soft;
}

.hero__stat-label {
  font-size: $text-xs;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba($cream, 0.6);
}
</style>
