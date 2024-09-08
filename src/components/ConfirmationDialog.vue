<template>
  <div v-if="isVisible" class="modal-backdrop">
    <div class="modal">
      <p class="modal-message">{{ message }}</p>
      <div class="modal-actions">
        <button class="modal-button confirm-button" @click="confirm(true)">Oui</button>
        <button class="modal-button cancel-button" @click="confirm(false)">Non</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    message: {
      type: String,
      default: "Êtes-vous sûr de vouloir annuler la partie en cours ?"
    }
  },
  methods: {
    confirm(response) {
      this.$emit("confirmed", response);
    }
  }
};
</script>

<style scoped>
@import "@/styles/popup.css";
</style>
