import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import {
  movePlayer,
  addProjectile,
  updateProjectiles,
  setGameStatus,
  resetGame,
  updateEnemies,
  addEnemy,
} from '../../storeRedux/gameSlice';
import React from 'react';
import { GUNS } from './Guns';
import EnemyComponent, { ENEMY_TYPES, EnemyTypeKey } from './Enemy';
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

/**
 * useCamera handles viewport positioning and visible line range calculations
 * @param playerPosition - player position control
 * @returns Coordinates for where tha camera should be locking in
 */
export const useCamera = (playerPosition: { x: number; y: number }) => {
  const [cameraTransform, setCameraTransform] = useState({ x: 0, y: 0 });
  const [visibleLineRange, setVisibleLineRange] = useState({
    start: 0,
    end: 50,
  });

  const updateCamera = useCallback(() => {
    // calculate camera position with bounds checking to prevent out-of-bounds scrolling
    const targetY = Math.max(
      0,
      Math.min(5200, playerPosition.y - VIEWPORT.HEIGHT / 2)
    );
    const targetX = Math.max(
      0,
      Math.min(VIEWPORT.WIDTH - 1200, playerPosition.x - VIEWPORT.WIDTH / 2)
    );

    // calculate visible line range for optimized rendering
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
 * @param updateCamera - Function to update the camear position
 * @param activeKeys - Ref object containing currently pressed keys
 * @param isDashing - Boolean indicating if the player is currently dashing
 * @param gameStatus - Current game status
 * @param inStore - Boolean indicating if the player is in the store
 * @returns Movement state and update function for the game loop
 */
export const usePlayerMovement = (
  updateCamera: () => void,
  activeKeys: React.MutableRefObject<{ [key: string]: boolean }>,
  isDashing: boolean,
  gameStatus: 'menu' | 'playing' | 'gameOver',
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

      // calculate movement based on active keys
      let horizontalMovement = 0;
      let verticalMovement = 0;

      const keys = activeKeys.current;
      if (keys['w'] || keys['W'] || keys['ArrowUp']) verticalMovement -= 1;
      if (keys['s'] || keys['S'] || keys['ArrowDown']) verticalMovement += 1;
      if (keys['a'] || keys['A'] || keys['ArrowLeft']) horizontalMovement -= 1;
      if (keys['d'] || keys['D'] || keys['ArrowRight']) horizontalMovement += 1;

      // check if player is moving
      const isPlayerMoving = horizontalMovement !== 0 || verticalMovement !== 0;
      setIsMoving(isPlayerMoving);

      // if not return
      if (!isPlayerMoving) return;

      // normalize diagonal so its not too fast if not
      if (horizontalMovement !== 0 && verticalMovement !== 0) {
        horizontalMovement /= Math.sqrt(2);
        verticalMovement /= Math.sqrt(2);
      }

      /*
            Use delta time so in slower computers twice the ground is covered even with less re-renders 
        At 60 FPS: 16.667 / 16.667 = 1.0
        At 30 FPS: 33.334 / 16.667 = 2.0
        At 120 FPS: 8.333 / 16.667 = 0.5
        */

      // apply speed calculations with dash multiplier and delta time
      const currentSpeed =
        PLAYER.SPEED * (isDashing ? PLAYER.DASH_SPEED_MULTIPLIER : 1);
      horizontalMovement *= currentSpeed * (deltaTime / 16.667);
      verticalMovement *= currentSpeed * (deltaTime / 16.667);

      // calculate new position with boundary restrictions
      const newX = Math.max(
        //left boundary
        50 + SIZE / 2,
        //right boundary
        Math.min(1150 - SIZE * 1.5, playerPosition.x + horizontalMovement)
      );

        const newY = Math.max(
            //top boundary
            SIZE / 2,
            //bottom 
            Math.min(540 * 12, playerPosition.y + verticalMovement)
        );

      dispatch(movePlayer({ x: newX, y: newY }));
      updateCamera();
    },
    [dispatch, playerPosition, isDashing, gameStatus, inStore, updateCamera]
  );

  return { isMoving, setIsMoving, updatePlayerPosition };
};

/***
 * useProjectiles handles creation, movement, and cleanup of projectiles
 * chosen for projectile logic and provide efficient updates in the game loop
 * @param gameStatus - Current game status
 * @returns Projectile state and update function
 */
export const useProjectiles = (gameStatus: 'menu' | 'playing' | 'gameOver') => {
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
        // if outside boundaries delete
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

/***
 * usePlayerAbilities manages special abilities like dashing and charging projectiles
 * chosen to separate ability logic from basic movement and provide clean ability state management
 * @param gameStatus - Current game status
 * @param inStore - Boolean indicating if the player is in the store
 * @param playerPosition - current player position
 * @param cameraTransform - current coordinates for adjusting the game's viewport
 * @returns ability states and their respective control functions
 */
export const usePlayerAbilities = (
  gameStatus: string,
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

  // dash ability implementation with cooldown management
  const activateDash = useCallback(() => {
    // check if possible to initiate dashing
    if (!canDash || gameStatus !== 'playing') return;

    // set current dash loop
    setIsDashing(true);
    // not allow new dash whilst dashing
    setCanDash(false);

    // wait for dash to finish
    setTimeout(() => {
      setIsDashing(false);
    }, PLAYER.DASH_DURATION_MS);

    // allow dash cd before new one can be used
    setTimeout(() => {
      setCanDash(true);
    }, PLAYER.DASH_DURATION_MS + PLAYER.DASH_COOLDOWN_MS);
  }, [canDash, gameStatus]);

  // projectile charging mechanism
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

  // projectile release with direction calculation and charge time checking
  const releaseProjectile = useCallback(
    (e: MouseEvent) => {
      if (gameStatus !== 'playing' || !isCharging || inStore) return;

      const chargeTime = Date.now() - chargeStartTimestamp;
      const isFullyCharged = chargeTime >= gunConfig.charged.chargeTime;

      const gameBoard = document.querySelector('.game-board');
      if (!gameBoard) return;

      // calculate projectile direction based on mouse position
      // get the game board position and dimensions relative to the viewport
      const boardRect = gameBoard.getBoundingClientRect();

      // vonvert mouse position from screen coordinates to game world coordinates by:
      // starting with mouse screen position (e.clientX)
      // subtracting board's left offset to get position relative to game board
      // subtracting camera offset to account for scrolled view
      const mouseX = e.clientX - boardRect.left - cameraTransform.x;
      const mouseY = e.clientY - boardRect.top - cameraTransform.y;

      // calculate the vector from player to mouse by subtracting player position from mouse position
      // this gives us the direction the projectile should travel
      const directionX = mouseX - playerPosition.x;
      const directionY = mouseY - playerPosition.y;

      // calculate the length of the direction vector using the pythagorean theorem
      // this is used to normalize the direction vector to ensure consistent projectile speed
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

/***
 * useGameState handles game start and reset functionality
 * chosen to centralize game state transitions and provide clean game flow control
 * @returns Game control functions
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

/***
 * renderLineNumbers renders line numbers with viewport optimization
 * chosen to provide efficient line number rendering with camera movement
 * @param totalLines - Total number of lines to render
 * @param lineHeight - Height of each line
 * @param cameraTransform - current coordinates for adjusting the game's viewport
 * @returns Array of rendered line number elements
 */
export const renderLineNumbers = (
  totalLines: number,
  lineHeight: number,
  cameraTransform: { x: number; y: number }
) => {
  // Initialize array to store visible line number elements
  const numbers = [];
  // iterate through all possible line numbers
  for (let i = 1; i < totalLines; i++) {
    // calculate position for current line
    // subtract 1 from i since line counting starts at 1 but positions start at 0
    const linePosition = (i - 1) * lineHeight;

    // determine if this line is currently visible in viewport by:
    // 1 checking if line is below top of viewport (-cameraTransform.y)
    // 2 checking if line is above bottom of viewport (-cameraTransform.y + VIEWPORT.HEIGHT)
    const isVisible =
      linePosition >= -cameraTransform.y &&
      linePosition <= -cameraTransform.y + VIEWPORT.HEIGHT;

    // only render numbers for visible lines
    if (isVisible) {
      // create span element for line number with:
      // unique key for React reconciliation
      // absolute positioning for precise placement
      // top position set to exact pixel location
      numbers.push(
        <span
          key={i}
          style={{
            position: 'absolute',
            top: `${linePosition}px`,
          }}>
          {i}
        </span>
      );
    }
  }
  return numbers;
};

/**
 * renderEnemies creates React components for each enemy in the provided array
 * @param enemies - An array of Enemy objects to be rendered
 * @returns An array of Enemy components with properties set according to each enemy object
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

/**
 * useEnemyMovement sets up interval to spawn enemies at random positions
 * when the game is in the 'playing' state, uses a side effecct to create new
 * enemies every 3 seconds
 * @returns void
 */
export const useEnemyMovement = (cameraTransform: { x: number; y: number }): void => {
  const dispatch = useAppDispatch();
  const gameStatus = useAppSelector((state) => state.game.gameStatus);
  const gameLevel = useAppSelector((state) => state.game.level);

  useEffect(() => {
    let spawnInterval: NodeJS.Timeout;

    const spawnEnemy = () => {
      let availableEnemyTypes: EnemyTypeKey[] = ['basic'];
      if (gameLevel >= 2) availableEnemyTypes.push('fast');
      if (gameLevel >= 3) availableEnemyTypes.push('tank');

      const randomType =
        availableEnemyTypes[
          Math.floor(Math.random() * availableEnemyTypes.length)
        ];
      const enemyConfig = ENEMY_TYPES[randomType].config;


        const newEnemy: Enemy = {
            id: Math.random().toString(),
            position: {
                x: Math.random() * VIEWPORT.WIDTH,
                /*
                540 * 12                             game world height in pixels (6480px)
                -cameraTransform.y                   current camera vertical (negative because camera moves opposite to world)
                Math.random() * VIEWPORT.HEIGHT      random position within visible screen (0 to 800px)

                we use math max so it doesnt spawn above the "ceiling"
                and math min so it doesnt spawn below the "basement"
                */ 
                y: Math.max(0, Math.min(540 * 12,
                    -cameraTransform.y +
                    Math.random() * VIEWPORT.HEIGHT
                )),
            },
            health: 100,
            speed: enemyConfig.baseSpeed,
            type: randomType,
        };

      dispatch(addEnemy(newEnemy));
    };

    if (gameStatus === 'playing') {
      spawnInterval = setInterval(spawnEnemy, 300);
    }

    return () => {
      if (spawnInterval) clearInterval(spawnInterval);
    };
  }, [dispatch, gameStatus, gameLevel, cameraTransform]);
};
