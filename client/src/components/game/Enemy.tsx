import React from 'react';
import { Enemy } from '../../storeRedux/gameSlice';

export interface EnemyConfig {
  baseHealth: number;
  baseSpeed: number;
  size: number;
  color: string;
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
      size: 32,
      color: 'red',
    },
  },
  fast: {
    id: 'fast',
    name: 'Speedy Bug',
    description: 'A quick-moving runtime error',
    config: {
      baseHealth: 75,
      baseSpeed: 1.5,
      size: 24,
      color: 'yellow',
    },
  },
  tank: {
    id: 'tank',
    name: 'Stubborn Bug',
    description: 'A complicated logical error',
    config: {
      baseHealth: 200,
      baseSpeed: 0.8,
      size: 40,
      color: 'blue',
    },
  },
};

const EnemyComponent: React.FC<Enemy> = ({ position, health, type }) => {
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
      }}>
      {health}
    </div>
  );
};

export default EnemyComponent;
