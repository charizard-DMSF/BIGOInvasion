// gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Position, Enemy, Projectile, GameStatus, Wave } from '../types/game.types';
import { PLAYER, ENEMY, VIEWPORT } from '../config/constants';

interface DamageEnemyPayload {
    id: string;
    damage: number;
}

const initialWave: Wave = {
    number: 1,
    enemyCount: 10,
    enemiesSpawned: 0,
    enemiesDefeated: 0
};

const initialState: GameState = {
    level: 1,
    wave: initialWave,
    score: 0,
    playerPosition: { x: VIEWPORT.WIDTH / 2, y: VIEWPORT.HEIGHT / 2 },
    playerHealth: PLAYER.MAX_HEALTH,
    enemies: [],
    projectiles: [],
    gameStatus: 'menu',
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
            state.wave.enemiesSpawned++;
        },
        updateEnemies(state, action: PayloadAction<Enemy[]>) {
            state.enemies = action.payload;
        },
        addProjectile(state, action: PayloadAction<Projectile>) {
            state.projectiles.push(action.payload);
        },
        updateProjectiles(state, action: PayloadAction<Projectile[]>) {
            state.projectiles = action.payload;
        },
        damagePlayer(state, action: PayloadAction<number>) {
            const newHealth = Math.min(
                PLAYER.MAX_HEALTH,
                Math.max(0, state.playerHealth - action.payload)
            );
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
                    state.score += ENEMY.SCORE_VALUE;
                    state.wave.enemiesDefeated++;
                }
            }
        },
        updateWave(state) {
            const { enemiesDefeated, enemyCount } = state.wave;
            if (enemiesDefeated >= enemyCount) {
                state.wave = {
                    number: state.wave.number + 1,
                    enemyCount: Math.floor(enemyCount * 1.5),
                    enemiesSpawned: 0,
                    enemiesDefeated: 0
                };
                state.level = Math.floor(state.wave.number / 5) + 1;
            }
        }, 
        setGameStatus(state, action: PayloadAction<GameStatus>) {
            state.gameStatus = action.payload;
        }, 
        resetGame: () => initialState,
    },
});

export const {
    movePlayer,
    addEnemy,
    updateEnemies,
    addProjectile,
    updateProjectiles,
    damagePlayer,
    damageEnemy,
    updateWave,
    setGameStatus,
    resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;