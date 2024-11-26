// Menu.tsx
import React from 'react';

interface MenuProps {
    onStartGame: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartGame }) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90">
            <h1 className="text-6xl font-bold mb-8 text-green-500 tracking-wider">
                BIG O INVASION
            </h1>
            <button
                onClick={onStartGame}
                className="px-8 py-4 text-2xl bg-green-600 text-white rounded-lg 
                         hover:bg-green-500 transition-colors
                         border-2 border-green-400 hover:border-green-300
                         shadow-lg hover:shadow-green-500/50"
            >
                START GAME
            </button>
        </div>
    );
};

export default Menu;