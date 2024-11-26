import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Position, Enemy } from '../types/game.types';

const initialState: GameState = {
    level: 1,
    score: 0,
    playerPosition: { x: 400, y: 300 },
    playerHealth: 100,
    enemies: [],
    projectiles: [],
    gameStatus: 'playing',
    wave: 1
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        movePlayer(state, action: PayloadAction<Position>) {
            state.playerPosition = action.payload;
        },
        addEnemy(state, action: PayloadAction<Enemy>) {
            state.enemies.push(action.payload);
        },
        removeEnemy(state, action: PayloadAction<string>) {
            state.enemies = state.enemies.filter(enemy => enemy.id !== action.payload);
        },
        updateScore(state, action: PayloadAction<number>) {
            state.score += action.payload;
        },
        setLevel(state, action: PayloadAction<number>) {
            state.level = action.payload;
        }
    }
});

export const { movePlayer, addEnemy, removeEnemy, updateScore, setLevel } = gameSlice.actions;
export default gameSlice.reducer;