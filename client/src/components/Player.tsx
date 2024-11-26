import React from 'react';
import { Position } from '../types/game.types';

interface PlayerProps {
    position: Position;
}

const Player: React.FC<PlayerProps> = ({ position }) => {
    return (
        <div
            className="player"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`
            }}
        />
    );
};

export default Player;