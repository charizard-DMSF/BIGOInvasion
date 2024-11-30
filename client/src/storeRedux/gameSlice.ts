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
  shields: number;
  nukes: number;
  inStore: boolean;
  mathbucks: number;
  DASH_COOLDOWN_MS: number;
  SIZE: number;
  enemies: Enemy[];
  projectiles: Projectile[];
  currentGun: string;
  unlockedGuns: string[];
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
  playerHealth: 50,
  score: 500,
  level: 1,
  shields: 5,
  nukes: 10,
  inStore: false,
  mathbucks: 10000,
  enemies: [],
  SIZE: 32,
  projectiles: [],
  DASH_COOLDOWN_MS: 50,
  currentGun: 'basic',
  unlockedGuns: ['basic'],
  gameStatus: 'menu',
  stats: {
    HEALTH: 1,
    SPEED: 8,
    DASH_SPEED_MULTIPLIER: 3,
    DASH_DURATION_MS: 150,
  },
  powerUps: {
    Shield: 6,
    Nuke: 9,
  },
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
    upgradeStat: (
      state,
      action: PayloadAction<{ stat: string; level: number }>
    ) => {
      const { stat, level } = action.payload;
      state.stats[stat] = level;
    },
    setGameStatus: (
      state,
      action: PayloadAction<'menu' | 'playing' | 'gameOver'>
    ) => {
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
    switchGun: (state, action: PayloadAction<string>) => {
      if (state.unlockedGuns.includes(action.payload)) {
        state.currentGun = action.payload;
      }
    },
    unlockGun: (state, action: PayloadAction<string>) => {
      if (!state.unlockedGuns.includes(action.payload)) {
        state.unlockedGuns.push(action.payload);
      }
    },
    addEnemy: (state, action: PayloadAction<Enemy>) => {
      state.enemies.push(action.payload);
    },
    damageEnemy: (
      state,
      action: PayloadAction<{ id: string; damage: number }>
    ) => {
      const enemy = state.enemies.find((e) => e.id === action.payload.id);
      if (enemy) {
        enemy.health -= action.payload.damage;
        if (enemy.health <= 0) {
          state.enemies = state.enemies.filter(
            (e) => e.id !== action.payload.id
          );
        }
      }
    },
    removeEnemy: () => {},
  },
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
  switchGun,
  unlockGun,
  addEnemy,
  damageEnemy,
  removeEnemy,
} = gameSlice.actions;

export default gameSlice.reducer;
