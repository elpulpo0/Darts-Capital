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

      <div class="modal-row">
        <label class="modal-label">Mode Sombre</label>
        <label class="switch">
          <input
            type="checkbox"
            :checked="theme === 'light'"
            @change="toggleTheme"
          />
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
      <div class="app-version">
        <p>Version: {{ versionName }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const store = useStore();

    // Accéder aux réglages via le store
    const soundEnabled = computed(() => store.state.settings.soundEnabled);
    const iaDifficulty = computed(() => store.state.settings.iaDifficulty);
    const theme = computed(() => store.state.settings.theme);

    return {
      soundEnabled,
      iaDifficulty,
      theme,
    };
  },
  data() {
    return {
      localSoundEnabled: this.soundEnabled,
      localIaDifficulty: this.iaDifficulty,
      localTheme: this.theme === 'light' ? 'light' : 'dark',
      versionName: process.env.VUE_APP_VERSION_NAME || "Unknown",
    };
  },
  watch: {
    soundEnabled(newVal) {
      this.localSoundEnabled = newVal;
    },
    iaDifficulty(newVal) {
      this.localIaDifficulty = newVal;
    },
    theme(newVal) {
      this.localTheme = newVal;
    },
  },
  methods: {
    saveSettings() {
      // Mettre à jour le store avec les nouvelles valeurs
      this.$store.commit("setSoundEnabled", this.localSoundEnabled);
      this.$store.commit("setIaDifficulty", this.localIaDifficulty);
      this.$store.commit("setTheme", this.localTheme);

      this.closeModal(true); // Fermer la modale après avoir sauvegardé
    },
    toggleTheme() {
    this.localTheme = this.localTheme === "dark" ? "light" : "dark";
    this.$store.commit("setTheme", this.localTheme); // Mettre à jour le store avec le nouveau thème

    // Émettre pour sauvegarder les réglages
    this.$emit(
      "settings-saved",
      this.localSoundEnabled,
      this.localIaDifficulty,
      this.localTheme,
    );
  },
    closeModal(isSaving = false) {
      if (!isSaving) {
        this.localSoundEnabled = this.soundEnabled;
        this.localIaDifficulty = this.iaDifficulty;
        this.localTheme = this.theme;
      }
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
@import "@/styles/popup.css";
</style>
