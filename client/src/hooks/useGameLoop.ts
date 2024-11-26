import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { updateEnemies } from '../store/gameSlice';
import { moveTowards } from '../utils/collision';

const ENEMY_SPEED = 2;
const GAME_LOOP_INTERVAL = 1000 / 60; // 60 FPS

export const useGameLoop = () => {
    const dispatch = useDispatch();
    const { playerPosition, enemies } = useSelector((state: RootState) => state.game);

    const updateGame = useCallback(() => {
        // Move enemies towards player
        const updatedEnemies = enemies.map(enemy => ({
            ...enemy,
            position: moveTowards(enemy.position, playerPosition, enemy.speed || ENEMY_SPEED)
        }));

        dispatch(updateEnemies(updatedEnemies));
    }, [dispatch, enemies, playerPosition]);

    useEffect(() => {
        const gameLoop = setInterval(updateGame, GAME_LOOP_INTERVAL);
        return () => clearInterval(gameLoop);
    }, [updateGame]);
};

