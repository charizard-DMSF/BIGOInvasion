import React from 'react';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import { updateMathbucks, upgradeStat, toggleStore, unlockGun } from '../../storeRedux/gameSlice';
import { GUNS } from '../game/guns';

const Store: React.FC = () => {
    const dispatch = useAppDispatch();
    const { mathbucks, stats, unlockedGuns } = useAppSelector(state => state.game);

    const handleUpgrade = (stat: string, currentLevel: number) => {
        if (mathbucks >= 100) {
            dispatch(updateMathbucks(mathbucks - 100));
            dispatch(upgradeStat({ stat, level: currentLevel + 1 }));
        }
    };

    const handleGunPurchase = (gunId: string, cost: number) => {
        if (mathbucks >= cost && !unlockedGuns.includes(gunId)) {
            dispatch(updateMathbucks(mathbucks - cost));
            dispatch(unlockGun(gunId));
        }
    };

    const handleBack = () => {
        dispatch(toggleStore());
    };

    return (
        <div className="store-container">
            <button className="back-button" onClick={handleBack}>Back</button>
            <div className="mathbucks-display">
                Mathbucks: {mathbucks}
            </div>
            <div className="store-content">
                <h2 className="section-title">Weapons Shop</h2>
                <div className="guns-list">
                    {Object.values(GUNS).map((gun) => (
                        <div key={gun.id} className="stats-row">
                            <div className="stat-name">
                                <div>{gun.name}</div>
                                <div className="gun-description">{gun.description}</div>
                            </div>
                            <button
                                className="unlock-button"
                                onClick={() => handleGunPurchase(gun.id, gun.cost)}
                                disabled={unlockedGuns.includes(gun.id) || mathbucks < gun.cost}
                            >
                                {unlockedGuns.includes(gun.id)
                                    ? 'Owned'
                                    : `Buy (${gun.cost} MB)`}
                            </button>
                        </div>
                    ))}
                </div>

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
                            <button className="unlock-button" disabled>Unlock!</button>
                        </div>
                    </div>
                    <div className="powerup-row">
                        <span>Nuke</span>
                        <div className="powerup-info">
                            <span className="drop-rate">Drop Rate: 1%</span>
                            <button className="unlock-button" disabled>Unlock!</button>
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