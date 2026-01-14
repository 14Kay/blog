
import Image from 'next/image';
import { getSteamProfile, getOwnedGames, getRecentlyPlayedGames } from '@/lib/steam';
import { getAccountAge, formatPlaytime } from '@/lib/steam-utils';
import GameCard from '@/components/GameCard';
import GameLibrary from '@/components/GameLibrary';
import SteamGameImage from '@/components/SteamGameImage';

import { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
    const profile = await getSteamProfile();
    return {
        title: profile ? `${profile.personaname}'s Games` : 'Games Library',
        description: 'My Steam game collection and play history.',
    };
}

export default async function GamesPage() {
    const [profile, ownedGames, recentGames] = await Promise.all([
        getSteamProfile(),
        getOwnedGames(),
        getRecentlyPlayedGames()
    ]);

    if (!profile) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">无法获取 Steam 信息</h1>
                <p className="text-gray-500">
                    请检查环境变量 <code>STEAM_API_KEY</code> 和 <code>STEAM_ID</code> 是否配置正确。
                </p>
            </div>
        );
    }

    // Sort owned games by playtime (bestsellers/favorites)
    const sortedGames = [...ownedGames].sort((a, b) => b.playtime_forever - a.playtime_forever);

    // Top 6 Games for Featured Section
    const topGames = sortedGames.slice(0, 6);
    const libraryGames = sortedGames.slice(6);

    // Calculate total stats
    const totalPlaytimeMinutes = ownedGames.reduce((acc, game) => acc + game.playtime_forever, 0);
    const totalPlaytimeHours = Math.floor(totalPlaytimeMinutes / 60);

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Section with Immersive Background */}
            <section className="relative w-full min-h-[400px] sm:h-[500px] flex items-center justify-center overflow-hidden py-20 sm:py-0">
                {/* Background Image (User Avatar Blown Up & Blurred) */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={profile.avatarfull}
                        alt="Background"
                        fill
                        className="object-cover opacity-30 dark:opacity-20 blur-3xl scale-110"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-900/50 dark:to-gray-900" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6 px-4 max-w-4xl mx-auto mt-0">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 animate-pulse"></div>
                        <a href={profile.profileurl} target="_blank" rel="noopener noreferrer" className="relative block">
                            <Image
                                src={profile.avatarfull}
                                alt={profile.personaname}
                                width={120}
                                height={120}
                                className="rounded-full border-4 border-white dark:border-gray-800 shadow-2xl transition-transform duration-500 group-hover:scale-105 sm:w-[140px] sm:h-[140px]"
                                unoptimized
                            />
                            <div className={`absolute bottom-2 right-2 w-4 h-4 sm:w-5 sm:h-5 border-4 border-white dark:border-gray-800 rounded-full ${profile.personastate === 1 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </a>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">
                            {profile.personaname}
                        </h1>

                    </div>

                    {/* Stats Cards - Floating */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 w-full max-w-2xl pt-2 sm:pt-4">
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg border border-white/20 dark:border-white/5 transform hover:-translate-y-1 transition-transform">
                            <p className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-cyan-500">{ownedGames.length}</p>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Games Owned</p>
                        </div>
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg border border-white/20 dark:border-white/5 transform hover:-translate-y-1 transition-transform">
                            <p className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-600 to-pink-500">{totalPlaytimeHours.toLocaleString()}</p>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Hours Played</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg border border-white/20 dark:border-white/5 transform hover:-translate-y-1 transition-transform">
                            <p className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-amber-500 to-orange-500">{getAccountAge(profile.timecreated)}</p>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Years on Steam</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 -mt-12 relative z-20">

                {/* Top Played / Featured */}
                {topGames.length > 0 && (
                    <section className="pt-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-3xl">🏆</span> Most Played
                        </h2>

                        <div className="space-y-6">
                            {/* Top 1-3 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* The #1 Game - Bigger prominence */}
                                <div className="md:col-span-2">
                                    <div className="group relative h-full min-h-[300px] rounded-3xl overflow-hidden shadow-2xl">
                                        <SteamGameImage
                                            game={topGames[0]}
                                            alt={topGames[0].name}
                                            imageType="hero"
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-8 text-white">
                                            <h3 className="text-3xl font-bold mb-2">{topGames[0].name}</h3>
                                            <p className="text-white/80 text-lg font-medium">{formatPlaytime(topGames[0].playtime_forever)}</p>
                                        </div>
                                        <a href={`https://store.steampowered.com/app/${topGames[0].appid}`} target="_blank" className="absolute inset-0 z-10" />
                                    </div>
                                </div>

                                {/* #2 & #3 Games */}
                                <div className="grid grid-rows-2 gap-6">
                                    {topGames.slice(1, 3).map((game) => (
                                        <div key={game.appid} className="group relative rounded-2xl overflow-hidden shadow-xl">
                                            <SteamGameImage
                                                game={game}
                                                alt={game.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                            <div className="absolute bottom-0 left-0 p-4 text-white">
                                                <h3 className="text-lg font-bold line-clamp-1">{game.name}</h3>
                                                <p className="text-white/80 text-sm font-medium">{formatPlaytime(game.playtime_forever)}</p>
                                            </div>
                                            <a href={`https://store.steampowered.com/app/${game.appid}`} target="_blank" className="absolute inset-0 z-10" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top 4-6 */}
                            {topGames.length > 3 && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {topGames.slice(3, 6).map((game) => (
                                        <div key={game.appid} className="group relative h-48 rounded-2xl overflow-hidden shadow-xl">
                                            <Image
                                                src={`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`}
                                                alt={game.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                            <div className="absolute bottom-0 left-0 p-4 text-white">
                                                <h3 className="text-lg font-bold line-clamp-1">{game.name}</h3>
                                                <p className="text-white/80 text-sm font-medium">{formatPlaytime(game.playtime_forever)}</p>
                                            </div>
                                            <a href={`https://store.steampowered.com/app/${game.appid}`} target="_blank" className="absolute inset-0 z-10" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Recent Activity */}
                {recentGames.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="text-2xl">🕹️</span> Recently Played
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {recentGames.map((game) => (
                                <GameCard key={game.appid} game={game} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Full Library */}
                {/* Full Library (Collapsible) */}
                <GameLibrary games={libraryGames} totalCount={ownedGames.length} />
            </div>
        </div>
    );
}
