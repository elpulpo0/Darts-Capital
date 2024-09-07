<template>
  <div v-if="isVisible" class="modal-backdrop">
    <div class="modal">
      <h3 class="modal-message">Règles des missions</h3>
      <ul>
        <li
          v-for="contractName in orderedContractNames"
          :key="contractName"
        >
          <strong class="contract-name">{{ contractName }} :</strong>
          {{ contractRulesData[contractName] }}
        </li>
      </ul>
      <div class="modal-actions">
        <button class="modal-button confirm-button" @click="closeModal">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      contractRulesData: {
        "Capital Initial":
          "Le joueur doit définir son capital de départ en lançant 3 fléchettes",
        "Nombre":
          "Le joueur doit toucher le segment correspondant au nombre spécifié avec au moins une fléchette.",
        "Suite":
          "Le joueur doit marquer des points dans 3 segments consécutifs.",
        "Couleur":
          "Le joueur doit toucher trois segments de couleurs différentes.",
        "Side": "Le joueur doit marquer des points dans 3 segments adjacents.",
        "Peluche": "Le total des fléchettes ne doit pas dépasser 20.",
        "57": "Le joueur doit marquer exactement 57 points avec une, deux ou trois fléchettes",
        "Double": "Le joueur doit toucher un segment double.",
        "Triple": "Le joueur doit toucher un segment triple.",
        "Centre":
          "Le joueur doit toucher le centre de la cible (25 ou 50 points).",
      },
      // Définir l'ordre des contrats ici
      orderedContractNames: [
        "Capital Initial",
        "Nombre",
        "Suite",
        "Couleur",
        "Side",
        "Peluche",
        "57",
        "Double",
        "Triple",
        "Centre",
      ],
    };
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
@import "@/styles/popup.css";
</style>
