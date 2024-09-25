<template>
  <div class="privacy-policy-container">
    <h1>{{ $t('privacyPolicy.title') }}</h1>
    <p>{{ $t('privacyPolicy.lastUpdated') }}</p>

    <p>{{ $t('privacyPolicy.intro') }}</p>

    <h2>{{ $t('privacyPolicy.informationCollectedTitle') }}</h2>
    <p>{{ $t('privacyPolicy.informationCollectedText') }}</p>

    <h2>{{ $t('privacyPolicy.cookiesTitle') }}</h2>
    <p>{{ $t('privacyPolicy.cookiesText') }}</p>

    <h2>{{ $t('privacyPolicy.sharingTitle') }}</h2>
    <p>{{ $t('privacyPolicy.sharingText') }}</p>

    <h2>{{ $t('privacyPolicy.modificationTitle') }}</h2>
    <p>{{ $t('privacyPolicy.modificationText') }}</p>

    <h2>{{ $t('privacyPolicy.contactTitle') }}</h2>
    <p>{{ $t('privacyPolicy.contactText') }}
      <strong>chris.elpulpo@gmail.com</strong>
    </p>

    <!-- Ajout du bouton de retour -->
    <div class="button-container">
      <button class="back-to-home-button" @click="goBackToHome">
        {{ $t('privacyPolicy.backButton') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PrivacyPolicy",
  mounted() {
    document.body.classList.add("scrollable"); // Active le défilement uniquement sur cette page
  },
  beforeUnmount() {
    document.body.classList.remove("scrollable"); // Désactive le défilement quand tu quittes cette page
  },
  methods: {
    goBackToHome() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>

body.light .privacy-policy-container {
  background-color: #ECF0F1;
  color: #2C3E50;
}

.privacy-policy-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Met le contenu en haut et le bouton en bas */
  width: 100%;
  max-width: 500px;
  overflow-y: auto;
  color: white;
  background-color: #2C3E50;
  padding: 20px;
  box-sizing: border-box;
  height: 100vh;
  line-height: 1; /* Ajuste l'espacement des lignes */
}

.privacy-policy-container::-webkit-scrollbar {
  display: none; /* Masquer la barre de défilement pour Chrome, Safari et autres navigateurs Webkit */
}

h1, h2 {
  margin: 0;
  padding: 10px 0;
}

p {
  margin: 10px 0;
}

h2 {
  margin-top: 20px;
  color: #989a9b;
  font-size: 1.2em;
}

.button-container {
  align-self: flex-end; /* Assure que le bouton est en bas */
  text-align: center;
  margin-top: auto;
}

.back-to-home-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  min-height: 48px;
}

.back-to-home-button:hover {
  background-color: #2980b9;
}

</style>
