import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import {
    setGameStatus,
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

const VIEWPORT = {
    WIDTH: 1200,
    HEIGHT: 800,
};

interface LevelConfig {
    requiredKills: number;      // enemies needed to complete level
    spawnInterval: number;      // milliseconds between enemy spawns
    enemyTypes: {
        basic: number;          // spawn weights for each enemy type
        fast: number;
        tank: number;
    };
    mathbucksReward: number;    // money awarded upon level completion
}

export const LEVEL_CONFIGS: { [key: number]: LevelConfig } = {
    1: {
        requiredKills: 15,
        spawnInterval: 2000,    // starting with faster initial spawns
        enemyTypes: {
            basic: 1,           // level 1: only basic enemies
            fast: 0,
            tank: 0,
        },
        mathbucksReward: 500
    },
    2: {
        requiredKills: 25,
        spawnInterval: 1500,
        enemyTypes: {
            basic: 0.7,         // level 2: introduces fast enemies
            fast: 0.3,
            tank: 0
        },
        mathbucksReward: 1000
    },
    3: {
        requiredKills: 40,
        spawnInterval: 1000,
        enemyTypes: {
            basic: 0.6,
            fast: 0.3,
            tank: 0.1
        },
        mathbucksReward: 1500
    },
    4: {
        requiredKills: 60,
        spawnInterval: 600,
        enemyTypes: {
            basic: 0.5,
            fast: 0.3,
            tank: 0.2
        },
        mathbucksReward: 2000
    },
    5: {
        requiredKills: 80,
        spawnInterval: 500,
        enemyTypes: {
            basic: 0.4,
            fast: 0.4,
            tank: 0.2
        },
        mathbucksReward: 2500
    },
    6: {
        requiredKills: 100,
        spawnInterval: 400,
        enemyTypes: {
            basic: 0.3,
            fast: 0.4,
            tank: 0.3
        },
        mathbucksReward: 3000
    },
    7: {
        requiredKills: 150,
        spawnInterval: 300,
        enemyTypes: {
            basic: 0.2,
            fast: 0.5,
            tank: 0.3
        },
        mathbucksReward: 4000
    }
};

export const useLevelManager = (cameraTransform: { x: number; y: number }) => {
    const dispatch = useAppDispatch();

    // Redux state selectors
    const currentLevel = useAppSelector(state => state.game.currentLevel);
    const killCount = useAppSelector(state => state.game.levelKillCount);
    const gameStatus = useAppSelector(state => state.game.gameStatus);
    const mathbucks = useAppSelector(state => state.game.mathbucks);
    const isPaused = useAppSelector(state => state.game.isPaused);
    const inStore = useAppSelector(state => state.game.inStore);

    // Local state for level transition management
    const [isLevelTransitioning, setIsLevelTransitioning] = useState(false);

    const getCurrentLevelConfig = useCallback(() => {
        return LEVEL_CONFIGS[currentLevel];
    }, [currentLevel]);

    const getEnemyTypeForSpawn = useCallback((): EnemyTypeKey => {
        const config = getCurrentLevelConfig();
        const weights = config.enemyTypes;
        const totalWeight = weights.basic + weights.fast + weights.tank;
        const random = Math.random() * totalWeight;
        let weightSum = 0;

        weightSum += weights.basic;
        if (random < weightSum) {
            return 'basic';
        }

        weightSum += weights.fast;
        if (random < weightSum) {
            return 'fast';
        }

        return 'tank';
    }, [getCurrentLevelConfig]);

    const handleEnemyDefeat = useCallback(() => {
        dispatch(incrementKillCount());
        const config = getCurrentLevelConfig();

        if (killCount + 1 >= config.requiredKills) {
            handleLevelComplete();
        }
    }, [killCount, currentLevel, dispatch, getCurrentLevelConfig]);

    const handleLevelComplete = useCallback(() => {
        setIsLevelTransitioning(true);

        const config = getCurrentLevelConfig();
        dispatch(updateMathbucks(mathbucks + config.mathbucksReward));

        const transitionDuration = 1000;
        const transitionDelay = 500;

        setTimeout(() => {
            setIsLevelTransitioning(false);
        }, transitionDelay + transitionDuration);

        setTimeout(() => {
            if (currentLevel < 7) {
                dispatch(advanceLevel());
                dispatch(resetKillCount());
            } else {
                dispatch(setGameStatus('victory'));
            }
        }, transitionDelay + transitionDuration);
    }, [currentLevel, dispatch, mathbucks, getCurrentLevelConfig]);

    const initializeLevel = useCallback((level: number, savedPlayerPosition?: Position) => {
        // Clear existing enemies
        dispatch(updateEnemies([]));

        // Reset kill count for the level
        dispatch(resetKillCount());

        // Set player position if provided (for saved games)
        if (savedPlayerPosition) {
            dispatch(movePlayer(savedPlayerPosition));
        }

        // Spawn initial wave of enemies for the level
        const config = LEVEL_CONFIGS[level];
        if (config) {
            for (let i = 0; i < Math.min(5, config.requiredKills); i++) {
                const enemyType = getEnemyTypeForSpawn();
                const enemyConfig = ENEMY_TYPES[enemyType].config;

                const newEnemy: Enemy = {
                    id: Math.random().toString(),
                    position: {
                        x: Math.random() * VIEWPORT.WIDTH,
                        y: Math.max(0, Math.min(540 * 12,
                            -cameraTransform.y + Math.random() * VIEWPORT.HEIGHT
                        )),
                    },
                    health: enemyConfig.baseHealth,
                    speed: enemyConfig.baseSpeed,
                    damage: enemyConfig.damage,
                    type: enemyType,
                };

                dispatch(addEnemy(newEnemy));
            }
        }
    }, [dispatch, cameraTransform.y, getEnemyTypeForSpawn]);

    useEffect(() => {
        let spawnInterval: NodeJS.Timeout;

        if (gameStatus === 'playing' && currentLevel === 1 && !isLevelTransitioning) {
            dispatch(updateEnemies([]));
        }

        if (gameStatus === 'playing' && !isLevelTransitioning && !isPaused && !inStore) {
            const config = getCurrentLevelConfig();

            spawnInterval = setInterval(() => {
                if (killCount < config.requiredKills) {
                    const enemyType = getEnemyTypeForSpawn();
                    const enemyConfig = ENEMY_TYPES[enemyType].config;

                    const newEnemy: Enemy = {
                        id: Math.random().toString(),
                        position: {
                            x: Math.random() * VIEWPORT.WIDTH,
                            y: Math.max(0, Math.min(540 * 12,
                                -cameraTransform.y + Math.random() * VIEWPORT.HEIGHT
                            )),
                        },
                        health: enemyConfig.baseHealth,
                        speed: enemyConfig.baseSpeed,
                        damage: enemyConfig.damage,
                        type: enemyType,
                    };

                    dispatch(addEnemy(newEnemy));
                }
            }, config.spawnInterval);
        }

        return () => {
            if (spawnInterval) {
                clearInterval(spawnInterval);
            }
        };
    }, [gameStatus, isLevelTransitioning, currentLevel, isPaused, inStore]);

    return {
        currentLevelConfig: getCurrentLevelConfig(),
        isLevelTransitioning,
        killCount,
        handleEnemyDefeat,
        initializeLevel
    };
};