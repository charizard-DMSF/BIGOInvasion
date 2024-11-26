import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { movePlayer, damageEnemy } from '../store/gameSlice';
import { v4 as uuidv4 } from 'uuid';
import Player from './Player';
import Enemy from './Enemy';
import HUD from './HUD';
import { useEnemySpawner } from '../hooks/useEnemySpawner';
import { useGameLoop } from '../hooks/useGameLoop';

const GAME_WIDTH = 1200;
const GAME_HEIGHT = 800;
const BASE_SPEED = 8;
const DASH_MULTIPLIER = 2.5;
const DASH_DURATION = 150;
const PROJECTILE_SPEED = 12;
const DEBUG_DAMAGE = 25;

interface Projectile {
    id: string;
    position: { x: number; y: number };
    direction: { x: number; y: number };
}

const Game: React.FC = () => {
    const dispatch = useDispatch();
    const { playerPosition, enemies } = useSelector((state: RootState) => state.game);
    const [keysPressed] = useState<Set<string>>(new Set());
    const [isDashing, setIsDashing] = useState(false);
    const [canDash, setCanDash] = useState(true);
    const [isMoving, setIsMoving] = useState(false);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);

    useEnemySpawner();
    useGameLoop();

    const moveCharacter = useCallback((keys: Set<string>) => {
        let dx = 0;
        let dy = 0;

        if (keys.has('w') || keys.has('ArrowUp')) dy -= 1;
        if (keys.has('s') || keys.has('ArrowDown')) dy += 1;
        if (keys.has('a') || keys.has('ArrowLeft')) dx -= 1;
        if (keys.has('d') || keys.has('ArrowRight')) dx += 1;

        setIsMoving(dx !== 0 || dy !== 0);

        if (dx !== 0 && dy !== 0) {
            dx /= Math.sqrt(2);
            dy /= Math.sqrt(2);
        }

        const currentSpeed = BASE_SPEED * (isDashing ? DASH_MULTIPLIER : 1);
        dx *= currentSpeed;
        dy *= currentSpeed;

        const newX = Math.max(0, Math.min(GAME_WIDTH - 32, playerPosition.x + dx));
        const newY = Math.max(0, Math.min(GAME_HEIGHT - 32, playerPosition.y + dy));

        dispatch(movePlayer({ x: newX, y: newY }));
    }, [dispatch, playerPosition, isDashing]);

    const handleDash = useCallback(() => {
        if (!canDash) return;

        setIsDashing(true);
        setCanDash(false);

        setTimeout(() => {
            setIsDashing(false);
        }, DASH_DURATION);

        setTimeout(() => {
            setCanDash(true);
        }, DASH_DURATION * 3);
    }, [canDash]);

    const shoot = useCallback((e: MouseEvent) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const board = document.querySelector('.game-board');
        if (!board) return;
        const rect = board.getBoundingClientRect();

        const dx = mouseX - (rect.left + playerPosition.x);
        const dy = mouseY - (rect.top + playerPosition.y);
        const distance = Math.sqrt(dx * dx + dy * dy);

        const projectile = {
            id: uuidv4(),
            position: { ...playerPosition },
            direction: {
                x: dx / distance,
                y: dy / distance
            }
        };

        setProjectiles(prev => [...prev, projectile]);
    }, [playerPosition]);

    useEffect(() => {
        const keys = new Set<string>();

        const handleKeyDown = (e: KeyboardEvent) => {
            keys.add(e.key);
            if (e.key === 'Shift') {
                handleDash();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keys.delete(e.key);
            if (keys.size === 0) {
                setIsMoving(false);
            }
        };

        const gameLoop = setInterval(() => {
            if (keys.size > 0) {
                moveCharacter(keys);
            }
        }, 1000 / 60);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('click', shoot);

        return () => {
            clearInterval(gameLoop);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('click', shoot);
        };
    }, [moveCharacter, handleDash, shoot]);

    // Separate projectile movement effect
    useEffect(() => {
        const projectileLoop = setInterval(() => {
            setProjectiles(prev => {
                const updated = prev.map(projectile => ({
                    ...projectile,
                    position: {
                        x: projectile.position.x + projectile.direction.x * PROJECTILE_SPEED,
                        y: projectile.position.y + projectile.direction.y * PROJECTILE_SPEED
                    }
                }));

                return updated.filter(projectile => (
                    projectile.position.x >= 0 &&
                    projectile.position.x <= GAME_WIDTH &&
                    projectile.position.y >= 0 &&
                    projectile.position.y <= GAME_HEIGHT
                ));
            });
        }, 1000 / 60);

        return () => clearInterval(projectileLoop);
    }, []);

    // Separate collision detection effect
    useEffect(() => {
        const collisionLoop = setInterval(() => {
            setProjectiles(prev => {
                const remaining = [...prev];
                const toRemove = new Set<string>();

                remaining.forEach(projectile => {
                    enemies.forEach(enemy => {
                        const dx = enemy.position.x - projectile.position.x;
                        const dy = enemy.position.y - projectile.position.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 20) {
                            dispatch(damageEnemy({ id: enemy.id, damage: DEBUG_DAMAGE }));
                            toRemove.add(projectile.id);
                        }
                    });
                });

                return remaining.filter(projectile => !toRemove.has(projectile.id));
            });
        }, 1000 / 60);

        return () => clearInterval(collisionLoop);
    }, [enemies, dispatch]);

    return (
        <div className="app">
            <div className="game-container">
                <HUD />
                <div className="game-board">
                    <div
                        className={`player ${isMoving ? 'moving' : ''} ${isDashing ? 'dashing' : ''}`}
                        style={{
                            left: `${playerPosition.x}px`,
                            top: `${playerPosition.y}px`,
                            transition: isDashing ? 'none' : 'all 0.05s linear',
                            filter: isDashing ? 'brightness(1.5) drop-shadow(0 0 15px #00ff00)' : 'none'
                        }}
                    />

                    {projectiles.map(projectile => (
                        <div
                            key={projectile.id}
                            className="projectile debug-shot"
                            style={{
                                left: `${projectile.position.x}px`,
                                top: `${projectile.position.y}px`
                            }}
                        >
                            console.log()
                        </div>
                    ))}

                    {enemies.map((enemy) => (
                        <Enemy key={enemy.id} {...enemy} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Game;