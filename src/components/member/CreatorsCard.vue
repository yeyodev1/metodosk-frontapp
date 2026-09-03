<script setup lang="ts">
/**
 * Quiénes te acompañan.
 *
 * Sale de la vista de bienvenida para no pasar de las 400 líneas por archivo,
 * y de paso queda reutilizable: es la misma tarjeta que pide cualquier
 * pantalla donde haga falta poner cara a quién armó el reto.
 */
import CldImage from '@/components/ui/CldImage.vue'
import { CREATORS } from '@/config/site'
</script>

<template>
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
</template>

<style lang="scss" scoped>
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
</style>
