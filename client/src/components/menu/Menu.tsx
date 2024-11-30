import { Link } from 'react-router-dom';
import React from 'react';

const Menu = () => {
  return (
    <div className="menu">
      <h1 id="title">Big O Invasion</h1>
      <div className="menu-content">
        <Link to="/game" className="link">
          <h2>New Game</h2>
        </Link>
        <Link to="/leaderboard" className="link">
          <h2>Leaderboard</h2>
        </Link>
      </div>
    </div>
  );
};

export default Menu;
