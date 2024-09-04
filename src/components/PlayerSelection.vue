<template>
  <div class="player-selection">
    <h2>Sélection des Joueurs</h2>

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
        :class="{ selected: isSelected(player) }"
        @click="handleClick(player, index)"
        @mousedown="startHold(index)"
        @mouseup="clearHold"
        @mouseleave="clearHold"
        @touchstart="startHold(index)"
        @touchend="clearHold"
      >
        <img
          :src="player.avatar"
          alt="Avatar"
          class="player-avatar"
        />
        <div class="player-info">
          <span class="player-name">{{ player.name }}</span>
        </div>
      </li>
    </ul>

    <h3>Ajouter un Nouveau Joueur</h3>
    <form @submit.prevent="addNewPlayer" class="add-player-form">
      <input
        v-model="newPlayerName"
        type="text"
        placeholder="Nom du joueur"
        class="player-input"
      />
      <button type="submit" class="add-button">+</button>
    </form>

    <button
      @click="startGame"
      :disabled="selectedPlayers.length === 0"
      class="start-game-button"
      :class="{ disabled: selectedPlayers.length === 0 }"
    >
      Lancer le jeu
    </button>
  </div>
</template>

<script>
export default {
  props: {
    defaultPlayers: Array // Recevoir les joueurs pré-sélectionnés
  },
  data() {
    return {
      storedPlayers: [],
      selectedPlayers: [],
      newPlayerName: "",
      holdTimeout: null,
      holding: false,
    };
  },
  mounted() {
    this.loadStoredPlayers();
  },
  methods: {
    loadStoredPlayers() {
      const players = localStorage.getItem("players");
      if (players) {
        this.storedPlayers = JSON.parse(players);
        // Pré-sélectionner les joueurs reçus par les props
        this.selectedPlayers = this.storedPlayers.filter(player =>
          this.defaultPlayers.some(defaultPlayer => defaultPlayer.name === player.name)
        );
      }
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
        this.selectedPlayers = this.selectedPlayers.filter(p => p !== player);
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
        const context = require.context(
          "@/assets/ProPlayers",
          false,
          /\.png$/
        );
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
      this.selectedPlayers = this.selectedPlayers.filter(player => player !== removedPlayer);
      this.savePlayers();
    },
    savePlayers() {
      localStorage.setItem("players", JSON.stringify(this.storedPlayers));
    },
    startGame() {
      this.storedPlayers = this.storedPlayers.map(player => ({
        ...player,
        darts: [],
        dartsDisplay: [],
      }));
      this.$emit("start-game", this.selectedPlayers);
    },
    isSelected(player) {
      return this.selectedPlayers.includes(player);
    }
  }
};
</script>

<style scoped>
@import "@/styles/player-selection.css";
@import "@/styles/home.css";
</style>
