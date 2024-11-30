import React from 'react';
import { useAppSelector } from '../storeRedux/store';

const PlayerStats: React.FC = () => {
    const { playerHealth, score, level, mathbucks, stats } = useAppSelector(state => state.game);


    const accuracy = 88.5;
    const totalShots = 1250;
    const hitShots = Math.floor(totalShots * (accuracy / 100));
    const timePlayedMinutes = 45;

    return (
        <div className="player-stats-container">
            <h2 className="stats-title">Combat Stats</h2>
            <div className="stats-grid">
                <div className="stat-block">
                    <div className="stat-label">Accuracy</div>
                    <div className="stat-value">{accuracy}%</div>
                </div>
                <div className="stat-block">
                    <div className="stat-label">Shots Fired</div>
                    <div className="stat-value">{totalShots.toLocaleString()}</div>
                </div>
                <div className="stat-block">
                    <div className="stat-label">Hits</div>
                    <div className="stat-value">{hitShots.toLocaleString()}</div>
                </div>
                <div className="stat-block">
                    <div className="stat-label">Time Played</div>
                    <div className="stat-value">{timePlayedMinutes} min</div>
                </div>
            </div>

            <h2 className="stats-title">Player Upgrades</h2>
            <div className="stats-grid">
                {Object.entries(stats).map(([stat, level]) => (
                    <div key={stat} className="stat-block">
                        <div className="stat-label">{stat.replace(/_/g, ' ')}</div>
                        <div className="stat-value">Level {level}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerStats;