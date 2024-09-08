<template>
  <div class="home">
    <!-- Afficher le logo uniquement si la partie n'a pas encore commencé ou est terminée -->
    <div class="header" v-if="!gameStarted || gameOver">
      <img :src="require('@/assets/logo.png')" alt="Logo" class="logo" />
      <img :src="require('@/assets/capital.png')" alt="Title" class="capital" />
    </div>

    <!-- Composant PlayerSelection, visible quand la partie n'a pas commencé -->
    <PlayerSelection
      v-if="!gameStarted && !gameOver"
      @start-game="startGame"
      :defaultPlayers="preselectedPlayers"
    />

    <!-- Composant GameBoard, visible quand la partie a commencé -->
    <GameBoard
      v-else-if="gameStarted && !gameOver"
      :players="players"
      @game-over="handleGameOver"
      @restart-game="restartGame"
    />

    <!-- Composant GameOver, visible quand le jeu est terminé -->
    <GameOver v-if="gameOver" :winners="winners" @restart-game="restartGame" />
  </div>
</template>

<script>
import PlayerSelection from "@/components/PlayerSelection.vue";
import GameBoard from "@/components/GameBoard.vue";
import GameOver from "@/components/GameOver.vue";

export default {
  data() {
    return {
      gameStarted: false,
      gameOver: false,
      players: [],
      winners: [],
      preselectedPlayers: [], // Pour pré-sélectionner les joueurs si nécessaire
    };
  },
  methods: {
    startGame(selectedPlayers) {
      this.players = selectedPlayers.sort(() => Math.random() - 0.5);
      this.gameStarted = true;
      this.preselectedPlayers = []; // Réinitialiser après le début du jeu
    },
    handleGameOver(winners) {
      // Lorsque le jeu est terminé, afficher les gagnants et revenir à la sélection des joueurs
      this.winners = winners;
      this.gameStarted = false;
      this.gameOver = true;
    },
    restartGame() {
    this.gameStarted = false;
    this.gameOver = false;
    this.preselectedPlayers = [...this.players];
    this.players = [];
  },
  },
  components: {
    PlayerSelection,
    GameBoard,
    GameOver,
  },
};
</script>

<style scoped>
@import "@/styles/home.css";
</style>
