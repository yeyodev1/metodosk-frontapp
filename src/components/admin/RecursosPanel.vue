<script setup lang="ts">
/**
 * Cómo va el envío de la lista de implementos a quienes compraron antes de que
 * el correo de acceso la incluyera.
 *
 * Solo informa: el envío lo hace un cron cada día y no depende de que nadie
 * entre acá a apretar nada. Lo que falla vuelve a intentarse a la mañana
 * siguiente, así que tampoco hay un botón de reintento que alguien deba
 * acordarse de tocar.
 */
import { onMounted, ref } from 'vue'
import adminService, { type RecursosEstado } from '@/services/adminService'

const estado = ref<RecursosEstado | null>(null)

async function cargar() {
  try {
    estado.value = await adminService.estadoRecursos()
  } catch {
    // Un panel secundario no debe romper la pantalla de compras.
    estado.value = null
  }
}

onMounted(cargar)
</script>

<template>
  <section v-if="estado" class="recursos">
    <div class="recursos__texto">
      <h2 class="recursos__title">Lista de implementos</h2>
      <p class="recursos__sub">
        <template v-if="estado.pendientes">
          Enviada a {{ estado.enviados }} de {{ estado.total }}. Faltan
          <strong>{{ estado.pendientes }}</strong
          >, y salen solas: cada día a las 9:00 se manda la siguiente tanda hasta
          terminar. No hay que hacer nada.
        </template>
        <template v-else>
          Enviada a las {{ estado.total }} alumnas. Las nuevas la reciben dentro del correo
          de compra.
        </template>
      </p>
    </div>

    <span v-if="estado.pendientes" class="recursos__estado">En curso</span>
  </section>
</template>

<style lang="scss" scoped>
.recursos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: $space-md;
  padding: 1.1rem 1.3rem;
  border-radius: $radius-md;
  background-color: $sand;
}

.recursos__texto {
  flex: 1 1 300px;
}

.recursos__title {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.recursos__sub {
  margin-top: 0.2rem;
  font-size: $text-xs;
  line-height: 1.5;
  color: $ink-soft;
}

.recursos__estado {
  padding: 0.35rem 0.85rem;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.08);
  font-size: $text-xs;
  color: $ink-soft;
  white-space: nowrap;
}
</style>
