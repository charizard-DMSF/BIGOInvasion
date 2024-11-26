import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { movePlayer, damageEnemy, damagePlayer, setGameStatus, resetGame } from '../store/gameSlice';
import { v4 as uuidv4 } from 'uuid';
import Player from './Player';
import Enemy from './Enemy';
import HUD from './HUD';
import Menu from './Menu';
import Lose from './Lose';
import { useEnemySpawner } from '../hooks/useEnemySpawner';
import { useGameLoop } from '../hooks/useGameLoop';
import { checkPlayerEnemyCollision } from '../utils/collision';

const GAME_WIDTH = 1200;
const GAME_HEIGHT = 800;
const BASE_SPEED = 8;
const DASH_MULTIPLIER = 2.5;
const DASH_DURATION = 150;
const PROJECTILE_SPEED = 12;
const CHARGED_PROJECTILE_SPEED = 15;
const DEBUG_DAMAGE = 25;
const CHARGED_DAMAGE = 75;
const MAX_CHARGE_TIME = 1000;
const ENEMY_COLLISION_DAMAGE = 10;
const ENEMY_COLLISION_COOLDOWN = 1000;
const SANITY_GAIN_ON_KILL = 2;

interface Projectile {
    id: string;
    position: { x: number; y: number };
    direction: { x: number; y: number };
    isCharged?: boolean;
    piercing?: boolean;
}

const Game: React.FC = () => {
    const dispatch = useDispatch();
    const { playerPosition, enemies, playerHealth: playerSanity, gameStatus } = useSelector((state: RootState) => state.game);
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const [isDashing, setIsDashing] = useState(false);
    const [canDash, setCanDash] = useState(true);
    const [isMoving, setIsMoving] = useState(false);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [isCharging, setIsCharging] = useState(false);
    const [chargeStartTime, setChargeStartTime] = useState(0);
    const animationFrameId = useRef<number>();
    const lastUpdateTime = useRef<number>(0);
    const lastDamageTime = useRef<number>(0);

    useEnemySpawner();
    useGameLoop();

    const startGame = useCallback(() => {
        dispatch(resetGame());
        dispatch(setGameStatus('playing'));
    }, [dispatch]);

    const restartGame = useCallback(() => {
        dispatch(resetGame());
        dispatch(setGameStatus('playing'));
        setProjectiles([]);
        setIsDashing(false);
        setCanDash(true);
        setIsMoving(false);
        setIsCharging(false);
        lastDamageTime.current = 0;
        lastUpdateTime.current = 0;
    }, [dispatch]);

    const moveCharacter = useCallback((deltaTime: number) => {
        if (gameStatus !== 'playing') return;

        let dx = 0;
        let dy = 0;

        const keys = keysPressed.current;
        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;

        const isCurrentlyMoving = dx !== 0 || dy !== 0;
        setIsMoving(isCurrentlyMoving);

        if (!isCurrentlyMoving) return;

        if (dx !== 0 && dy !== 0) {
            dx /= Math.sqrt(2);
            dy /= Math.sqrt(2);
        }

        const currentSpeed = BASE_SPEED * (isDashing ? DASH_MULTIPLIER : 1);
        dx *= currentSpeed * (deltaTime / 16.667);
        dy *= currentSpeed * (deltaTime / 16.667);

        const newX = Math.max(0, Math.min(GAME_WIDTH - 32, playerPosition.x + dx));
        const newY = Math.max(0, Math.min(GAME_HEIGHT - 32, playerPosition.y + dy));

        dispatch(movePlayer({ x: newX, y: newY }));
    }, [dispatch, playerPosition, isDashing, gameStatus]);

    const checkEnemyCollisions = useCallback(() => {
        if (gameStatus !== 'playing') return;

        const currentTime = Date.now();
        if (currentTime - lastDamageTime.current < ENEMY_COLLISION_COOLDOWN) return;

        enemies.forEach(enemy => {
            if (checkPlayerEnemyCollision(playerPosition, enemy)) {
                dispatch(damagePlayer(ENEMY_COLLISION_DAMAGE));
                lastDamageTime.current = currentTime;
            }
        });
    }, [enemies, playerPosition, dispatch, gameStatus]);

    const handleDash = useCallback(() => {
        if (!canDash || gameStatus !== 'playing') return;

        setIsDashing(true);
        setCanDash(false);

        setTimeout(() => {
            setIsDashing(false);
        }, DASH_DURATION);

        setTimeout(() => {
            setCanDash(true);
        }, DASH_DURATION * 3);
    }, [canDash, gameStatus]);

    const startCharge = useCallback((e: MouseEvent) => {
        if (gameStatus !== 'playing') return;

        if (e.button === 0) {
            setIsCharging(true);
            setChargeStartTime(Date.now());
        }
    }, [gameStatus]);

    const releaseCharge = useCallback((e: MouseEvent) => {
        if (gameStatus !== 'playing') return;

        if (e.button === 0 && isCharging) {
            const chargeTime = Date.now() - chargeStartTime;
            const isFullyCharged = chargeTime >= MAX_CHARGE_TIME;

            const board = document.querySelector('.game-board');
            if (!board) return;
            const rect = board.getBoundingClientRect();

            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const dx = mouseX - (rect.left + playerPosition.x);
            const dy = mouseY - (rect.top + playerPosition.y);
            const distance = Math.sqrt(dx * dx + dy * dy);

            const projectile = {
                id: uuidv4(),
                position: { ...playerPosition },
                direction: {
                    x: dx / distance,
                    y: dy / distance
                },
                isCharged: isFullyCharged,
                piercing: isFullyCharged
            };

            setProjectiles(prev => [...prev, projectile]);
            setIsCharging(false);
        }
    }, [isCharging, chargeStartTime, playerPosition, gameStatus]);

    const gameLoop = useCallback((timestamp: number) => {
        if (gameStatus !== 'playing') return;

        if (!lastUpdateTime.current) {
            lastUpdateTime.current = timestamp;
        }

        const deltaTime = timestamp - lastUpdateTime.current;
        moveCharacter(deltaTime);
        checkEnemyCollisions();

        setProjectiles(prev => {
            const updated = prev.map(projectile => ({
                ...projectile,
                position: {
                    x: projectile.position.x + projectile.direction.x * (projectile.isCharged ? CHARGED_PROJECTILE_SPEED : PROJECTILE_SPEED) * (deltaTime / 16.667),
                    y: projectile.position.y + projectile.direction.y * (projectile.isCharged ? CHARGED_PROJECTILE_SPEED : PROJECTILE_SPEED) * (deltaTime / 16.667)
                }
            }));

            return updated.filter(projectile => (
                projectile.position.x >= 0 &&
                projectile.position.x <= GAME_WIDTH &&
                projectile.position.y >= 0 &&
                projectile.position.y <= GAME_HEIGHT
            ));
        });

        setProjectiles(prev => {
            const remaining = [...prev];
            const toRemove = new Set<string>();

            remaining.forEach(projectile => {
                enemies.forEach(enemy => {
                    const dx = enemy.position.x - projectile.position.x;
                    const dy = enemy.position.y - projectile.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 20) {
                        if (enemy.health - (projectile.isCharged ? CHARGED_DAMAGE : DEBUG_DAMAGE) <= 0) {
                            dispatch(damagePlayer(-SANITY_GAIN_ON_KILL)); // Heal on kill
                        }
                        dispatch(damageEnemy({
                            id: enemy.id,
                            damage: projectile.isCharged ? CHARGED_DAMAGE : DEBUG_DAMAGE
                        }));
                        if (!projectile.piercing) {
                            toRemove.add(projectile.id);
                        }
                    }
                });
            });

            return remaining.filter(projectile => !toRemove.has(projectile.id));
        });

        lastUpdateTime.current = timestamp;
        if (gameStatus === 'playing') {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
    }, [moveCharacter, enemies, dispatch, checkEnemyCollisions, gameStatus]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            keysPressed.current[e.key] = true;
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            delete keysPressed.current[e.key];

            const movementKeys = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            const isAnyMovementKeyPressed = movementKeys.some(key => keysPressed.current[key]);

            if (!isAnyMovementKeyPressed) {
                setIsMoving(false);
            }
        };

        const handleBlur = () => {
            keysPressed.current = {};
            setIsMoving(false);
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 2) { // Right click
                handleDash();
            } else if (e.button === 0) { // Left click
                startCharge(e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', releaseCharge);
        window.addEventListener('contextmenu', handleContextMenu);

        if (gameStatus === 'playing') {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', releaseCharge);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [gameLoop, handleDash, startCharge, releaseCharge, gameStatus]);

    return (
        <div className="app">
            <div className="game-container">
                <HUD />
                <div className="game-board">
                    {gameStatus === 'menu' && <Menu onStartGame={startGame} />}
                    {gameStatus === 'gameOver' && <Lose onRestart={restartGame} />}
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
    );
};

export default Game;