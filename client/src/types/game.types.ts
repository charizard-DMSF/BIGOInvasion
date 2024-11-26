export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameOver';

export interface Position {
    x: number;
    y: number;
}

export interface Enemy {
    id: string;
    position: Position;
    health: number;
    complexity: number; // Represents the O(n) complexity level
    type: string;
    speed?: number;
}

export interface Projectile {
    id: string;
    position: Position;
    direction: Position; // Normalized vector for direction
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
    gameStatus: GameStatus;
}

export interface LevelConfig {
    name: string;
    complexity: string;
    enemyCount: number;
    wavesCount: number;
    calculateDamage: (wave: number) => number;
}

