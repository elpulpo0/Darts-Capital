<template>
  <div>
    <ConfirmationDialog
      :isVisible="showConfirmPopup"
      @do-not-save="handleDoNotSave"
      @canceled="handleCancelation"
      @save-game="handleSaveGame"
    />
    <SettingsModal
      :isVisible="showSettingsModal"
      :soundEnabled="soundEnabled"
      :iaDifficulty="iaDifficulty"
      :theme="theme"
      @settings-saved="forwardSettingsSaved"
      @close="closeSettingsModal"
    />
    <ContractRulesModal
      :isVisible="showContractRulesModal"
      @close="closeContractRulesModal"
    />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import ConfirmationDialog from "./ConfirmationDialog.vue";
import SettingsModal from "./SettingsModal.vue";
import ContractRulesModal from "./ContractRulesModal.vue";

export default {
  props: {
    showConfirmPopup: Boolean,
    showSettingsModal: Boolean,
    showContractRulesModal: Boolean,
  },

  emits: [
    "canceled",
    "do-not-save",
    "close-settings-modal",
    "close-contract-rules-modal",
    "settings-saved",
    "save-game",
  ],

  setup() {
    const store = useStore();

    // Accéder aux réglages du store
    const soundEnabled = computed(() => store.state.settings.soundEnabled);
    const iaDifficulty = computed(() => store.state.settings.iaDifficulty);
    const theme = computed(() => store.state.settings.theme);

    return { soundEnabled, iaDifficulty, theme, store }; // Retourne aussi le store si nécessaire
  },

  methods: {
    handleDoNotSave() {
      this.$emit("do-not-save");
    },
    handleCancelation() {
      this.$emit("canceled");
    },
    closeSettingsModal() {
      this.$emit("close-settings-modal");
    },
    closeContractRulesModal() {
      this.$emit("close-contract-rules-modal");
    },
    forwardSettingsSaved(newSoundSetting, newIaDifficulty, newTheme) {
      // Utiliser le store pour mettre à jour les réglages
      this.store.commit("setSoundEnabled", newSoundSetting);
      this.store.commit("setIaDifficulty", newIaDifficulty);
      this.store.commit("setTheme", newTheme);
      this.$emit("settings-saved", newSoundSetting, newIaDifficulty, newTheme);
    },
    handleSaveGame() {
      this.$emit("save-game");
    },
  },

  components: {
    ConfirmationDialog,
    SettingsModal,
    ContractRulesModal,
  },
};
</script>
