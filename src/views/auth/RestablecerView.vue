<script setup lang="ts">
/**
 * La contraseña nueva, con el enlace del correo.
 *
 * Si sale bien, entra directo: quien acaba de recuperar su cuenta no debería
 * tener que volver a escribir lo que acaba de crear. Si el enlace venció o ya
 * se usó, se le dice y se le da el camino para pedir otro.
 */
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AuthShell from './AuthShell.vue'
import authService from '@/services/authService'
import { homeForRole, useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const form = reactive({ password: '', repeat: '' })
const loading = ref(false)
const error = ref('')
const ver = ref(false)

async function onSubmit() {
  if (form.password.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }
  if (form.password !== form.repeat) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { token: sesion, user } = await authService.restablecer(token.value, form.password)
    session.setSession(sesion, user)
    router.replace(homeForRole(user.role))
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos guardarla'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell
    eyebrow="Tu cuenta"
    title="Crea tu nueva contraseña"
    lead="Al menos 8 caracteres. Al guardarla entras directo a tu reto."
    quote="Lista. Ahora sí, a entrenar."
    quote-foot="Tu avance y tus datos siguen intactos."
    photo="metodosk/sk-04"
  >
    <div v-if="!token" class="sin">
      <p class="sin__title">Este enlace no es válido</p>
      <p class="sin__texto">Abre el enlace desde el correo que te mandamos, o pide uno nuevo.</p>
      <RouterLink to="/recuperar" class="sin__link">Pedir un enlace nuevo</RouterLink>
    </div>

    <form v-else class="form" novalidate @submit.prevent="onSubmit">
      <label class="field">
        <span>Nueva contraseña</span>
        <div class="pass">
          <input
            v-model="form.password"
            :type="ver ? 'text' : 'password'"
            autocomplete="new-password"
            required
            autofocus
          />
          <button
            type="button"
            class="pass__ojo"
            :aria-label="ver ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            @click="ver = !ver"
          >
            <FaIcon :icon="ver ? 'eye-slash' : 'eye'" />
          </button>
        </div>
      </label>

      <label class="field">
        <span>Repítela</span>
        <input
          v-model="form.repeat"
          :type="ver ? 'text' : 'password'"
          autocomplete="new-password"
          required
        />
      </label>

      <Transition name="aviso">
        <p v-if="error" class="form__error">{{ error }}</p>
      </Transition>

      <BaseButton type="submit" size="lg" block :disabled="loading">
        {{ loading ? 'Guardando…' : 'Guardar y entrar' }}
      </BaseButton>

      <p v-if="error.includes('enlace')" class="alt">
        <RouterLink to="/recuperar">Pedir un enlace nuevo</RouterLink>
      </p>
    </form>
  </AuthShell>
</template>

<style lang="scss" scoped>
.pass {
  position: relative;
  display: block;

  input {
    width: 100%;
    padding-right: 3rem;
  }
}

.pass__ojo {
  position: absolute;
  top: 50%;
  right: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border: none;
  border-radius: 50%;
  background: none;
  color: $ink-muted;
  cursor: pointer;
  transform: translateY(-50%);

  &:hover {
    color: $ink;
  }

  @include focus-ring;
}

.sin {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.4rem;
  border-radius: $radius-lg;
  background-color: $cream;
}

.sin__title {
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;
}

.sin__texto {
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

.sin__link {
  margin-top: 0.4rem;
  font-size: $text-sm;
  font-weight: 600;
  color: $wine;
  text-decoration: underline;
}

.aviso-enter-active,
.aviso-leave-active {
  transition: opacity 0.25s $ease;
}

.aviso-enter-from,
.aviso-leave-to {
  opacity: 0;
}
</style>
