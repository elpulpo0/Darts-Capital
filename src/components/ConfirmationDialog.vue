<template>
  <div v-if="isVisible" class="modal-backdrop">
    <div class="modal">
      <p class="modal-message">{{ $t('modal.confirmMessage') }}</p>
      <div class="modal-actions">
        <button class="modal-button confirm-button" @click="confirmAndQuit">
          {{ $t('modal.confirmAndQuit') }}
        </button>
        <button class="modal-button confirm-button" @click="saveAndQuit">
          {{ $t('modal.saveAndQuit') }}
        </button>
        <button class="modal-button cancel-button" @click="cancel">
          {{ $t('modal.cancel') }}
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
      default: "", // Laisse vide si tu veux utiliser le texte par défaut de i18n
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
