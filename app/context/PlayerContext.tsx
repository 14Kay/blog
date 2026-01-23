"use client";

import { Song } from "@/lib/songs";
import React, { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback } from "react";

interface PlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    volume: number;
    mode: 'sequence' | 'shuffle';
    queue: Song[];
    toast: string | null;
    playSong: (song: Song, newQueue?: Song[]) => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    playNext: () => void;
    playPrev: () => void;
    toggleMode: () => void;
    audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.25);
    const [queue, setQueue] = useState<Song[]>([]);
    const [mode, setMode] = useState<'sequence' | 'shuffle'>('sequence');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [toast, setToast] = useState<string | null>(null);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Load volume from localStorage on mount
    useEffect(() => {
        const savedVolume = localStorage.getItem("musicVolume");
        if (savedVolume !== null) {
            setVolume(parseFloat(savedVolume));
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined" && !audioRef.current) {
            audioRef.current = new Audio();
        }
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
        localStorage.setItem("musicVolume", volume.toString());
    }, [volume])

    const _play = async (song: Song) => {
        if (!audioRef.current) return;

        // Check platform restriction
        if (song.source !== 'tx' && song.source !== 'wy') {
            setToast(`不支持播放此平台 (${song.source}) 的音乐`);
            return;
        }

        const id = song.id.replace(/^(wy|tx|kg|mg)_/, '');
        const platform = song.source;
        let url = '';

        if (platform === 'wy') {
            url = `https://api.viki.moe/ncm/songs/${id}/play`;
        } else if (platform === 'tx') {
            url = `https://api.viki.moe/qqm/songs/${id}/play`;
        } else {
            // Should be caught by the check above, but playing safe
            setToast("不支持的播放源");
            return;
        }

        // Optimistic UI update: Show player immediately
        setCurrentSong(song);
        setIsPlaying(true);

        if (url) {
            audioRef.current.src = url;
            try {
                await audioRef.current.play();
                // Play started successfully
            } catch (e) {
                console.error("Play failed", e);
                // Revert state on failure
                setIsPlaying(false);
                setToast("播放失败，请稍后重试");
            }
        }
    };

    const playSong = useCallback(async (song: Song, newQueue?: Song[]) => {
        if (newQueue) {
            setQueue(newQueue);
        }
        // Check if it's the same song
        if (currentSong?.id === song.id) {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                try {
                    await audioRef.current?.play();
                    setIsPlaying(true);
                } catch (e) {
                    console.error("Resume failed", e);
                }
            }
            return;
        }

        await _play(song);
    }, [currentSong, isPlaying]);

    const togglePlay = useCallback(async () => {
        if (!audioRef.current || !currentSong) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (e) {
                console.error("Resume failed", e);
            }
        }
    }, [currentSong, isPlaying]);

    const getNextSong = useCallback(() => {
        if (!currentSong || queue.length === 0) return null;

        let attempt = 0;
        let nextIndex = queue.findIndex(s => s.id === currentSong.id);
        const maxAttempts = queue.length; // Prevent infinite loop

        while (attempt < maxAttempts) {
            if (mode === 'shuffle') {
                nextIndex = Math.floor(Math.random() * queue.length);
            } else {
                nextIndex = (nextIndex + 1) % queue.length;
            }

            const candidate = queue[nextIndex];
            if (candidate.source === 'tx' || candidate.source === 'wy') {
                return candidate;
            }
            attempt++;
        }
        return null; // No playable song found
    }, [currentSong, queue, mode]);

    const getPrevSong = useCallback(() => {
        if (!currentSong || queue.length === 0) return null;

        let attempt = 0;
        let prevIndex = queue.findIndex(s => s.id === currentSong.id);
        const maxAttempts = queue.length;

        while (attempt < maxAttempts) {
            if (mode === 'shuffle') {
                prevIndex = Math.floor(Math.random() * queue.length);
            } else {
                prevIndex = (prevIndex - 1 + queue.length) % queue.length;
            }

            const candidate = queue[prevIndex];
            if (candidate.source === 'tx' || candidate.source === 'wy') {
                return candidate;
            }
            attempt++;
        }
        return null;
    }, [currentSong, queue, mode]);

    const playNext = useCallback(() => {
        const next = getNextSong();
        if (next) _play(next);
    }, [getNextSong]);

    const playPrev = useCallback(() => {
        const prev = getPrevSong();
        if (prev) _play(prev);
    }, [getPrevSong]);

    const toggleMode = useCallback(() => {
        setMode(prev => prev === 'sequence' ? 'shuffle' : 'sequence');
    }, []);

    return (
        <PlayerContext.Provider
            value={{
                currentSong,
                isPlaying,
                volume,
                mode,
                queue,
                toast,
                playSong,
                togglePlay,
                setVolume,
                playNext,
                playPrev,
                toggleMode,
                audioRef,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}
