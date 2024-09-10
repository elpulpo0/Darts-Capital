<template>
  <div v-if="isVisible" class="modal-backdrop">
    <div class="modal">
      <h3>Réglages</h3>

      <div class="modal-row">
        <span class="modal-label">Effets sonores</span>
        <label class="switch">
          <input type="checkbox" v-model="localSoundEnabled" />
          <span class="slider round"></span>
        </label>
      </div>

      <div class="modal-actions">
        <button class="modal-button confirm-button" @click="saveSettings">
          Sauvegarder
        </button>
        <button class="modal-button cancel-button" @click="closeModal">
          Fermer
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
    soundEnabled: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      localSoundEnabled: this.soundEnabled, // Utilisation d'une copie locale
    };
  },
  watch: {
    soundEnabled(newVal) {
      this.localSoundEnabled = newVal; // Met à jour la copie locale si la prop change
    },
  },

  methods: {
    saveSettings() {
  this.$emit("settings-saved", this.localSoundEnabled); // Sauvegarde les paramètres
  this.closeModal();
}

,
    closeModal() {
      this.localSoundEnabled = this.soundEnabled;
      this.$emit("close"); // Ferme la modale
    },
  },
};
</script>

<style scoped>
@import "@/styles/popup.css";
</style>
