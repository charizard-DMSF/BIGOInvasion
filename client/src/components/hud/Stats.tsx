// components/hud/Hud.tsx
import React from 'react';
import { Heart, Target, Shield, Bomb } from 'lucide-react';

interface HudProps {
    health: number;
    score: number;
    level: number;
    gunType: string;
    shields: number;
    nukes: number;
}

const Hud: React.FC<HudProps> = ({ health, score, level, gunType, shields, nukes }) => {
    return (
        <div className="hud-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white'
        }}>
            <div className="stats">
                <div><Heart /> Health: {health}</div>
                <div>Score: {score}</div>
                <div>Level: {level}</div>
            </div>

            <div className="equipment" style={{ display: 'flex', gap: '20px' }}>
                <div><Target /> Gun: {gunType}</div>
                <div><Shield /> Shields: {shields}</div>
                <div><Bomb /> Nukes: {nukes}</div>
            </div>
        </div>
    );
};

export default Hud;