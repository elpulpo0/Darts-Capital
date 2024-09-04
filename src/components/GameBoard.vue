<template>
  <div class="container">
    <div class="game-board">
      <!-- Affichage du titre ou du résultat du contrat -->
      <div class="contract-result-container">
        <span class="gametitle" v-if="!contractResult">
          <h3 v-if="isInitialPhase">Définition du Capital Initial</h3>
          <h3 v-else-if="gameOver">Fin du Jeu</h3>
          <h3 v-else>{{ currentContract?.name }}</h3>
        </span>
        <p
          v-else
          :class="{
            'contract-result': true,
            success: contractResult === 'Contrat Réussi',
            failure: contractResult === 'Contrat Raté',
            confirmed: contractResult === 'Capital Confirmé',
          }"
        >
          {{ contractResult }}
        </p>
      </div>

      <!-- Scores des joueurs -->
      <div v-if="!gameOver" class="players-scores">
        <ul>
          <li
            v-for="(player, index) in localPlayers"
            :key="index"
            :class="{
              'player-active': index === currentPlayerIndex,
            }"
          >
            <div class="player-info">
              <img :src="player.avatar" alt="Avatar" class="player-avatar" />
              <div class="player-details">
                <div class="player-main-info">
                  <div class="name-and-score">
                    <span class="player-name">{{ player.name }}</span>
                    <span class="player-score"
                      >{{ player.capital }} points</span
                    >
                  </div>
                  <!-- Afficher les informations de lancer pour tous les joueurs -->
                  <div class="player-additional-info">
                    <span>
                      ({{ player.currentRoundPoints }})
                      {{ player.dartsDisplay.join(" | ") }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="contracts-status">
              <span
                v-for="(contract, idx) in contracts"
                :key="idx"
                :class="{
                  'contract-success': player.contractsStatus[idx]?.success,
                  'contract-fail':
                    player.contractsStatus[idx]?.success === false,
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

      <!-- Tableau de jeu -->
      <div v-if="!gameOver" class="dartboard">
        <div
          class="dartboard-row"
          v-for="row in dartboardLayout"
          :key="row.join('-')"
        >
          <button
            v-for="num in row"
            :key="num"
            @click="addDart(num)"
            class="dartboard-number"
          >
            {{ num }}
          </button>
        </div>
        <div class="last-row">
          <button
            :class="{ selected: multiplier === 2 }"
            class="double-button"
            @click="toggleMultiplier(2)"
          >
            DOUBLE
          </button>
          <button
            :class="{ selected: multiplier === 3 }"
            class="triple-button"
            @click="toggleMultiplier(3)"
          >
            TRIPLE
          </button>
          <button class="back-button" @click="undoDart">BACK</button>
        </div>
      </div>

      <!-- Message de fin de jeu -->
      <div v-else-if="gameOver">
        <h3>Le jeu est terminé !</h3>
        <p class="player-name">
          Le gagnant est {{ winner.name }} avec {{ winner.capital }} points !
        </p>
        <button class="restart-game-button" @click="restartGame">
          Recommencer
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { contracts } from "@/config/contracts";
import { dartboardSegments } from "@/config/dartboardSegments";

export default {
  props: {
    players: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      gameOver: false,
      winner: null,
      currentPlayerIndex: 0,
      currentContractIndex: -1,
      isUndoing: false,
      localPlayers: this.players.map((player) => ({
        ...player,
        darts: [],
        dartsDisplay: [], // Chaque joueur a son propre dartsDisplay
        currentRoundPoints: 0,
        contractsStatus: Array(contracts.length).fill({
          success: undefined,
        }),
      })),
      dartboardLayout: [
        [1, 2, 3, 4, 5, 6, 7],
        [8, 9, 10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19, 20, 25],
        [0],
      ],
      multiplier: 1,
      contracts: contracts || [],
      contractResult: null,
      extractedDarts: [],
      originalDarts: [],
      gameHistory: [],
    };
  },
  watch: {
    contractResult(newValue) {
      if (newValue && !this.isUndoing) {
        // Ne pas changer de joueur si on est en train d'annuler
        this.$nextTick(() => {
          // Vérifie une dernière fois que `isUndoing` est bien à `false` avant de changer de joueur
          if (!this.isUndoing) {
            this.nextPlayer();
          }
        });
      }
    },
  },

  computed: {
    isInitialPhase() {
      return this.currentContractIndex === -1;
    },
    currentPlayer() {
      return this.localPlayers[this.currentPlayerIndex];
    },
    currentContract() {
      return this.contracts && this.contracts.length > 0
        ? this.contracts[this.currentContractIndex]
        : null;
    },
    contractResultClass() {
      return this.contractResult === "Réussi" ? "success" : "failure";
    },
  },
  methods: {
    restartGame() {
      // Émet l'événement pour indiquer que le jeu est terminé et qu'il faut redémarrer
      this.$emit("game-over");
    },
    emitGameOver() {
      this.gameOver = true;
      // Optionnel: définissez le gagnant ou d'autres détails
      this.winner = { name: "Joueur", capital: 100 }; // Remplacez par les données réelles
    },
    saveGameState() {
      this.gameHistory.push({
        currentPlayerIndex: this.currentPlayerIndex,
        currentContractIndex: this.currentContractIndex,
        localPlayers: JSON.parse(JSON.stringify(this.localPlayers)),
        contractResult: this.contractResult,
        extractedDarts: [...this.extractedDarts],
        originalDarts: [...this.originalDarts],
      });
    },
    extractNumber(dart) {
      if (typeof dart !== "string") {
        console.error(`Type incorrect pour dart: ${dart}`);
        return NaN;
      }

      // Supprime les préfixes 'D' ou 'T' s'ils existent
      let numberStr = dart.replace(/^[DT]/, "");

      // Vérifiez si le résultat est une chaîne vide ou non numérique
      if (numberStr === "" || isNaN(numberStr)) {
        console.error(
          `Valeur vide ou non numérique après suppression des préfixes pour dart: ${dart}`,
        );
        return NaN;
      }

      // Convertir la chaîne en nombre
      const number = parseInt(numberStr, 10);

      if (isNaN(number)) {
        console.error(
          `Échec de la conversion pour ${dart}. Valeur extraite: ${numberStr}`,
        );
      }

      return number;
    },
    checkAdjacentSegments(darts) {
      // Vérifiez que la liste des segments contient exactement trois éléments
      if (darts.length !== 3) {
        console.error("Il doit y avoir exactement trois segments.");
        return false;
      }

      // Extraire les segments
      const [first, second, third] = darts;

      // Vérifiez que les segments sont uniques
      if (new Set(darts).size !== 3) {
        console.error("Les segments doivent être distincts.");
        return false;
      }

      // Fonction pour vérifier l'adjacence entre deux segments
      const areAdjacent = (seg1, seg2) => {
        const segment1 = dartboardSegments[seg1];
        const segment2 = dartboardSegments[seg2];

        // Vérifiez que les deux segments existent
        if (!segment1) {
          console.error(`Segment ${seg1} n'est pas défini.`);
          return false;
        }
        if (!segment2) {
          console.error(`Segment ${seg2} n'est pas défini.`);
          return false;
        }

        // Vérifiez si seg2 est dans la liste des adjacents de seg1
        const isAdjacent = segment1.adjacentNumbers.includes(seg2);

        return isAdjacent;
      };

      // Vérifiez les adjacences pour chaque paire
      const firstAdjacentToSecond = areAdjacent(first, second);
      const firstAdjacentToThird = areAdjacent(first, third);
      const secondAdjacentToThird = areAdjacent(second, third);
      const secondAdjacentToFirst = areAdjacent(second, first);
      const thirdAdjacentToFirst = areAdjacent(third, first);
      const thirdAdjacentToSecond = areAdjacent(third, second);

      // Vérifiez si un des segments est adjacent aux deux autres
      const isValid =
        (firstAdjacentToSecond && firstAdjacentToThird) ||
        (secondAdjacentToFirst && secondAdjacentToThird) ||
        (thirdAdjacentToFirst && thirdAdjacentToSecond);

      return isValid;
    },
    addDart(number) {
      this.saveGameState(); // Sauvegarder l'état avant d'ajouter un lancer

      const dartDisplay = this.getDartDisplay(number);
      const score = number * this.multiplier;
      const dartNumber = this.extractNumber(dartDisplay);

      if (this.currentPlayer.darts.length < 3) {
        this.currentPlayer.darts.push(dartDisplay);
        this.currentPlayer.currentRoundPoints += score;
        this.currentPlayer.dartsDisplay.push(dartDisplay);

        this.extractedDarts.push(dartNumber);
        this.originalDarts.push(dartDisplay);

        if (this.currentPlayer.darts.length === 3) {
          if (this.isInitialPhase) {
            this.confirmCapital();
          } else {
            this.evaluateContract();
          }
        }
      }

      this.multiplier = 1;
    },

    getDartDisplay(number) {
      if (this.multiplier === 2) {
        return `D${number}`; // Double
      } else if (this.multiplier === 3) {
        return `T${number}`; // Triple
      } else {
        return `${number}`; // Simple
      }
    },
    evaluateContract() {
      const contractIsSuccessful = this.checkContractSuccess();

      if (contractIsSuccessful) {
        this.currentPlayer.capital += this.currentPlayer.currentRoundPoints;
      } else {
        this.currentPlayer.capital = Math.floor(this.currentPlayer.capital / 2);
      }

      this.currentPlayer.contractsStatus[this.currentContractIndex] = {
        success: contractIsSuccessful,
      };

      // Stocker le résultat pour l'affichage
      this.contractResult = contractIsSuccessful
        ? "Contrat Réussi"
        : "Contrat Raté";
    },
    checkContractSuccess() {
      if (this.isInitialPhase) return true;

      const currentContract = this.currentContract.name;
      const darts = this.extractedDarts; // Utilise les numéros déjà extraits
      const originalDarts = this.originalDarts;

      switch (currentContract) {
        case "20":
        case "19":
        case "18":
        case "17":
        case "16":
        case "15":
        case "14":
        case "13":
          return darts.includes(parseInt(currentContract));

        case "Triple":
          return this.currentPlayer.dartsDisplay.some((dart) =>
            dart.includes("T"),
          );

        case "Double":
          return this.currentPlayer.dartsDisplay.some((dart) =>
            dart.includes("D"),
          );

        case "Side":
          return this.checkAdjacentSegments(originalDarts);

        case "Suite":
          return this.checkSequentialNumbers(darts);

        case "Couleur":
          return this.checkDifferentColors(originalDarts);

        case "57":
          return this.currentPlayer.currentRoundPoints === 57;

        case "Centre":
          return darts.includes(25) || darts.includes(50);

        case "Peluche":
          return this.checkPelucheContract(darts);

        default:
          return false;
      }
    },
    confirmCapital() {
      this.localPlayers[this.currentPlayerIndex].capital =
        this.currentPlayer.currentRoundPoints;
      this.contractResult = "Capital confirmé";
    },
    nextPlayer() {
      if (this.isUndoing) {
        return;
      }

      this.saveGameState();

      this.currentPlayerIndex++;
      if (this.currentPlayerIndex >= this.localPlayers.length) {
        this.currentPlayerIndex = 0;
        this.nextPhase();
      }

      // Réinitialisation des informations du nouveau joueur
      this.currentPlayer.darts = [];
      this.currentPlayer.dartsDisplay = [];
      this.currentPlayer.currentRoundPoints = 0;
      this.extractedDarts = [];
      this.originalDarts = [];
      this.contractResult = null;
    },

    nextPhase() {
      this.saveGameState(); // Sauvegarder l'état avant de changer de phase

      if (this.isInitialPhase) {
        this.currentContractIndex = 0;
      } else if (this.currentContractIndex < this.contracts.length - 1) {
        this.currentContractIndex++;
      } else {
        this.endGame();
      }
    },

    endGame() {
      this.gameOver = true;
      this.winner = this.localPlayers.reduce((prev, current) =>
        prev.capital > current.capital ? prev : current,
      );
    },
    undoDart() {
      if (this.gameHistory.length > 0) {
        const previousState = this.gameHistory.pop();

        // Si le joueur a changé, restaurer l'état du joueur précédent
        if (this.currentPlayerIndex !== previousState.currentPlayerIndex) {
          this.currentPlayerIndex = previousState.currentPlayerIndex;
          this.currentContractIndex = previousState.currentContractIndex;
          this.localPlayers = previousState.localPlayers;
          this.extractedDarts = previousState.extractedDarts;
          this.originalDarts = previousState.originalDarts;

          // Si le joueur actuel a déjà des fléchettes lancées, on supprime la dernière
          if (this.currentPlayer.darts.length > 0) {
            const lastDart = this.currentPlayer.darts.pop();
            const dartNumber = this.extractNumber(lastDart);
            this.currentPlayer.currentRoundPoints -=
              dartNumber * this.multiplier;
            this.currentPlayer.dartsDisplay.pop();
            this.extractedDarts.pop(); // Retirer le dernier numéro extrait
          }
        } else {
          // Si le joueur n'a pas changé, annuler simplement la dernière fléchette
          if (this.currentPlayer.darts.length > 0) {
            const lastDart = this.currentPlayer.darts.pop();
            const dartNumber = this.extractNumber(lastDart);
            this.currentPlayer.currentRoundPoints -=
              dartNumber * this.multiplier;
            this.currentPlayer.dartsDisplay.pop();
            this.extractedDarts.pop(); // Retirer le dernier numéro extrait
          }
        }
      }
    },

    toggleMultiplier(multiplier) {
      if (this.multiplier === multiplier) {
        this.multiplier = 1;
      } else {
        this.multiplier = multiplier;
      }
    },
    checkPelucheContract(darts) {
      const allNonZero = darts.every((dart) => dart !== 0);

      // Calculez la somme des fléchettes
      const sum = darts.reduce((acc, dart) => acc + dart, 0);

      const validSum = sum <= 20;

      return allNonZero && validSum;
    },
    checkDifferentColors(darts) {
      const colors = new Set();

      darts.forEach((dart) => {
        // Recherche directe dans dartboardSegments
        const segment = dartboardSegments[dart];

        if (segment) {
          // Ajoute la couleur au Set
          colors.add(segment.color);
        } else {
          console.error(`Segment non trouvé: ${dart}`);
        }
      });

      // Retourne vrai si chaque dart a une couleur différente
      const isValid = colors.size === darts.length;

      return isValid;
    },
    checkSequentialNumbers(darts) {
      const sortedDarts = [...darts].sort((a, b) => a - b);
      return sortedDarts.every(
        (num, index) => index === 0 || num === sortedDarts[index - 1] + 1,
      );
    },
  },
};
</script>

<style scoped>
@import "@/styles/game-board.css";

.player-active {
  outline: 2px solid #007bff; /* Cadre autour du joueur actif */
  outline-offset: 8px; /* Espace entre le cadre et le contenu */
  border-radius: 8px; /* Arrondi des coins du cadre */
}
</style>
