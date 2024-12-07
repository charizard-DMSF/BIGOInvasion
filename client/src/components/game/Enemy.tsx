import React from 'react';
import { Enemy } from '../../storeRedux/gameSlice';
import enemy1 from '../../../public/assets/enemy1.png';
import enemy2 from '../../../public/assets/enemy2.png';
import enemy3 from '../../../public/assets/enemy3.png';

export interface EnemyConfig {
  baseHealth: number;
  baseSpeed: number;
  damage: number;
  size: number;
  color: string;
  image: string;
}

export interface EnemyType {
  id: string;
  name: string;
  description: string;
  config: EnemyConfig;
}

export type EnemyTypeKey = keyof typeof ENEMY_TYPES;

export const ENEMY_TYPES: { [key: string]: EnemyType } = {
  basic: {
    id: 'basic',
    name: 'Basic Bug',
    description: 'A small coding bug',
    config: {
      baseHealth: 50,
      baseSpeed: 1,
      damage: 5,
      size: 32,
      color: 'red',
      image: enemy1,
    },
  },
  fast: {
    id: 'fast',
    name: 'Speedy Bug',
    description: 'A quick-moving runtime error',
    config: {
      baseHealth: 75,
      baseSpeed: 1.5,
      damage: 2,
      size: 24,
      color: 'yellow',
      image: enemy2,
    },
  },
  tank: {
    id: 'tank',
    name: 'Stubborn Bug',
    description: 'A complicated logical error',
    config: {
      baseHealth: 200,
      baseSpeed: 0.8,
      damage: 10,
      size: 40,
      color: 'blue',
      image: enemy3,
    },
  },
};

const EnemyComponent: React.FC<Enemy> = ({
  position,
  health,
  damage,
  type,
}) => {
  const enemyConfig = ENEMY_TYPES[type].config;

  return (
    <div
      className={`enemy enemy-${type}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${enemyConfig.size}px`,
        height: `${enemyConfig.size}px`,
        backgroundColor: enemyConfig.color,
        backgroundImage: `url(${enemyConfig.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      {health}
    </div>
  );
};

export default EnemyComponent;
