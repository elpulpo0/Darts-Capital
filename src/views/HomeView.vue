<template>
    <div class="home">
        <div class="header">
            <img :src="require('@/assets/logo.png')" alt="Logo" class="logo" />
            <h1>VojvoDarts - Capital</h1>
        </div>
        <PlayerSelection v-if="!gameStarted" @start-game="startGame" />
        <GameBoard v-else :players="players" />
    </div>
</template>

<script>
import PlayerSelection from "@/components/PlayerSelection.vue";
import GameBoard from "@/components/GameBoard.vue";

export default {
    data() {
        return {
            gameStarted: false,
            players: [],
        };
    },
    methods: {
        startGame(selectedPlayers) {
            this.players = selectedPlayers.sort(() => Math.random() - 0.5);
            this.gameStarted = true;
        },
    },
    components: {
        PlayerSelection,
        GameBoard,
    },
};
</script>

<style scoped>
@import "@/styles/home.css";
</style>
