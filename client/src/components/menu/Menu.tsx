import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

interface SavedGame {
  currentLevel: number;
  lastSaved: string;
}

const Menu = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setIsAuthenticated(true);

        if (userData.user_id) {
          try {
            const response = await fetch(`http://localhost:8080/loadGame/${userData.user_id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });

            if (response.ok) {
              const { gameState } = await response.json();
              if (gameState) {
                setSavedGame({
                  currentLevel: gameState.currentLevel,
                  lastSaved: new Date().toISOString()
                });
              }
            }
          } catch (error) {
            console.error('Failed to check saved game:', error);
          }
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="menu">
      <h1 id="title">Big O Invasion</h1>
      <div className="menu-content">
        <Link to="/game" className="link">
          <h2>New Game</h2>
        </Link>

        {isAuthenticated && savedGame && (
          <Link to="/game?loadSave=true" className="link">
            <h2>Continue Level {savedGame.currentLevel}</h2>
          </Link>
        )}

        <Link to="/leaderboard" className="link">
          <h2>Leaderboard</h2>
        </Link>

        {!isAuthenticated ? (
          <>
            <Link to="/login" className="link">
              <h2>Login</h2>
            </Link>
            <Link to="/signup" className="link">
              <h2>Signup</h2>
            </Link>
          </>
        ) : (
          <Link to="/" className="link" onClick={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }}>
            <h2>Logout</h2>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Menu;