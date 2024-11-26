import { Position, Enemy, Projectile } from '../types/game.types';

const PLAYER_SIZE = 32;
const ENEMY_SIZE = 24;
const PROJECTILE_SIZE = 8;

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function getBounds(position: Position, size: number): Bounds {
  return {
    left: position.x,
    right: position.x + size,
    top: position.y,
    bottom: position.y + size
  };
}

function checkBoundsCollision(bounds1: Bounds, bounds2: Bounds): boolean {
  return !(
    bounds1.right < bounds2.left ||
    bounds1.left > bounds2.right ||
    bounds1.bottom < bounds2.top ||
    bounds1.top > bounds2.bottom
  );
}

export function checkPlayerEnemyCollision(
  playerPosition: Position,
  enemy: Enemy
): boolean {
  const playerBounds = getBounds(playerPosition, PLAYER_SIZE);
  const enemyBounds = getBounds(enemy.position, ENEMY_SIZE);
  return checkBoundsCollision(playerBounds, enemyBounds);
}

export function checkProjectileEnemyCollision(
  projectile: Projectile,
  enemy: Enemy
): boolean {
  const projectileBounds = getBounds(projectile.position, PROJECTILE_SIZE);
  const enemyBounds = getBounds(enemy.position, ENEMY_SIZE);
  return checkBoundsCollision(projectileBounds, enemyBounds);
}

export function isInBounds(position: Position, bounds: { width: number; height: number }): boolean {
  return (
    position.x >= 0 &&
    position.x <= bounds.width - PLAYER_SIZE &&
    position.y >= 0 &&
    position.y <= bounds.height - PLAYER_SIZE
  );
}
