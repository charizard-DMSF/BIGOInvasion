import React from 'react';
import { useAppSelector } from '../../storeRedux/store';
import { Heart, Trophy, Target, Shield, Bomb, Crosshair, Coins } from 'lucide-react';
import '../../styles/styles.css';

const Hud = () => {
    const {
        playerHealth,
        score,
        level,
        shields,
        nukes,
        gunType,
        mathbucks
    } = useAppSelector(state => state.game);

    const healthPercentage = (playerHealth / 100) * 100;

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
                    <span className="level-value">{level}</span>
                </div>
            </div>

            <div className="hud-stats-right">
                <div className="equipment-container">
                    <div className="weapon-type">
                        <Crosshair size={20} />
                        <span className="value">{gunType}</span>
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