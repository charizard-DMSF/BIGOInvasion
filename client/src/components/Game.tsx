import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
    movePlayer,
    damageEnemy,
    damagePlayer,
    setGameStatus,
    resetGame,
    updateEnemies,
    addProjectile,
    updateProjectiles
} from '../store/gameSlice';
import { v4 as uuidv4 } from 'uuid';
import Player from './Player';
import Enemy from './Enemy';
import HUD from './HUD';
import Menu from './Menu';
import Lose from './Lose';
import { useEnemySpawner } from '../hooks/useEnemySpawner';
import { checkPlayerEnemyCollision, checkProjectileEnemyCollision, isInBounds } from '../utils/collision';
import { Position, Projectile } from '../types/game.types';
import { VIEWPORT, PLAYER, PROJECTILE, ENEMY } from '../config/constants';
import { ErrorBoundary } from './ErrorBoundary';

const Game: React.FC = () => {
    const dispatch = useDispatch();
    const {
        playerPosition,
        enemies,
        projectiles,
        playerHealth,
        gameStatus
    } = useSelector((state: RootState) => state.game);

    // Input state tracking
    const activeKeys = useRef<{ [key: string]: boolean }>({});

    // Player state
    const [isDashing, setIsDashing] = useState(false);
    const [canDash, setCanDash] = useState(true);
    const [isMoving, setIsMoving] = useState(false);
    const [isCharging, setIsCharging] = useState(false);
    const [chargeStartTimestamp, setChargeStartTimestamp] = useState(0);

    // Game state tracking
    const lastFrameTimestamp = useRef<number>(0);
    const lastDamageTimestamp = useRef<number>(0);
    const frameRequestId = useRef<number>();

    useEnemySpawner();

    const initializeGame = useCallback(() => {
        dispatch(resetGame());
        dispatch(setGameStatus('playing'));
    }, [dispatch]);

    const resetGameState = useCallback(() => {
        dispatch(resetGame());
        dispatch(setGameStatus('playing'));
        setIsDashing(false);
        setCanDash(true);
        setIsMoving(false);
        setIsCharging(false);
        lastDamageTimestamp.current = 0;
        lastFrameTimestamp.current = 0;
    }, [dispatch]);

    const updatePlayerPosition = useCallback((deltaTime: number) => {
        if (gameStatus !== 'playing') return;

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

        const currentSpeed = PLAYER.BASE_SPEED * (isDashing ? PLAYER.DASH_SPEED_MULTIPLIER : 1);
        horizontalMovement *= currentSpeed * (deltaTime / 16.667);
        verticalMovement *= currentSpeed * (deltaTime / 16.667);

        const newX = Math.max(
            PLAYER.SIZE / 2,
            Math.min(VIEWPORT.WIDTH - PLAYER.SIZE / 2, playerPosition.x + horizontalMovement)
        );
        const newY = Math.max(
            PLAYER.SIZE / 2,
            Math.min(VIEWPORT.HEIGHT - PLAYER.SIZE / 2, playerPosition.y + verticalMovement)
        );

        dispatch(movePlayer({ x: newX, y: newY }));
    }, [dispatch, playerPosition, isDashing, gameStatus]);

    // Continuing from previous Game.tsx...

    const updateEnemyPositions = useCallback((deltaTime: number) => {
        if (!enemies.length || gameStatus !== 'playing') return;

        const updatedEnemies = enemies.map(enemy => {
            const distanceX = playerPosition.x - enemy.position.x;
            const distanceY = playerPosition.y - enemy.position.y;
            const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (totalDistance === 0) return enemy;

            const normalizedX = distanceX / totalDistance;
            const normalizedY = distanceY / totalDistance;

            const newX = enemy.position.x + (normalizedX * enemy.speed * deltaTime / 16.667);
            const newY = enemy.position.y + (normalizedY * enemy.speed * deltaTime / 16.667);

            return {
                ...enemy,
                position: { x: newX, y: newY }
            };
        });

        dispatch(updateEnemies(updatedEnemies));
    }, [dispatch, enemies, playerPosition, gameStatus]);

    const detectCollisions = useCallback(() => {
        if (gameStatus !== 'playing') return;

        const currentTime = Date.now();
        if (currentTime - lastDamageTimestamp.current < ENEMY.COLLISION_IMMUNITY_DURATION_MS) return;

        for (const enemy of enemies) {
            if (checkPlayerEnemyCollision(playerPosition, enemy)) {
                dispatch(damagePlayer(ENEMY.COLLISION_DAMAGE));
                lastDamageTimestamp.current = currentTime;
                break;
            }
        }
    }, [enemies, playerPosition, dispatch, gameStatus]);

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

    const startProjectileCharge = useCallback((e: MouseEvent) => {
        if (gameStatus !== 'playing') return;

        if (e.button === 0) {
            setIsCharging(true);
            setChargeStartTimestamp(Date.now());
        }
    }, [gameStatus]);

    const releaseProjectile = useCallback((e: MouseEvent) => {
        if (gameStatus !== 'playing' || !isCharging) return;

        const chargeTime = Date.now() - chargeStartTimestamp;
        const isFullyCharged = chargeTime >= PROJECTILE.CHARGED.CHARGE_TIME_MS;

        const gameBoard = document.querySelector('.game-board');
        if (!gameBoard) return;

        const boardRect = gameBoard.getBoundingClientRect();
        const mouseX = e.clientX - boardRect.left;
        const mouseY = e.clientY - boardRect.top;

        const directionX = mouseX - playerPosition.x;
        const directionY = mouseY - playerPosition.y;
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);

        const projectile: Projectile = {
            id: uuidv4(),
            position: { ...playerPosition },
            direction: {
                x: directionX / distance,
                y: directionY / distance
            },
            isCharged: isFullyCharged,
            piercing: isFullyCharged
        };

        dispatch(addProjectile(projectile));
        setIsCharging(false);
    }, [isCharging, chargeStartTimestamp, playerPosition, gameStatus, dispatch]);

    const updateProjectilePositions = useCallback((deltaTime: number) => {
        if (gameStatus !== 'playing') return;

        dispatch(updateProjectiles(
            projectiles
                .map(projectile => {
                    const speed = projectile.isCharged
                        ? PROJECTILE.CHARGED.SPEED
                        : PROJECTILE.NORMAL.SPEED;

                    const newPosition = {
                        x: projectile.position.x + projectile.direction.x * speed * (deltaTime / 16.667),
                        y: projectile.position.y + projectile.direction.y * speed * (deltaTime / 16.667)
                    };

                    return { ...projectile, position: newPosition };
                })
                .filter(projectile =>
                    isInBounds(projectile.position, {
                        width: VIEWPORT.WIDTH,
                        height: VIEWPORT.HEIGHT
                    })
                )
        ));

        // Handle projectile collisions
        const remainingProjectiles = [...projectiles];
        const projectilesToRemove = new Set<string>();

        for (const projectile of remainingProjectiles) {
            for (const enemy of enemies) {
                if (checkProjectileEnemyCollision(projectile, enemy)) {
                    const damage = projectile.isCharged
                        ? PROJECTILE.CHARGED.DAMAGE
                        : PROJECTILE.NORMAL.DAMAGE;

                    if (enemy.health - damage <= 0) {
                        dispatch(damagePlayer(-ENEMY.HEALTH_RESTORE_ON_KILL));
                    }

                    dispatch(damageEnemy({
                        id: enemy.id,
                        damage: damage
                    }));

                    if (!projectile.piercing) {
                        projectilesToRemove.add(projectile.id);
                        break;
                    }
                }
            }
        }

        if (projectilesToRemove.size > 0) {
            dispatch(updateProjectiles(
                remainingProjectiles.filter(p => !projectilesToRemove.has(p.id))
            ));
        }
    }, [projectiles, enemies, gameStatus, dispatch]);

    const gameLoop = useCallback((timestamp: number) => {
        if (gameStatus !== 'playing') return;

        if (!lastFrameTimestamp.current) {
            lastFrameTimestamp.current = timestamp;
        }

        const deltaTime = timestamp - lastFrameTimestamp.current;

        updatePlayerPosition(deltaTime);
        updateEnemyPositions(deltaTime);
        updateProjectilePositions(deltaTime);
        detectCollisions();

        lastFrameTimestamp.current = timestamp;
        frameRequestId.current = requestAnimationFrame(gameLoop);
    }, [
        updatePlayerPosition,
        updateEnemyPositions,
        updateProjectilePositions,
        detectCollisions,
        gameStatus
    ]);

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

        const handleContextMenu = (e: Event) => {
            e.preventDefault();
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
        window.addEventListener('contextmenu', handleContextMenu);

        if (gameStatus === 'playing') {
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
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [gameLoop, activateDash, startProjectileCharge, releaseProjectile, gameStatus]);

    return (
        <ErrorBoundary>
            <div className="app">
                <div className="game-container">
                    <HUD />
                    <div className="game-board">
                        {gameStatus === 'menu' && <Menu onStartGame={initializeGame} />}
                        {gameStatus === 'gameOver' && <Lose onRestart={resetGameState} />}
                        {gameStatus === 'playing' && (
                            <>
                                <Player
                                    position={playerPosition}
                                    isMoving={isMoving}
                                    isDashing={isDashing}
                                    isCharging={isCharging}
                                />

                                {projectiles.map(projectile => (
                                    <div
                                        key={projectile.id}
                                        className={`projectile debug-shot ${projectile.isCharged ? 'charged' : ''}`}
                                        style={{
                                            left: `${projectile.position.x}px`,
                                            top: `${projectile.position.y}px`
                                        }}
                                    >
                                        {projectile.isCharged ? 'console.error()' : 'console.log()'}
                                    </div>
                                ))}

                                {enemies.map((enemy) => (
                                    <Enemy key={enemy.id} {...enemy} />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default Game;