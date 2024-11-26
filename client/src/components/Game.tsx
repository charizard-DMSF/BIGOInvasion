import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { movePlayer, addEnemy, removeEnemy } from '../store/gameSlice';
import { checkPlayerEnemyCollision } from '../utils/collision';
import Player from './Player';
import Enemy from './Enemy';
import HUD from './HUD';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const MOVEMENT_SPEED = 4;

const Game: React.FC = () => {
    const dispatch = useDispatch();
    const { playerPosition, enemies, gameStatus } = useSelector((state: RootState) => state.game);
    const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

    // Key handlers...
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
            e.preventDefault();
            setKeysPressed(prev => new Set(prev).add(e.key));
        }
    }, []);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
            setKeysPressed(prev => {
                const updated = new Set(prev);
                updated.delete(e.key);
                return updated;
            });
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    // Movement loop
    useEffect(() => {
        const moveInterval = setInterval(() => {
            let dx = 0;
            let dy = 0;

            if (keysPressed.has('ArrowUp') || keysPressed.has('w')) dy -= MOVEMENT_SPEED;
            if (keysPressed.has('ArrowDown') || keysPressed.has('s')) dy += MOVEMENT_SPEED;
            if (keysPressed.has('ArrowLeft') || keysPressed.has('a')) dx -= MOVEMENT_SPEED;
            if (keysPressed.has('ArrowRight') || keysPressed.has('d')) dx += MOVEMENT_SPEED;

            if (dx !== 0 && dy !== 0) {
                dx /= Math.sqrt(2);
                dy /= Math.sqrt(2);
            }

            if (dx !== 0 || dy !== 0) {
                const newX = Math.max(0, Math.min(GAME_WIDTH, playerPosition.x + dx));
                const newY = Math.max(0, Math.min(GAME_HEIGHT, playerPosition.y + dy));
                dispatch(movePlayer({ x: newX, y: newY }));
            }
        }, 16);

        return () => clearInterval(moveInterval);
    }, [keysPressed, playerPosition, dispatch]);

    return (
        <div className="game-container">
            <HUD />
            <div
                className="game-board"
                style={{
                    width: `${GAME_WIDTH}px`,
                    height: `${GAME_HEIGHT}px`
                }}
            >
                <Player position={playerPosition} />
                {enemies.map((enemy) => (
                    <Enemy key={enemy.id} {...enemy} />
                ))}
            </div>
        </div>
    );
};

export default Game;