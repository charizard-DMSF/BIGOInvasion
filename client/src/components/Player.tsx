import React from 'react';
import { Position } from '../types/game.types';

interface PlayerProps {
    position: Position;
    isMoving: boolean;
    isDashing: boolean;
    isCharging: boolean;
}

const Player: React.FC<PlayerProps> = ({
    position,
    isMoving,
    isDashing,
    isCharging
}) => {
    return (
        <div
            className={`player 
                ${isMoving ? 'moving' : ''} 
                ${isDashing ? 'dashing' : ''} 
                ${isCharging ? 'charging' : ''}`
            }
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transition: isDashing ? 'none' : 'transform 0.05s linear',
                filter: isDashing
                    ? 'brightness(1.5) drop-shadow(0 0 15px #00ff00)'
                    : 'none'
            }}
        />
    );
};

export default Player;