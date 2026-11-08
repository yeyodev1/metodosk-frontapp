<script setup lang="ts">
/**
 * El home con la web apagada desde el panel.
 *
 * A propósito es calcado de la pantalla de Vercel cuando un deployment ya no
 * existe, sin marca ni enlaces: quien entre tiene que creer que la web se
 * cayó o la borraron. Las alumnas siguen entrando por /login, que no se toca.
 */
import { onBeforeUnmount } from 'vue'

const titulo = document.title
document.title = '404: NOT_FOUND'
onBeforeUnmount(() => (document.title = titulo))

// Parece un ID de error real: región + 5 letras + timestamp + hash.
const id = `gru1::${Math.random().toString(36).slice(2, 7)}-${Date.now()}-${Math.random().toString(16).slice(2, 14)}`
</script>

<template>
  <main class="nf">
    <div class="nf__box">
      <h1 class="nf__title">404: NOT_FOUND</h1>
      <p class="nf__line">Code: <code>DEPLOYMENT_NOT_FOUND</code></p>
      <p class="nf__line">ID: <code>{{ id }}</code></p>
      <p class="nf__help">
        <a href="https://vercel.com/docs/errors/DEPLOYMENT_NOT_FOUND" rel="noopener">Read our documentation</a>
        to learn more about this error.
      </p>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.nf {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 16px;
  background: #fff;
  color: #000;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  text-align: center;
}

.nf__title {
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
}

.nf__line {
  margin-top: 4px;
  font-size: 14px;
  color: #171717;

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 13px;
    color: #000;
  }
}

.nf__help {
  margin-top: 24px;
  font-size: 13px;
  color: #666;

  a {
    color: #0070f3;
    text-decoration: underline;
  }
}
</style>
