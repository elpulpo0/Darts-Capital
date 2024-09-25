<template>
  <div v-if="isVisible" class="modal-backdrop">
    <div class="modal">
      <h3>
        {{ $t('history.throwHistoryTitle', { playerName: player.name }) }}
      </h3>
      <div v-if="player.history && player.history.length">
        <ul>
          <li v-for="(entry, index) in player.history" :key="index">
            <strong>{{ entry.contract }} :</strong>
            {{ entry.darts.join(' | ') }}
          </li>
        </ul>
      </div>
      <p v-else>{{ $t('history.noThrows') }}</p>
      <button class="modal-button confirm-button" @click="closeModal">
        {{ $t('history.closeButton') }}
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

<style scoped>
@import "@/styles/popup.css";
</style>
