import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Position, Enemy } from '../types/game.types';

interface DamageEnemyPayload {
    id: string;
    damage: number;
}

const initialState: GameState = {
    level: 1,
    score: 0,
    playerPosition: { x: 600, y: 400 },
    playerHealth: 100,
    enemies: [],
    gameStatus: 'menu',
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
        updateEnemies(state, action: PayloadAction<Enemy[]>) {
            state.enemies = action.payload;
        },
        updateScore(state, action: PayloadAction<number>) {
            state.score += action.payload;
        },
        setLevel(state, action: PayloadAction<number>) {
            state.level = action.payload;
        },
        setGameStatus(state, action: PayloadAction<'menu' | 'playing' | 'gameOver'>) {
            state.gameStatus = action.payload;
        },
        resetGame(state) {
            return {
                ...initialState,
                gameStatus: 'playing'
            };
        },
        damagePlayer(state, action: PayloadAction<number>) {
            const newHealth = Math.min(100, Math.max(0, state.playerHealth - action.payload));
            state.playerHealth = newHealth;
            if (newHealth === 0) {
                state.gameStatus = 'gameOver';
            }
        },
        damageEnemy(state, action: PayloadAction<DamageEnemyPayload>) {
            const enemy = state.enemies.find(e => e.id === action.payload.id);
            if (enemy) {
                enemy.health -= action.payload.damage;
                if (enemy.health <= 0) {
                    state.enemies = state.enemies.filter(e => e.id !== action.payload.id);
                    state.score += 100;
                }
            }
        }
    }
});

export const {
    movePlayer,
    addEnemy,
    removeEnemy,
    updateEnemies,
    updateScore,
    setLevel,
    damagePlayer,
    damageEnemy,
    setGameStatus,
    resetGame
} = gameSlice.actions;

export default gameSlice.reducer;