<template>
  <div class="game-board">
    <h2 v-if="!contractResult && isInitialPhase">Capital Initial</h2>
    <h2 v-else-if="!contractResult && gameOver">Le jeu est terminé !</h2>
    <h2 v-else>Mission : {{ currentContract?.name }}</h2>

    <!-- Bouton retour en haut à droite -->
    <button
      v-if="!gameOver"
      class="back-button-top-right"
      @click="showConfirmPopup = true"
    >
      <font-awesome-icon :icon="['fas', 'undo-alt']" />
    </button>

    <span v-if="!contractResult">
      <!-- Phase initiale : définition du capital -->
      <div v-if="isInitialPhase">
        <p class="instruction-text">Définissez votre capital de départ.</p>
      </div>

      <!-- En cours de mission -->
      <div v-else-if="!gameOver">
        <p class="instruction-text">{{ currentContract?.description }}</p>
      </div>
    </span>

    <!-- Scores des joueurs -->
    <div v-if="!gameOver" class="players-scores">
      <ul>
        <li
          v-for="(player, index) in localPlayers"
          :key="index"
          :class="{
            'player-active': index === currentPlayerIndex,
          }"
          @click="showPlayerHistory(index)"
          :ref="(el) => setPlayerRef(el, index)"
        >
          <div class="player-info">
            <img :src="player.avatar" alt="Avatar" class="player-avatar" />
            <div class="player-details">
              <div class="player-main-info">
                <div class="name-and-score">
                  <div class="name-container">
                    <span
                      class="ranking-circle"
                      :class="getRankingClass(index)"
                    ></span>
                    <span class="player-name">{{ player.name }}</span>
                  </div>
                  <span class="player-score">{{ player.capital }} points</span>
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
          :disabled="
            (num === 25 && multiplier === 3) || (num === 0 && multiplier >= 2)
          "
          :class="{
            'disabled-button':
              (num === 25 && multiplier === 3) ||
              (num === 0 && multiplier >= 2),
          }"
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

    <!-- Message de fin de jeu amélioré avec cohérence de style -->
    <div v-else-if="gameOver" class="game-over-container">
      <p class="game-over-winners">
        Le(s) gagnant(s) :
        <br />
        <br />
        <span
          v-for="(player, index) in winners"
          :key="index"
          class="winner-name"
        >
          {{ player.name }}{{ index < winners.length - 1 ? ", " : "" }}
        </span>
        <br />
        <br />
        avec <span class="points">{{ winners[0].capital }} points !</span>
      </p>
      <button class="restart-game-button" @click="restartGame">
        Recommencer
      </button>
    </div>

    <!-- Composant ConfirmationDialog -->
    <ConfirmationDialog
      v-if="showConfirmPopup"
      :isVisible="showConfirmPopup"
      message="Êtes-vous sûr de vouloir annuler la partie en cours ?"
      @confirmed="handleConfirmation"
    />

    <!-- Modal pour afficher l'historique des lancers -->
    <div v-if="showHistoryModal" class="modal-backdrop">
      <div class="modal">
        <h3>
          Historique des lancers de {{ localPlayers[historyPlayerIndex].name }}
        </h3>
        <div
          v-if="
            localPlayers[historyPlayerIndex].history &&
            localPlayers[historyPlayerIndex].history.length
          "
        >
          <ul>
            <li
              v-for="(entry, index) in localPlayers[historyPlayerIndex].history"
              :key="index"
            >
              <strong>{{ entry.contract }} :</strong>
              {{ entry.darts.join(" | ") }}
            </li>
          </ul>
        </div>
        <p v-else>Aucun lancer enregistré</p>
        <button class="modal-button confirm-button" @click="closeHistoryModal">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ConfirmationDialog from "./ConfirmationDialog.vue";
import { contracts } from "@/config/contracts";
import { dartboardSegments } from "@/config/dartboardSegments";

export default {
  props: {
    players: {
      type: Array,
      required: true,
    },
  },
  components: {
    ConfirmationDialog,
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
        history: [],
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
      snapshots: [], // Ajout de la liste des instantanés
      showConfirmPopup: false,
      playerRefs: [],
      showHistoryModal: false,
      historyPlayerIndex: null,
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
    currentPlayerIndex(newVal) {
      this.scrollToActivePlayer(newVal);
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
    // Nouvelle méthode pour sauvegarder un instantané complet
    saveSnapshot() {
      const snapshot = {
        currentPlayerIndex: this.currentPlayerIndex,
        currentContractIndex: this.currentContractIndex,
        players: JSON.parse(JSON.stringify(this.localPlayers)),
        contractResult: this.contractResult,
        multiplier: this.multiplier,
        darts: JSON.parse(JSON.stringify(this.extractedDarts)),
        originalDarts: JSON.parse(JSON.stringify(this.originalDarts)),
      };
      this.snapshots.push(snapshot);
    },

    // Méthode pour restaurer un instantané
    restoreSnapshot() {
      if (this.snapshots.length > 0) {
        const lastSnapshot = this.snapshots.pop();

        // Restauration de l'état du jeu depuis l'instantané
        this.currentPlayerIndex = lastSnapshot.currentPlayerIndex;
        this.currentContractIndex = lastSnapshot.currentContractIndex;
        this.localPlayers = JSON.parse(JSON.stringify(lastSnapshot.players));
        this.contractResult = lastSnapshot.contractResult;
        this.multiplier = lastSnapshot.multiplier;
        this.extractedDarts = JSON.parse(JSON.stringify(lastSnapshot.darts));
        this.originalDarts = JSON.parse(
          JSON.stringify(lastSnapshot.originalDarts),
        );

        console.log("État restauré depuis l'instantané", lastSnapshot);
      }
    },

    addDart(number) {
      this.saveSnapshot(); // Sauvegarder un instantané avant d'ajouter un lancer

      const dartDisplay = this.getDartDisplay(number);
      const score = number * this.multiplier; // Calcul du score pour la fléchette actuelle

      const contractName = this.currentContract?.name;

      // Ajouter la fléchette aux différentes listes
      const dartNumber = this.extractNumber(dartDisplay);

      if (this.currentPlayer.darts.length < 3) {
        this.currentPlayer.darts.push(dartDisplay);
        this.currentPlayer.dartsDisplay.push(dartDisplay);
        this.extractedDarts.push(dartNumber);
        this.originalDarts.push(dartDisplay);

        // Si c'est la phase de capital initial, on comptabilise toutes les fléchettes
        if (this.isInitialPhase) {
          this.currentPlayer.currentRoundPoints += score;
        }

        // Contrats nécessitant 3 fléchettes (Suite, Couleur, Side, Peluche, 57)
        else if (
          contractName === "Suite" ||
          contractName === "Couleur" ||
          contractName === "Side" ||
          contractName === "Peluche" ||
          contractName === "57"
        ) {
          // Comptabiliser toujours toutes les fléchettes dans le score
          this.currentPlayer.currentRoundPoints += score;
        }

        // Sinon, on vérifie les règles selon le contrat actuel
        else if (this.isDartValidForContract(number)) {
          // Gérer tous les contrats numérotés (ex. 20, 19, 18, etc.)
          if (!isNaN(contractName)) {
            const contractNumber = parseInt(contractName);

            // Ajouter le score si la fléchette correspond au contrat (simple, double ou triple)
            if (
              dartNumber === contractNumber ||
              dartNumber === contractNumber * 2 ||
              dartNumber === contractNumber * 3
            ) {
              this.currentPlayer.currentRoundPoints += score;
            }
          }

          // Contrat "Double" : vérifier que la fléchette touche une zone double
          else if (contractName === "Double") {
            if (this.multiplier === 2) {
              this.currentPlayer.currentRoundPoints += score;
            }
          }

          // Contrat "Bulle" : vérifier que la fléchette touche le centre (25 ou 50 points)
          else if (contractName === "Centre") {
            if (dartNumber === 25 || dartNumber === 50) {
              this.currentPlayer.currentRoundPoints += score;
            }
          }

          // Contrat "Triple" : vérifier que la fléchette touche une zone triple
          else if (contractName === "Triple") {
            if (this.multiplier === 3) {
              this.currentPlayer.currentRoundPoints += score;
            }
          }
        }

        // Gestion de l'historique des fléchettes pour le joueur
        const lastHistoryEntry =
          this.currentPlayer.history[this.currentPlayer.history.length - 1];
        const currentContractName = this.isInitialPhase
          ? "Capital Initial"
          : this.currentContract?.name || "Sans contrat";

        if (
          !lastHistoryEntry ||
          lastHistoryEntry.contract !== currentContractName
        ) {
          this.currentPlayer.history.push({
            contract: currentContractName,
            darts: [dartDisplay],
          });
        } else {
          lastHistoryEntry.darts.push(dartDisplay);
        }

        // Si le joueur a lancé 3 fléchettes, on valide le tour
        if (this.currentPlayer.darts.length === 3) {
          if (this.isInitialPhase) {
            this.confirmCapital(); // Phase de capital initial
          } else {
            this.evaluateContract(); // Pour les autres contrats
          }
        }
      }

      // Réinitialiser le multiplicateur à 1 après chaque lancer
      this.multiplier = 1;
    },

    // Remplacement de la logique de undoDart par la restauration d'un instantané
    undoDart() {
      this.restoreSnapshot(); // Restaurer l'état depuis l'instantané
    },

    showPlayerHistory(index) {
      this.historyPlayerIndex = index;
      this.showHistoryModal = true;
    },
    closeHistoryModal() {
      this.showHistoryModal = false;
    },
    setPlayerRef(el, index) {
      if (el) {
        this.playerRefs[index] = el; // Affectation directe dans Vue 3
      }
    },
    scrollToActivePlayer(index) {
      const activePlayer = this.playerRefs[index];
      if (activePlayer) {
        activePlayer.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
    handleConfirmation(confirmed) {
      this.showConfirmPopup = false;
      if (confirmed) {
        this.restartGame();
      }
    },
    getRankingClass(index) {
      // Supposons que `localPlayers` est trié par capital ou score
      const sortedPlayers = [...this.localPlayers].sort(
        (a, b) => b.capital - a.capital,
      );
      const ranking = sortedPlayers.findIndex(
        (player) => player === this.localPlayers[index],
      );

      if (ranking === 0) return "gold";
      if (ranking === 1) return "silver";
      if (ranking === 2) return "bronze";
      return ""; // Pas de cercle pour les autres joueurs
    },
    restartGame() {
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
        return NaN;
      }

      // Supprime les préfixes 'D' ou 'T' s'ils existent
      let numberStr = dart.replace(/^[DT]/, "");

      // Vérifiez si le résultat est une chaîne vide ou non numérique
      if (numberStr === "" || isNaN(numberStr)) {
        return NaN;
      }

      // Convertir la chaîne en nombre
      const number = parseInt(numberStr, 10);

      return number;
    },
    checkAdjacentSegments(darts) {
      // Vérifiez que la liste des segments contient exactement trois éléments
      if (darts.length !== 3) {
        return false;
      }

      // Extraire les segments
      const [first, second, third] = darts;

      // Vérifiez que les segments sont uniques
      if (new Set(darts).size !== 3) {
        return false;
      }

      // Fonction pour vérifier l'adjacence entre deux segments
      const areAdjacent = (seg1, seg2) => {
        const segment1 = dartboardSegments[seg1];
        const segment2 = dartboardSegments[seg2];

        // Vérifiez que les deux segments existent
        if (!segment1) {
          return false;
        }
        if (!segment2) {
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
    isDartValidForContract(number) {
      if (this.isInitialPhase) {
        return true;
      }

      const contractName = this.currentContract?.name;

      switch (contractName) {
        case "Suite":
          return this.checkSequentialNumbers(this.extractedDarts);

        case "Couleur":
          return this.checkDifferentColors(this.originalDarts);

        case "Peluche":
          return this.checkPelucheContract(this.extractedDarts);

        case "Centre":
          return number === 25 || number === 50;

        case "Triple":
          return this.multiplier === 3;

        case "Double":
          return this.multiplier === 2;

        case "57":
          return this.currentPlayer.currentRoundPoints === 57;

        case "Side":
          return this.checkAdjacentSegments(this.originalDarts);

        default: {
          const contractNumber = parseInt(contractName);
          return (
            number === contractNumber ||
            (number === contractNumber * 2 && this.multiplier === 2) ||
            (number === contractNumber * 3 && this.multiplier === 3)
          );
        }
      }
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
      const maxScore = Math.max(
        ...this.localPlayers.map((player) => player.capital),
      );
      this.winners = this.localPlayers.filter(
        (player) => player.capital === maxScore,
      );
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
@import "@/styles/home.css";
@import "@/styles/popup.css";
</style>
