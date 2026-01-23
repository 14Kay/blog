import fs from 'node:fs';
import path from 'node:path';

export interface Song {
  name: string;
  artist: string;
  album: string;
  id: string;
  source: string;
  cover: string;
  duration: string;
}

export function getAllSongs(): Song[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'songs.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').slice(1);

    return lines.map(line => {
      // CSV format: 歌曲名,艺术家,专辑名,id,歌曲来源名称,封面,时长
      // Handle potential commas in fields (naive implementation, assuming no commas in fields based on sample)
      const [name, artist, album, id, source, cover, duration] = line.split(',');
      return {
        name,
        artist,
        album,
        id,
        source,
        cover: cover?.replace('http://', 'https://'),
        duration
      };
    });
  } catch (error) {
    console.error('读取歌曲数据失败:', error);
    return [];
  }
}
