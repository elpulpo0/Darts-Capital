<template>
  <div class="tournament-board">
    <!-- En-tête pour indiquer le mode tournoi -->
    <div class="tournament-header">
      <h2>{{ $t("tournament.title") }}</h2>
      <p>{{ $t("tournament.round") }} {{ currentRound }} / {{ totalRounds }}</p>
    </div>

    <!-- Tableau des scores du tournoi -->
    <TournamentScoreboard :players="localPlayers" :round="currentRound" />

    <!-- Bouton pour commencer la partie -->
    <button @click="startNextGame" class="start-game-button">
      {{ $t("tournament.playNextRound") }}
    </button>

    <!-- Modal pour afficher les gagnants du tournoi -->
    <div v-if="tournamentOver">
      <h2>{{ $t("tournament.winner") }}: {{ tournamentWinner.name }}</h2>
      <button @click="restartTournament">{{ $t("tournament.restart") }}</button>
    </div>
  </div>
</template>

<script>
import TournamentScoreboard from "./TournamentScoreboard.vue";
export default {
  components: {
    TournamentScoreboard,
  },
  props: {
    players: Array,
  },
  data() {
    return {
      localPlayers: this.players.map((player) => ({
        ...player,
        score: 0,
        roundsWon: 0,
      })),
      currentRound: 1,
      totalRounds: 5,
      tournamentOver: false,
      tournamentWinner: null,
    };
  },
  methods: {
    startNextGame() {
      // Naviguer vers le composant GameBoard en passant les joueurs dans la query string
      this.$router.push({
        name: "GameBoard",
        query: {
          players: JSON.stringify(this.localPlayers), // Convertir les joueurs en JSON
          round: this.currentRound,
          isTournamentMode: true,
        },
      });
    },
    handleGameOver(winners) {
      winners.forEach((winner) => {
        const player = this.localPlayers.find((p) => p.name === winner.name);
        player.roundsWon++;
      });

      this.currentRound++;

      if (this.currentRound > this.totalRounds) {
        this.endTournament();
      }
    },
    endTournament() {
      this.tournamentOver = true;
      this.tournamentWinner = this.localPlayers.reduce((max, player) =>
        player.roundsWon > max.roundsWon ? player : max,
      );
      this.$emit("tournament-over", this.tournamentWinner);
    },
    restartTournament() {
      this.tournamentOver = false;
      this.currentRound = 1;
      this.localPlayers.forEach((player) => {
        player.roundsWon = 0;
      });
    },
  },
};
</script>

<style scoped>
/* @import "@/styles/tournament.css"; */
</style>
