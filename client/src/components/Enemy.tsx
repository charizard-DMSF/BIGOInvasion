import React from 'react';
import { Enemy as EnemyType } from '../types/game.types';

const Enemy: React.FC<EnemyType> = ({ position, health }) => {
    return (
        <div
            className="enemy"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transition: 'transform 0.1s ease-out'
            }}
        >
            <div className="enemy-health">{health}</div>
        </div>
    );
};

export default Enemy;