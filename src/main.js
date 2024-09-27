import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import router from "./router";
import store from "./stores/store";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUndoAlt,
  faInfoCircle,
  faCog,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faFacebook } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import en from "./config/language/en.json";
import fr from "./config/language/fr.json";
import de from "./config/language/de.json";
import it from "./config/language/it.json";
import nl from "./config/language/nl.json";
import pt from "./config/language/pt.json";
import es from "./config/language/es.json";

library.add(
  faUndoAlt,
  faInfoCircle,
  faCog,
  faArrowLeft,
  faArrowRight,
  faInstagram,
  faFacebook,
);

const i18n = createI18n({
  locale: "en", // Langue par défaut
  fallbackLocale: "fr",
  messages: {
    fr,
    en,
    de,
    it,
    nl,
    pt,
    es,
  },
});

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);

// Ajouter le thème au body au démarrage
const theme = store.state.settings.theme;
document.body.classList.add(theme);

app.use(router);
app.use(store);
app.use(i18n);

// Écouter les changements de thème
store.subscribe((mutation) => {
  if (mutation.type === "setTheme") {
    document.body.className = ""; // Réinitialiser les classes
    document.body.classList.add(mutation.payload); // Ajouter le nouveau thème
  }
});

app.mount("#app");
