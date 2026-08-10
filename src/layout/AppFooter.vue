<script setup lang="ts">
import { BRAND, CREATORS } from '@/config/site'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <p class="footer__logo">{{ BRAND.name }}</p>
        <p class="footer__by">por {{ BRAND.authors }}</p>
      </div>

      <nav class="footer__links" aria-label="Enlaces">
        <a
          v-for="creator in CREATORS"
          :key="creator.handle"
          :href="creator.instagram"
          target="_blank"
          rel="noopener"
        >
          {{ creator.handle }}
        </a>
        <a :href="BRAND.whatsapp" target="_blank" rel="noopener">WhatsApp</a>
        <a :href="`mailto:${BRAND.email}`">{{ BRAND.email }}</a>
      </nav>

      <p class="footer__legal">
        © {{ year }} {{ BRAND.name }}. Pagos procesados por PayPhone.
      </p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background-color: $ink;
  color: rgba($cream, 0.7);
  padding-block: $space-xl;
}

.footer__inner {
  @include container;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-lg;
}

.footer__logo {
  font-family: $font-display;
  font-size: $text-xl;
  color: $cream;
}

.footer__by {
  font-size: $text-sm;
  color: $rose;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
  font-size: $text-sm;

  a {
    transition: color 0.3s $ease;

    &:hover {
      color: $rose;
    }
  }
}

.footer__legal {
  flex: 1 1 100%;
  padding-top: $space-md;
  border-top: 1px solid rgba($cream, 0.12);
  font-size: $text-xs;
  color: rgba($cream, 0.45);
}
</style>
