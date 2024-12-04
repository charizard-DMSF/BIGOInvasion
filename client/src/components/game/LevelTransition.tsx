// LevelTransition.tsx
import React, { useEffect, useState } from 'react';
import { Trophy, Coins, ArrowRight } from 'lucide-react';

interface LevelTransitionProps {
    currentLevel: number;
    mathbucksReward: number;
    onTransitionComplete: () => void;
}

const LevelTransition: React.FC<LevelTransitionProps> = ({
    currentLevel,
    mathbucksReward,
    onTransitionComplete
}) => {
    const [stage, setStage] = useState(1);

    useEffect(() => {
        const stage2Timer = setTimeout(() => setStage(2), 1000);
        const stage3Timer = setTimeout(() => setStage(3), 2000);
        const completeTimer = setTimeout(onTransitionComplete, 3000);

        return () => {
            clearTimeout(stage2Timer);
            clearTimeout(stage3Timer);
            clearTimeout(completeTimer);
        };
    }, [onTransitionComplete]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-8 mx-4 w-full max-w-md">
                {/* Stage 1: Level Complete */}
                <div
                    className="text-center mb-6"
                    style={{
                        transform: `scale(${stage >= 1 ? 1 : 0})`,
                        transition: 'transform 0.5s ease'
                    }}
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Trophy className="w-8 h-8 text-green-500" />
                        <h2 className="text-3xl font-bold text-green-500">
                            Level {currentLevel} Complete!
                        </h2>
                    </div>
                </div>

                {/* Stage 2: Rewards */}
                <div
                    className="text-center mb-6"
                    style={{
                        opacity: stage >= 2 ? 1 : 0,
                        transform: `translateY(${stage >= 2 ? 0 : 20}px)`,
                        transition: 'all 0.5s ease'
                    }}
                >
                    <div className="flex items-center justify-center gap-2 text-xl">
                        <Coins className="w-6 h-6 text-green-500" />
                        <span className="text-white">Reward:</span>
                        <span className="text-green-500 font-bold">
                            {mathbucksReward} Mathbucks
                        </span>
                    </div>
                </div>

                {/* Stage 3: Next Level or Victory */}
                <div
                    className="text-center"
                    style={{
                        opacity: stage >= 3 ? 1 : 0,
                        transform: `translateY(${stage >= 3 ? 0 : 20}px)`,
                        transition: 'all 0.5s ease'
                    }}
                >
                    {currentLevel < 7 ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-white text-lg">Preparing Level {currentLevel + 1}</span>
                            <ArrowRight className="w-5 h-5 text-green-500 animate-pulse" />
                        </div>
                    ) : (
                        <div className="text-yellow-500 text-xl font-bold">
                            Final Level Complete! Prepare for Victory!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LevelTransition;