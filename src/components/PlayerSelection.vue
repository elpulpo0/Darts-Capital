<template>
  <div class="player-selection">
    <h2>Sélection des joueurs</h2>

    <p v-if="storedPlayers.length === 0" class="instruction-text">
      Ajoutez des joueurs pour commencer.
    </p>

    <p v-if="storedPlayers.length > 0" class="instruction-text">
      Cliquez sur les joueurs pour les sélectionner.
    </p>

    <ul class="player-list">
      <li
        v-for="(player, index) in storedPlayers"
        :key="index"
        class="player-item"
        :class="{ selected: isSelected(player), computer: player.isComputer }"
        @click="handleClick(player, index)"
      >
        <img :src="player.avatar" alt="Avatar" class="player-avatar" />
        <div class="player-info">
          <!-- Appliquer une couleur différente pour les ordinateurs -->
          <span
            class="player-name"
            :style="{ color: player.isComputer ? '#3498db' : 'white' }"
          >
            {{ player.name }}
          </span>
        </div>
        <span class="delete-icon" @click.stop="removePlayer(index)">
          &#10005;
        </span>
      </li>
    </ul>

    <div class="add-players-container">
  <!-- À gauche : Bouton pour ajouter une IA -->
  <button @click="addComputerPlayer" class="add-ia-button">
    Ajouter une IA
  </button>

  <!-- À droite : Formulaire pour ajouter un joueur (input + bouton +) -->
  <form @submit.prevent="addNewPlayer" class="add-player-form">
    <input
      v-model="newPlayerName"
      type="text"
      placeholder="Ajouter un joueur"
      class="player-input"
    />
    <button type="submit" class="add-button">+</button>
  </form>
</div>


    <button
      @click="startGame"
      :disabled="selectedPlayers.length < 2"
      class="start-game-button"
      :class="{ disabled: selectedPlayers.length < 2 }"
    >
      {{
        selectedPlayers.length < 2
          ? "Sélectionnez au moins 2 joueurs"
          : "Lancer une nouvelle partie"
      }}
    </button>

    <button
      @click="restoreGame"
      :disabled="!gameSaved"
      class="start-game-button"
      :class="{ disabled: !gameSaved }"
    >
      Restaurer la partie sauvegardée
    </button>

    <p class="privacy-link">
      <router-link to="/privacy-policy"
        >Politique de confidentialité</router-link
      >
    </p>
  </div>
</template>

<script>
export default {
  props: {
    defaultPlayers: Array,
  },
  data() {
    return {
      storedPlayers: [],
      selectedPlayers: [],
      newPlayerName: "",
      newComputerName: "",
      holdTimeout: null,
      holding: false,
      gameSaved: false,
    };
  },
  mounted() {
    this.loadStoredPlayers();
    this.checkSavedGame();
  },
  methods: {
    addComputerPlayer() {
      // Charger tous les avatars disponibles
      const context = require.context("@/assets/ProPlayers", false, /\.png$/);
      const avatars = context.keys().map(context);

      // Sélectionner un avatar aléatoire
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

      // Extraire le nom du fichier pour générer le nom du joueur
      const fileName = randomAvatar.split("/").pop().split(".")[0]; // Récupérer seulement le nom sans l'extension
      const playerName = fileName.replace(/_/g, " "); // Remplacer les underscores par des espaces

      // Créer le joueur ordinateur avec le nom extrait du fichier
      const computerPlayer = {
        name: playerName,
        isComputer: true,
        avatar: randomAvatar,
        capital: 0,
        score: 0,
        darts: [],
        dartsDisplay: [],
      };

      // Ajouter le joueur ordinateur à la liste des joueurs
      this.storedPlayers.push(computerPlayer);
      this.selectedPlayers.push(computerPlayer);
    },
    loadStoredPlayers() {
      const players = localStorage.getItem("players");
      if (players) {
        this.storedPlayers = JSON.parse(players);
        this.selectedPlayers = this.storedPlayers.filter((player) =>
          this.defaultPlayers.some(
            (defaultPlayer) => defaultPlayer.name === player.name,
          ),
        );
      }
    },
    checkSavedGame() {
      const savedGame = localStorage.getItem("dartGameSnapshot");
      this.gameSaved = !!savedGame;
    },
    restoreGame() {
      this.$emit("restore-game");
    },
    handleClick(player) {
      if (this.holding) {
        return;
      }
      this.toggleSelection(player);
    },
    toggleSelection(player) {
      const isSelected = this.selectedPlayers.includes(player);
      if (isSelected) {
        this.selectedPlayers = this.selectedPlayers.filter((p) => p !== player);
      } else {
        this.selectedPlayers.push(player);
      }
    },
    startHold(index) {
      this.holding = false;
      this.clearHold();
      this.holdTimeout = setTimeout(() => {
        this.holding = true;
        this.removePlayer(index);
      }, 800);
    },
    clearHold() {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    },
    addNewPlayer() {
      if (this.newPlayerName !== "") {
        const context = require.context("@/assets/ProPlayers", false, /\.png$/);
        const avatars = context.keys().map(context);
        const randomAvatar =
          avatars[Math.floor(Math.random() * avatars.length)];

        const newPlayer = {
          name: this.newPlayerName,
          avatar: randomAvatar,
          capital: 0,
          score: 0,
          darts: [],
          dartsDisplay: [],
        };

        this.storedPlayers.push(newPlayer);
        this.newPlayerName = "";
        this.savePlayers();
      }
    },
    removePlayer(index) {
      const removedPlayer = this.storedPlayers.splice(index, 1)[0];
      this.selectedPlayers = this.selectedPlayers.filter(
        (player) => player !== removedPlayer,
      );
      this.savePlayers();
    },
    savePlayers() {
      localStorage.setItem("players", JSON.stringify(this.storedPlayers));
    },
    startGame() {
      this.storedPlayers = this.storedPlayers.map((player) => ({
        ...player,
        darts: [],
        dartsDisplay: [],
      }));
      this.$emit("start-game", this.selectedPlayers);
    },
    isSelected(player) {
      return this.selectedPlayers.includes(player);
    },
  },
};
</script>

<style scoped>
@import "@/styles/player-selection.css";
@import "@/styles/home.css";
</style>
