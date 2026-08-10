<script setup lang="ts">
import CldImage from '@/components/ui/CldImage.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { NUTRITION } from '@/config/site'
import { PHOTO } from '@/config/photos'
</script>

<template>
  <section id="nutricion" class="nutrition">
    <div class="nutrition__inner">
      <SectionHeading :eyebrow="NUTRITION.eyebrow" :title="NUTRITION.title" align="center">
        {{ NUTRITION.intro }}
      </SectionHeading>

      <!-- Paso 1: elegir objetivo -->
      <div class="block">
        <p class="block__label">
          <span class="block__step">01</span>{{ NUTRITION.goals.title }}
        </p>

        <div class="goals">
          <article
            v-for="(goal, index) in NUTRITION.goals.items"
            :key="goal.name"
            v-reveal="index * 120"
            class="goal"
          >
            <span class="goal__tag">{{ goal.tag }}</span>
            <h3 class="goal__name">{{ goal.name }}</h3>
            <p class="goal__text">{{ goal.text }}</p>
          </article>
        </div>
      </div>

      <!-- Paso 2: qué incluye -->
      <div class="block">
        <p class="block__label">
          <span class="block__step">02</span>{{ NUTRITION.includes.title }}
        </p>

        <div class="content">
          <ol class="items">
            <li
              v-for="(item, index) in NUTRITION.includes.items"
              :key="item.title"
              v-reveal="index * 70"
              class="item"
            >
              <span class="item__num" aria-hidden="true">{{ index + 1 }}</span>
              <div class="item__body">
                <h3 class="item__title">{{ item.title }}</h3>
                <p class="item__text">{{ item.text }}</p>
              </div>
            </li>
          </ol>

          <figure class="content__shot" v-reveal="120">
            <CldImage
              :public-id="PHOTO.nutrition.id"
              :alt="PHOTO.nutrition.alt"
              ratio="4:5"
              sizes="(min-width: 1024px) 34vw, 100vw"
            />
            <figcaption>Karen López · Nutrición del Método SK</figcaption>
          </figure>
        </div>
      </div>

      <div class="closing" v-reveal>
        <h3 class="closing__title">{{ NUTRITION.closing.title }}</h3>
        <p class="closing__text">{{ NUTRITION.closing.text }}</p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.nutrition {
  padding-block: $space-section;
  background-color: $bone;
}

.nutrition__inner {
  @include container;
  display: flex;
  flex-direction: column;
  gap: $space-xl;
}

// Cada paso de la sección, con su rótulo numerado.
.block {
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.block__label {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-family: $font-principal;
  font-size: $text-lg;
  font-weight: 600;
  color: $ink;
}

.block__step {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: $wine;
  color: $cream;
  font-size: $text-xs;
  letter-spacing: 0.06em;
}

.goals {
  @include flex-cards(320px, clamp(1rem, 2.5vw, 1.75rem));
  align-items: stretch;
}

.goal {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: clamp(1.6rem, 3.5vw, 2.4rem);
  background-color: $cream;
  border: 1px solid rgba($ink, 0.06);
  border-left: 4px solid $rose;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
}

.goal__tag {
  @include eyebrow;
}

.goal__name {
  @include display($display-sm);
}

.goal__text {
  font-size: $text-base;
  color: $ink-soft;
}

.content {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: flex-start;
}

.items {
  flex: 1 1 420px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: flex;
  gap: 1rem;
  padding: clamp(1rem, 2.2vw, 1.35rem);
  background-color: $cream;
  border: 1px solid rgba($ink, 0.06);
  border-radius: $radius-sm;
  transition:
    border-color 0.4s $ease,
    transform 0.4s $ease;

  &:hover {
    border-color: rgba($rose, 0.5);
    transform: translateX(4px);
  }
}

.item__num {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
  font-family: $font-principal;
  font-size: $text-sm;
  font-weight: 600;
}

.item__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.item__title {
  font-family: $font-principal;
  font-size: $text-base;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.item__text {
  font-size: $text-sm;
  color: $ink-soft;
}

.content__shot {
  flex: 1 1 280px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;

  figcaption {
    @include eyebrow;
    color: $ink-muted;
  }
}

.closing {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: clamp(1.8rem, 4vw, 3rem);
  background-color: $wine;
  border-radius: $radius-lg;
  text-align: center;
}

.closing__title {
  @include display($display-sm);
  color: $cream;
}

.closing__text {
  max-width: 60ch;
  margin-inline: auto;
  font-size: $text-lg;
  color: rgba($cream, 0.82);
}
</style>
