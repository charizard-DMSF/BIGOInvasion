import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const HUD: React.FC = () => {
    const { score, level, playerHealth } = useSelector((state: RootState) => state.game);

    return (
        <div className="hud">
            <div>Level: {level}</div>
            <div>Score: {score}</div>
            <div>Health: {playerHealth}</div>
        </div>
    );
};

export default HUD;