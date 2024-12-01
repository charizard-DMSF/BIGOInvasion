import React from 'react';
import { Enemy } from '../../storeRedux/gameSlice';

const Enemy: React.FC<Enemy> = ({ position, health }) => {
  return (
    <div
      className="enemy"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}>
      {health}
    </div>
  );
};

export default Enemy;
