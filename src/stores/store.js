import { createStore } from "vuex";

const store = createStore({
  state: {
    settings: {
      soundEnabled: true,
      iaDifficulty: "medium",
      theme: "dark",
    },
  },
  mutations: {
    setSoundEnabled(state, value) {
      state.settings.soundEnabled = value;
    },
    setIaDifficulty(state, value) {
      state.settings.iaDifficulty = value;
    },
    setTheme(state, value) {
      state.settings.theme = value;
    },
  },
});

export default store;
