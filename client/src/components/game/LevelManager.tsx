// src/components/game/LevelManager.ts
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import {
    setGameStatus,
    addEnemy,
    advanceLevel,
    incrementKillCount,
    updateMathbucks,
    resetKillCount
} from '../../storeRedux/gameSlice';
import { Enemy } from '../../storeRedux/gameSlice';
import { EnemyTypeKey } from './Enemy';
import { ENEMY_TYPES } from './Enemy';

// game viewport dimensions - defines playable area
const VIEWPORT = {
    WIDTH: 1200,
    HEIGHT: 800,
};

// defines what each level needs and contains
interface LevelConfig {
    requiredKills: number;
    spawnInterval: number;  // milliseconds
    enemyTypes: {
        basic: number;   // spawn weights
        fast: number;
        tank: number;
    };
    mathbucksReward: number;
}

// level configurations getting progressively harder
// each level needs more kills, spawns enemies faster, and has more variety
export const LEVEL_CONFIGS: { [key: number]: LevelConfig } = {
    1: {
        requiredKills: 15,
        spawnInterval: 2000,
        enemyTypes: {
            basic: 1,
            fast: 0,
            tank: 0
        },
        mathbucksReward: 500
    },
    2: {
        requiredKills: 25,
        spawnInterval: 1500,
        enemyTypes: {
            basic: 0.7,
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
        spawnInterval: 800,
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
        spawnInterval: 200,
        enemyTypes: {
            basic: 0.3,
            fast: 0.4,
            tank: 0.3
        },
        mathbucksReward: 3000
    },
    7: {
        requiredKills: 150,
        spawnInterval: 50,
        enemyTypes: {
            basic: 0.2,
            fast: 0.5,
            tank: 0.3
        },
        mathbucksReward: 4000
    }
};

// main level management hook that handles game progression
export const useLevelManager = (cameraTransform: { x: number; y: number }) => {
    const dispatch = useAppDispatch();
    // grab all our game state from redux
    const currentLevel = useAppSelector(state => state.game.currentLevel);
    const killCount = useAppSelector(state => state.game.levelKillCount);
    const gameStatus = useAppSelector(state => state.game.gameStatus);
    const mathbucks = useAppSelector(state => state.game.mathbucks);

    // tracks if we're in between levels
    const [isLevelTransitioning, setIsLevelTransitioning] = useState(false);

    // helper to get current level settings
    const getCurrentLevelConfig = useCallback(() => {
        return LEVEL_CONFIGS[currentLevel];
    }, [currentLevel]);

    // handles what happens when player defeats an enemy
    const handleEnemyDefeat = useCallback(() => {
        dispatch(incrementKillCount());
        const config = getCurrentLevelConfig();

        // check if we've hit the kill requirement for level completion
        if (killCount + 1 >= config.requiredKills) {
            handleLevelComplete();
        }
    }, [killCount, currentLevel, dispatch, getCurrentLevelConfig]);

    // manages level completion logic
    const handleLevelComplete = useCallback(() => {
        setIsLevelTransitioning(true);

        // give player their reward
        const config = getCurrentLevelConfig();
        dispatch(updateMathbucks(mathbucks + config.mathbucksReward));

        // wait a bit then either advance to next level or declare victory
        setTimeout(() => {
            if (currentLevel < 7) {
                dispatch(advanceLevel());
                dispatch(resetKillCount());
            } else {
                dispatch(setGameStatus('victory'));
            }
            setIsLevelTransitioning(false);
        }, 3000);
    }, [currentLevel, dispatch, mathbucks, getCurrentLevelConfig]);

    // handles enemy spawning based on level configuration
    useEffect(() => {
        let spawnInterval: NodeJS.Timeout;

        if (gameStatus === 'playing' && !isLevelTransitioning) {
            const config = getCurrentLevelConfig();

            // spawns a new enemy with random position and type based on level weights
            const spawnEnemy = () => {
                const config = getCurrentLevelConfig();
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
            };

            // set up the spawn interval based on level config
            spawnInterval = setInterval(spawnEnemy, config.spawnInterval);
        }

        // cleanup interval when component unmounts or game state changes
        return () => {
            if (spawnInterval) {
                clearInterval(spawnInterval);
            }
        };
    }, [gameStatus, isLevelTransitioning, dispatch, getCurrentLevelConfig, cameraTransform]);

    // randomly selects enemy type based on level configuration weights
    const getEnemyTypeForSpawn = useCallback(() => {
        const config = getCurrentLevelConfig();
        const rand = Math.random();
        let cumulativeWeight = 0;

        // use weighted random selection based on level config
        for (const [type, weight] of Object.entries(config.enemyTypes)) {
            cumulativeWeight += weight;
            if (rand <= cumulativeWeight) {
                return type as EnemyTypeKey;
            }
        }

        // fallback to basic enemy type
        return 'basic' as EnemyTypeKey;
    }, [getCurrentLevelConfig]);

    // expose necessary values and functions to component
    return {
        currentLevelConfig: getCurrentLevelConfig(),
        isLevelTransitioning,
        killCount,
        handleEnemyDefeat
    };
};