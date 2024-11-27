export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameOver';

export interface Position {
    x: number;
    y: number;
}

export enum EnemyType {
    Basic = 'basic',
    Fast = 'fast',
    Tank = 'tank',
}

export interface Enemy {
    id: string;
    position: Position;
    health: number;
    type: EnemyType;
    speed: number;
}

export interface Projectile {
    id: string;
    position: Position;
    direction: Position;
    isCharged: boolean;
    piercing: boolean;
}

export interface Wave {
    number: number;
    enemyCount: number;
    enemiesSpawned: number;
    enemiesDefeated: number;
}

export interface GameState {
    level: number;
    wave: Wave;
    score: number;
    playerPosition: Position;
    playerHealth: number;
    enemies: Enemy[];
    projectiles: Projectile[];
    gameStatus: GameStatus;
}

export interface GameStats {
    accuracy: number;
    killCount: number;
    damageDone: number;
    damageTaken: number;
    timeElapsed: number;
}