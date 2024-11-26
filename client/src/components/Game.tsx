import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { movePlayer, damageEnemy, damagePlayer, setGameStatus, resetGame, updateEnemies } from '../store/gameSlice';
import { v4 as uuidv4 } from 'uuid';
import Player from './Player';
import Enemy from './Enemy';
import HUD from './HUD';
import Menu from './Menu';
import Lose from './Lose';
import { useEnemySpawner } from '../hooks/useEnemySpawner';
import { checkPlayerEnemyCollision } from '../utils/collision';

// game board dimensions in pixels
const VIEWPORT_WIDTH = 1200;
const VIEWPORT_HEIGHT = 800;

// player movement settings
const PLAYER_BASE_SPEED = 8;
const DASH_SPEED_MULTIPLIER = 2.5;
const DASH_DURATION_MS = 150;

// projectile configuration
const NORMAL_PROJECTILE_SPEED = 12;
const CHARGED_PROJECTILE_SPEED = 15;
const NORMAL_PROJECTILE_DAMAGE = 25;
const CHARGED_PROJECTILE_DAMAGE = 75;
const CHARGE_TIME_MS = 1000;

// enemy interaction settings
const ENEMY_COLLISION_DAMAGE = 10;
const COLLISION_IMMUNITY_DURATION_MS = 1000;
const HEALTH_RESTORE_ON_KILL = 2;
const ENEMY_MOVEMENT_SPEED = 2;

// projectile entity definition that represents a single projectile in the game
interface Projectile {
    id: string;
    position: { x: number; y: number };
    direction: { x: number; y: number };
    isCharged?: boolean;
    piercing?: boolean;
}

const Game: React.FC = () => {
    const dispatch = useDispatch();
    const { playerPosition, enemies, playerHealth: sanityLevel, gameStatus } = useSelector((state: RootState) => state.game);

    // input state tracking
    const activeKeys = useRef<{ [key: string]: boolean }>({});

    // player state
    const [isDashing, setIsDashing] = useState(false);
    const [canDash, setCanDash] = useState(true);
    const [isMoving, setIsMoving] = useState(false);
    const [isCharging, setIsCharging] = useState(false);
    const [chargeStartTimestamp, setChargeStartTimestamp] = useState(0);

    // game state tracking
    const [activeProjectiles, setActiveProjectiles] = useState<Projectile[]>([]);
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
        setActiveProjectiles([]);
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

        const currentSpeed = PLAYER_BASE_SPEED * (isDashing ? DASH_SPEED_MULTIPLIER : 1);
        horizontalMovement *= currentSpeed * (deltaTime / 16.667);
        verticalMovement *= currentSpeed * (deltaTime / 16.667);

        const newX = Math.max(0, Math.min(VIEWPORT_WIDTH - 32, playerPosition.x + horizontalMovement));
        const newY = Math.max(0, Math.min(VIEWPORT_HEIGHT - 32, playerPosition.y + verticalMovement));

        dispatch(movePlayer({ x: newX, y: newY }));
    }, [dispatch, playerPosition, isDashing, gameStatus]);

    const updateEnemyPositions = useCallback((deltaTime: number) => {
        if (!enemies.length || gameStatus !== 'playing') return;

        const updatedEnemies = enemies.map(enemy => {
            const distanceX = playerPosition.x - enemy.position.x;
            const distanceY = playerPosition.y - enemy.position.y;
            const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (totalDistance === 0) return enemy;

            const speed = ENEMY_MOVEMENT_SPEED * (deltaTime / 16.667);
            const newX = enemy.position.x + (distanceX / totalDistance) * speed;
            const newY = enemy.position.y + (distanceY / totalDistance) * speed;

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
        if (currentTime - lastDamageTimestamp.current < COLLISION_IMMUNITY_DURATION_MS) return;

        enemies.forEach(enemy => {
            if (checkPlayerEnemyCollision(playerPosition, enemy)) {
                dispatch(damagePlayer(ENEMY_COLLISION_DAMAGE));
                lastDamageTimestamp.current = currentTime;
            }
        });
    }, [enemies, playerPosition, dispatch, gameStatus]);

    const activateDash = useCallback(() => {
        if (!canDash || gameStatus !== 'playing') return;

        setIsDashing(true);
        setCanDash(false);

        setTimeout(() => {
            setIsDashing(false);
        }, DASH_DURATION_MS);

        setTimeout(() => {
            setCanDash(true);
        }, DASH_DURATION_MS * 3);
    }, [canDash, gameStatus]);

    const startProjectileCharge = useCallback((e: MouseEvent) => {
        if (gameStatus !== 'playing') return;

        if (e.button === 0) {
            setIsCharging(true);
            setChargeStartTimestamp(Date.now());
        }
    }, [gameStatus]);

    const releaseProjectile = useCallback((e: MouseEvent) => {
        if (gameStatus !== 'playing') return;

        if (e.button === 0 && isCharging) {
            const chargeTime = Date.now() - chargeStartTimestamp;
            const isFullyCharged = chargeTime >= CHARGE_TIME_MS;

            const gameBoard = document.querySelector('.game-board');
            if (!gameBoard) return;
            const boardRect = gameBoard.getBoundingClientRect();

            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const directionX = mouseX - (boardRect.left + playerPosition.x);
            const directionY = mouseY - (boardRect.top + playerPosition.y);
            const distance = Math.sqrt(directionX * directionX + directionY * directionY);

            const projectile = {
                id: uuidv4(),
                position: { ...playerPosition },
                direction: {
                    x: directionX / distance,
                    y: directionY / distance
                },
                isCharged: isFullyCharged,
                piercing: isFullyCharged
            };

            setActiveProjectiles(prev => [...prev, projectile]);
            setIsCharging(false);
        }
    }, [isCharging, chargeStartTimestamp, playerPosition, gameStatus]);

    const gameLoop = useCallback((timestamp: number) => {
        if (gameStatus !== 'playing') return;

        if (!lastFrameTimestamp.current) {
            lastFrameTimestamp.current = timestamp;
        }

        const deltaTime = timestamp - lastFrameTimestamp.current;
        updatePlayerPosition(deltaTime);
        updateEnemyPositions(deltaTime);
        detectCollisions();

        setActiveProjectiles(prev => {
            const updated = prev.map(projectile => ({
                ...projectile,
                position: {
                    x: projectile.position.x + projectile.direction.x * (projectile.isCharged ? CHARGED_PROJECTILE_SPEED : NORMAL_PROJECTILE_SPEED) * (deltaTime / 16.667),
                    y: projectile.position.y + projectile.direction.y * (projectile.isCharged ? CHARGED_PROJECTILE_SPEED : NORMAL_PROJECTILE_SPEED) * (deltaTime / 16.667)
                }
            }));

            return updated.filter(projectile => (
                projectile.position.x >= 0 &&
                projectile.position.x <= VIEWPORT_WIDTH &&
                projectile.position.y >= 0 &&
                projectile.position.y <= VIEWPORT_HEIGHT
            ));
        });

        setActiveProjectiles(prev => {
            const remaining = [...prev];
            const toRemove = new Set<string>();

            remaining.forEach(projectile => {
                enemies.forEach(enemy => {
                    const distanceX = enemy.position.x - projectile.position.x;
                    const distanceY = enemy.position.y - projectile.position.y;
                    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                    if (distance < 20) {
                        if (enemy.health - (projectile.isCharged ? CHARGED_PROJECTILE_DAMAGE : NORMAL_PROJECTILE_DAMAGE) <= 0) {
                            dispatch(damagePlayer(-HEALTH_RESTORE_ON_KILL));
                        }
                        dispatch(damageEnemy({
                            id: enemy.id,
                            damage: projectile.isCharged ? CHARGED_PROJECTILE_DAMAGE : NORMAL_PROJECTILE_DAMAGE
                        }));
                        if (!projectile.piercing) {
                            toRemove.add(projectile.id);
                        }
                    }
                });
            });

            return remaining.filter(projectile => !toRemove.has(projectile.id));
        });

        lastFrameTimestamp.current = timestamp;
        if (gameStatus === 'playing') {
            frameRequestId.current = requestAnimationFrame(gameLoop);
        }
    }, [updatePlayerPosition, updateEnemyPositions, enemies, dispatch, detectCollisions, gameStatus]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            activeKeys.current[e.key] = true;
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            delete activeKeys.current[e.key];

            const movementKeys = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            const isAnyMovementKeyPressed = movementKeys.some(key => activeKeys.current[key]);

            if (!isAnyMovementKeyPressed) {
                setIsMoving(false);
            }
        };

        const handleBlur = () => {
            activeKeys.current = {};
            setIsMoving(false);
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 2) {
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
        <div className="app">
            <div className="game-container">
                <HUD />
                <div className="game-board">
                    {gameStatus === 'menu' && <Menu onStartGame={initializeGame} />}
                    {gameStatus === 'gameOver' && <Lose onRestart={resetGameState} />}
                    {gameStatus === 'playing' && (
                        <>
                            <div
                                className={`player ${isMoving ? 'moving' : ''} ${isDashing ? 'dashing' : ''} ${isCharging ? 'charging' : ''}`}
                                style={{
                                    left: `${playerPosition.x}px`,
                                    top: `${playerPosition.y}px`,
                                    transition: isDashing ? 'none' : 'none',
                                    filter: isDashing ? 'brightness(1.5) drop-shadow(0 0 15px #00ff00)' : 'none'
                                }}
                            />

                            {activeProjectiles.map(projectile => (
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
    );
};

export default Game;