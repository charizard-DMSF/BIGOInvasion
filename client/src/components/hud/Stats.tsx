import React from 'react';
import { useAppSelector } from '../../storeRedux/store';

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

    return (
        <div className="hud-container">
            <div>
                <span>Health: {playerHealth}</span>
                <span>Score: {score}</span>
                <span>Level: {level}</span>
            </div>
            <div>
                <span>Gun: {gunType}</span>
                <span>Shields: {shields}</span>
                <span>Nukes: {nukes}</span>
                <span>MathBucks: {mathbucks}</span>
            </div>
        </div>
    );
};

export default Hud;