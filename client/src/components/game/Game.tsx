import React, { useEffect, useRef, useState } from 'react';
import Hud from '../hud/stats';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import { toggleStore, switchGun } from '../../storeRedux/gameSlice';  // Add switchGun import
import Store from '../store/Store';
import {
  useCamera,
  usePlayerMovement,
  useProjectiles,
  usePlayerAbilities,
  useGameState,
  renderLineNumbers
} from './gameUtils';
import { GUNS } from './guns';

const Game: React.FC = () => {
  const dispatch = useAppDispatch();
  const worldRef = useRef<HTMLDivElement>(null);
  const activeKeys = useRef<{ [key: string]: boolean }>({});
  const lastFrameTimestamp = useRef<number>(0);
  const frameRequestId = useRef<number>();

  const currentGun = useAppSelector(state => state.game.currentGun);

  const {
    playerPosition,
    gameStatus,
    inStore,
    projectiles,
    unlockedGuns
  } = useAppSelector(state => state.game);

  const [backgroundCode] = useState<string[]>([]);

  const { cameraTransform, updateCamera } = useCamera(playerPosition);

  const {
    isDashing,
    isCharging,
    activateDash,
    startProjectileCharge,
    releaseProjectile,
    setIsDashing,
    setCanDash,
    setIsCharging
  } = usePlayerAbilities(gameStatus, inStore, playerPosition, cameraTransform);

  const { isMoving, setIsMoving, updatePlayerPosition } = usePlayerMovement(
    updateCamera,
    activeKeys,
    isDashing,
    gameStatus,
    inStore
  );

  const { updateProjectilePositions } = useProjectiles(gameStatus);  // Removed projectiles from destructuring since we get it from state
  const { handleGameStart, handleGameReset } = useGameState();

  const gameLoop = React.useCallback((timestamp: number) => {
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

  const handleStoreToggle = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      dispatch(toggleStore());
    }
  }, [dispatch]);

  const handleCompleteReset = React.useCallback(() => {
    handleGameReset();
    setIsDashing(false);
    setCanDash(true);
    setIsMoving(false);
    setIsCharging(false);
    lastFrameTimestamp.current = 0;
  }, [handleGameReset, setIsMoving]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      activeKeys.current[e.key] = true;

      // Gun switching logic
      if (gameStatus === 'playing' && !inStore) {
        const gunKeys: { [key: string]: string } = {
          '1': 'basic',
          '2': 'spread',
          '3': 'sniper'
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
  }, [
    gameLoop,
    activateDash,
    startProjectileCharge,
    releaseProjectile,
    handleStoreToggle,
    gameStatus,
    inStore,
    setIsMoving,
    dispatch,
    unlockedGuns
  ]);

  if (inStore) {
    return <Store />;
  }

  return (
    <>
      <Hud />
      <div className="game-container">
        <div className="game-board">
          <div className="line-numbers" style={{ transform: `translateY(${cameraTransform.y}px)` }}>
            {renderLineNumbers(500, 12, cameraTransform)}
          </div>

          <div className="background-code">
            {backgroundCode.map((snippet, index) => (
              <div key={index} className="code-snippet">
                {snippet}
              </div>
            ))}
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
                <button onClick={handleCompleteReset}>Try Again</button>
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

                {projectiles.map(projectile => {
                  const gunConfig = GUNS[currentGun];
                  const projectileConfig = projectile.isCharged ?
                    gunConfig.charged || gunConfig.normal :
                    gunConfig.normal;

                  return (
                    <div
                      key={projectile.id}
                      className={`debug-shot ${projectile.isCharged ? 'charged' : ''}`}
                      style={{
                        left: `${projectile.position.x}px`,
                        top: `${projectile.position.y}px`,
                        width: `${projectileConfig.size}px`,
                        height: `${projectileConfig.size}px`,
                        backgroundColor: projectileConfig.color
                      }}
                    >
                      {projectileConfig.displayText}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;