<template>
  <div class="tournament-scoreboard">
    <h3>{{ $t('tournament.scoreboardTitle') }}</h3>
    <table class="scoreboard-table">
      <thead>
        <tr>
          <th>{{ $t('tournament.playerName') }}</th>
          <th>{{ $t('tournament.totalPoints') }}</th>
          <th>{{ $t('tournament.roundsWon') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="player in players" :key="player.name">
          <td>{{ player.name }}</td>
          <td>{{ player.capital }}</td> <!-- Affiche le score actuel (capital) -->
          <td>{{ player.roundsWon }}</td> <!-- Affiche le nombre de rounds gagnés -->
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    players: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
.tournament-scoreboard {
  margin: 20px 0;
  padding: 10px;
  background-color: #2c3e50;
  color: white;
  border-radius: 8px;
}

.scoreboard-table {
  width: 100%;
  border-collapse: collapse;
}

.scoreboard-table th,
.scoreboard-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #7f8c8d;
}

.scoreboard-table th {
  background-color: #34495e;
  color: #ecf0f1;
}

.scoreboard-table td {
  background-color: #3b4b5b;
}

.scoreboard-table tr:nth-child(even) td {
  background-color: #2c3e50;
}

.scoreboard-table tr:hover td {
  background-color: #34495e;
}
</style>
