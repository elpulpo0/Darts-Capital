<template>
  <div class="home">
    <!-- Show the logo only if the game hasn't started or it's over -->
    <div class="header" v-if="!gameStarted || gameOver">
      <img :src="require('@/assets/capital.png')" alt="Title" class="capital" />
      <img
        :src="require('@/assets/logo.png')"
        alt="Logo"
        class="logo"
        @click="showAssociationInfo = true"
      />
    </div>

    <!-- PlayerSelection component, visible when the game has not started -->
    <PlayerSelection
      v-if="!gameStarted && !gameOver"
      @start-game="startGame"
      :defaultPlayers="preselectedPlayers"
      @restore-game="prepareGameForRestore"
    />

    <!-- GameBoard component, visible when the game has started -->
    <GameBoard
      v-else-if="gameStarted && !gameOver"
      ref="gameBoard"
      :players="players"
      @game-over="handleGameOver"
      @restart-game="restartGame"
    />

    <!-- GameOver component, visible when the game is over -->
    <GameOver v-if="gameOver" :winners="winners" @restart-game="restartGame" />

    <!-- Modale d'information sur l'association -->
    <div v-if="showAssociationInfo" class="modal-backdrop">
      <div class="modal">
        <h3>VojvoDarts Côte d'Azur</h3>
        <p class="modal-message">
          L’association a pour objet de :
          <br /><br />
          - Proposer l’initiation au jeu de fléchettes traditionnelles au grand
          public.<br /><br />
          - Développer la vocation éducative et sociale du sport<br /><br />
          - Proposer à ses membres la pratique libre ou encadrée du jeu de
          fléchettes traditionnelles et éventuellement électroniques.
        </p>

        <div class="social-buttons">
  <button
    class="social-button"
    @click="openLink('https://www.instagram.com/vojvodarts', '_blank')"
  >
    <font-awesome-icon :icon="['fab', 'instagram']" />
  </button>
  <button
    class="social-button"
    @click="openLink('https://www.facebook.com/VojvoDarts', '_blank')"
  >
    <font-awesome-icon :icon="['fab', 'facebook']" />
  </button>
</div>

        <div class="modal-actions">
          <button
            class="modal-button cancel-button"
            @click="showAssociationInfo = false"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
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
      preselectedPlayers: [],
      restoreGameState: false,
      showAssociationInfo: false,
    };
  },
  watch: {
    gameStarted(newVal) {
      if (newVal && this.restoreGameState) {
        // Only restore the game if the user chose to restore a saved game
        this.$nextTick(() => {
          if (
            this.$refs.gameBoard &&
            typeof this.$refs.gameBoard.restoreGame === "function"
          ) {
            const savedSnapshot = localStorage.getItem("dartGameSnapshot");
            if (savedSnapshot) {
              const snapshot = JSON.parse(savedSnapshot);
              this.$refs.gameBoard.restoreGame(snapshot);
              this.restoreGameState = false; // Reset the flag after restoring
            }
          } else {
            console.error(
              "GameBoard component is not available or restoreGame is not a function.",
            );
          }
        });
      }
    },
  },
  methods: {
    openLink(url) {
      window.open(url, "_blank");
    },
    startGame(selectedPlayers) {
      // Start a new game without restoring any saved state
      this.players = selectedPlayers.sort(() => Math.random() - 0.5);
      this.gameStarted = true;
      this.restoreGameState = false; // Ensure no restoration happens during new game
      this.preselectedPlayers = []; // Reset after starting the game
    },
    prepareGameForRestore() {
      // Called when the user clicks "Restaurer la partie"
      const savedSnapshot = localStorage.getItem("dartGameSnapshot");
      if (savedSnapshot) {
        this.restoreGameState = true; // Set flag to restore game
        this.players = JSON.parse(savedSnapshot).players; // Preselect the players
        this.gameStarted = true; // Mark the game as started to trigger GameBoard mount
      } else {
        console.error("No saved game state found in localStorage.");
      }
    },
    handleGameOver(winners) {
      // When the game is over, show the winners and return to player selection
      this.winners = winners;
      this.gameStarted = false;
      this.gameOver = true;
    },
    restartGame() {
      // Reset the game state and allow the user to start fresh
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
@import "@/styles/popup.css";
</style>
