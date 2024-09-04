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
      default: "Êtes-vous sûr de vouloir continuer ?"
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
/* Aligne le design du pop-up avec les autres éléments */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: #2C3E50;
  color: #ECF0F1;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  width: 300px;
  max-width: 80%;
  text-align: center;
}

.modal-message {
  margin-bottom: 20px;
  font-size: 1.2em;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}

.modal-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
  min-height: 48px;
  width: 70px;
}

.confirm-button {
  background-color: #3498DB;
  color: white;
}

.confirm-button:hover {
  background-color: #2980B9;
}

.cancel-button {
  background-color: #E74C3C;
  color: white;
}

.cancel-button:hover {
  background-color: #C0392B;
}
</style>
