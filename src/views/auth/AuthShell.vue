<script setup lang="ts">
/** Marco compartido de las pantallas de acceso. */
defineProps<{ eyebrow?: string; title: string; lead?: string }>()
</script>

<template>
  <main class="shell">
    <div class="shell__card">
      <a class="shell__brand" href="/">
        <span class="shell__mark">SK</span>
        <span>Método SK</span>
      </a>

      <header class="shell__head">
        <p v-if="eyebrow" class="shell__eyebrow">{{ eyebrow }}</p>
        <h1 class="shell__title">{{ title }}</h1>
        <p v-if="lead" class="shell__lead">{{ lead }}</p>
      </header>

      <slot />
    </div>
  </main>
</template>

<style lang="scss" scoped>
.shell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: $space-lg 1.25rem;
  background-color: $ink;
}

.shell__card {
  display: flex;
  flex-direction: column;
  gap: $space-md;
  width: min(430px, 100%);
  padding: clamp(1.6rem, 5vw, 2.5rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.shell__brand {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-family: $font-display;
  font-size: 1rem;
  color: $ink;
}

.shell__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: $ink;
  color: $rose-soft;
  font-size: 0.8rem;
  font-style: italic;
}

.shell__head {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.shell__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.shell__title {
  font-family: $font-display;
  font-size: clamp(1.5rem, 5vw, 1.9rem);
  line-height: 1.15;
  color: $ink;
}

.shell__lead {
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

/* Formulario: se define acá para que lo hereden las pantallas del slot. */
.shell__card :deep(.form) {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.shell__card :deep(.field) {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.shell__card :deep(.field > span) {
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $ink-muted;
}

.shell__card :deep(.field input) {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid rgba($ink, 0.16);
  border-radius: $radius-sm;
  background-color: $bone;
  font-family: inherit;
  font-size: $text-base;
  color: $ink;
}

.shell__card :deep(.field input:focus) {
  outline: none;
  border-color: $rose-deep;
  background-color: $cream;
}

.shell__card :deep(.field input:disabled) {
  opacity: 0.6;
}

.shell__card :deep(.field__hint) {
  font-size: $text-xs;
  color: $ink-muted;
}

.shell__card :deep(.form__error) {
  font-size: $text-sm;
  color: $alert-error;
}

.shell__card :deep(.alt) {
  font-size: $text-sm;
  color: $ink-soft;
  text-align: center;
}

.shell__card :deep(.alt a) {
  color: $rose-deep;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Aviso de "primero se compra". */
.shell__card :deep(.aviso) {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: 1.1rem 1.2rem;
  border: 1px solid rgba($rose-deep, 0.25);
  border-radius: $radius-md;
  background-color: rgba($rose-soft, 0.35);
}

.shell__card :deep(.aviso__title) {
  font-family: $font-display;
  font-size: 1.15rem;
  color: $ink;
}

.shell__card :deep(.aviso__text) {
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}
</style>
