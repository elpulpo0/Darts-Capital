import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUndoAlt,
  faInfoCircle,
  faCog,
} from "@fortawesome/free-solid-svg-icons"; // Ajout de faInfoCircle
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Ajouter uniquement les icônes dont vous avez besoin
library.add(faUndoAlt, faInfoCircle, faCog); // Ajout de faInfoCircle dans la bibliothèque

const app = createApp(App);

// Enregistrer le composant FontAwesomeIcon globalement
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router);

app.mount("#app");
