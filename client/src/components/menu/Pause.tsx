import React, { useState } from 'react';
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
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleSaveAndQuit = async () => {
        if (!user) {
            console.error('No user found');
            return;
        }

        try {
            setIsSaving(true);
            setSaveError(null);
            const userData = JSON.parse(user);

            console.log('User data from localStorage:', userData);

            // Use user_id consistently
            const userId = userData.user_id;

            if (!userId) {
                console.error('Missing user ID in stored data:', userData);
                throw new Error('User ID not found in stored data');
            }

            const payload = {
                userId: userId,  // This will now be the user_id from the database
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
            };

            // Add logging to verify payload
            console.log('Sending save game payload:', payload);

            const response = await fetch('http://localhost:8080/saveGame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            console.log('Save game response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to save game');
            }

            dispatch(setGameStatus('menu'));
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Failed to save game:', error);
            setSaveError(error instanceof Error ? error.message : 'Failed to save game');
        } finally {
            setIsSaving(false);
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
                {saveError && (
                    <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
                        {saveError}
                    </div>
                )}
                <div className="pause-menu-buttons">
                    <button onClick={onResume}>Resume Game</button>
                    <button onClick={handleStats}>
                        {isStatsOpen ? 'Close Stats' : 'Your Stats'}
                    </button>
                    <button onClick={handleLeaderboard}>
                        {isLeaderboardOpen ? 'Close Leaderboard' : 'Leaderboard'}
                    </button>
                    {user && (
                        <button
                            onClick={handleSaveAndQuit}
                            disabled={isSaving}
                            style={{ opacity: isSaving ? 0.7 : 1 }}
                        >
                            {isSaving ? 'Saving...' : 'Save and Quit'}
                        </button>
                    )}
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