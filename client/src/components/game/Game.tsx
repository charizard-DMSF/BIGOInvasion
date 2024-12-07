import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from 'antd';
import Hud from '../hud/Stats';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import {
  toggleStore,
  switchGun,
  togglePause,
  toggleLeaderboard,
  toggleStats,
  damageEnemy,
  updateEnemies,
  defeatEnemy,
  updateProjectiles,
  damagePlayer,
  setGameStatus,
  movePlayer,
  loadSavedGameState,
  finishLoading
} from '../../storeRedux/gameSlice';
import PauseMenu from '../menu/Pause';
import Store from '../store/Store';
import {
  useCamera,
  usePlayerMovement,
  useProjectiles,
  usePlayerAbilities,
  useGameState,
  renderLineNumbers,
  renderEnemies,
} from './gameUtils';
import { GUNS } from './Guns';
import { useLevelManager } from './LevelManager';

const Game: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const worldRef = useRef<HTMLDivElement>(null);
  const activeKeys = useRef<{ [key: string]: boolean }>({});
  const lastFrameTimestamp = useRef<number>(0);
  const frameRequestId = useRef<number>();

  // Redux state selectors
  const currentGun = useAppSelector((state) => state.game.currentGun);
  const isPaused = useAppSelector((state) => state.game.isPaused);
  const isLeaderboardOpen = useAppSelector((state) => state.game.isLeaderboardOpen);
  const isStatsOpen = useAppSelector((state) => state.game.isStatsOpen);
  const enemies = useAppSelector((state) => state.game.enemies);
  const currentLevel = useAppSelector((state) => state.game.currentLevel);
  const { playerPosition, gameStatus, inStore, projectiles, unlockedGuns } = useAppSelector((state) => state.game);

  // Custom hooks
  const { cameraTransform, updateCamera } = useCamera(playerPosition);
  const { updateProjectilePositions } = useProjectiles(gameStatus);
  const { handleGameStart, handleGameReset } = useGameState();
  const { currentLevelConfig, isLevelTransitioning, handleEnemyDefeat, initializeLevel } = useLevelManager(cameraTransform);

  const {
    isDashing,
    isCharging,
    activateDash,
    startProjectileCharge,
    releaseProjectile,
    setIsDashing,
    setCanDash,
    setIsCharging,
  } = usePlayerAbilities(gameStatus, inStore, playerPosition, cameraTransform);

  const { isMoving, setIsMoving, updatePlayerPosition } = usePlayerMovement(
    updateCamera,
    activeKeys,
    isDashing,
    gameStatus,
    inStore
  );

  // Player damage cooldown state
  const [isPlayerInvulnerable, setIsPlayerInvulnerable] = useState(false);
  const isInvulnerableRef = useRef(false);
  const damageCooldown = 1000;

  // Load saved game
  useEffect(() => {
    const loadSave = searchParams.get('loadSave');
    const user = localStorage.getItem('user');

    if (loadSave === 'true' && user) {
      const userData = JSON.parse(user);

      const loadSavedGame = async () => {
        try {
          const response = await fetch(`http://localhost:8080/loadGame/${userData.user_id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!response.ok) throw new Error('Failed to load game');

          const { gameState } = await response.json();

          if (gameState) {
            // Load the complete state including enemies
            dispatch(loadSavedGameState({
              ...gameState,
              enemies: gameState.enemies || [] // Include enemies in load
            }));

            // Don't initialize level with new enemies
            dispatch(movePlayer(gameState.playerPosition));

            // Finally set to playing
            dispatch(finishLoading());
          }
        } catch (error) {
          console.error('Failed to load saved game:', error);
          dispatch(setGameStatus('playing'));
        }
      };

      loadSavedGame();
    }
  }, [dispatch, searchParams]);

  // Update invulnerability ref
  useEffect(() => {
    isInvulnerableRef.current = isPlayerInvulnerable;
  }, [isPlayerInvulnerable]);

  // Collision detection
  const checkCollisions = useCallback(() => {
    const updatedProjectiles = [...projectiles];
    const updatedEnemies = [...enemies];
    let projectilesToRemove = new Set();

    const playerBox = {
      left: playerPosition.x,
      right: playerPosition.x + 8,
      top: playerPosition.y,
      bottom: playerPosition.y + 8,
    };

    // Check projectile-enemy collisions
    updatedProjectiles.forEach((projectile) => {
      const projectileBox = {
        left: projectile.position.x,
        right: projectile.position.x + 30,
        top: projectile.position.y,
        bottom: projectile.position.y + 30,
      };

      updatedEnemies.forEach((enemy) => {
        const enemyBox = {
          left: enemy.position.x,
          right: enemy.position.x + 30,
          top: enemy.position.y,
          bottom: enemy.position.y + 30,
        };

        if (
          projectileBox.left < enemyBox.right &&
          projectileBox.right > enemyBox.left &&
          projectileBox.top < enemyBox.bottom &&
          projectileBox.bottom > enemyBox.top
        ) {
          const gunConfig = GUNS[currentGun];
          const damage = projectile.isCharged && gunConfig.charged
            ? gunConfig.charged.damage
            : gunConfig.normal.damage;

          dispatch(damageEnemy({ id: enemy.id, damage }));

          const updatedEnemy = enemies.find((e) => e.id === enemy.id);
          if (updatedEnemy && updatedEnemy.health <= 0) {
            dispatch(defeatEnemy(enemy.id));
            handleEnemyDefeat();
          }

          if (!projectile.piercing) {
            projectilesToRemove.add(projectile.id);
          }
        }
      });
    });

    // Check enemy-player collisions
    if (!isInvulnerableRef.current) {
      for (const enemy of updatedEnemies) {
        const enemyBox = {
          left: enemy.position.x,
          right: enemy.position.x + 30,
          top: enemy.position.y,
          bottom: enemy.position.y + 30,
        };

        if (
          playerBox.left < enemyBox.right &&
          playerBox.right > enemyBox.left &&
          playerBox.top < enemyBox.bottom &&
          playerBox.bottom > enemyBox.top
        ) {
          isInvulnerableRef.current = true;
          setIsPlayerInvulnerable(true);

          dispatch(damagePlayer(enemy.damage));

          const playerElement = document.querySelector('.player');
          if (playerElement) {
            playerElement.classList.add('invulnerable');
          }

          setTimeout(() => {
            isInvulnerableRef.current = false;
            setIsPlayerInvulnerable(false);
            const playerElement = document.querySelector('.player');
            if (playerElement) {
              playerElement.classList.remove('invulnerable');
            }
          }, damageCooldown);

          break;
        }
      }
    }

    // Remove used projectiles
    if (projectilesToRemove.size > 0) {
      const remainingProjectiles = updatedProjectiles.filter(
        (p) => !projectilesToRemove.has(p.id)
      );
      dispatch(updateProjectiles(remainingProjectiles));
    }
  }, [projectiles, enemies, currentGun, playerPosition, dispatch, handleEnemyDefeat]);

  // Update enemy positions
  const updateEnemyPositions = useCallback(
    (deltaTime: number) => {
      const updatedEnemies = enemies.map((enemy) => {
        const directionX = playerPosition.x - enemy.position.x;
        const directionY = playerPosition.y - enemy.position.y;

        const distance = Math.sqrt(
          directionX * directionX + directionY * directionY
        );
        const normalizedDirectionX = distance > 0 ? directionX / distance : 0;
        const normalizedDirectionY = distance > 0 ? directionY / distance : 0;

        return {
          ...enemy,
          position: {
            x: enemy.position.x + normalizedDirectionX * enemy.speed * (deltaTime / 16.667),
            y: enemy.position.y + normalizedDirectionY * enemy.speed * (deltaTime / 16.667),
          },
        };
      });

      dispatch(updateEnemies(updatedEnemies));
    },
    [enemies, dispatch, playerPosition]
  );

  // Game loop
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (gameStatus !== 'playing' || inStore || isPaused || isLevelTransitioning) return;

      if (!lastFrameTimestamp.current) {
        lastFrameTimestamp.current = timestamp;
      }

      const deltaTime = timestamp - lastFrameTimestamp.current;
      lastFrameTimestamp.current = timestamp;

      updatePlayerPosition(deltaTime);
      updateProjectilePositions(deltaTime);
      updateEnemyPositions(deltaTime);
      checkCollisions();

      frameRequestId.current = requestAnimationFrame(gameLoop);
    },
    [
      updatePlayerPosition,
      updateProjectilePositions,
      updateEnemyPositions,
      checkCollisions,
      gameStatus,
      inStore,
      isPaused,
      isLevelTransitioning,
    ]
  );

  // Event handlers
  const handleStoreToggle = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        dispatch(toggleStore());
      }
    },
    [dispatch]
  );

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isStatsOpen) {
          dispatch(toggleStats());
        } else if (isLeaderboardOpen) {
          dispatch(toggleLeaderboard());
        } else {
          dispatch(togglePause());
        }
      }
    },
    [dispatch, isLeaderboardOpen, isStatsOpen]
  );

  const handleCompleteReset = useCallback(() => {
    handleGameReset();
    setIsDashing(false);
    setCanDash(true);
    setIsMoving(false);
    setIsCharging(false);
    lastFrameTimestamp.current = 0;
  }, [handleGameReset, setIsMoving]);

  // Event listeners and game loop setup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        e.preventDefault();
      }
      activeKeys.current[e.key] = true;

      // Gun switching logic
      if (gameStatus === 'playing' && !inStore && !isPaused) {
        const gunKeys: { [key: string]: string } = {
          '1': 'basic',
          '2': 'spread',
          '3': 'sniper',
        };

        if (e.key in gunKeys && unlockedGuns.includes(gunKeys[e.key])) {
          dispatch(switchGun(gunKeys[e.key]));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete activeKeys.current[e.key];
    };

    const handleBlur = () => {
      activeKeys.current = {};
      setIsMoving(false);
      setIsCharging(false);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isPaused || inStore) return;

      if (e.button === 2) {
        e.preventDefault();
        activateDash();
      } else if (e.button === 0) {
        e.preventDefault();
        startProjectileCharge(e);
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', releaseProjectile);
    window.addEventListener('keypress', handleStoreToggle);
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Start game loop
    if (gameStatus === 'playing' && !inStore && !isPaused) {
      frameRequestId.current = requestAnimationFrame(gameLoop);
    }

    // Cleanup
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
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [
    gameLoop,
    activateDash,
    startProjectileCharge,
    releaseProjectile,
    handleStoreToggle,
    handleEscape,
    gameStatus,
    inStore,
    isPaused,
    setIsMoving,
    dispatch,
    unlockedGuns,
  ]);

  // Render store if in store mode
  if (inStore) {
    return <Store />;
  }

  const { Header } = Layout;

  const layoutStyle = {
    borderRadius: 8,
    overflow: 'hidden',
    width: 'calc(100% - 8px)',
    maxWidth: 'calc(100% - 8px)',
  };

  return (
    <Layout style={layoutStyle}>
      <Header className='headerStyle'>
        <Hud />
      </Header>
      <div className='content-container'></div>
      <div className="game-container">
        {/* Level transition overlay */}
        {gameStatus === 'playing' && isLevelTransitioning && (
          <div className="level-transition">
            <h2>Level {currentLevel} Complete!</h2>
            <p>Reward: {currentLevelConfig.mathbucksReward} Mathbucks</p>
            {currentLevel < 7 && <p>Preparing Level {currentLevel + 1}...</p>}
          </div>
        )}

        {/* Victory state */}
        {gameStatus === 'victory' && (
          <div className="menu-container">
            <h2>Congratulations!</h2>
            <p>You've completed all levels!</p>
            <button onClick={handleCompleteReset}>Play Again</button>
          </div>
        )}

        {/* Game over state */}
        {gameStatus === 'gameOver' && (
          <div className="menu-container">
            <button onClick={handleCompleteReset}>Try Again</button>
          </div>
        )}

        <div className="game-board">
          <div className="line-numbers" style={{ transform: `translateY(${cameraTransform.y}px)` }}>
            {renderLineNumbers(500, 12, cameraTransform)}
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

            {/* Playing state */}
            {gameStatus === 'playing' && (
              <>
                {renderEnemies(enemies)}
                {/* Player */}
                <div
                  className={`player ${isMoving ? 'moving' : ''} ${isDashing ? 'dashing' : ''} ${isCharging ? 'charging' : ''
                    }`}
                  style={{
                    left: `${playerPosition.x}px`,
                    top: `${playerPosition.y}px`,
                  }}
                />

                {/* Projectiles */}
                {projectiles.map((projectile) => {
                  const gunConfig = GUNS[currentGun];
                  const projectileConfig = projectile.isCharged
                    ? gunConfig.charged || gunConfig.normal
                    : gunConfig.normal;

                  return (
                    <div
                      key={projectile.id}
                      className={`debug-shot gun-${currentGun} ${projectile.isCharged ? 'charged' : 'normal'}`}
                      style={{
                        left: `${projectile.position.x}px`,
                        top: `${projectile.position.y}px`,
                        width: `${projectileConfig.size}px`,
                        height: `${projectileConfig.size}px`,
                      }}>
                      {projectileConfig.displayText}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Pause Menu */}
        {gameStatus === 'playing' && isPaused && (
          <PauseMenu
            onResume={() => dispatch(togglePause())}
            isLeaderboardOpen={isLeaderboardOpen}
            isStatsOpen={isStatsOpen}
          />
        )}
      </div>
    </Layout>
  );
};

export default Game;