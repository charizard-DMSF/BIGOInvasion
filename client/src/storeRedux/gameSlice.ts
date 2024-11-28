// src/store/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Position {
    x: number;
    y: number;
}

export interface Projectile {
    id: string;
    position: Position;
    direction: {
        x: number;
        y: number;
    };
    isCharged: boolean;
    piercing: boolean;
}

export interface Enemy {
    id: string;
    position: Position;
    health: number;
    speed: number;
}

interface GameState {
    playerPosition: Position;
    playerHealth: number;
    score: number;
    level: number;
    gunType: string;
    shields: number;
    nukes: number;
    inStore: boolean;
    mathbucks: number;
    enemies: Enemy[];
    projectiles: Projectile[];
    gameStatus: 'menu' | 'playing' | 'gameOver';
    stats: {
        [key: string]: number;
    };
    powerUps: {
        [key: string]: number;
    };
}

const initialState: GameState = {
    playerPosition: { x: 600, y: 400 },
    playerHealth: 100,
    score: 0,
    level: 1,
    gunType: 'Basic',
    shields: 0,
    nukes: 0,
    inStore: false,
    mathbucks: 0,
    enemies: [],
    projectiles: [],
    gameStatus: 'menu',
    stats: {
        'Fire Rate': 1,
        'Damage': 1,
        'Speed': 1,
        'Health': 1
    },
    powerUps: {
        'Shield': 0,
        'Double Score': 0,
        'Nuke': 0
    }
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        movePlayer: (state, action: PayloadAction<Position>) => {
            state.playerPosition = action.payload;
        },
        updateHealth: (state, action: PayloadAction<number>) => {
            state.playerHealth = action.payload;
        },
        damagePlayer: (state, action: PayloadAction<number>) => {
            state.playerHealth = Math.max(0, state.playerHealth - action.payload);
            if (state.playerHealth <= 0) {
                state.gameStatus = 'gameOver';
            }
        },
        updateScore: (state, action: PayloadAction<number>) => {
            state.score = action.payload;
        },
        updateLevel: (state, action: PayloadAction<number>) => {
            state.level = action.payload;
        },
        toggleStore: (state) => {
            state.inStore = !state.inStore;
        },
        updateMathbucks: (state, action: PayloadAction<number>) => {
            state.mathbucks = action.payload;
        },
        upgradeStat: (state, action: PayloadAction<{ stat: string; level: number }>) => {
            const { stat, level } = action.payload;
            state.stats[stat] = level;
        },
        setGameStatus: (state, action: PayloadAction<'menu' | 'playing' | 'gameOver'>) => {
            state.gameStatus = action.payload;
        },
        resetGame: (state) => {
            return { ...initialState, gameStatus: 'playing' };
        },
        addProjectile: (state, action: PayloadAction<Projectile>) => {
            state.projectiles.push(action.payload);
        },
        updateProjectiles: (state, action: PayloadAction<Projectile[]>) => {
            state.projectiles = action.payload;
        },
    }
});

export const {
    movePlayer,
    updateHealth,
    damagePlayer,
    updateScore,
    updateLevel,
    toggleStore,
    updateMathbucks,
    upgradeStat,
    setGameStatus,
    resetGame,
    addProjectile,
    updateProjectiles,
} = gameSlice.actions;

export default gameSlice.reducer;