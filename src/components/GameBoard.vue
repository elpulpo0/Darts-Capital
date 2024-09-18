<template>
  <div class="game-board">
    <GameBoardHeader
      :contractResult="contractResult"
      :isInitialPhase="isInitialPhase"
      :gameOver="gameOver"
      :currentContract="currentContract"
      @show-confirm-popup="showConfirmPopup = true"
      @open-settings-modal="openSettingsModal"
      @open-contract-rules="openContractRules"
    />

    <PlayerList
      v-if="!gameOver"
      :localPlayers="localPlayers"
      :currentPlayerIndex="currentPlayerIndex"
      :contracts="contracts"
      @show-player-history="showPlayerHistory"
    />

    <DartBoard
      v-if="!gameOver"
      :dartboardLayout="dartboardLayout"
      :multiplier="multiplier"
      @add-dart="addDart"
      @toggle-multiplier="toggleMultiplier"
      @undo-dart="undoDart"
    />

    <ModalsHandler
      :showConfirmPopup="showConfirmPopup"
      :showSettingsModal="showSettingsModal"
      :showContractRulesModal="showContractRulesModal"
      :soundEnabled="soundEnabled"
      @do-not-save="handleDoNotSave"
      @canceled="closeConfirmPopup"
      @save-game="handleSaveGame"
      @close-settings-modal="closeSettingsModal"
      @close-contract-rules-modal="closeContractRulesModal"
      @settings-saved="handleSettingsSaved"
    />

    <PlayerHistoryModal
      v-if="showHistoryModal"
      :isVisible="showHistoryModal"
      :player="localPlayers[historyPlayerIndex]"
      @close="closeHistoryModal"
    />
  </div>
</template>

<script>
import GameBoardHeader from "./GameBoardHeader.vue";
import PlayerList from "./PlayerList.vue";
import DartBoard from "./DartBoard.vue";
import ModalsHandler from "./ModalsHandler.vue";
import PlayerHistoryModal from "./PlayerHistoryModal.vue";
import { contracts } from "@/config/contracts";
import { dartboardSegments } from "@/config/dartboardSegments";
import successSound from "@/assets/sounds/success.mp3";
import failedSound from "@/assets/sounds/failed.mp3";
import clicSound from "@/assets/sounds/clic.mp3";
import dartSound from "@/assets/sounds/dart.mp3";
import backSound from "@/assets/sounds/back.mp3";
import gameoverSound from "@/assets/sounds/gameover.mp3";

export default {
  props: {
    players: {
      type: Array,
      required: true,
    },
  },
  components: {
    GameBoardHeader,
    PlayerList,
    DartBoard,
    ModalsHandler,
    PlayerHistoryModal,
  },
  data() {
    return {
      showSettingsModal: false,
      soundEnabled: true,
      gameOver: false,
      winner: null,
      currentPlayerIndex: 0,
      currentContractIndex: -1,
      isUndoing: false,
      localPlayers: this.players.map((player) => ({
        ...player,
        darts: [],
        dartsDisplay: [],
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
      snapshots: [],
      snapshotIndex: -1,
      showConfirmPopup: false,
      playerRefs: [],
      showHistoryModal: false,
      historyPlayerIndex: null,
      gameHistory: [],
      showContractRulesModal: false,
    };
  },
  mounted() {
    // Si le premier joueur est un ordinateur, lancez son tour immédiatement
    if (this.currentPlayer.isComputer) {
      this.playComputerTurn();
    }
  },
  watch: {
    contractResult(newValue) {
      if (newValue !== null && !this.isUndoing) {
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
  },
  methods: {
    openSettingsModal() {
      this.showSettingsModal = true;
    },
    closeSettingsModal() {
      this.showSettingsModal = false;
    },
    handleSettingsSaved(newSoundSetting) {
      this.soundEnabled = newSoundSetting;
    },

    openContractRules() {
      this.showContractRulesModal = true;
    },
    closeContractRulesModal() {
      this.showContractRulesModal = false;
    },
    // Nouvelle méthode pour sauvegarder un instantané complet
    saveSnapshot() {
      const previousPlayerIndex =
        this.currentPlayerIndex === 0
          ? this.localPlayers.length - 1
          : this.currentPlayerIndex - 1;
      const snapshot = {
        currentPlayerIndex: this.currentPlayerIndex,
        currentContractIndex: this.currentContractIndex,
        players: JSON.parse(JSON.stringify(this.localPlayers)),
        contractResult: this.contractResult,
        multiplier: this.multiplier,
        darts: JSON.parse(JSON.stringify(this.extractedDarts)),
        originalDarts: JSON.parse(JSON.stringify(this.originalDarts)),
        previousIsComputer: this.localPlayers[previousPlayerIndex].isComputer,
      };

      // Ajoutez le snapshot et augmentez l'index
      this.snapshots.push(snapshot);
      this.snapshotIndex++;
    },
    saveGameProgression() {
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
      localStorage.setItem("dartGameSnapshot", JSON.stringify(snapshot));
    },

    restoreGame(snapshot) {
      this.currentPlayerIndex = snapshot.currentPlayerIndex;
      this.currentContractIndex = snapshot.currentContractIndex;
      this.localPlayers = JSON.parse(JSON.stringify(snapshot.players));
      this.contractResult = snapshot.contractResult;
      this.multiplier = snapshot.multiplier;
      this.extractedDarts = JSON.parse(JSON.stringify(snapshot.darts));
      this.originalDarts = JSON.parse(JSON.stringify(snapshot.originalDarts));
    },
    // Méthode pour restaurer un instantané
    restoreSnapshot(index) {
      if (index >= 0 && index < this.snapshots.length) {
        const snapshot = this.snapshots[index];

        // Restauration de l'état du jeu depuis l'instantané
        this.currentPlayerIndex = snapshot.currentPlayerIndex;
        this.currentContractIndex = snapshot.currentContractIndex;
        this.localPlayers = JSON.parse(JSON.stringify(snapshot.players));
        this.contractResult = snapshot.contractResult;
        this.multiplier = snapshot.multiplier;
        this.extractedDarts = JSON.parse(JSON.stringify(snapshot.darts));
        this.originalDarts = JSON.parse(JSON.stringify(snapshot.originalDarts));

        // Mettez à jour l'index actuel
        this.snapshotIndex = index;
      }
    },

    addDart(number) {
      if (this.soundEnabled) {
        const dart = new Audio(dartSound);
        dart.play();
      }
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
          // Comptabiliser le score
          this.currentPlayer.currentRoundPoints += score;

          // Cas commun : Un zéro fait échouer le contrat immédiatement
          if (dartNumber === 0 && contractName != "57") {
            this.abridgeContract(); // Marque comme raté et termine le tour
            return;
          }

          // Contrat "Suite" : impossible de former une suite
          if (
            (contractName === "Suite" && dartNumber === 25) ||
            (contractName === "Suite" && dartNumber === 50)
          ) {
            this.abridgeContract();
            return;
          }
          if (
            contractName === "Suite" &&
            this.currentPlayer.darts.length >= 2
          ) {
            const [first, second] = this.extractedDarts;

            if (first === second) {
              this.abridgeContract();
              return;
            }

            if (Math.abs(first - second) > 2) {
              this.abridgeContract();
              return;
            }
          }

          // Contrat "Couleur" : vérifier les fléchettes de la même couleur
          if (
            contractName === "Couleur" &&
            this.currentPlayer.darts.length >= 2
          ) {
            if (!this.checkDifferentColors(this.originalDarts)) {
              this.abridgeContract(); // Marque comme raté et termine le tour
              return;
            }
          }

          // Contrat "57" : réussite avant la fin
          if (
            contractName === "57" &&
            this.currentPlayer.currentRoundPoints === 57
          ) {
            this.evaluateContract();

            // Ajouter des "0" pour les fléchettes restantes si le contrat est réussi avant la fin
            while (this.currentPlayer.darts.length < 3) {
              this.currentPlayer.darts.push("0");
              this.currentPlayer.dartsDisplay.push("0");

              // Ajouter les "0" dans l'historique pour chaque fléchette restante
              const lastHistoryEntry =
                this.currentPlayer.history[
                  this.currentPlayer.history.length - 1
                ];
              lastHistoryEntry.darts.push("0");
            }
          }

          // Contrat "57" : dépassement du score
          if (
            contractName === "57" &&
            this.currentPlayer.currentRoundPoints > 57
          ) {
            this.abridgeContract();
            return;
          }

          // Contrat "Side" : segments non adjacents
          if (
            contractName === "Side" &&
            this.currentPlayer.darts.length === 2
          ) {
            const [firstDart, secondDart] = this.extractedDarts;

            // Vérifier que les deux fléchettes ne sont pas identiques
            if (firstDart === secondDart) {
              this.abridgeContract(); // Si elles sont identiques, échouer le contrat
              return;
            }
          }

          // Contrat "Peluche" : dépassement de 20
          if (
            (contractName === "Peluche" &&
              this.currentPlayer.darts.length === 2 &&
              this.currentPlayer.currentRoundPoints >= 20) ||
            (contractName === "Peluche" &&
              this.currentPlayer.darts.length === 1 &&
              this.currentPlayer.currentRoundPoints >= 19)
          ) {
            this.abridgeContract();
            return;
          }
        }

        // Sinon, on vérifie les règles selon le contrat actuel
        else if (!isNaN(contractName)) {
          // Gérer tous les contrats numérotés (ex. 20, 19, 18, etc.)
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

      // Si le joueur a lancé 3 fléchettes, on valide le tour
      if (this.currentPlayer.darts.length === 3) {
        if (this.isInitialPhase) {
          this.confirmCapital(); // Phase de capital initial
        } else {
          this.evaluateContract(); // Pour les autres contrats
        }
      }

      // Réinitialiser le multiplicateur à 1 après chaque lancer
      this.multiplier = 1;
    },
    // Fonction pour marquer le contrat comme échoué et abréger le tour
    abridgeContract() {
      if (this.soundEnabled) {
        const fail = new Audio(failedSound);
        fail.play();
      }
      this.currentPlayer.contractsStatus[this.currentContractIndex] = {
        success: false,
      };
      this.contractResult = false;
      // Remplir les fléchettes restantes avec des zéros pour l'affichage
      while (this.currentPlayer.darts.length < 3) {
        this.currentPlayer.darts.push("0");
        this.currentPlayer.dartsDisplay.push("0");
      }
      // Ajouter "0" dans l'historique également
      const lastHistoryEntry =
        this.currentPlayer.history[this.currentPlayer.history.length - 1];
      lastHistoryEntry.darts.push("0");

      this.currentPlayer.capital = Math.floor(this.currentPlayer.capital / 2);

      // Si c'est au tour de l'ordinateur, mettre fin immédiatement à son tour
      if (this.currentPlayer.isComputer) {
        this.isComputerPlaying = false;
      }
    },

    undoDart() {
      if (this.soundEnabled) {
        const back = new Audio(backSound);
        back.play();
      }

      this.isUndoing = true; // Indiquer que nous sommes en train d'annuler

      // Vérifier que les snapshots existent et que l'index est valide
      if (this.snapshots.length === 0 || this.snapshotIndex < 0) {
        this.isUndoing = false; // Réinitialiser l'état de l'annulation
        return;
      }

      // Déterminer combien de snapshots à restaurer
      let snapshotsToRestore = 1; // Par défaut, remonter d'un snapshot

      // Vérifier si le joueur précédent était un ordinateur
      const previousPlayerIndex =
        this.currentPlayerIndex === 0
          ? this.localPlayers.length - 1
          : this.currentPlayerIndex - 1;
      const previousPlayer = this.localPlayers[previousPlayerIndex];

      // Si le joueur précédent est un ordinateur, remonter plusieurs snapshots
      if (previousPlayer.isComputer) {
        // Parcourez les snapshots pour trouver le début du tour de l'ordinateur
        while (snapshotsToRestore < this.snapshots.length) {
          const snapshot =
            this.snapshots[this.snapshotIndex - snapshotsToRestore];
          if (
            !snapshot ||
            snapshot.currentPlayerIndex !== previousPlayerIndex
          ) {
            break;
          }
          snapshotsToRestore++;
        }
        if (snapshotsToRestore > 1) {
          snapshotsToRestore++;
        }
      }

      // Restaurer les snapshots en fonction du nombre déterminé
      for (let i = 0; i < snapshotsToRestore; i++) {
        if (this.snapshotIndex >= 0) {
          this.restoreSnapshot(this.snapshotIndex);
          this.snapshotIndex--; // Mettre à jour l'index
        }
      }

      // Réinitialiser le multiplicateur
      this.multiplier = 1;

      this.$forceUpdate(); // Forcer la mise à jour de l'interface utilisateur
      this.isUndoing = false; // Réinitialiser l'état de l'annulation
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
    handleSaveGame() {
      this.saveGameProgression();
      this.$emit("restart-game");
    },
    handleDoNotSave() {
      this.$emit("restart-game");
    },
    closeConfirmPopup() {
      this.showConfirmPopup = false;
    },
    getRankingClass(index) {
      const sortedPlayers = [...this.localPlayers].sort(
        (a, b) => b.capital - a.capital,
      );
      const ranking = sortedPlayers.findIndex(
        (player) => player === this.localPlayers[index],
      );

      if (ranking === 0) return "gold";
      if (ranking === 1) return "silver";
      if (ranking === 2) return "bronze";
      return "";
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

      if (dart === "D25") {
        return 50;
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
      // Fonction pour vérifier l'adjacence entre deux segments
      const areAdjacent = (seg1, seg2) => {
        const segment1 = dartboardSegments[String(seg1)];
        const segment2 = dartboardSegments[String(seg2)];

        // Vérifiez que les deux segments existent
        if (!segment1 || !segment2) {
          return false;
        }

        // Vérifiez si seg2 est dans la liste des adjacents de seg1
        return segment1.adjacentNumbers.includes(String(seg2));
      };
      if (darts.length === 3) {
        // Extraire les segments
        const [first, second, third] = darts;

        // Vérifiez que les segments sont uniques
        if (new Set(darts).size !== 3) {
          return false;
        }

        // Vérifiez les adjacences pour chaque paire
        const firstAdjacentToSecond = areAdjacent(first, second);
        const firstAdjacentToThird = areAdjacent(first, third);
        const secondAdjacentToThird = areAdjacent(second, third);
        const secondAdjacentToFirst = areAdjacent(second, first);
        const thirdAdjacentToFirst = areAdjacent(third, first);
        const thirdAdjacentToSecond = areAdjacent(third, second);

        // Vérifiez si un des segments est adjacent aux deux autres
        if (
          (firstAdjacentToSecond && firstAdjacentToThird) ||
          (secondAdjacentToFirst && secondAdjacentToThird) ||
          (thirdAdjacentToFirst && thirdAdjacentToSecond)
        ) {
          return true;
        } else {
          return false;
        }
      }

      // Si le nombre de fléchettes est différent de 3, on ne peut pas vérifier
      return false;
    },
    isDartValidForContract(number) {
      if (this.isInitialPhase) {
        return true;
      }

      const contractName = this.currentContract?.name;

      switch (contractName) {
        case "Centre":
          return number === 25 || number === 50;

        case "Triple":
          return this.multiplier === 3;

        case "Double":
          return this.multiplier === 2;

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
        if (this.soundEnabled) {
          const success = new Audio(successSound);
          success.play();
        }
        this.currentPlayer.capital += this.currentPlayer.currentRoundPoints;
      } else {
        if (this.soundEnabled) {
          const fail = new Audio(failedSound);
          fail.play();
        }
        this.currentPlayer.capital = Math.floor(this.currentPlayer.capital / 2);
      }

      this.currentPlayer.contractsStatus[this.currentContractIndex] = {
        success: contractIsSuccessful,
      };

      // Stocker le résultat pour l'affichage
      this.contractResult = contractIsSuccessful;
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
          return this.checkAdjacentSegments(darts);

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
      this.contractResult = true;
    },

    nextPlayer() {
      if (this.isUndoing) {
        return;
      }

      // Stocker les informations du dernier tour avant de réinitialiser
      this.currentPlayer.lastRoundPoints =
        this.currentPlayer.currentRoundPoints;
      this.currentPlayer.lastDartsDisplay = [
        ...this.currentPlayer.dartsDisplay,
      ];

      this.saveGameState(); // Sauvegarder l'état du jeu

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

      // Si c'est au tour de l'ordinateur, exécuter playComputerTurn
      if (this.currentPlayer.isComputer) {
        this.playComputerTurn();
      }
    },
    playComputerTurn() {
      // Sauvegarder l'état du jeu avant le tour de l'ordinateur
      this.saveSnapshot();
      // Désactiver l'interface pour le joueur humain pendant le tour de l'ordinateur
      this.isComputerPlaying = true;

      const throwDart = (dartNumber) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (this.contractResult !== null) {
              resolve(); // Si le contrat est abrégé ou complété, ne pas lancer
              return;
            }
            this.addDart(dartNumber); // Lancer la fléchette pour l'ordinateur
            resolve(); // Résoudre la promesse une fois le lancer effectué
          }, 1000); // Simuler un délai d'une seconde entre chaque lancer
        });
      };

      const throwDartsSequentially = async () => {
        for (let i = 0; i < 3; i++) {
          if (!this.currentPlayer.isComputer) {
            return; // Si le tour change, arrêter
          }

          // Arrêter immédiatement si le contrat est abrégé
          if (this.contractResult !== null) {
            break;
          }

          let dartNumber;
          let multiplier =
            Math.random() < 0.5 ? 1 : Math.random() < 0.8 ? 2 : 3; // Simple, double ou triple

          if (Math.random() < 0.7) {
            dartNumber = this.getSuccessfulDartNumber(); // Numéro "réussi"
          } else {
            dartNumber = this.getRandomDartNumber(); // Numéro aléatoire
          }

          this.multiplier = multiplier;

          // Attendre que la fléchette soit lancée avant de passer à la suivante
          await throwDart(dartNumber);

          // Arrêter si nous sommes en train d'annuler
          if (this.isUndoing) {
            break;
          }
        }
        this.isComputerPlaying = false; // Le tour de l'ordinateur est terminé
      };

      // Commencer les lancers de l'ordinateur
      throwDartsSequentially();
    },
    // Méthode pour obtenir un numéro de lancer "réussi"
    getSuccessfulDartNumber() {
      const successfulNumbers = [15, 16, 17, 18, 19, 20]; // Nombres avec des scores élevés
      return successfulNumbers[
        Math.floor(Math.random() * successfulNumbers.length)
      ];
    },

    // Méthode pour obtenir un numéro de lancer aléatoire
    getRandomDartNumber() {
      return Math.floor(Math.random() * 20) + 1; // Numéro entre 1 et 20
    },
    nextPhase() {
      this.saveGameState(); // Sauvegarder l'état avant de changer de phase

      if (this.isInitialPhase) {
        this.currentContractIndex = 0;
      } else if (this.currentContractIndex < this.contracts.length - 1) {
        this.currentContractIndex++;
      } else {
        setTimeout(() => {
          if (this.soundEnabled) {
            const gameover = new Audio(gameoverSound);
            gameover.play();
          }
          this.endGame();
        }, 500);
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
      this.$emit("game-over", this.winners);
    },
    toggleMultiplier(multiplier) {
      if (this.soundEnabled) {
        const clic = new Audio(clicSound);
        clic.play();
      }
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
