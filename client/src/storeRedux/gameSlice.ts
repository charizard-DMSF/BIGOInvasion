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
    shields: 3,
    nukes: 1,
    inStore: false,
    mathbucks: 500,
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
        setGunType: (state, action: PayloadAction<string>) => {
            state.gunType = action.payload;
        },
        updateShields: (state, action: PayloadAction<number>) => {
            state.shields = action.payload;
        },
        updateNukes: (state, action: PayloadAction<number>) => {
            state.nukes = action.payload;
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
        addPowerUp: (state, action: PayloadAction<{ powerUp: string; amount: number }>) => {
            const { powerUp, amount } = action.payload;
            state.powerUps[powerUp] = (state.powerUps[powerUp] || 0) + amount;
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
        updateEnemies: (state, action: PayloadAction<Enemy[]>) => {
            state.enemies = action.payload;
        },
        damageEnemy: (state, action: PayloadAction<{ id: string; damage: number }>) => {
            const enemy = state.enemies.find(e => e.id === action.payload.id);
            if (enemy) {
                enemy.health -= action.payload.damage;
                if (enemy.health <= 0) {
                    state.enemies = state.enemies.filter(e => e.id !== action.payload.id);
                    state.score += 100;
                    state.mathbucks += 10;
                }
            }
        }
    }
});

export const {
    movePlayer,
    updateHealth,
    damagePlayer,
    updateScore,
    updateLevel,
    setGunType,
    updateShields,
    updateNukes,
    toggleStore,
    updateMathbucks,
    upgradeStat,
    addPowerUp,
    setGameStatus,
    resetGame,
    addProjectile,
    updateProjectiles,
    updateEnemies,
    damageEnemy
} = gameSlice.actions;

export default gameSlice.reducer;