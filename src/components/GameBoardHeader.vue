<template>
  <div class="game-board-header">
    <h2 v-if="!contractResult && isInitialPhase" @click="$emit('open-contract-rules')">
      {{ $t('gameBoard.initialCapital') }}
      <font-awesome-icon :icon="['fas', 'info-circle']" class="info-icon" />
    </h2>
    <h2 v-else-if="!contractResult && gameOver">{{ $t('gameBoard.gameOver') }}</h2>
    <h2 v-else @click="$emit('open-contract-rules')">
      {{ $t('gameBoard.mission', { name: currentContract?.name }) }}
      <font-awesome-icon :icon="['fas', 'info-circle']" class="info-icon" />
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

    <span v-if="!contractResult">
      <div v-if="isInitialPhase">
        <p class="instruction-text">{{ $t('gameBoard.defineCapital') }}</p>
      </div>

      <div v-else-if="!gameOver">
        <p class="instruction-text">{{ $t(currentContract?.descriptionKey) }}</p>
      </div>
    </span>
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
