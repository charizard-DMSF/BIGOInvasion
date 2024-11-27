import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Hud from '../hud/stats';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import {
  movePlayer,
  addProjectile,
  updateProjectiles,
  setGameStatus,
  resetGame,
  toggleStore
} from '../../storeRedux/gameSlice';
import { VIEWPORT, PLAYER, PROJECTILE } from '../../constants/constants';
import Store from '../store/Store';

// Example code snippets for background
const CODE_SNIPPETS = [
  'function handleError(error: Error) {',
  '  console.error("An error occurred:", error);',
  '  throw new Error("Failed to process request");',
  '}',
  // Add more code snippets as needed
];

const Game: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const worldRef = useRef<HTMLDivElement>(null);

  // Get state from Redux
  const {
    playerPosition,
    projectiles,
    gameStatus,
    inStore
  } = useAppSelector(state => state.game);

  // Camera position
  const [cameraTransform, setCameraTransform] = useState({ x: 0, y: 0 });
  const [visibleLineRange, setVisibleLineRange] = useState({ start: 0, end: 50 });

  // Local state
  const activeKeys = useRef<{ [key: string]: boolean }>({});
  const [isDashing, setIsDashing] = useState(false);
  const [canDash, setCanDash] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeStartTimestamp, setChargeStartTimestamp] = useState(0);
  const lastFrameTimestamp = useRef<number>(0);
  const frameRequestId = useRef<number>();

  // Handle store toggle
  const handleStoreToggle = useCallback((e: KeyboardEvent) => {
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      dispatch(toggleStore());
    }
  }, [dispatch]);

  // Update camera position
  const updateCamera = useCallback(() => {
    if (!worldRef.current) return;

    // Calculate target camera position (centering on player)
    const targetY = Math.max(0, Math.min(5200, playerPosition.y - VIEWPORT.HEIGHT / 2));
    const targetX = Math.max(0, Math.min(VIEWPORT.WIDTH - 1200, playerPosition.x - VIEWPORT.WIDTH / 2));

    // Update line numbers range
    const startLine = Math.max(0, Math.floor(targetY / 12));
    const endLine = Math.min(500, startLine + Math.ceil(VIEWPORT.HEIGHT / 12));
    setVisibleLineRange({ start: startLine, end: endLine });

    // Smooth camera movement
    setCameraTransform({
      x: -targetX,
      y: -targetY
    });
  }, [playerPosition]);

  // Handle game start
  const handleGameStart = useCallback(() => {
    dispatch(resetGame());
    dispatch(setGameStatus('playing'));
  }, [dispatch]);

  // Handle game reset
  const handleGameReset = useCallback(() => {
    dispatch(resetGame());
    setIsDashing(false);
    setCanDash(true);
    setIsMoving(false);
    setIsCharging(false);
    lastFrameTimestamp.current = 0;
  }, [dispatch]);

  // Update player position
  const updatePlayerPosition = useCallback((deltaTime: number) => {
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

    // Normalize diagonal movement
    if (horizontalMovement !== 0 && verticalMovement !== 0) {
      horizontalMovement /= Math.sqrt(2);
      verticalMovement /= Math.sqrt(2);
    }

    // Apply speed and delta time
    const currentSpeed = PLAYER.BASE_SPEED * (isDashing ? PLAYER.DASH_SPEED_MULTIPLIER : 1);
    horizontalMovement *= currentSpeed * (deltaTime / 16.667);
    verticalMovement *= currentSpeed * (deltaTime / 16.667);

    const newX = Math.max(
      PLAYER.SIZE / 2,
      Math.min(VIEWPORT.WIDTH - PLAYER.SIZE / 2, playerPosition.x + horizontalMovement)
    );
    const newY = Math.max(
      PLAYER.SIZE / 2,
      Math.min(6000 - PLAYER.SIZE / 2, playerPosition.y + verticalMovement)
    );

    dispatch(movePlayer({ x: newX, y: newY }));
    updateCamera();
  }, [dispatch, playerPosition, isDashing, gameStatus, inStore, updateCamera]);

  // Update projectile positions
  const updateProjectilePositions = useCallback((deltaTime: number) => {
    if (gameStatus !== 'playing') return;

    const updatedProjectiles = projectiles
      .map(projectile => {
        const speed = projectile.isCharged
          ? PROJECTILE.CHARGED.SPEED
          : PROJECTILE.NORMAL.SPEED;

        return {
          ...projectile,
          position: {
            x: projectile.position.x + projectile.direction.x * speed * (deltaTime / 16.667),
            y: projectile.position.y + projectile.direction.y * speed * (deltaTime / 16.667)
          }
        };
      })
      .filter(projectile =>
        projectile.position.x >= 0 &&
        projectile.position.x <= VIEWPORT.WIDTH &&
        projectile.position.y >= 0 &&
        projectile.position.y <= 6000
      );

    dispatch(updateProjectiles(updatedProjectiles));
  }, [projectiles, gameStatus, dispatch]);

  // Handle dash ability
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
  }, [canDash, gameStatus]);

  // Handle shooting
  const startProjectileCharge = useCallback((e: MouseEvent) => {
    if (gameStatus !== 'playing' || inStore) return;

    if (e.button === 0) {
      setIsCharging(true);
      setChargeStartTimestamp(Date.now());
    }
  }, [gameStatus, inStore]);

  const releaseProjectile = useCallback((e: MouseEvent) => {
    if (gameStatus !== 'playing' || !isCharging || inStore) return;

    const chargeTime = Date.now() - chargeStartTimestamp;
    const isFullyCharged = chargeTime >= PROJECTILE.CHARGED.CHARGE_TIME_MS;

    const gameBoard = document.querySelector('.game-board');
    if (!gameBoard) return;

    const boardRect = gameBoard.getBoundingClientRect();
    const mouseX = e.clientX - boardRect.left - cameraTransform.x;
    const mouseY = e.clientY - boardRect.top - cameraTransform.y;

    const directionX = mouseX - playerPosition.x;
    const directionY = mouseY - playerPosition.y;
    const distance = Math.sqrt(directionX * directionX + directionY * directionY);

    dispatch(addProjectile({
      id: Math.random().toString(),
      position: { ...playerPosition },
      direction: {
        x: directionX / distance,
        y: directionY / distance
      },
      isCharged: isFullyCharged,
      piercing: isFullyCharged
    }));
    setIsCharging(false);
  }, [isCharging, chargeStartTimestamp, playerPosition, gameStatus, inStore, dispatch, cameraTransform]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameStatus !== 'playing' || inStore) return;

    if (!lastFrameTimestamp.current) {
      lastFrameTimestamp.current = timestamp;
    }

    const deltaTime = timestamp - lastFrameTimestamp.current;
    lastFrameTimestamp.current = timestamp;

    updatePlayerPosition(deltaTime);
    updateProjectilePositions(deltaTime);

    frameRequestId.current = requestAnimationFrame(gameLoop);
  }, [updatePlayerPosition, updateProjectilePositions, gameStatus, inStore]);

  // Set up event listeners and start game loop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      activeKeys.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete activeKeys.current[e.key];
      if (!Object.keys(activeKeys.current).some(key =>
        ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)
      )) {
        setIsMoving(false);
      }
    };

    const handleBlur = () => {
      activeKeys.current = {};
      setIsMoving(false);
      setIsCharging(false);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        activateDash();
      } else if (e.button === 0) {
        startProjectileCharge(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', releaseProjectile);
    window.addEventListener('keypress', handleStoreToggle);
    window.addEventListener('contextmenu', e => e.preventDefault());

    if (gameStatus === 'playing' && !inStore) {
      frameRequestId.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (frameRequestId.current) {
        cancelAnimationFrame(frameRequestId.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', releaseProjectile);
      window.removeEventListener('keypress', handleStoreToggle);
      window.removeEventListener('contextmenu', e => e.preventDefault());
    };
  }, [gameLoop, activateDash, startProjectileCharge, releaseProjectile, handleStoreToggle, gameStatus, inStore]);

  // Generate line numbers
  const renderLineNumbers = () => {
    const numbers = [];
    const totalLines = 500;
    const lineHeight = 12; // Height of each line in pixels

    for (let i = 1; i <= totalLines; i++) {
      const linePosition = (i - 1) * lineHeight;
      const isVisible = linePosition >= -cameraTransform.y &&
        linePosition <= -cameraTransform.y + VIEWPORT.HEIGHT;

      if (isVisible) {
        numbers.push(
          <span
            key={i}
            style={{
              position: 'absolute',
              top: `${linePosition}px`
            }}
          >
            {i}
          </span>
        );
      }
    }
    return numbers;
  };

  if (inStore) {
    return <Store />;
  }

  return (
    <div className="game-container">
      <Hud />
      <div className="game-board">
        <div className="line-numbers" style={{ transform: `translateY(${cameraTransform.y}px)` }}>
          {renderLineNumbers()}
        </div>
        <div className="background-code">
          {CODE_SNIPPETS.join('\n')}
        </div>
        <div
          ref={worldRef}
          className="game-world"
          style={{
            transform: `translate(${cameraTransform.x}px, ${cameraTransform.y}px)`
          }}
        >
          {gameStatus === 'menu' && (
            <div className="menu-container">
              <button onClick={handleGameStart}>Start Game</button>
            </div>
          )}
          {gameStatus === 'gameOver' && (
            <div className="menu-container">
              <button onClick={handleGameReset}>Try Again</button>
            </div>
          )}
          {gameStatus === 'playing' && (
            <>
              <div
                className={`player ${isMoving ? 'moving' : ''} ${isDashing ? 'dashing' : ''} ${isCharging ? 'charging' : ''}`}
                style={{
                  left: `${playerPosition.x}px`,
                  top: `${playerPosition.y}px`
                }}
              />
              {projectiles.map(projectile => (
                <div
                  key={projectile.id}
                  className={`debug-shot ${projectile.isCharged ? 'charged' : ''}`}
                  style={{
                    left: `${projectile.position.x}px`,
                    top: `${projectile.position.y}px`
                  }}
                >
                  {projectile.isCharged ? 'console.error()' : 'console.log()'}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;