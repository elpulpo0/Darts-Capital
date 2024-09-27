<template>
  <div class="player-selection">
    <div class="topline-container">
      <div class="settings-container">
        <button @click="openSettingsModal" class="settings-button-home">
          <font-awesome-icon :icon="['fas', 'cog']" />
        </button>
      </div>
      <div class="title-container">
        <h2 class="title">{{ $t("home.title") }}</h2>
      </div>
    </div>

    <p v-if="storedPlayers.length === 0" class="instruction-text">
      {{ $t("home.addPlayerToStart") }}
    </p>

    <p v-if="storedPlayers.length > 0" class="instruction-text">
      {{ $t("home.clicOnPlayerToSelect") }}
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
      <button @click="addComputerPlayer" class="add-ia-button">
        {{ $t("home.addAi") }}
      </button>
      <form @submit.prevent="addNewPlayer" class="add-player-form">
        <input
          v-model="newPlayerName"
          type="text"
          :placeholder="$t('home.addPlayer')"
          class="player-input"
        />
        <button type="submit" class="add-button">+</button>
      </form>
    </div>

    <div class="mode-selection">
      <button @click="toggleGameMode('left')" class="arrow-button">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
      <button
        @click="gameMode === 'normal' ? startGame() : startTournament()"
        :disabled="isStartDisabled"
        class="start-game-button"
        :class="{ disabled: isStartDisabled }"
      >
        {{
          isStartDisabled
            ? gameMode === "normal"
              ? $t("home.select2players")
              : $t("home.select4players")
            : gameMode === "normal"
              ? $t("home.startGame")
              : $t("home.startTournament")
        }}
      </button>
      <button @click="toggleGameMode('right')" class="arrow-button">
        <font-awesome-icon :icon="['fas', 'arrow-right']" />
      </button>
    </div>

    <button
      @click="restoreGame"
      :disabled="!gameSaved"
      class="start-game-button"
      :class="{ disabled: !gameSaved }"
    >
      {{ $t("home.restoreGame") }}
    </button>

    <p class="privacy-link">
      <router-link to="/privacy-policy">{{
        $t("home.privacyPolicy")
      }}</router-link>
    </p>
    <ModalsHandler
      :showSettingsModal="showSettingsModal"
      :soundEnabled="soundEnabled"
      :iaDifficulty="iaDifficulty"
      :theme="theme"
      @close-settings-modal="closeSettingsModal"
    />
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import ModalsHandler from "./ModalsHandler.vue";

export default {
  props: {
    defaultPlayers: Array,
  },
  components: {
    ModalsHandler,
  },
  data() {
    return {
      showSettingsModal: false,
      storedPlayers: [],
      selectedPlayers: [],
      newPlayerName: "",
      gameSaved: false,
      gameMode: "normal",
    };
  },
  computed: {
    isStartDisabled() {
      // Désactiver si moins de 2 joueurs pour le mode normal ou moins de 4 pour le mode tournoi
      if (this.gameMode === "normal") {
        return this.selectedPlayers.length < 2; // Mode normal exige 2 joueurs minimum
      } else if (this.gameMode === "tournament") {
        return this.selectedPlayers.length < 4; // Mode tournoi exige 4 joueurs minimum
      } else {
        return true; // Par défaut, désactiver si aucun mode valide
      }
    },
  },
  setup() {
    const store = useStore();

    // Accéder aux réglages
    const soundEnabled = computed(() => store.state.settings.soundEnabled);
    const iaDifficulty = computed(() => store.state.settings.iaDifficulty);
    const theme = computed(() => store.state.settings.theme);

    return { soundEnabled, iaDifficulty, theme, store };
  },
  mounted() {
    this.loadStoredPlayers();
    this.checkSavedGame();
  },
  methods: {
    toggleGameMode(direction) {
      const modes = ["normal", "tournament"];
      const currentIndex = modes.indexOf(this.gameMode);
      if (direction === "left") {
        this.gameMode = modes[(currentIndex - 1 + modes.length) % modes.length];
      } else {
        this.gameMode = modes[(currentIndex + 1) % modes.length];
      }
    },
    openSettingsModal() {
      this.showSettingsModal = true;
    },
    closeSettingsModal() {
      this.showSettingsModal = false;
    },
    addComputerPlayer() {
      const context = require.context("@/assets/ProPlayers", false, /\.png$/);
      const avatars = context.keys().map(context);
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      const fileName = randomAvatar.split("/").pop().split(".")[0];
      const playerName = fileName.replace(/_/g, " ");
      const computerPlayer = {
        name: playerName,
        isComputer: true,
        avatar: randomAvatar,
        capital: 0,
        score: 0,
        darts: [],
        dartsDisplay: [],
      };
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
    startTournament() {
      this.storedPlayers = this.storedPlayers.map((player) => ({
        ...player,
        darts: [],
        dartsDisplay: [],
      }));
      this.$emit("start-tournament", this.selectedPlayers);
    },
    updateSettings(newSoundSetting, newIaDifficulty, newTheme) {
      this.store.commit("setSoundEnabled", newSoundSetting);
      this.store.commit("setIaDifficulty", newIaDifficulty);
      this.store.commit("setTheme", newTheme);
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
@import "@/styles/popup.css";
</style>
