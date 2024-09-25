import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./stores/store";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUndoAlt,
  faInfoCircle,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faUndoAlt, faInfoCircle, faCog, faInstagram, faFacebook);

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);

// Ajouter le thème au body au démarrage
const theme = store.state.settings.theme;
document.body.classList.add(theme);

app.use(router);
app.use(store);

// Écouter les changements de thème
store.subscribe((mutation) => {
  if (mutation.type === "setTheme") {
    document.body.className = ""; // Réinitialiser les classes
    document.body.classList.add(mutation.payload); // Ajouter le nouveau thème
  }
});

app.mount("#app");
