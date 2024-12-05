import React from 'react';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import {
  updateMathbucks,
  upgradeStat,
  toggleStore,
  unlockGun,
  updateHealth,
} from '../../storeRedux/gameSlice';
import { GUNS } from '../game/Guns';

const Store: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mathbucks, stats, unlockedGuns } = useAppSelector(
    (state) => state.game
  );

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

  const handleHealthRefill = () => {
    if (mathbucks >= 100) {
      dispatch(updateHealth(50));
      dispatch(updateMathbucks(mathbucks - 100));
    }
  };

  return (
    <div className="store-container">
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
      <div className="mathbucks-display">Mathbucks: {mathbucks}</div>
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
                disabled={
                  unlockedGuns.includes(gun.id) || mathbucks < gun.cost
                }>
                {unlockedGuns.includes(gun.id)
                  ? 'Owned'
                  : `Buy (${gun.cost} MB)`}
              </button>
            </div>
          ))}
        </div>

        <h2 className="section-title">Stats Upgrades</h2>
        <div className="stats-row">
          <div className="stat-name">HEALTH REFILL (+50)</div>
          <button
            className="unlock-button"
            disabled={mathbucks < 100}
            onClick={() => handleHealthRefill()}>
            Unlock! (100MB)
          </button>
        </div>
        {Object.entries(stats).map(([statKey, stat]) => (
          <div key={statKey} className="stats-row">
            <div className="stat-name">
              {statKey} (Level {stat.value})
            </div>
            <button
              className="unlock-button"
              onClick={() => handleUpgrade(statKey, stat.value)}
              disabled={mathbucks < 100}>
              {stat.value >= stat.max ? 'MAX LEVEL!' : 'Unlock! (100 MB)'}
            </button>
          </div>
        ))}

        <h2 className="section-title">Power-Ups (Enemy Drops)</h2>
        <div className="powerups-list">
          <div className="powerup-row">
            <span>Shield</span>
            <div className="powerup-info">
              <span className="drop-rate">Drop Rate: 5%</span>
              <button className="unlock-button" disabled>
                Unlock!
              </button>
            </div>
          </div>
          <div className="powerup-row">
            <span>Nuke</span>
            <div className="powerup-info">
              <span className="drop-rate">Drop Rate: 1%</span>
              <button className="unlock-button" disabled>
                Unlock!
              </button>
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
