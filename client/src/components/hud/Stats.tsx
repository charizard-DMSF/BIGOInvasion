import React from 'react';
import { useAppSelector } from '../../storeRedux/store';
import { Heart, Trophy, Target, Shield, Bomb, Crosshair, Coins, Skull } from 'lucide-react';

const Hud = () => {
    // add component render debug
    console.log('Hud Component Rendering');

    // get full game state
    const gameState = useAppSelector(state => state.game);
    console.log('Full Game State:', gameState);

    const {
        playerHealth,
        score,
        currentLevel,
        shields,
        nukes,
        currentGun,
        mathbucks,
        levelKillCount
    } = gameState;

    // get the required kills from level config
    interface LevelConfig {
        requiredKills: number;
    }

    const LEVEL_CONFIGS: { [key: string]: LevelConfig } = {
        "1": { requiredKills: 15 },
        "2": { requiredKills: 25 },
        "3": { requiredKills: 40 },
        "4": { requiredKills: 60 },
        "5": { requiredKills: 80 },
        "6": { requiredKills: 100 },
        "7": { requiredKills: 150 }
    };

    const currentLevelConfig = useAppSelector(state => {
        const level = state.game.currentLevel.toString();
        return LEVEL_CONFIGS[level] || LEVEL_CONFIGS["1"];
    });

    const healthPercentage = (playerHealth / 100) * 100;

    // define gun names and their corresponding key numbers
    const gunConfig: Record<string, { name: string, key: string }> = {
        'basic': { name: 'Debug Logger', key: '1' },
        'spread': { name: 'Multi Logger', key: '2' },
        'sniper': { name: 'Stack Trace', key: '3' }
    };

    return (
        <div className="hud-container">
            <div className="hud-stats-left">
                <div className="health-bar-container">
                    <div className="health-bar-label">
                        <Heart size={20} color="#ff4444" fill="#ff4444" />
                    </div>
                    <div className="health-bar-background">
                        <div
                            className="health-bar-fill"
                            style={{ width: `${healthPercentage}%` }}
                        />
                        <div className="health-value">{playerHealth}</div>
                    </div>
                </div>
                <div className="score-display">
                    <Trophy size={20} color="#4CAF50" />
                    <span className="score-value">{score.toLocaleString()}</span>
                </div>
                <div className="level-display">
                    <Target size={20} color="#4CAF50" />
                    <span className="level-value">{currentLevel}</span>
                </div>
                <div className="level-display">
                    <Skull size={20} color="#4CAF50" />
                    <span className="level-value">
                        {levelKillCount}/ {currentLevelConfig.requiredKills}
                    </span>
                </div>
            </div>
            <div className="hud-stats-right">
                <div className="equipment-container">
                    <div className="weapon-type">
                        <Crosshair size={20} />
                        <span className="value" style={{ color: '#00ff00' }}>
                            {gunConfig[currentGun]?.name || 'Debug Logger'}
                        </span>
                        <span className="key-hint">[{gunConfig[currentGun]?.key || '1'}]</span>
                    </div>
                    <div className="shield-count">
                        <Shield size={20} />
                        <span className="value">{shields}</span>
                    </div>
                    <div className="nuke-count">
                        <Bomb size={20} />
                        <span className="value">{nukes}</span>
                    </div>
                    <div className="mathbucks">
                        <Coins size={20} />
                        <span className="value">{mathbucks}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hud;