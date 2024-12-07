import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import {
  movePlayer,
  addProjectile,
  updateProjectiles,
  setGameStatus,
  resetGame,
} from '../../storeRedux/gameSlice';
import React from 'react';
import { GUNS } from './Guns';
import EnemyComponent from './Enemy';
import { Enemy } from '../../storeRedux/gameSlice';

const VIEWPORT = {
  WIDTH: 1200,
  HEIGHT: 800,
};

interface PlayerMovementReturn {
  isMoving: boolean;
  setIsMoving: (value: boolean) => void;
  updatePlayerPosition: (deltaTime: number) => void;
}

type GameStatus = 'menu' | 'playing' | 'gameOver' | 'victory' | 'loading';

/**
 * useCamera handles viewport positioning and visible line range calculations
 * @param playerPosition - player position control
 * @returns Coordinates for where tha camera should be locking in
 */
export const useCamera = (playerPosition: { x: number; y: number }) => {
    const [cameraTransform, setCameraTransform] = useState({ x: 0, y: 0 });
    const [visibleLineRange, setVisibleLineRange] = useState({ start: 0, end: 100 });

    const updateCamera = useCallback(() => {
        // calculate camera position with bounds checking to prevent out-of-bounds scrolling
        const targetY = Math.max(0, Math.min(5850, playerPosition.y - VIEWPORT.HEIGHT / 3));
        const targetX = Math.max(0, Math.min(VIEWPORT.WIDTH - 1200, playerPosition.x - VIEWPORT.WIDTH / 2));

    const startLine = Math.max(0, Math.floor(targetY / 12));
    const endLine = Math.min(500, startLine + Math.ceil(VIEWPORT.HEIGHT / 12));
    setVisibleLineRange({ start: startLine, end: endLine });

    setCameraTransform({
      x: -targetX,
      y: -targetY,
    });
  }, [playerPosition]);

  return { cameraTransform, visibleLineRange, updateCamera };
};

/**
 * usePlayerMovement handles all player position updates and movement calculations
 */
export const usePlayerMovement = (
  updateCamera: () => void,
  activeKeys: React.MutableRefObject<{ [key: string]: boolean }>,
  isDashing: boolean,
  gameStatus: GameStatus,
  inStore: boolean
): PlayerMovementReturn => {
  const dispatch = useAppDispatch();
  const playerPosition = useAppSelector((state) => state.game.playerPosition);
  const PLAYER = useAppSelector((state) => state.game.stats);
  const SIZE = useAppSelector((state) => state.game.SIZE);

  const [isMoving, setIsMoving] = useState(false);

  const updatePlayerPosition = useCallback(
    (deltaTime: number) => {
      if (gameStatus !== 'playing' || inStore) return;

      let horizontalMovement = 0;
      let verticalMovement = 0;

      const keys = activeKeys.current;
      if (keys['w'] || keys['W'] || keys['ArrowUp']) verticalMovement -= 1;
      if (keys['s'] || keys['S'] || keys['ArrowDown']) verticalMovement += 1;
      if (keys['a'] || keys['A'] || keys['ArrowLeft']) horizontalMovement -= 1;
      if (keys['d'] || keys['D'] || keys['ArrowRight']) horizontalMovement += 1;

      const isPlayerMoving = horizontalMovement !== 0 || verticalMovement !== 0;
      setIsMoving(isPlayerMoving);

      if (!isPlayerMoving) return;

      if (horizontalMovement !== 0 && verticalMovement !== 0) {
        horizontalMovement /= Math.sqrt(2);
        verticalMovement /= Math.sqrt(2);
      }

      const currentSpeed =
        PLAYER.SPEED * (isDashing ? PLAYER.DASH_SPEED_MULTIPLIER : 1);
      horizontalMovement *= currentSpeed * (deltaTime / 16.667);
      verticalMovement *= currentSpeed * (deltaTime / 16.667);

      const newX = Math.max(
        50 + SIZE / 2,
        Math.min(1150 - SIZE * 1.5, playerPosition.x + horizontalMovement)
      );

        const newY = Math.max(
            //top boundary
            SIZE / 2,
            //bottom 
            Math.min(509 * 12, playerPosition.y + verticalMovement)
        );

      dispatch(movePlayer({ x: newX, y: newY }));
      updateCamera();
    },
    [dispatch, playerPosition, isDashing, gameStatus, inStore, updateCamera, PLAYER.SPEED, PLAYER.DASH_SPEED_MULTIPLIER, SIZE]
  );

  return { isMoving, setIsMoving, updatePlayerPosition };
};

/**
 * useProjectiles handles creation, movement, and cleanup of projectiles
 */
export const useProjectiles = (gameStatus: GameStatus) => {
  const dispatch = useAppDispatch();
  const projectiles = useAppSelector((state) => state.game.projectiles);
  const currentGun = useAppSelector((state) => state.game.currentGun);
  const gunConfig = GUNS[currentGun];

  const updateProjectilePositions = useCallback(
    (deltaTime: number) => {
      if (gameStatus !== 'playing') return;

      const updatedProjectiles = projectiles
        .map((projectile) => {
          const config = projectile.isCharged
            ? gunConfig.charged || gunConfig.normal
            : gunConfig.normal;

          return {
            ...projectile,
            position: {
              x:
                projectile.position.x +
                projectile.direction.x * config.speed * (deltaTime / 16.667),
              y:
                projectile.position.y +
                projectile.direction.y * config.speed * (deltaTime / 16.667),
            },
          };
        })
        .filter(
          (projectile) =>
            projectile.position.x >= 0 &&
            projectile.position.x <= VIEWPORT.WIDTH &&
            projectile.position.y >= 0 &&
            projectile.position.y <= 6000
        );

      dispatch(updateProjectiles(updatedProjectiles));
    },
    [projectiles, gameStatus, dispatch, currentGun, gunConfig]
  );

  return { projectiles, updateProjectilePositions };
};

/**
 * usePlayerAbilities manages special abilities like dashing and charging projectiles
 */
export const usePlayerAbilities = (
  gameStatus: GameStatus,
  inStore: boolean,
  playerPosition: { x: number; y: number },
  cameraTransform: { x: number; y: number }
) => {
  const dispatch = useAppDispatch();
  const [isDashing, setIsDashing] = useState(false);
  const [canDash, setCanDash] = useState(true);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeStartTimestamp, setChargeStartTimestamp] = useState(0);
  const PLAYER = useAppSelector((state) => state.game.stats);
  const currentGun = useAppSelector((state) => state.game.currentGun);
  const gunConfig = GUNS[currentGun];

  const activateDash = useCallback(() => {
    if (!canDash || gameStatus !== 'playing') return;

    setIsDashing(true);
    setCanDash(false);

    setTimeout(() => {
      setIsDashing(false);
    }, PLAYER.DASH_DURATION_MS);

    setTimeout(() => {
      setCanDash(true);
    }, PLAYER.DASH_DURATION_MS + PLAYER.DASH_COOLDOWN_MS);
  }, [canDash, gameStatus, PLAYER.DASH_DURATION_MS, PLAYER.DASH_COOLDOWN_MS]);

  const startProjectileCharge = useCallback(
    (e: MouseEvent) => {
      if (gameStatus !== 'playing' || inStore) return;

      if (e.button === 0) {
        setIsCharging(true);
        setChargeStartTimestamp(Date.now());
      }
    },
    [gameStatus, inStore]
  );

  const releaseProjectile = useCallback(
    (e: MouseEvent) => {
      if (gameStatus !== 'playing' || !isCharging || inStore) return;

      const chargeTime = Date.now() - chargeStartTimestamp;
      const isFullyCharged = chargeTime >= (gunConfig.charged?.chargeTime || 0);

      const gameBoard = document.querySelector('.game-board');
      if (!gameBoard) return;

      const boardRect = gameBoard.getBoundingClientRect();
      const mouseX = e.clientX - boardRect.left - cameraTransform.x;
      const mouseY = e.clientY - boardRect.top - cameraTransform.y;

      const directionX = mouseX - playerPosition.x;
      const directionY = mouseY - playerPosition.y;

      const distance = Math.sqrt(
        directionX * directionX + directionY * directionY
      );

      dispatch(
        addProjectile({
          id: Math.random().toString(),
          position: { ...playerPosition },
          direction: {
            x: directionX / distance,
            y: directionY / distance,
          },
          isCharged: isFullyCharged,
          piercing: isFullyCharged,
        })
      );
      setIsCharging(false);
    },
    [
      isCharging,
      chargeStartTimestamp,
      playerPosition,
      gameStatus,
      inStore,
      dispatch,
      cameraTransform,
      gunConfig
    ]
  );

  return {
    isDashing,
    canDash,
    isCharging,
    activateDash,
    startProjectileCharge,
    releaseProjectile,
    setIsDashing,
    setCanDash,
    setIsCharging,
  };
};

/**
 * useGameState handles game start and reset functionality
 */
export const useGameState = () => {
  const dispatch = useAppDispatch();

  const handleGameStart = useCallback(() => {
    dispatch(resetGame());
    dispatch(setGameStatus('playing'));
  }, [dispatch]);

  const handleGameReset = useCallback(() => {
    dispatch(resetGame());
  }, [dispatch]);

  return { handleGameStart, handleGameReset };
};

/**
 * renderLineNumbers renders line numbers with viewport optimization
 */
export const renderLineNumbers = (
  totalLines: number,
  lineHeight: number,
  cameraTransform: { x: number; y: number }
) => {
  const numbers = [];
  // calculate max lines based on the movement boundary (509 * 12) divided by line height
  const maxLines = Math.floor((509 * 12) / (lineHeight * 2)); // using lineHeight * 2 since we doubled spacing

  for (let i = 1; i <= maxLines; i++) {
    const linePosition = (i - 1) * lineHeight * 2;
    const isVisible =
      linePosition >= -cameraTransform.y &&
      linePosition <= -cameraTransform.y + VIEWPORT.HEIGHT;

    if (isVisible) {
      numbers.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${linePosition}px`,
            paddingRight: '8px',
            paddingTop: '12px',
            width: '40px',
            height: '36px',
            textAlign: 'right',
            color: '#666',
            fontSize: '14px',
            fontFamily: 'monospace',
            userSelect: 'none',
            lineHeight: '24px'
          }}
        >
          {i}
        </div>
      );
    }
  }
  return numbers;
};


/**
 * renderEnemies creates React components for each enemy in the provided array
 */
export const renderEnemies = (enemies: Enemy[]) => {
  return enemies.map((enemy: Enemy) => (
    <EnemyComponent
      key={enemy.id}
      id={enemy.id}
      position={enemy.position}
      health={enemy.health}
      damage={enemy.damage}
      speed={enemy.speed}
      type={enemy.type}
    />
  ));
};
