<template>
  <div>
    <ConfirmationDialog
      :isVisible="showConfirmPopup"
      @confirmed="handleConfirmation"
    />
    <SettingsModal
      :isVisible="showSettingsModal"
      :soundEnabled="soundEnabled"
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
  },
  emits: ["confirmed", "close-settings-modal", "close-contract-rules-modal", "settings-saved"],
  methods: {
    handleConfirmation(confirmed) {
      this.$emit("confirmed", confirmed);
    },
    closeSettingsModal() {
      this.$emit("close-settings-modal");
    },
    closeContractRulesModal() {
      this.$emit("close-contract-rules-modal");
    },
    forwardSettingsSaved(newSoundSetting) {
      this.$emit("settings-saved", newSoundSetting);
    },
  },
  components: {
    ConfirmationDialog,
    SettingsModal,
    ContractRulesModal,
  },
};
</script>
