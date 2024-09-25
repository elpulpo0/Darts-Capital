<template>
  <div v-if="isVisible" class="modal-backdrop">
    <div class="modal">
      <h3 class="modal-message">{{ $t('rules.missionRulesTitle') }}</h3>
      <ul>
        <li v-for="contractKey in orderedContractKeys" :key="contractKey">
          <strong class="contract-name">{{ $t('rules.contracts.' + contractKey) }} :</strong>
          {{ $t('rules.contractDescriptions.' + contractKey) }}
        </li>
      </ul>
      <div class="modal-actions">
        <button class="modal-button confirm-button" @click="closeModal">
          {{ $t('rules.closeButton') }}
        </button>
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
      // Définir l'ordre des clés de contrat ici
      orderedContractKeys: [
        "initialCapital",
        "number",
        "sequence",
        "color",
        "side",
        "plush",
        "fiftySeven",
        "double",
        "triple",
        "center",
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
