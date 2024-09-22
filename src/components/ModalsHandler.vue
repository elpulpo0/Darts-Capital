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
import ConfirmationDialog from "./ConfirmationDialog.vue";
import SettingsModal from "./SettingsModal.vue";
import ContractRulesModal from "./ContractRulesModal.vue";

export default {
  props: {
    showConfirmPopup: Boolean,
    showSettingsModal: Boolean,
    showContractRulesModal: Boolean,
    soundEnabled: Boolean,
    iaDifficulty: {
      type: String,
      default: "medium", // Valeur par défaut
    },
  },

  emits: [
    "canceled",
    "do-no-save",
    "close-settings-modal",
    "close-contract-rules-modal",
    "settings-saved",
    "save-game",
  ],
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
    forwardSettingsSaved(newSoundSetting, newIaDifficulty) {
      this.$emit("settings-saved", newSoundSetting, newIaDifficulty);
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
