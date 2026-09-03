<script setup lang="ts">
/**
 * La comunidad.
 *
 * Un muro compartido, con foto de perfil opcional y la hora al lado de cada
 * mensaje. No reemplaza a los comentarios de cada video —esos siguen colgando
 * del video que se está viendo— sino que cubre lo otro: presentarse, contar
 * cómo va la semana, preguntar algo que no es de ningún ejercicio en concreto.
 *
 * Alrededor va lo que corresponde a una pre-venta: qué está abierto hoy, qué
 * se abre pronto, y qué se lleva por haber comprado antes.
 */
import { onMounted, ref } from 'vue'
import communityService, { type MiPerfil } from '@/services/communityService'
import perksService, { type Beneficios } from '@/services/perksService'
import CommunityChat from '@/components/community/CommunityChat.vue'
import AvatarPicker from '@/components/community/AvatarPicker.vue'
import PerksCard from '@/components/member/PerksCard.vue'
import '@/plugins/icons'

const perfil = ref<MiPerfil | null>(null)
const beneficios = ref<Beneficios | null>(null)

onMounted(async () => {
  // Se piden juntos: son dos tarjetas de la misma pantalla y encadenarlos
  // haría esperar a la segunda por la primera sin ninguna razón.
  const [p, b] = await Promise.allSettled([
    communityService.miPerfil(),
    perksService.beneficios(),
  ])
  if (p.status === 'fulfilled') perfil.value = p.value
  if (b.status === 'fulfilled') beneficios.value = b.value
})
</script>

<template>
  <div class="com">
    <header class="hero">
      <p class="hero__eyebrow"><FaIcon icon="comments" /> Entre nosotras</p>
      <h1 class="hero__title">La comunidad</h1>
      <p class="hero__sub">
        El muro de todas las que están haciendo el reto. Preséntate, cuenta cómo te fue la semana o
        pregunta lo que sea. Para dudas de un ejercicio en concreto, los comentarios de cada video
        siguen siendo el mejor sitio.
      </p>
    </header>

    <div class="cuerpo">
      <div class="principal">
        <CommunityChat />
      </div>

      <aside class="lado">
        <AvatarPicker
          v-if="perfil"
          :perfil="perfil"
          @actualizado="perfil = $event"
        />
        <PerksCard v-if="beneficios" :beneficios="beneficios" />
      </aside>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.com {
  padding: 4.2rem clamp(1rem, 3vw, 2.5rem) 4rem;

  @include from('lg') {
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
  }
}

.hero {
  max-width: 70ch;
  margin-bottom: $space-md;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @include eyebrow;

  svg {
    font-size: 0.8em;
  }
}

.hero__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.hero__sub {
  margin-top: 0.5rem;
  font-size: $text-base;
  line-height: 1.6;
  color: $ink-soft;
}

/* Dos columnas con flex-wrap: en este proyecto no se usa CSS Grid. */
.cuerpo {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: $space-sm;
}

.principal {
  flex: 1 1 340px;
  min-width: 0;
}

.lado {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  min-width: 0;

  @include from('lg') {
    max-width: 380px;
  }
}
</style>
