import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../storeRedux/store';
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

    const handleSaveAndQuit = () => {
        // Here you would implement save logic
        dispatch(setGameStatus('menu'));
        navigate('/');
    };

    const handleStats = () => {
        dispatch(toggleStats());
    };

    const handleLeaderboard = () => {
        dispatch(toggleLeaderboard());
    };

    const handleMainMenu = () => {
        dispatch(setGameStatus('menu'));
        navigate('/');
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
                    <button onClick={handleSaveAndQuit}>Save and Quit</button>
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