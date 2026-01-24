
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID || '76561198268671173'; // Default to user's ID
const PROXY_URL = process.env.STEAM_PROXY || process.env.HTTPS_PROXY; // Only use proxy if explicitly configured

// Note: We use 'undici' to handle proxying cleanly with fetch
import { fetch, ProxyAgent } from 'undici';
import { SteamGame, SteamProfile } from './steam-types';

interface SteamUserResponse {
    response: {
        players: {
            player: SteamProfile[];
        };
    };
}

interface SteamGamesResponse {
    response: {
        game_count: number;
        games: SteamGame[];
    };
}

const dispatcher = PROXY_URL ? new ProxyAgent(PROXY_URL) : undefined;

export async function getSteamProfile(): Promise<SteamProfile | null> {
    if (!STEAM_API_KEY) return null;

    try {
        const response = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0001/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`,
            {
                dispatcher
            }
        );
        const data = await response.json() as SteamUserResponse;
        return data.response.players.player[0] || null;
    } catch (error) {
        console.error('Error fetching Steam profile:', error);
        return null;
    }
}

export async function getOwnedGames(): Promise<SteamGame[]> {
    if (!STEAM_API_KEY) return [];

    try {
        const response = await fetch(
            `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&include_appinfo=1&include_played_free_games=1&format=json`,
            { dispatcher }
        );
        const data = await response.json() as SteamGamesResponse;
        return data.response.games || [];
    } catch (error) {
        console.error('Error fetching owned games:', error);
        return [];
    }
}

export async function getRecentlyPlayedGames(): Promise<SteamGame[]> {
    if (!STEAM_API_KEY) return [];

    try {
        const response = await fetch(
            `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&format=json`,
            { dispatcher }
        );
        const data = await response.json() as SteamGamesResponse;
        return data.response.games || [];
    } catch (error) {
        console.error('Error fetching recent games:', error);
        return [];
    }
}

// Re-export types and utils for convenience (optional, but careful with server-only deps)
// BETTER STRATEGY: Do NOT re-export utils if we want to force clients to import from safe files.
// But for server components, re-exporting types is fine.
export type { SteamGame, SteamProfile } from './steam-types';
// We do NOT re-export formatPlaytime here to avoid accidental import of 'undici' via this file.
