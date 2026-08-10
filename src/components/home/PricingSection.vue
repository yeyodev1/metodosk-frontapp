<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useCheckout } from '@/composables/useCheckout'
import { formatUsd } from '@/config/payment'
import { CHALLENGES, PRICING } from '@/config/site'

const { selectedId, select, open } = useCheckout()

const remaining = computed(() => PRICING.spots.total - PRICING.spots.taken)
const filled = computed(() =>
  Math.round((PRICING.spots.taken / PRICING.spots.total) * 100),
)
const saving = computed(() => PRICING.regular - PRICING.presale)
</script>

<template>
  <section id="precio" class="pricing">
    <div class="pricing__inner">
      <SectionHeading :eyebrow="PRICING.eyebrow" :title="PRICING.title" align="center" />

      <div class="pricing__card" v-reveal>
        <div class="pricing__main">
          <p class="pricing__label">Elige tu reto</p>
          <div class="pricing__options">
            <button
              v-for="challenge in CHALLENGES"
              :key="challenge.id"
              type="button"
              class="option"
              :class="{ 'is-active': selectedId === challenge.id }"
              :aria-pressed="selectedId === challenge.id"
              @click="select(challenge.id)"
            >
              <span class="option__name">{{ challenge.name }}</span>
              <span class="option__claim">{{ challenge.claim }}</span>
            </button>
          </div>

          <ul class="pricing__includes">
            <li v-for="item in PRICING.includes" :key="item">{{ item }}</li>
          </ul>
        </div>

        <aside class="pricing__box">
          <p class="pricing__regular">
            Precio real <s>{{ formatUsd(PRICING.regular) }}</s>
          </p>
          <p class="pricing__amount">{{ formatUsd(PRICING.presale) }}</p>
          <p class="pricing__save">Ahorras {{ formatUsd(saving) }} en la pre-venta</p>

          <div class="spots">
            <div class="spots__bar" role="presentation">
              <span class="spots__fill" :style="{ width: `${filled}%` }" />
            </div>
            <p class="spots__text">
              Quedan <strong>{{ remaining }}</strong> de {{ PRICING.spots.total }} cupos a
              este precio
            </p>
          </div>

          <BaseButton size="lg" block @click="open()">{{ PRICING.cta }}</BaseButton>

          <p class="pricing__note">{{ PRICING.note }}</p>

          <ul class="pricing__guarantees">
            <li v-for="item in PRICING.guarantees" :key="item">{{ item }}</li>
          </ul>
        </aside>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.pricing {
  padding-block: $space-section;
  background-color: $sand;
}

.pricing__inner {
  @include container(1080px);
  display: flex;
  flex-direction: column;
  gap: $space-xl;
}

.pricing__card {
  display: flex;
  flex-wrap: wrap;
  background-color: $cream;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  overflow: hidden;
}

.pricing__main {
  flex: 1 1 340px;
  display: flex;
  flex-direction: column;
  gap: $space-md;
  padding: clamp(1.6rem, 4vw, 2.8rem);
}

.pricing__label {
  @include eyebrow;
}

.pricing__options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.option {
  flex: 1 1 180px;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  text-align: left;
  padding: 0.95rem 1.1rem;
  border: 1px solid rgba($ink, 0.14);
  border-radius: $radius-md;
  transition:
    border-color 0.3s $ease,
    background-color 0.3s $ease;

  @include focus-ring;

  &:hover {
    border-color: rgba($rose, 0.7);
  }

  &.is-active {
    border-color: $rose-deep;
    background-color: $rose-soft;
  }
}

.option__name {
  font-weight: 600;
  font-size: $text-sm;
}

.option__claim {
  font-size: $text-xs;
  color: $ink-soft;
}

.pricing__includes {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  list-style: none;
  font-size: $text-sm;
  color: $ink-soft;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;

    &::before {
      content: '✓';
      flex: none;
      color: $rose-deep;
      font-weight: 700;
    }
  }
}

.pricing__box {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: clamp(1.6rem, 4vw, 2.8rem);
  background-color: $ink;
  color: rgba($cream, 0.75);
}

.pricing__regular {
  @include eyebrow;
  color: rgba($cream, 0.5);

  s {
    color: rgba($cream, 0.5);
  }
}

.pricing__amount {
  font-family: $font-display;
  font-size: clamp(3rem, 8vw, 4.4rem);
  line-height: 1;
  color: $cream;
}

.pricing__save {
  font-size: $text-sm;
  color: $rose;
}

.spots {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-block: $space-xs;
}

.spots__bar {
  height: 6px;
  border-radius: $radius-pill;
  background-color: rgba($cream, 0.14);
  overflow: hidden;
}

.spots__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, $rose, $rose-deep);
}

.spots__text {
  font-size: $text-xs;
  letter-spacing: 0.04em;

  strong {
    color: $cream;
  }
}

.pricing__note {
  font-size: $text-xs;
  color: rgba($cream, 0.55);
}

.pricing__guarantees {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  list-style: none;
  margin-top: auto;
  padding-top: $space-sm;
  border-top: 1px solid rgba($cream, 0.12);
  font-size: $text-xs;
  color: rgba($cream, 0.55);
}
</style>
