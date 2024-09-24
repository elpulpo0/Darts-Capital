<template>
  <div class="home">
    <div class="header" v-if="!gameStarted || gameOver">
      <img :src="require('@/assets/capital.png')" alt="Title" class="capital" />
      <img
        :src="require('@/assets/logo.png')"
        alt="Logo"
        class="logo"
        @click="showAssociationInfo = true"
      />
    </div>

    <PlayerSelection
      v-if="!gameStarted && !gameOver"
      @start-game="startGame"
      :defaultPlayers="preselectedPlayers"
      @restore-game="prepareGameForRestore"
      :soundEnabled="soundEnabled"
      :iaDifficulty="iaDifficulty"
      :theme="theme"
      @settings-saved="handleSettingsSaved"
    />

    <GameBoard
      v-else-if="gameStarted && !gameOver"
      ref="gameBoard"
      :players="players"
      @game-over="handleGameOver"
      @restart-game="restartGame"
      :soundEnabled="soundEnabled"
      :iaDifficulty="iaDifficulty"
      :theme="theme"
    />

    <GameOver v-if="gameOver" :winners="winners" @restart-game="restartGame" />

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
import { computed } from 'vue';
import PlayerSelection from "@/components/PlayerSelection.vue";
import GameBoard from "@/components/GameBoard.vue";
import GameOver from "@/components/GameOver.vue";
import { useStore } from "vuex";

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
  setup() {
    const store = useStore();

    // Accéder aux réglages via le store
    const soundEnabled = computed(() => store.state.settings.soundEnabled);
    const iaDifficulty = computed(() => store.state.settings.iaDifficulty);
    const theme = computed(() => store.state.settings.theme);

    return {
      soundEnabled,
      iaDifficulty,
      theme,
    };
  },
  watch: {
    gameStarted(newVal) {
      if (newVal && this.restoreGameState) {
        this.$nextTick(() => {
          if (this.$refs.gameBoard && typeof this.$refs.gameBoard.restoreGame === "function") {
            const savedSnapshot = localStorage.getItem("dartGameSnapshot");
            if (savedSnapshot) {
              const snapshot = JSON.parse(savedSnapshot);
              this.$refs.gameBoard.restoreGame(snapshot);
              this.restoreGameState = false;
            }
          } else {
            console.error("GameBoard component is not available or restoreGame is not a function.");
          }
        });
      }
    },
  },
  methods: {
    handleSettingsSaved(newSoundSetting, newIaDifficulty, newTheme) {
      this.$store.commit('setSoundEnabled', newSoundSetting);
      this.$store.commit('setIaDifficulty', newIaDifficulty);
      this.$store.commit('setTheme', newTheme);
    },
    openLink(url) {
      window.open(url, "_blank");
    },
    startGame(selectedPlayers) {
      this.players = selectedPlayers.sort(() => Math.random() - 0.5);
      this.gameStarted = true;
      this.restoreGameState = false;
      this.preselectedPlayers = [];
    },
    prepareGameForRestore() {
      const savedSnapshot = localStorage.getItem("dartGameSnapshot");
      if (savedSnapshot) {
        this.restoreGameState = true;
        this.players = JSON.parse(savedSnapshot).players;
        this.gameStarted = true;
      } else {
        console.error("No saved game state found in localStorage.");
      }
    },
    handleGameOver(winners) {
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
@import "@/styles/popup.css";
</style>
