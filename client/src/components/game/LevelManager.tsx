import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import {
    addEnemy,
    advanceLevel,
    incrementKillCount,
    updateMathbucks,
    resetKillCount,
    updateEnemies,
    movePlayer,
    Position
} from '../../storeRedux/gameSlice';
import { Enemy } from '../../storeRedux/gameSlice';
import { EnemyTypeKey } from './Enemy';
import { ENEMY_TYPES } from './Enemy';

// ---------------
// constants
// ---------------
const VIEWPORT = {
    WIDTH: 1200,
    HEIGHT: 800,
};

// ---------------
// types
// ---------------
interface LevelConfig {
    requiredKills: number;
    spawnInterval: number;
    enemyTypes: {
        basic: number;
        fast: number;
        tank: number;
    };
    mathbucksReward: number;
}

// ---------------
// level configurations
// contains settings for levels 1-7
// ---------------
export const LEVEL_CONFIGS: { [key: number]: LevelConfig } = {
    1: {
        requiredKills: 15,
        spawnInterval: 1800,
        enemyTypes: { basic: 1, fast: 0, tank: 0 },
        mathbucksReward: 500
    },
    2: {
        requiredKills: 25,
        spawnInterval: 1500,
        enemyTypes: { basic: 0.7, fast: 0.3, tank: 0 },
        mathbucksReward: 1000
    },
    3: {
        requiredKills: 40,
        spawnInterval: 1000,
        enemyTypes: { basic: 0.6, fast: 0.3, tank: 0.1 },
        mathbucksReward: 1500
    },
    4: {
        requiredKills: 60,
        spawnInterval: 600,
        enemyTypes: { basic: 0.5, fast: 0.3, tank: 0.2 },
        mathbucksReward: 2000
    },
    5: {
        requiredKills: 80,
        spawnInterval: 500,
        enemyTypes: { basic: 0.4, fast: 0.4, tank: 0.2 },
        mathbucksReward: 2500
    },
    6: {
        requiredKills: 100,
        spawnInterval: 400,
        enemyTypes: { basic: 0.3, fast: 0.4, tank: 0.3 },
        mathbucksReward: 3000
    },
    7: {
        requiredKills: 150,
        spawnInterval: 300,
        enemyTypes: { basic: 0.2, fast: 0.5, tank: 0.3 },
        mathbucksReward: 4000
    }
};

// ---------------
// endless mode generator
// creates scaled configurations for levels beyond 7
// ---------------
const generateEndlessLevelConfig = (level: number): LevelConfig => {
    const baseLevel = 7;
    const scalingFactor = (level - baseLevel) * 0.15; // 15% increase per level

    return {
        requiredKills: Math.floor(150 * (1 + scalingFactor)),
        spawnInterval: Math.max(100, Math.floor(300 * (1 - scalingFactor * 0.5))),
        enemyTypes: {
            basic: Math.max(0.1, 0.2 - scalingFactor * 0.1),   // decrease basic enemies
            fast: 0.5 + scalingFactor * 0.1,                   // increase fast enemies
            tank: 0.3 + scalingFactor * 0.1,                   // increase tank enemies
        },
        mathbucksReward: Math.floor(4000 * (1 + scalingFactor))
    };
};

// ---------------
// main level manager hook
// manages level progression, enemy spawning, and rewards
// ---------------
export const useLevelManager = (cameraTransform: { x: number; y: number }) => {
    const dispatch = useAppDispatch();

    // redux state selectors
    const currentLevel = useAppSelector(state => state.game.currentLevel);
    const killCount = useAppSelector(state => state.game.levelKillCount);
    const gameStatus = useAppSelector(state => state.game.gameStatus);
    const mathbucks = useAppSelector(state => state.game.mathbucks);
    const isPaused = useAppSelector(state => state.game.isPaused);
    const inStore = useAppSelector(state => state.game.inStore);

    // local state
    const [isLevelTransitioning, setIsLevelTransitioning] = useState(false);

    // ---------------
    // level configuration handlers
    // ---------------
    const getCurrentLevelConfig = useCallback(() => {
        return currentLevel <= 7 ? LEVEL_CONFIGS[currentLevel] : generateEndlessLevelConfig(currentLevel);
    }, [currentLevel]);

    // ---------------
    // enemy spawn handlers
    // ---------------
    const getEnemyTypeForSpawn = useCallback((): EnemyTypeKey => {
        const config = getCurrentLevelConfig();
        const weights = config.enemyTypes;
        const totalWeight = weights.basic + weights.fast + weights.tank;
        const random = Math.random() * totalWeight;
        let weightSum = 0;

        // weighted random selection based on level configuration
        weightSum += weights.basic;
        if (random < weightSum) return 'basic';

        weightSum += weights.fast;
        if (random < weightSum) return 'fast';

        return 'tank';
    }, [getCurrentLevelConfig]);

    // ---------------
    // enemy creation utility
    // handles enemy scaling for endless mode
    // ---------------
    const createEnemy = useCallback((enemyType: EnemyTypeKey, levelScaling: number): Enemy => {
        const enemyConfig = ENEMY_TYPES[enemyType].config;

        return {
            id: Math.random().toString(),
            position: {
                x: Math.random() * VIEWPORT.WIDTH,
                y: Math.max(0, Math.min(540 * 12,
                    -cameraTransform.y + Math.random() * VIEWPORT.HEIGHT
                )),
            },
            health: Math.floor(enemyConfig.baseHealth * levelScaling),
            speed: enemyConfig.baseSpeed * Math.min(2, levelScaling), // cap speed scaling at 2x
            damage: Math.floor(enemyConfig.damage * levelScaling),
            type: enemyType,
        };
    }, [cameraTransform.y]);

    // ---------------
    // level progression handlers
    // ---------------
    const handleEnemyDefeat = useCallback(() => {
        dispatch(incrementKillCount());
        const config = getCurrentLevelConfig();

        if (killCount + 1 >= config.requiredKills) {
            handleLevelComplete();
        }
    }, [killCount, getCurrentLevelConfig, dispatch]);

    const handleLevelComplete = useCallback(() => {
        setIsLevelTransitioning(true);
        const config = getCurrentLevelConfig();

        // award mathbucks for level completion
        dispatch(updateMathbucks(mathbucks + config.mathbucksReward));

        // handle level transition timing
        const transitionDuration = 1000;
        const transitionDelay = 500;

        setTimeout(() => {
            setIsLevelTransitioning(false);
        }, transitionDelay + transitionDuration);

        setTimeout(() => {
            dispatch(advanceLevel());
            dispatch(resetKillCount());
        }, transitionDelay + transitionDuration);
    }, [getCurrentLevelConfig, dispatch, mathbucks]);

    // ---------------
    // level initialization
    // sets up initial state for a new level
    // ---------------
    const initializeLevel = useCallback((level: number, savedPlayerPosition?: Position) => {
        dispatch(updateEnemies([]));
        dispatch(resetKillCount());

        if (savedPlayerPosition) {
            dispatch(movePlayer(savedPlayerPosition));
        }

        const config = level <= 7 ? LEVEL_CONFIGS[level] : generateEndlessLevelConfig(level);
        const levelScaling = level > 7 ? 1 + ((level - 7) * 0.1) : 1;

        // initial enemy population
        if (config) {
            for (let i = 0; i < 5; i++) {
                const enemyType = getEnemyTypeForSpawn();
                const enemy = createEnemy(enemyType, levelScaling);
                dispatch(addEnemy(enemy));
            }
        }
    }, [dispatch, getEnemyTypeForSpawn, createEnemy]);

    // ---------------
    // continuous enemy spawning
    // manages the spawn interval for each level
    // ---------------
    useEffect(() => {
        let spawnInterval: NodeJS.Timeout;

        // clear enemies on first level start
        if (gameStatus === 'playing' && currentLevel === 1 && !isLevelTransitioning) {
            dispatch(updateEnemies([]));
        }

        // setup spawn interval when game is active
        if (gameStatus === 'playing' && !isLevelTransitioning && !isPaused && !inStore) {
            const config = getCurrentLevelConfig();
            const levelScaling = currentLevel > 7 ? 1 + ((currentLevel - 7) * 0.1) : 1;

            spawnInterval = setInterval(() => {
                if (killCount < config.requiredKills) {
                    const enemyType = getEnemyTypeForSpawn();
                    const enemy = createEnemy(enemyType, levelScaling);
                    dispatch(addEnemy(enemy));
                }
            }, config.spawnInterval);
        }

        return () => {
            if (spawnInterval) {
                clearInterval(spawnInterval);
            }
        };
    }, [
        gameStatus,
        isLevelTransitioning,
        currentLevel,
        isPaused,
        inStore,
        killCount,
        getCurrentLevelConfig,
        getEnemyTypeForSpawn,
        createEnemy,
        dispatch
    ]);

    return {
        currentLevelConfig: getCurrentLevelConfig(),
        isLevelTransitioning,
        killCount,
        handleEnemyDefeat,
        initializeLevel
    };
};