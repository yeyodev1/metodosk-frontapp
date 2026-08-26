<script setup lang="ts">
import PayphoneCheckout from '@/components/payment/PayphoneCheckout.vue'
</script>

<template>
  <div class="app-container">
    <!--
      Transición entre vistas.

      SIN `mode="out-in"` a propósito. Con out-in, montar la vista nueva depende
      de que la salida avise que terminó; si ese aviso no llega, no se monta
      nada y la pantalla queda en blanco. Es lo que pasaba al ir del home al
      login: el home mide más de 13.000px, quedaba en opacity 0 antes de
      empezar a salir, ninguna propiedad cambiaba, el navegador no disparaba
      `transitionend` y la navegación moría ahí. Recargar lo arreglaba porque
      no había vista anterior de la que salir.

      Cruzándolas, la entrante se monta siempre, pase lo que pase con la que
      sale. Solo se anima la opacidad: mover con `transform` un elemento de esa
      altura obliga a componer la página entera.

      La saliente se saca del flujo para que no empuje a la entrante mientras
      ambas coexisten ese instante.

    -->
    <RouterView v-slot="{ Component, route }">
      <Transition name="page">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>

    <PayphoneCheckout />
  </div>
</template>

<style lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/**
 * Se anima con @keyframes, no con transition, y a propósito NO existe una
 * regla `.page-enter-from { opacity: 0 }`.
 *
 * Con transition, la vista arranca en opacity 0 y solo se vuelve visible
 * cuando Vue quita esa clase en el siguiente frame. Si ese frame se demora
 * —pestaña en segundo plano, hilo principal ocupado, el home mide más de
 * 13.000px— la clase se queda pegada y la página entera queda invisible.
 * Era exactamente el bug: en blanco al navegar, bien al recargar.
 *
 * Con keyframes el estado natural del elemento es visible; la animación solo
 * lo atenúa mientras corre. Si nunca llega a correr, se ve sin animación.
 * Falla visible, no en blanco.
 */
.page-enter-active {
  animation: page-in 0.28s ease-out;
}

.page-leave-active {
  position: absolute;
  inset: 0;
  animation: page-out 0.16s ease-in forwards;
}

@keyframes page-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes page-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    animation-duration: 0.01ms;
  }
}
</style>
