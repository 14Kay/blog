export interface SteamProfile {
    steamid: string;
    personaname: string;
    profileurl: string;
    avatar: string;
    avatarfull: string;
    personastate: number; // 0: Offline, 1: Online, etc.
    timecreated: number;
}

export interface SteamGame {
    appid: number;
    name: string;
    playtime_forever: number; // Minutes
    playtime_2weeks?: number; // Minutes
    img_icon_url: string;
}
