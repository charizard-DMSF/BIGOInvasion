import React from 'react';
import { useAppSelector } from '../../storeRedux/store';
import { Heart, Trophy, Target, Shield, Bomb, Crosshair, Coins } from 'lucide-react';

const Hud = () => {
    // Add component render debug
    console.log('Hud Component Rendering');

    // Get full game state
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
    } = gameState;

    const healthPercentage = (playerHealth / 100) * 100;

    // Define gun names and their corresponding key numbers
    const gunConfig: Record<string, { name: string, key: string }> = {
        'basic': { name: 'Debug Logger', key: '1' },
        'spread': { name: 'Multi Logger', key: '2' },
        'sniper': { name: 'Stack Trace', key: '3' }
    };

    // Debug gun name resolution
    console.log('Current Gun:', currentGun);
    console.log('Gun Config:', gunConfig);
    console.log('Resolved Gun Info:', gunConfig[currentGun]);

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
                {/* Level Progress Display */}
                <div className="level-progress">
                    <h3>Level {currentLevel}</h3>
                    <p>Kills: {killCount} / {currentLevelConfig.requiredKills}</p>
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