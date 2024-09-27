import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import GameBoard from "../components/GameBoard.vue";
import TournamentBoard from "../components/TournamentBoard.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/game",
    name: "GameBoard",
    component: GameBoard,
    props: true, // Permet de passer des params comme props
  },
  {
    path: "/tournament",
    name: "TournamentBoard",
    component: TournamentBoard,
    props: true, // Permet de passer des params comme props
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
