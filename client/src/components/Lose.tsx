import React from 'react';

interface LoseProps {
    onRestart: () => void;
}

const Lose: React.FC<LoseProps> = ({ onRestart }) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 z-50">
            <h1 className="text-6xl font-bold mb-8 text-red-500 tracking-wider">
                YOU GOT COMPILED
            </h1>
            <button
                onClick={onRestart}
                className="px-8 py-4 text-2xl bg-red-600 text-white rounded-lg 
                         hover:bg-red-500 transition-colors
                         border-2 border-red-400 hover:border-red-300
                         shadow-lg hover:shadow-red-500/50"
            >
                RECOMPILE
            </button>
        </div>
    );
};

export default Lose;