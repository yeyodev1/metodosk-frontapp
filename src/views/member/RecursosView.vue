<script setup lang="ts">
/**
 * Lo que la alumna necesita comprar antes de empezar.
 *
 * Es la misma lista que le llegó por correo el día de la compra. Está acá
 * porque ese correo se pierde entre todo lo demás, y esto es justo lo que se
 * va a querer releer parada en la tienda.
 *
 * Los dos casos —casa y gimnasio— se muestran juntos, sin preguntar cuál es:
 * son listas de tres líneas y una sola de ellas aplica, así que elegir cuesta
 * menos que responder una pregunta.
 */
import { GRUPOS_RECURSOS } from '@/config/recursos'
</script>

<template>
  <main class="recursos">
    <header class="recursos__head">
      <p class="recursos__eyebrow">Recursos</p>
      <h1 class="recursos__title">Lo que vas a necesitar</h1>
      <p class="recursos__sub">
        Nada más que esto. El reto está armado para que funcione con lo mínimo, así que no
        te compres media tienda antes de empezar.
      </p>
    </header>

    <section v-for="grupo in GRUPOS_RECURSOS" :key="grupo.id" class="grupo">
      <div class="grupo__head">
        <span class="grupo__icono"><FaIcon :icon="grupo.icono" /></span>
        <div>
          <h2 class="grupo__title">{{ grupo.titulo }}</h2>
          <p class="grupo__intro">{{ grupo.intro }}</p>
        </div>
      </div>

      <ul class="items">
        <li v-for="r in grupo.recursos" :key="r.nombre" class="item">
          <span class="item__marca"><FaIcon icon="basket-shopping" /></span>
          <div>
            <h3 class="item__nombre">{{ r.nombre }}</h3>
            <p class="item__detalle">{{ r.detalle }}</p>
          </div>
        </li>
      </ul>
    </section>

    <p class="recursos__nota">
      ¿Dudas con alguna medida o no consigues algo? Escríbenos por WhatsApp y lo resolvemos:
      casi siempre hay una forma de empezar con lo que ya tienes en casa.
    </p>
  </main>
</template>

<style lang="scss" scoped>
.recursos {
  padding: 0;
}

.recursos__head {
  margin-bottom: $space-md;
}

.recursos__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.recursos__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.recursos__sub {
  max-width: 46ch;
  margin-top: 0.5rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

/* ── Cada forma de entrenar ── */
.grupo {
  margin-bottom: $space-md;
  padding: 1.4rem 1.5rem;
  border-radius: $radius-lg;
  background-color: $cream;
}

.grupo__head {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  margin-bottom: 1.1rem;
}

.grupo__icono {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background-color: $sand;
  color: $ink;
  font-size: 0.95rem;
}

.grupo__title {
  font-family: $font-display;
  font-size: 1.35rem;
  line-height: 1.2;
  color: $ink;
}

.grupo__intro {
  margin-top: 0.15rem;
  font-size: $text-sm;
  color: $ink-soft;
}

/* ── Los implementos ── */
.items {
  list-style: none;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 0.9rem 0;
  border-top: 1px solid rgba($ink, 0.08);
}

.item__marca {
  flex: none;
  margin-top: 0.15rem;
  color: $ink-muted;
  font-size: 0.8rem;
}

.item__nombre {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.item__detalle {
  margin-top: 0.2rem;
  max-width: 54ch;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}

.recursos__nota {
  padding: 1.1rem 1.3rem;
  border-radius: $radius-md;
  background-color: $sand;
  font-size: $text-sm;
  line-height: 1.6;
  color: $ink-soft;
}
</style>
