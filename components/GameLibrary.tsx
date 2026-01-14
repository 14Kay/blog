'use client';

import { useState } from 'react';
import { SteamGame } from '@/lib/steam-types';
import GameCard from '@/components/GameCard';

interface GameLibraryProps {
    games: SteamGame[];
    totalCount: number;
}

export default function GameLibrary({ games, totalCount }: GameLibraryProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section>
            <div
                className="flex items-center gap-4 mb-6 cursor-pointer group select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <span className="text-2xl">📚</span> Library
                    <span className={`text-sm text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </h2>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-semibold text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                    {totalCount} TITLES
                </span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    {games.map((game, index) => (
                        <div key={game.appid} className="contents">
                            <GameCard game={game} rank={index + 4} />
                        </div>
                    ))}
                </div>
            )}

            {!isExpanded && (
                <div className="text-center">
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        Show All {totalCount} Games
                    </button>
                </div>
            )}
        </section>
    );
}
