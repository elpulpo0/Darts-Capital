<template>
  <div class="game-board-header">
    <h2 v-if="!contractResult && isInitialPhase" @click="$emit('open-contract-rules')">
      Capital Initial<font-awesome-icon
        :icon="['fas', 'info-circle']"
        class="info-icon"
      />
    </h2>
    <h2 v-else-if="!contractResult && gameOver">Le jeu est terminé !</h2>
    <h2 v-else @click="$emit('open-contract-rules')">
      Mission : {{ currentContract?.name
      }}<font-awesome-icon :icon="['fas', 'info-circle']" class="info-icon" />
    </h2>

    <button
      v-if="!gameOver"
      class="back-button-top-right"
      @click="$emit('show-confirm-popup')"
    >
      <font-awesome-icon :icon="['fas', 'undo-alt']" />
    </button>

    <button
      v-if="!gameOver"
      class="settings-button-top-left"
      @click="$emit('open-settings-modal')"
    >
      <font-awesome-icon :icon="['fas', 'cog']" />
    </button>
  </div>
</template>

<script>
export default {
  props: {
    contractResult: Boolean,
    isInitialPhase: Boolean,
    gameOver: Boolean,
    currentContract: Object,
  },
};
</script>
