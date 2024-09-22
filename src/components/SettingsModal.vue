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

      <div class="modal-row">
        <span class="modal-label">Niveau de l'IA</span>
        <select v-model="localIaDifficulty" class="modal-select">
          <option value="very_easy">Easy</option>
          <option value="easy">Soft</option>
          <option value="medium">Middle</option>
          <option value="hard">Hard</option>
          <option value="very_hard">Pro</option>
        </select>
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
    iaDifficulty: {
      type: String,
      default: "medium",
    },
  },
  data() {
    return {
      localSoundEnabled: this.soundEnabled, // Copie locale du son
      localIaDifficulty: this.iaDifficulty, // Copie locale de la difficulté de l'IA
    };
  },
  watch: {
    // Synchroniser les props avec la copie locale lorsque le modal est ouvert
    soundEnabled(newVal) {
      this.localSoundEnabled = newVal;
    },
    iaDifficulty(newVal) {
      this.localIaDifficulty = newVal;
    },
  },
  methods: {
    // Appliquer et sauvegarder les modifications lorsqu'on clique sur "Sauvegarder"
    saveSettings() {
      this.$emit(
        "settings-saved",
        this.localSoundEnabled,
        this.localIaDifficulty,
      );
      this.closeModal(true); // Fermer la modale après avoir sauvegardé
    },

    // Fermer la modale sans sauvegarder les modifications (si isSaving est false)
    closeModal(isSaving = false) {
      if (!isSaving) {
        // Réinitialiser les valeurs locales aux valeurs des props
        this.localSoundEnabled = this.soundEnabled;
        this.localIaDifficulty = this.iaDifficulty;
      }
      this.$emit("close"); // Fermer la modale
    },
  },
};
</script>

<style scoped>
@import "@/styles/popup.css";
</style>
