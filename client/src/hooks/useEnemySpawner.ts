import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { addEnemy } from '../store/gameSlice';
import { Position } from '../types/game.types';

const SPAWN_INTERVAL = 2000; // Spawn enemy every 2 seconds
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

export const useEnemySpawner = () => {
    const dispatch = useDispatch();

    const getRandomSpawnPosition = (): Position => {
        const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

        switch (edge) {
            case 0: // top
                return { x: Math.random() * GAME_WIDTH, y: -30 };
            case 1: // right
                return { x: GAME_WIDTH + 30, y: Math.random() * GAME_HEIGHT };
            case 2: // bottom
                return { x: Math.random() * GAME_WIDTH, y: GAME_HEIGHT + 30 };
            default: // left
                return { x: -30, y: Math.random() * GAME_HEIGHT };
        }
    };

    const spawnEnemy = useCallback(() => {
        const spawnPosition = getRandomSpawnPosition();

        const enemy = {
            id: uuidv4(),
            position: spawnPosition,
            health: 100,
            type: 'basic',
            speed: 2
        };

        dispatch(addEnemy(enemy));
    }, [dispatch]);

    useEffect(() => {
        const spawnInterval = setInterval(spawnEnemy, SPAWN_INTERVAL);
        return () => clearInterval(spawnInterval);
    }, [spawnEnemy]);
};
