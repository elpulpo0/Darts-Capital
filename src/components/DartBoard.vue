<template>
  <!-- Si le contrat est un nombre, afficher le dartboard simplifié -->
  <div v-if="isNumericContract" class="dartboard">
    <div class="dartboard-row">
      <!-- Afficher uniquement le numéro du contrat -->
      <button
        v-if="contractNumber"
        :key="contractNumber"
        @click="$emit('add-dart', contractNumber)"
        class="dartboard-unique-number"
      >
        {{ contractNumber }}
      </button>
    </div>

    <div class="last-row">
      <!-- Afficher le bouton "miss" pour le 0 -->
      <button
        :key="0"
        @click="$emit('add-dart', 0)"
        class="dartboard-number miss-button"
        :disabled="multiplier > 1"
      >
        MISS
      </button>
      <!-- Bouton Double -->
      <button
        :class="{ selected: multiplier === 2 }"
        class="double-button"
        @click="$emit('toggle-multiplier', 2)"
      >
        DOUBLE
      </button>

      <!-- Bouton Triple -->
      <button
        :class="{ selected: multiplier === 3 }"
        class="triple-button"
        @click="$emit('toggle-multiplier', 3)"
      >
        TRIPLE
      </button>

      <!-- Bouton Back -->
      <button class="back-button" @click="$emit('undo-dart')">
        <font-awesome-icon :icon="['fas', 'undo-alt']" />
      </button>
    </div>
  </div>

  <!-- Si le contrat n'est pas un nombre, afficher le dartboard classique -->
  <div v-else class="dartboard">
    <div
      class="dartboard-row"
      v-for="row in dartboardLayout"
      :key="row.join('-')"
    >
      <button
        v-for="num in row"
        :key="num"
        @click="$emit('add-dart', num)"
        :disabled="isDisabled(num)"
        class="dartboard-number"
      >
        {{ num }}
      </button>
    </div>

    <div class="last-row">
      <!-- Afficher le bouton "miss" (au lieu de 0) pour tous les cas -->
      <button
        :key="0"
        @click="$emit('add-dart', 0)"
        class="dartboard-number miss-button"
        :disabled="multiplier > 1"
      >
        MISS
      </button>

      <!-- Bouton Double -->
      <button
        :class="{ selected: multiplier === 2 }"
        class="double-button"
        @click="$emit('toggle-multiplier', 2)"
      >
        DOUBLE
      </button>

      <!-- Bouton Triple -->
      <button
        :class="{ selected: multiplier === 3 }"
        class="triple-button"
        @click="$emit('toggle-multiplier', 3)"
      >
        TRIPLE
      </button>

      <!-- Bouton Back -->
      <button class="back-button" @click="$emit('undo-dart')">
        <font-awesome-icon :icon="['fas', 'undo-alt']" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    contractNumber: {
      type: String, // Le numéro du contrat
      required: false, // Optionnel si le contrat est autre qu'un nombre
    },
    multiplier: Number, // Pour le multiplicateur
    dartboardLayout: Array, // Pour le dartboard classique
  },
  computed: {
    // Calculer si le contrat est un nombre
    isNumericContract() {
      return !isNaN(this.contractNumber) && this.contractNumber != 57;
    },
  },
  methods: {
    // Désactiver certains numéros pour le dartboard classique
    isDisabled(num) {
      return (
        (num === 25 && this.multiplier === 3) ||
        (num === 0 && this.multiplier >= 2)
      );
    },
  },
};
</script>
