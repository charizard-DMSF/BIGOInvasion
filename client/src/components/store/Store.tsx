// components/store/Store.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../storeRedux/store';
import { updateMathbucks, upgradeStat } from '../../storeRedux/gameSlice';

const Store: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { mathbucks, stats } = useSelector((state: RootState) => state.game);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'p') navigate('/game');
        };
        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [navigate]);

    const handleUpgrade = (stat: string, currentLevel: number) => {
        if (mathbucks >= 100) {
            dispatch(updateMathbucks(mathbucks - 100));
            dispatch(upgradeStat({ stat, level: currentLevel + 1 }));
        }
    };

    return (
        <div className="store-container">
            <button className="back-button">Back</button>

            <div className="mathbucks-display">
                Mathbucks: {mathbucks}
            </div>

            <div className="store-content">
                <h2 className="section-title">Stats Upgrades</h2>

                {Object.entries(stats).map(([stat, level]) => (
                    <div key={stat} className="stats-row">
                        <div className="stat-name">{stat} (Level {level})</div>
                        <button
                            className="unlock-button"
                            onClick={() => handleUpgrade(stat, level)}
                            disabled={mathbucks < 100}
                        >
                            Unlock! (100 MB)
                        </button>
                    </div>
                ))}

                <h2 className="section-title">Power-Ups (Enemy Drops)</h2>
                <div className="powerups-list">
                    <div className="powerup-row">
                        <span>Shield</span>
                        <div className="powerup-info">
                            <span className="drop-rate">Drop Rate: 5%</span>
                            <button className="unlock-button">Unlock!</button>
                        </div>
                    </div>

                    <div className="powerup-row">
                        <span>Better Gun</span>
                        <div className="powerup-info">
                            <span className="drop-rate">Drop Rate: 3%</span>
                            <button className="unlock-button">Unlock!</button>
                        </div>
                    </div>

                    <div className="powerup-row">
                        <span>Nuke</span>
                        <div className="powerup-info">
                            <span className="drop-rate">Drop Rate: 1%</span>
                            <button className="unlock-button">Unlock!</button>
                        </div>
                    </div>
                </div>

                <p className="powerup-note">
                    Defeat enemies to have a chance at obtaining these power-ups!
                </p>
            </div>
        </div>
    );
};

export default Store;