<template>
  <div>
    <p class="game-over-winners">
      Le(s) gagnant(s) :
      <br />
      <br />
      <span v-for="(player, index) in winners" :key="index" class="winner-name">
        {{ player.name }}{{ index < winners.length - 1 ? ", " : "" }}
      </span>
      <br />
      <br />
      avec <span class="points">{{ winners[0].capital }} points !</span>
    </p>
    <button class="restart-game-button" @click="$emit('restartGame')">
      Recommencer
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
