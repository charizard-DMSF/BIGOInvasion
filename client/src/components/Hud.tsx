import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { PLAYER } from '../config/constants';

const HUD: React.FC = () => {
    const { score, level, playerHealth, wave } = useSelector((state: RootState) => state.game);

    return (
        <div className="hud">
            <div className="stat-container">
                <div className="stat">
                    <span className="label">Level:</span>
                    <span className="value">{level}</span>
                </div>
                <div className="stat">
                    <span className="label">Wave:</span>
                    <span className="value">{wave.number}</span>
                </div>
                <div className="stat">
                    <span className="label">Score:</span>
                    <span className="value">{score}</span>
                </div>
                <div className="stat">
                    <div className="health-bar">
                        <div className="health-bar-fill"
                            style={{
                                width: `${(playerHealth / PLAYER.MAX_HEALTH) * 100}%`,
                                backgroundColor: `hsl(${playerHealth}, 100%, 50%)`
                            }}
                        />
                        <span className="health-text">{playerHealth}</span>
                    </div>
                </div>
                <div className="stat">
                    <span className="label">Bugs Remaining:</span>
                    <span className="value">{wave.enemyCount - wave.enemiesDefeated}</span>
                </div>
            </div>
        </div>
    );
};

export default HUD;