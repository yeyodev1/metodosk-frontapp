<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'light'
    size?: 'md' | 'lg'
    /** Si se pasa, renderiza un <a> en vez de <button>. */
    href?: string
    type?: 'button' | 'submit'
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button', disabled: false, block: false },
)
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : type"
    :disabled="href ? undefined : disabled"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
  >
    <span class="btn__label"><slot /></span>
  </component>
</template>

<style lang="scss" scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: $font-principal;
  font-size: $text-sm;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: $radius-pill;
  border: 1px solid transparent;
  padding: 0.95rem 1.9rem;
  overflow: hidden;
  transition:
    transform 0.35s $ease,
    background-color 0.35s $ease,
    color 0.35s $ease,
    border-color 0.35s $ease,
    box-shadow 0.35s $ease;

  @include focus-ring;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.btn__label {
  position: relative;
  z-index: 1;
}

.btn--lg {
  font-size: $text-base;
  padding: 1.15rem 2.4rem;
}

.btn--block {
  display: flex;
  width: 100%;
}

.btn--primary {
  background-color: $ink;
  color: $cream;
  box-shadow: $shadow-sm;

  &:hover:not(:disabled) {
    background-color: $wine;
    box-shadow: $shadow-md;
  }
}

.btn--ghost {
  border-color: rgba($ink, 0.22);
  color: $ink;

  &:hover:not(:disabled) {
    border-color: $ink;
    background-color: rgba($ink, 0.04);
  }
}

.btn--light {
  background-color: $cream;
  color: $ink;

  &:hover:not(:disabled) {
    background-color: $rose-soft;
  }
}
</style>
