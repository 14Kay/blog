
import { SteamGame } from '@/lib/steam-types';
import { formatPlaytime } from '@/lib/steam-utils';
import SteamGameImage from '@/components/SteamGameImage';

interface GameCardProps {
    game: SteamGame;
    rank?: number;
}

export default function GameCard({ game, rank }: GameCardProps) {
    return (
        <a
            href={`https://store.steampowered.com/app/${game.appid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-gray-800/50 transition-all hover:scale-[1.02] hover:shadow-lg"
        >
            <div className="relative aspect-[460/215] w-full overflow-hidden">
                <SteamGameImage
                    game={game}
                    alt={game.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Recent Playtime Badge */}
                {game.playtime_2weeks ? (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-white/10 flex items-center gap-1 shadow-sm">
                        <span className="text-green-400">●</span>
                        {formatPlaytime(game.playtime_2weeks)} 近两周
                    </div>
                ) : null}
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
                <h3 className="line-clamp-1 text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100" title={game.name}>
                    {game.name}
                </h3>

                <div className="mt-auto flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {formatPlaytime(game.playtime_forever)}
                    </span>
                    {rank && (
                        <span className="text-[10px] sm:text-xs opacity-30 font-medium">#{rank}</span>
                    )}
                </div>
            </div>
        </a>
    );
}
