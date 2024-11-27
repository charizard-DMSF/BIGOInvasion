// useEnemySpawner.ts
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { addEnemy, updateWave } from '../store/gameSlice';
import { Position, Enemy, EnemyType } from '../types/game.types';
import { PLAYER, ENEMY, VIEWPORT } from '../config/constants';
import type { RootState } from '../store';

export const useEnemySpawner = () => {
    const dispatch = useDispatch();
    const spawnTimerRef = useRef<NodeJS.Timeout>();
    const { gameStatus, wave } = useSelector((state: RootState) => state.game);

    const getRandomSpawnPosition = (): Position => {
        const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        const margin = ENEMY.SIZE * 2;

        switch (edge) {
            case 0: // top
                return { x: Math.random() * VIEWPORT.WIDTH, y: -margin };
            case 1: // right
                return { x: VIEWPORT.WIDTH + margin, y: Math.random() * VIEWPORT.HEIGHT };
            case 2: // bottom
                return { x: Math.random() * VIEWPORT.WIDTH, y: VIEWPORT.HEIGHT + margin };
            default: // left
                return { x: -margin, y: Math.random() * VIEWPORT.HEIGHT };
        }
    };

    const getEnemyType = (waveNumber: number): EnemyType => {
        const roll = Math.random();
        if (waveNumber >= 5 && roll > 0.8) return EnemyType.Tank;
        if (waveNumber >= 3 && roll > 0.6) return EnemyType.Fast;
        return EnemyType.Basic;
    };

    const getEnemyStats = (type: EnemyType): Pick<Enemy, 'health' | 'speed'> => {
        switch (type) {
            case EnemyType.Fast:
                return { health: ENEMY.BASE_HEALTH * 0.7, speed: ENEMY.BASE_SPEED * 1.5 };
            case EnemyType.Tank:
                return { health: ENEMY.BASE_HEALTH * 2, speed: ENEMY.BASE_SPEED * 0.7 };
            default:
                return { health: ENEMY.BASE_HEALTH, speed: ENEMY.BASE_SPEED };
        }
    };

    const spawnEnemy = useCallback(() => {
        if (wave.enemiesSpawned >= wave.enemyCount) {
            dispatch(updateWave());
            return;
        }

        const type = getEnemyType(wave.number);
        const stats = getEnemyStats(type);

        const enemy: Enemy = {
            id: uuidv4(),
            position: getRandomSpawnPosition(),
            type,
            ...stats,
        };

        dispatch(addEnemy(enemy));
    }, [dispatch, wave]);

    useEffect(() => {
        if (gameStatus === 'playing') {
            spawnTimerRef.current = setInterval(spawnEnemy, ENEMY.SPAWN_INTERVAL);
        }

        return () => {
            if (spawnTimerRef.current) {
                clearInterval(spawnTimerRef.current);
            }
        };
    }, [spawnEnemy, gameStatus]);
};