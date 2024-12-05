// src/store/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EnemyTypeKey } from '../components/game/Enemy';

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
  damage: number;
  speed: number;
  type: EnemyTypeKey;
}

interface GameState {
  playerPosition: Position;
  playerHealth: number;
  score: number;
  currentLevel: number;
  levelKillCount: number;
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
  isPaused: boolean;
  isLeaderboardOpen: boolean;
  isStatsOpen: boolean;
  gameStatus: 'menu' | 'playing' | 'gameOver' | 'victory';
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
  currentLevel: 1,
  levelKillCount: 0,
  shields: 5,
  nukes: 10,
  inStore: false,
  mathbucks: 10000,
  enemies: [],
  SIZE: 32,
  projectiles: [],
  isPaused: false,
  isLeaderboardOpen: false,
  isStatsOpen: false,
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
      console.log('state.playerHealth 1:', state.playerHealth);
      state.playerHealth = action.payload;
    },
    damagePlayer: (state, action: PayloadAction<number>) => {
      console.log('state :', state);
      console.log('state.playerHealth :', state.playerHealth);
      console.log('action.payload :', action.payload);
      state.playerHealth = Math.max(0, state.playerHealth - action.payload);
      if (state.playerHealth <= 0) {
        state.gameStatus = 'gameOver';
      }
    },
    updateScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
    },
    toggleStore: (state) => {
      state.inStore = !state.inStore;
    },
    updateMathbucks: (state, action: PayloadAction<number>) => {
      state.mathbucks = action.payload;
    },
    incrementMathbucks: (state, action: PayloadAction<number>) => {
      state.mathbucks += action.payload;
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
      action: PayloadAction<'menu' | 'playing' | 'gameOver' | 'victory'>
    ) => {
      state.gameStatus = action.payload;
    },
    resetGame: (state) => {
      return {
        ...initialState,
        gameStatus: 'playing',
        currentLevel: 1,
        levelKillCount: 0
      };
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
    togglePause: (state) => {
      state.isPaused = !state.isPaused;
    },
    toggleLeaderboard: (state) => {
      state.isLeaderboardOpen = !state.isLeaderboardOpen;
    },
    toggleStats: (state) => {
      state.isStatsOpen = !state.isStatsOpen;
    },
    addEnemy: (state, action: PayloadAction<Enemy>) => {
      state.enemies.push(action.payload);
    },
    updateEnemies: (state, action: PayloadAction<Enemy[]>) => {
      state.enemies = action.payload;
    },
    damageEnemy: (
      state,
      action: PayloadAction<{ id: string; damage: number }>
    ) => {
      const enemy = state.enemies.find((e) => e.id === action.payload.id);
      if (enemy) {
        enemy.health -= action.payload.damage;
      }
    },
    defeatEnemy: (state, action: PayloadAction<string>) => {
      state.enemies = state.enemies.filter((e) => e.id !== action.payload);
      state.score += 10;
      state.mathbucks += 10;
      // Kill count is now handled separately
    },
    removeEnemy: (state, action: PayloadAction<string>) => {
      state.enemies = state.enemies.filter(
        (enemy) => enemy.id !== action.payload
      );
    },
    incrementKillCount: (state) => {
      state.levelKillCount += 1;
    },
    resetKillCount: (state) => {
      state.levelKillCount = 0;
    },
    advanceLevel: (state) => {
      if (state.currentLevel < 7) {
        state.currentLevel += 1;
      } else {
        state.gameStatus = 'victory';
      }
    },
  },
});

export const {
  movePlayer,
  updateHealth,
  damagePlayer,
  updateScore,
  toggleStore,
  updateMathbucks,
  incrementMathbucks,
  upgradeStat,
  setGameStatus,
  resetGame,
  addProjectile,
  updateProjectiles,
  switchGun,
  unlockGun,
  togglePause,
  toggleLeaderboard,
  toggleStats,
  addEnemy,
  updateEnemies,
  damageEnemy,
  defeatEnemy,
  removeEnemy,
  incrementKillCount,
  resetKillCount,
  advanceLevel,
} = gameSlice.actions;

export default gameSlice.reducer;