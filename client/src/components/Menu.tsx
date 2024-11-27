import React from 'react';

interface MenuProps {
    onStartGame: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartGame }) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 z-50">
            <h1 className="text-6xl font-bold mb-8 text-green-500 tracking-wider">
                DEBUG DEFENDER
            </h1>
            <p className="text-green-400 mb-8 text-xl">
                Eliminate bugs with console.log() and console.error()
            </p>
            <button
                onClick={onStartGame}
                className="px-8 py-4 text-2xl bg-green-600 text-white rounded-lg 
                         hover:bg-green-500 transition-colors
                         border-2 border-green-400 hover:border-green-300
                         shadow-lg hover:shadow-green-500/50"
            >
                START DEBUGGING
            </button>
            <div className="mt-8 text-green-400 text-center">
                <p className="mb-2">Controls:</p>
                <p>WASD / Arrow Keys - Move</p>
                <p>Left Click - Fire console.log()</p>
                <p>Hold Left Click - Charge console.error()</p>
                <p>Right Click - Dash</p>
            </div>
        </div>
    );
};

export default Menu;