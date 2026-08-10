<script setup lang="ts">
defineProps<{ question: string; answer: string; open: boolean; id: string }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <div class="faq-item" :class="{ 'is-open': open }">
    <h3>
      <button
        type="button"
        class="faq-item__trigger"
        :aria-expanded="open"
        :aria-controls="`panel-${id}`"
        @click="$emit('toggle')"
      >
        <span>{{ question }}</span>
        <span class="faq-item__icon" aria-hidden="true" />
      </button>
    </h3>

    <div :id="`panel-${id}`" class="faq-item__panel" :hidden="!open">
      <p>{{ answer }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.faq-item {
  border-bottom: 1px solid rgba($ink, 0.12);
}

.faq-item__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-md;
  width: 100%;
  padding-block: 1.35rem;
  text-align: left;
  font-family: $font-principal;
  font-size: $text-base;
  font-weight: 500;
  transition: color 0.3s $ease;

  @include focus-ring;

  &:hover {
    color: $rose-deep;
  }
}

.faq-item__icon {
  position: relative;
  flex: none;
  width: 16px;
  height: 16px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1.5px;
    background-color: currentColor;
    transition: transform 0.35s $ease;
  }

  &::after {
    transform: rotate(90deg);
  }
}

.is-open .faq-item__icon::after {
  transform: rotate(0deg);
}

.faq-item__panel {
  padding-bottom: 1.4rem;

  p {
    max-width: 62ch;
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
