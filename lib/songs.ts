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
      // Regex to split by comma ONLY if not inside quotes
      const fields = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

      const [name, artist, album, id, source, cover, duration] = fields.map(field => {
        // Remove surrounding quotes if present
        if (field.startsWith('"') && field.endsWith('"')) {
          return field.slice(1, -1);
        }
        return field;
      });

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
