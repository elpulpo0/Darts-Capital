<template>
  <div class="home">
    <!-- Afficher le logo uniquement si la partie n'a pas encore commencé -->
    <div class="header" v-if="!gameStarted">
      <img :src="require('@/assets/logo.png')" alt="Logo" class="logo" />
      <img :src="require('@/assets/capital.png')" alt="Title" class="capital" />
    </div>

    <!-- Composant PlayerSelection, visible quand la partie n'a pas commencé -->
    <PlayerSelection
      v-if="!gameStarted"
      @start-game="startGame"
      :defaultPlayers="preselectedPlayers"
    />

    <!-- Composant GameBoard, visible quand la partie a commencé -->
    <GameBoard v-else :players="players" @game-over="handleGameOver" />
  </div>
</template>

<script>
import PlayerSelection from "@/components/PlayerSelection.vue";
import GameBoard from "@/components/GameBoard.vue";

export default {
  data() {
    return {
      gameStarted: false,
      players: [],
      preselectedPlayers: [] // Pour pré-sélectionner les joueurs si nécessaire
    };
  },
  methods: {
    startGame(selectedPlayers) {
      this.players = selectedPlayers.sort(() => Math.random() - 0.5);
      this.gameStarted = true;
      this.preselectedPlayers = []; // Réinitialiser après le début du jeu
    },
    handleGameOver() {
      // Lorsqu'un jeu est terminé, vous pouvez préparer les joueurs pour le redémarrage
      this.preselectedPlayers = this.players;
      this.gameStarted = false; // Revenir à l'état de sélection des joueurs
    }
  },
  components: {
    PlayerSelection,
    GameBoard,
  },
  
};
</script>

<style scoped>
@import "@/styles/home.css";
</style>
