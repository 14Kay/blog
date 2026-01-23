"use client";

import { usePlayer } from "@/app/context/PlayerContext";
import { Pause, Play, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Music, Minimize2, Disc } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

// Helper to format time
const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function GlobalPlayer() {
    const {
        currentSong,
        isPlaying,
        togglePlay,
        playNext,
        playPrev,
        mode,
        toggleMode,
        volume,
        setVolume,
        audioRef,
        toast
    } = usePlayer();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isVolumeHovered, setIsVolumeHovered] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Auto-collapse on small screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Store last volume for mute toggle
    const lastVolumeRef = useRef(0.25);

    // Local volume state to avoid lag during drag
    const [localVolume, setLocalVolume] = useState(volume);

    // Sync local volume when global volume changes
    useEffect(() => {
        setLocalVolume(volume);
        if (volume > 0) lastVolumeRef.current = volume;
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const onEnded = () => playNext();

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("ended", onEnded);
        };
    }, [audioRef, playNext]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // Debounce ref for volume updates
    const volumeDebounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setLocalVolume(newVolume); // Immediate UI update

        // Immediate audio update for responsiveness
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }

        // Debounce global state update (localStorage + context broadcast)
        if (volumeDebounceRef.current) {
            clearTimeout(volumeDebounceRef.current);
        }

        volumeDebounceRef.current = setTimeout(() => {
            setVolume(newVolume);
        }, 500);
    };

    if (!currentSong) return null;

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div
            className={cn(
                "fixed bottom-6 left-6 z-50 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)",
                isCollapsed ? "w-16 h-16 rounded-[32px] cursor-pointer hover:scale-110" : "w-80 h-[220px] rounded-3xl"
            )}
            onClick={() => isCollapsed && setIsCollapsed(false)}
        >
            <div className={cn(
                "absolute inset-0 overflow-hidden shadow-2xl transition-all duration-500",
                isCollapsed ? "rounded-[32px]" : "rounded-3xl"
            )}>
                {/* Glassmorphism Background */}
                <div className="absolute inset-0 bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 pointer-events-none" />

                {/* ------------- FULL PLAYER VIEW ------------- */}
                <div className={cn(
                    "absolute inset-0 p-5 transition-opacity duration-300 flex flex-col justify-between",
                    isCollapsed ? "opacity-0 pointer-events-none delay-0" : "opacity-100 delay-200"
                )}>
                    {/* Minimize Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
                        className="absolute top-2 right-2 p-1.5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white z-50 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Minimize player"
                    >
                        <Minimize2 size={16} />
                    </button>

                    {/* Toast */}
                    {toast && !isCollapsed && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-black/80 dark:bg-white/90 text-white dark:text-black text-xs font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {toast}
                        </div>
                    )}

                    {/* Top Section: Cover + Info + Status */}
                    <div className="flex items-start mb-4">
                        {/* Cover art with shadow */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-gray-200 dark:bg-black/20 mr-4 relative flex items-center justify-center">
                            {currentSong.cover && currentSong.source !== 'kw' ? (
                                <img src={currentSong.cover} alt={currentSong.name} className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-110' : 'scale-100'}`} />
                            ) : (
                                <Music size={24} className="text-gray-400/50" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/0 to-white/20 opacity-30 pointer-events-none" />

                            {/* Active Status Indicator (Green Dot) */}
                            {/* {isPlaying && (
                                <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10 animate-pulse" />
                            )} */}
                        </div>

                        <div className="flex-grow min-w-0 pt-1">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate drop-shadow-sm mb-1">{currentSong.name}</h3>
                            <p className="text-xs text-gray-600 dark:text-white/70 truncate font-medium">{currentSong.artist}</p>
                        </div>
                    </div>

                    {/* Content: Progress */}
                    <div className="mt-auto">
                        <div className="flex justify-between items-end mb-1.5 px-0.5">
                            <span className="text-[10px] text-gray-500 dark:text-white/50 font-mono tracking-wider">{formatTime(currentTime)}</span>
                            <span className="text-[10px] text-gray-500 dark:text-white/50 font-mono tracking-wider">-{formatTime(duration - currentTime)}</span>
                        </div>
                        <div className="relative h-1 w-full bg-gray-300/50 dark:bg-white/10 rounded-full overflow-hidden cursor-pointer group/progress">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="absolute top-0 left-0 h-full bg-gray-900 dark:bg-white/90 rounded-full transition-all duration-100 ease-linear shadow-sm" style={{ width: `${progress}%` }} />
                            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 dark:bg-white rounded-full shadow-md opacity-0 transition-opacity duration-200 pointer-events-none z-0 group-hover/progress:opacity-100" style={{ left: `${progress}%`, marginLeft: '-6px' }} />
                        </div>
                    </div>

                    {/* Content: Controls */}
                    <div className="flex items-center justify-between px-1 relative mt-4">
                        <div
                            className="relative flex items-center"
                            onMouseEnter={() => setIsVolumeHovered(true)}
                            onMouseLeave={() => setIsVolumeHovered(false)}
                        >
                            <button
                                onClick={() => setVolume(volume > 0 ? 0 : lastVolumeRef.current || 0.25)}
                                className="p-2 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <div className={cn("absolute left-0 bottom-full pb-4 z-20 transition-all duration-200 origin-bottom-left", isVolumeHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none')}>
                                <div className="p-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-white/10">
                                    <div className="h-24 w-6 flex items-center justify-center">
                                        <input type="range" min="0" max="1" step="0.01" value={localVolume} onChange={handleVolumeChange} className="w-20 h-6 -rotate-90 origin-center bg-transparent cursor-pointer appearance-none outline-none [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gray-200 dark:[&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 absolute left-1/2 -translate-x-1/2">
                            <button onClick={playPrev} className="p-2 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-95 cursor-pointer"><SkipBack size={20} className="fill-current" /></button>
                            <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer">
                                {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={20} className="fill-current" />}
                            </button>
                            <button onClick={playNext} className="p-2 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-95 cursor-pointer"><SkipForward size={20} className="fill-current" /></button>
                        </div>

                        <button
                            onClick={toggleMode}
                            className={cn("p-2 rounded-full transition-all active:scale-95 cursor-pointer", mode === 'shuffle' ? 'text-green-500 dark:text-green-400 bg-green-500/10' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/80')}
                        >
                            {mode === 'shuffle' ? <Shuffle size={18} /> : <Repeat size={18} />}
                        </button>
                    </div>
                </div>


                {/* ------------- MINI PLAYER VIEW (VINYL) ------------- */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all duration-500",
                    isCollapsed ? "opacity-100 rotate-0 delay-200" : "opacity-0 -rotate-90 pointer-events-none delay-0"
                )}>
                    {/* Spinning Vinyl */}
                    <div className={cn(
                        "relative w-full h-full rounded-full flex items-center justify-center",
                        isPlaying && isCollapsed ? "animate-[spin_4s_linear_infinite]" : ""
                    )}>
                        {currentSong.cover && currentSong.source !== 'kw' ? (
                            <img src={currentSong.cover} alt={currentSong.name} className="w-full h-full object-cover p-0.5 rounded-full" />
                        ) : (
                            <div className="w-full h-full bg-gray-800 dark:bg-gray-100 flex items-center justify-center rounded-full">
                                <Disc size={32} className="text-white dark:text-black" />
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full border-4 border-black/10 dark:border-white/10" />
                        <div className="absolute inset-0 m-auto w-4 h-4 bg-white/30 dark:bg-black/50 rounded-full border border-gray-400/30 backdrop-blur-sm z-10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
