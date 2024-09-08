<template>
  <div v-if="isVisible" class="modal-backdrop">
    <div class="modal">
      <h3>
        Historique des lancers de {{ player.name }}
      </h3>
      <div v-if="player.history && player.history.length">
        <ul>
          <li v-for="(entry, index) in player.history" :key="index">
            <strong>{{ entry.contract }} :</strong>
            {{ entry.darts.join(' | ') }}
          </li>
        </ul>
      </div>
      <p v-else>Aucun lancer enregistré</p>
      <button class="modal-button confirm-button" @click="closeModal">
        Fermer
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    player: {
      type: Object,
      required: true,
    },
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
  },
};
</script>