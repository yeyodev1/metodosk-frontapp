<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import authService from '@/services/authService'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    const { token, user } = await authService.login(form.email.trim(), form.password)
    localStorage.setItem('access_token', token)
    userStore.setUser({ id: user.id, name: user.name, email: user.email })
    // Vuelve a donde intentaba entrar antes de que lo mandáramos al login.
    const destino = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
    router.replace(destino)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login">
    <form class="login__card" novalidate @submit.prevent="onSubmit">
      <p class="login__eyebrow">Método SK</p>
      <h1 class="login__title">Panel de administración</h1>

      <label class="login__field">
        <span>Correo</span>
        <input v-model="form.email" type="email" autocomplete="email" required />
      </label>

      <label class="login__field">
        <span>Contraseña</span>
        <input v-model="form.password" type="password" autocomplete="current-password" required />
      </label>

      <p v-if="error" class="login__error">{{ error }}</p>

      <BaseButton type="submit" size="lg" block :disabled="loading">
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </BaseButton>
    </form>
  </main>
</template>

<style lang="scss" scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: $space-lg 1.25rem;
  background-color: $ink;
}

.login__card {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  width: min(400px, 100%);
  padding: clamp(1.6rem, 5vw, 2.4rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.login__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.login__title {
  margin-bottom: $space-sm;
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  span {
    font-size: $text-xs;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $ink-muted;
  }

  input {
    padding: 0.85rem 1rem;
    border: 1px solid rgba($ink, 0.16);
    border-radius: $radius-sm;
    background-color: $bone;
    font-family: inherit;
    font-size: $text-base;
    color: $ink;

    &:focus {
      outline: none;
      border-color: $rose-deep;
      background-color: $cream;
    }
  }
}

.login__error {
  font-size: $text-sm;
  color: $alert-error;
}
</style>
