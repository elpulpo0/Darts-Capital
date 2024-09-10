<template>
  <div v-if="isVisible" class="modal-backdrop">
    <div class="modal">
      <p class="modal-message">{{ message }}</p>
      <div class="modal-actions">
        <button class="modal-button confirm-button" @click="confirmAndQuit">
          Annuler et quitter
        </button>
        <button class="modal-button confirm-button" @click="saveAndQuit">
          Sauvegarder et quitter
        </button>
        <button class="modal-button cancel-button" @click="cancel">
          Retour
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
      required: true,
    },
    message: {
      type: String,
      default: "Êtes-vous sûr de vouloir quitter la partie en cours ?",
    },
  },
  methods: {
    confirmAndQuit() {
      this.$emit("do-not-save");
    },
    saveAndQuit() {
      this.$emit("save-game");
    },
    cancel() {
      this.$emit("canceled");
    },
  },
};
</script>

<style scoped>
@import "@/styles/popup.css";
</style>
