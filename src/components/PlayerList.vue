<template>
  <div class="players-scores">
    <ul>
      <li
        v-for="(player, index) in localPlayers"
        :key="index"
        :class="{ 'player-active': index === currentPlayerIndex }"
        @click="$emit('show-player-history', index)"
      >
        <!-- Informations joueur -->
        <div class="player-info">
          <img :src="player.avatar" alt="Avatar" class="player-avatar" />
          <div class="player-details">
            <div class="player-main-info">
              <div class="name-and-score">
                <span class="player-name">{{ player.name }}</span>
                <span class="player-score">{{ player.capital }} points</span>
              </div>
              <div class="player-additional-info">
                <span
                  >({{ player.currentRoundPoints }}) |
                  {{ player.dartsDisplay.join(" | ") }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Statut des contrats -->
        <div class="contracts-status">
          <span
            v-for="(contract, idx) in contracts"
            :key="idx"
            :class="{
              'contract-success': player.contractsStatus[idx]?.success === true,
              'contract-fail': player.contractsStatus[idx]?.success === false,
              'contract-pending':
                player.contractsStatus[idx]?.success === undefined,
            }"
            class="contract-circle"
          >
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    localPlayers: Array,
    currentPlayerIndex: Number,
    contracts: Array,
  },
};
</script>
