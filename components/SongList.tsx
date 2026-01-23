'use client';

import { useEffect, useRef, useState } from 'react';
import { Song } from '@/lib/songs';
import { Play, Pause, Music } from 'lucide-react';
import { usePlayer } from '@/app/context/PlayerContext';

interface SongListProps {
  songs: Song[];
}

export default function SongList({ songs }: SongListProps) {
  const [visibleSongs, setVisibleSongs] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Use global player context
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();

  useEffect(() => {
    if (containerRef.current) {
      const songCards = containerRef.current.querySelectorAll('.song-card');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const songIndex = entry.target.getAttribute('data-song-index');
              if (songIndex !== null) {
                setVisibleSongs((prev) => new Set(prev).add(parseInt(songIndex)));
              }
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      let visibleIndex = 0;
      songCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const songIndex = card.getAttribute('data-song-index');
          if (songIndex !== null) {
            setTimeout(() => {
              setVisibleSongs((prev) => new Set(prev).add(parseInt(songIndex)));
            }, visibleIndex * 100);
            visibleIndex++;
          }
        } else {
          observer.observe(card);
        }
      });

      return () => observer.disconnect();
    }
  }, [songs]);

  const handlePlayClick = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    playSong(song);
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {songs.map((song, index) => {
        const isCurrent = currentSong?.id === song.id;
        const playing = isCurrent && isPlaying;

        return (
          <div
            key={index}
            data-song-index={index}
            className={`song-card flex items-center p-4 bg-white dark:bg-gray-800/50 rounded-lg transition-all duration-800 hover:shadow-md cursor-pointer ${visibleSongs.has(index) ? 'post-visible' : 'post-hidden'
              } ${isCurrent ? 'ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
            onDoubleClick={() => playSong(song, songs)}
          >
            <div className="relative w-12 h-12 flex-shrink-0 mr-4 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
              {song.cover && song.source !== 'kw' && visibleSongs.has(index) ? (
                <img
                  src={song.cover}
                  alt={song.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (song.source === 'kw' || !song.cover) ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Music size={20} className="text-gray-400" />
                </div>
              ) : null}
              {/* Overlay for hover or active state */}
              <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${playing ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                {playing ? <Pause size={20} className="text-white fill-current" /> : <Play size={20} className="text-white fill-current" />}
              </div>
            </div>

            <div className="flex-grow min-w-0 mr-4">
              <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{song.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {song.artist} · {song.album}
              </div>
            </div>

            <div className="text-xs text-gray-400 font-mono flex-shrink-0">
              {song.duration}
            </div>
          </div>
        );
      })}
    </div>
  );
}
