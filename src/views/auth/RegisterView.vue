<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import AuthShell from './AuthShell.vue'
import authService, { type EmailStatus } from '@/services/authService'
import { homeForRole, useSessionStore } from '@/stores/session'
import { trackMeta } from '@/composables/useMetaPixel'

const router = useRouter()
const session = useSessionStore()

/**
 * El registro es en dos pasos a propósito: primero comprobamos que ese correo
 * tenga una compra, y recién entonces pedimos contraseña. Así nadie llena un
 * formulario completo para que al final le digamos que no puede entrar.
 */
const step = ref<'email' | 'password'>('email')
const form = reactive({ email: '', password: '', repeat: '' })
const status = ref<EmailStatus | null>(null)
const loading = ref(false)
const error = ref('')

const sinCompra = computed(() => status.value !== null && !status.value.hasPurchase)
const yaTieneCuenta = computed(() => status.value?.hasAccount === true)

async function verificarCorreo() {
  loading.value = true
  error.value = ''
  status.value = null
  try {
    const r = await authService.checkEmail(form.email.trim())
    status.value = r
    if (r.hasPurchase && !r.hasAccount) step.value = 'password'
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos comprobar ese correo'
  } finally {
    loading.value = false
  }
}

async function crearCuenta() {
  if (form.password !== form.repeat) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { token, user } = await authService.register(form.email.trim(), form.password)
    session.setSession(token, user)

    /**
     * CompleteRegistration: la compradora activó su acceso.
     *
     * No es una conversión de venta —esa ya ocurrió— pero sí es la señal de
     * que la compra terminó bien de punta a punta. Sirve para medir cuántas
     * compras se quedan sin activar, que es el agujero silencioso de este
     * embudo: pagaron y nunca entraron.
     */
    trackMeta('CompleteRegistration', {
      contentName: user.challenge ?? 'Reto Método SK',
      contact: { email: user.email, name: user.name || null },
    })

    router.replace(homeForRole(user.role))
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos crear tu cuenta'
  } finally {
    loading.value = false
  }
}

function volver() {
  step.value = 'email'
  status.value = null
  error.value = ''
}
</script>

<template>
  <AuthShell
    eyebrow="Crear contraseña"
    title="Tu cuenta nace con tu compra"
    lead="Escribe el correo que usaste al pagar y te decimos qué sigue."
    quote="El acceso no se registra. Se compra."
    quote-foot="Si ya pagaste, tu cuenta ya existe: acá solo le pones contraseña."
    photo="metodosk/sk-12"
  >
    <!-- Paso 1: comprobar que ese correo compró -->
    <form v-if="step === 'email'" class="form" novalidate @submit.prevent="verificarCorreo">
      <label class="field">
        <span>Correo de tu compra</span>
        <input v-model="form.email" type="email" autocomplete="email" required />
        <span class="field__hint">El mismo con el que pagaste en PayPhone.</span>
      </label>

      <Transition name="aviso">
        <p v-if="error" class="form__error">{{ error }}</p>
      </Transition>

      <BaseButton type="submit" size="lg" block :disabled="loading">
        {{ loading ? 'Comprobando…' : 'Continuar' }}
      </BaseButton>
    </form>

    <!-- Sin compra: se dice claro y se ofrece comprar -->
    <Transition name="aviso">
      <div v-if="sinCompra" class="aviso">
        <p class="aviso__title">Ese correo no tiene una compra</p>
        <p class="aviso__text">
          El acceso al reto no se registra: <strong>se compra</strong>. Si ya pagaste, revisa que sea
          el mismo correo que usaste en PayPhone — a veces se paga con otro.
        </p>
        <BaseButton href="/#precio" size="lg" block>Ver el reto y comprar</BaseButton>
      </div>
    </Transition>

    <!-- Ya tiene contraseña: al login -->
    <Transition name="aviso">
      <div v-if="yaTieneCuenta" class="aviso">
        <p class="aviso__title">Ya tienes cuenta</p>
        <p class="aviso__text">Ese correo ya tiene una contraseña creada. Entra directamente.</p>
        <BaseButton href="/login" size="lg" block>Ir a entrar</BaseButton>
      </div>
    </Transition>

    <!-- Paso 2: crear la contraseña -->
    <form v-if="step === 'password'" class="form" novalidate @submit.prevent="crearCuenta">
      <div class="aviso">
        <p class="aviso__title">Encontramos tu compra</p>
        <p class="aviso__text">
          <template v-if="status?.challenge">
            Compraste <strong>{{ status.challenge }}</strong>. Crea tu contraseña para entrar.
          </template>
          <template v-else>Crea tu contraseña para entrar.</template>
        </p>
      </div>

      <label class="field">
        <span>Correo</span>
        <input :value="form.email" type="email" disabled />
      </label>

      <label class="field">
        <span>Contraseña</span>
        <input v-model="form.password" type="password" autocomplete="new-password" required />
        <span class="field__hint">Mínimo 8 caracteres.</span>
      </label>

      <label class="field">
        <span>Repite la contraseña</span>
        <input v-model="form.repeat" type="password" autocomplete="new-password" required />
      </label>

      <Transition name="aviso">
        <p v-if="error" class="form__error">{{ error }}</p>
      </Transition>

      <BaseButton type="submit" size="lg" block :disabled="loading">
        {{ loading ? 'Creando…' : 'Crear mi contraseña' }}
      </BaseButton>

      <button type="button" class="volver" @click="volver">Usar otro correo</button>
    </form>

    <p class="alt">
      ¿Ya tienes contraseña?
      <RouterLink to="/login">Entra aquí</RouterLink>
    </p>
  </AuthShell>
</template>

<style lang="scss" scoped>
.volver {
  background: none;
  border: none;
  font-size: $text-sm;
  color: $ink-muted;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
</style>
