<template>
  <div>
    <p class="game-over-winners">
      {{ $t('gameOver.winners') }}
      <br />
      <br />
      <span v-for="(player, index) in winners" :key="index" class="winner-name">
        {{ player.name }}{{ index < winners.length - 1 ? ", " : "" }}
      </span>
      <br />
      <br />
      {{ $t('gameOver.withPoints', { points: winners[0].capital }) }}
    </p>
    <button class="restart-game-button" @click="$emit('restartGame')">
      {{ $t('gameOver.restartButton') }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    winners: Array,
  },
};
</script>

<style scoped>
@import "@/styles/popup.css";
</style>
