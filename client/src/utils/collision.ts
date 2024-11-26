import { Position, Enemy, Projectile } from '../types/game.types';

const PLAYER_SIZE = 32;  // Width/height of player in pixels
const ENEMY_SIZE = 24;   // Width/height of enemies in pixels
const PROJECTILE_SIZE = 8;  // Width/height of projectiles in pixels

interface Bounds {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

// Get bounding box for any entity
function getBounds(position: Position, size: number): Bounds {
    return {
        left: position.x,
        right: position.x + size,
        top: position.y,
        bottom: position.y + size
    };
}

// Check if two bounding boxes overlap
function checkBoundsCollision(bounds1: Bounds, bounds2: Bounds): boolean {
    return !(
        bounds1.right < bounds2.left ||
        bounds1.left > bounds2.right ||
        bounds1.bottom < bounds2.top ||
        bounds1.top > bounds2.bottom
    );
}

// Check collision between player and enemy
export function checkPlayerEnemyCollision(
    playerPosition: Position,
    enemy: Enemy
): boolean {
    const playerBounds = getBounds(playerPosition, PLAYER_SIZE);
    const enemyBounds = getBounds(enemy.position, ENEMY_SIZE);
    return checkBoundsCollision(playerBounds, enemyBounds);
}

// Check collision between projectile and enemy
export function checkProjectileEnemyCollision(
    projectile: Projectile,
    enemy: Enemy
): boolean {
    const projectileBounds = getBounds(projectile.position, PROJECTILE_SIZE);
    const enemyBounds = getBounds(enemy.position, ENEMY_SIZE);
    return checkBoundsCollision(projectileBounds, enemyBounds);
}

// Check if position is within game bounds
export function isInBounds(position: Position, bounds: { width: number; height: number }): boolean {
    return (
        position.x >= 0 &&
        position.x <= bounds.width - PLAYER_SIZE &&
        position.y >= 0 &&
        position.y <= bounds.height - PLAYER_SIZE
    );
}

// Calculate distance between two positions
export function getDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Get normalized direction vector between two positions
export function getDirection(from: Position, to: Position): Position {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return {
        x: dx / distance,
        y: dy / distance
    };
}

// For homing projectiles or enemy movement
export function moveTowards(
    current: Position,
    target: Position,
    speed: number
): Position {
    const direction = getDirection(current, target);
    return {
        x: current.x + direction.x * speed,
        y: current.y + direction.y * speed
    };
}