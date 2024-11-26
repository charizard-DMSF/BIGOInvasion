import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import Game from './components/Game';
import './styles/game.css';

const App: React.FC = () => {
    return (
        <div className="app">
            <Game />
        </div>
    );
};

export default App;