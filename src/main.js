import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import VTooltip from "v-tooltip";

// Importer le fichier CSS global
import "@/styles/main.css";

const app = createApp(App);

app.use(router);
app.directive("tooltip", VTooltip); // Enregistrement de la directive tooltip

app.mount("#app");
