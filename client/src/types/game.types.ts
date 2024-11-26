export interface Position {
    x: number;
    y: number;
}

export interface Enemy {
    id: string;
    position: Position;
    health: number;
    complexity: number;  // Represents the O(n) complexity level
    type: string;
    speed?: number;
}

export interface Projectile {
    id: string;
    position: Position;
    direction: Position;  // Normalized vector for direction
    speed: number;
}

export interface GameState {
    level: number;
    wave: number;
    score: number;
    playerPosition: Position;
    playerHealth: number;
    enemies: Enemy[];
    projectiles: Projectile[];
    gameStatus: 'playing' | 'paused' | 'gameOver';
}

export interface LevelConfig {
    name: string;
    complexity: string;
    enemyCount: number;
    wavesCount: number;
    calculateDamage: (wave: number) => number;
}

// Level configurations for different time complexities
export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
    1: {
        name: 'Constant Time',
        complexity: 'O(1)',
        enemyCount: 5,
        wavesCount: 3,
        calculateDamage: () => 1  // Always takes 1 shot
    },
    2: {
        name: 'Logarithmic Time',
        complexity: 'O(log n)',
        enemyCount: 7,
        wavesCount: 3,
        calculateDamage: (wave) => Math.ceil(Math.log2(wave + 1))
    },
    3: {
        name: 'Linear Time',
        complexity: 'O(n)',
        enemyCount: 8,
        wavesCount: 4,
        calculateDamage: (wave) => wave
    },
    4: {
        name: 'Linearithmic Time',
        complexity: 'O(n log n)',
        enemyCount: 10,
        wavesCount: 4,
        calculateDamage: (wave) => wave * Math.ceil(Math.log2(wave + 1))
    },
    5: {
        name: 'Quadratic Time',
        complexity: 'O(n²)',
        enemyCount: 12,
        wavesCount: 4,
        calculateDamage: (wave) => Math.pow(wave, 2)
    }
};