<template>
  <div class="privacy-policy-container">
    <h1>Politique de Confidentialité</h1>
    <p>Dernière mise à jour : 4 septembre 2024</p>

    <p>
      Nous ne collectons aucune donnée personnelle identifiable via cette
      application. Notre application est conçue pour être utilisée par des
      utilisateurs de tout âge et ne nécessite aucune information personnelle
      pour fonctionner.
    </p>

    <h2>Informations collectées</h2>
    <p>
      Aucune donnée personnelle n'est collectée via cette application. Nous ne
      recueillons aucune information sur votre identité, votre emplacement ou
      votre comportement d'utilisation.
    </p>

    <h2>Cookies</h2>
    <p>
      Nous n'utilisons pas de cookies ou de technologies similaires pour suivre
      les utilisateurs ou collecter des informations.
    </p>

    <h2>Partage des informations</h2>
    <p>
      Aucune information personnelle n'est partagée avec des tiers, car nous ne
      collectons aucune donnée.
    </p>

    <h2>Modification de la politique de confidentialité</h2>
    <p>
      Nous nous réservons le droit de modifier cette politique de
      confidentialité à tout moment. Toute modification sera affichée sur cette
      page.
    </p>

    <h2>Nous contacter</h2>
    <p>
      Si vous avez des questions concernant cette politique de confidentialité,
      vous pouvez nous contacter à : <strong>chris.elpulpo@gmail.com</strong>.
    </p>

    <!-- Ajout du bouton de retour -->
    <div class="button-container">
      <button class="back-to-home-button" @click="goBackToHome">
        Retour à l'accueil
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PrivacyPolicy",
  methods: {
    goBackToHome() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.privacy-policy-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  color: #000;
  border-radius: 8px;
  max-height: 100vh;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

h1 {
  color: #3498db;
}

h2 {
  margin-top: 20px;
  color: #2c3e50;
}

/* Ajout du style pour le bouton */
.button-container {
  text-align: center;
  margin-top: 20px;
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
