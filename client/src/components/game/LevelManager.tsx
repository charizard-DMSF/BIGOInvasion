// src/components/game/LevelManager.ts

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import {
    setGameStatus,
    addEnemy,
    advanceLevel,
    incrementKillCount,
    updateMathbucks,
    resetKillCount,
    updateEnemies
} from '../../storeRedux/gameSlice';
import { Enemy } from '../../storeRedux/gameSlice';
import { EnemyTypeKey } from './Enemy';
import { ENEMY_TYPES } from './Enemy';

const VIEWPORT = {
    WIDTH: 1200,
    HEIGHT: 800,
};

// defines what each level needs and contains
interface LevelConfig {
    requiredKills: number;      // enemies needed to complete level
    spawnInterval: number;      // milliseconds between enemy spawns
    enemyTypes: {
        basic: number;          // wpawn weights for each enemy type
        fast: number;         
        tank: number;
    };
    mathbucksReward: number;    // money awarded upon level completion
}

/*
 each level:
 - requires more kills to complete
 - spawns enemies faster (lower interval)
 - introduces new enemy types gradually
 - offers increased rewards
*/
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

/**
 * custom hook for managing game level progression and enemy spawning
 * @param cameraTransform Current camera position for viewport calculations
 * @returns Object containing level state and management functions
 */
export const useLevelManager = (cameraTransform: { x: number; y: number }) => {
    const dispatch = useAppDispatch();

    // redux state selectors
    const currentLevel = useAppSelector(state => state.game.currentLevel);
    const killCount = useAppSelector(state => state.game.levelKillCount);
    const gameStatus = useAppSelector(state => state.game.gameStatus);
    const mathbucks = useAppSelector(state => state.game.mathbucks);
    const isPaused = useAppSelector(state => state.game.isPaused);
    const inStore = useAppSelector(state => state.game.inStore);

    // local state for level transition management
    const [isLevelTransitioning, setIsLevelTransitioning] = useState(false);

    /**
     * retrieves configuration for current level
     */
    const getCurrentLevelConfig = useCallback(() => {
        return LEVEL_CONFIGS[currentLevel];
    }, [currentLevel]);

    /**
     * determines which enemy type to spawn based on level weights
     * uses weighted random selection algorithm
     */
    const getEnemyTypeForSpawn = useCallback((): EnemyTypeKey => {
        const config = getCurrentLevelConfig();
        const weights = config.enemyTypes;

        // calculate total weight for normalization
        const totalWeight = weights.basic + weights.fast + weights.tank;

        // generate random number between 0 and total weight
        const random = Math.random() * totalWeight;

        // select enemy type based on cumulative weight ranges
        let weightSum = 0;

        // check basic enemy range
        weightSum += weights.basic;
        if (random < weightSum) {
            return 'basic';
        }

        // check fast enemy range
        weightSum += weights.fast;
        if (random < weightSum) {
            return 'fast';
        }

        // if we get here, must be tank
        return 'tank';
    }, [getCurrentLevelConfig]);

    /*
      handles enemy defeat event and checks for level completion
     */
    const handleEnemyDefeat = useCallback(() => {
        dispatch(incrementKillCount());
        const config = getCurrentLevelConfig();

        // check if level completion requirement met
        if (killCount + 1 >= config.requiredKills) {
            handleLevelComplete();
        }
    }, [killCount, currentLevel, dispatch, getCurrentLevelConfig]);

    /*
      manages level completion logic including rewards and progression
     */
    const handleLevelComplete = useCallback(() => {
        setIsLevelTransitioning(true);

        // award level completion bonus
        const config = getCurrentLevelConfig();
        dispatch(updateMathbucks(mathbucks + config.mathbucksReward));

        // transition with a shorter delay and gradual fade
        const transitionDuration = 1000; // 1 second
        const transitionDelay = 500; // 0.5 second delay

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
    /*
      manages enemy spawning based on level configuration
     */


    useEffect(() => {
        let spawnInterval: NodeJS.Timeout;

        // clear enemies ONLY when starting level 1
        if (gameStatus === 'playing' && currentLevel === 1 && !isLevelTransitioning) {
            dispatch(updateEnemies([]));
        }

        // spawn enemies only when game is active and not paused/in store
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

    // return level management interface
    return {
        currentLevelConfig: getCurrentLevelConfig(),
        isLevelTransitioning,
        killCount,
        handleEnemyDefeat
    };
};