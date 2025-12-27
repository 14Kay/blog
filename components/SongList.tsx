'use client';

import { useEffect, useRef, useState } from 'react';
import { Song } from '@/lib/songs';

interface SongListProps {
  songs: Song[];
}

export default function SongList({ songs }: SongListProps) {
  const [visibleSongs, setVisibleSongs] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

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
          // 在视口内的卡片：使用 setTimeout 实现顺序动画
          const songIndex = card.getAttribute('data-song-index');
          if (songIndex !== null) {
            setTimeout(() => {
              setVisibleSongs((prev) => new Set(prev).add(parseInt(songIndex)));
            }, visibleIndex * 100);
            visibleIndex++;
          }
        } else {
          // 不在视口内的卡片：使用 Observer 监听滚动
          observer.observe(card);
        }
      });

      return () => observer.disconnect();
    }
  }, [songs]);

  return (
    <div className="space-y-4" ref={containerRef}>
      {songs.map((song, index) => (
        <div
          key={index}
          data-song-index={index}
          className={`song-card mb-3 p-6 bg-white dark:bg-gray-800/50 rounded-lg transition-all duration-800 ${
            visibleSongs.has(index) ? 'post-visible' : 'post-hidden'
          }`}
        >
          <div className="text-sm font-medium">{song.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {song.artist} · {song.album}
          </div>
        </div>
      ))}
    </div>
  );
}
