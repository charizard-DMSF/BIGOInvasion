import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../storeRedux/store';
import { setGameStatus, toggleLeaderboard, toggleStats } from '../../storeRedux/gameSlice';
import Leaderboard from '../Leaderboard';
import PlayerStats from '../YourStats';

interface PauseMenuProps {
    onResume: () => void;
    isLeaderboardOpen: boolean;
    isStatsOpen: boolean;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, isLeaderboardOpen, isStatsOpen }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const gameState = useAppSelector(state => state.game);
    const user = localStorage.getItem('user');

    const handleSaveAndQuit = async () => {
        if (!user) return;

        const userData = JSON.parse(user);

        try {
            const response = await fetch('http://localhost:8080/saveGame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: userData.id,
                    gameState: {
                        currentLevel: gameState.currentLevel,
                        levelKillCount: gameState.levelKillCount,
                        score: gameState.score,
                        playerHealth: gameState.playerHealth,
                        mathbucks: gameState.mathbucks,
                        unlockedGuns: gameState.unlockedGuns,
                        stats: gameState.stats,
                        powerUps: gameState.powerUps,
                        playerPosition: gameState.playerPosition,
                        lastSaved: new Date().toISOString()
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to save game');

            dispatch(setGameStatus('menu'));
            navigate('/');
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    };

    const handleStats = () => {
        dispatch(toggleStats());
    };

    const handleLeaderboard = () => {
        dispatch(toggleLeaderboard());
    };

    const handleMainMenu = () => {
        if (window.confirm('Are you sure? Any unsaved progress will be lost.')) {
            dispatch(setGameStatus('menu'));
            navigate('/');
        }
    };

    return (
        <div className="pause-menu-overlay">
            <div className="pause-menu-container">
                <h2>Game Paused</h2>
                <div className="pause-menu-buttons">
                    <button onClick={onResume}>Resume Game</button>
                    <button onClick={handleStats}>
                        {isStatsOpen ? 'Close Stats' : 'Your Stats'}
                    </button>
                    <button onClick={handleLeaderboard}>
                        {isLeaderboardOpen ? 'Close Leaderboard' : 'Leaderboard'}
                    </button>
                    {user && <button onClick={handleSaveAndQuit}>Save and Quit</button>}
                    <button onClick={handleMainMenu}>Main Menu</button>
                </div>
            </div>

            {isLeaderboardOpen && (
                <div className="leaderboard-overlay">
                    <Leaderboard onStatsClick={handleStats} />
                </div>
            )}

            {isStatsOpen && (
                <div className="stats-overlay">
                    <PlayerStats />
                </div>
            )}
        </div>
    );
};

export default PauseMenu;