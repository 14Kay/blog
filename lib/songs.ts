import fs from 'node:fs';
import path from 'node:path';

export interface Song {
  name: string;
  artist: string;
  album: string;
}

export function getAllSongs(): Song[] {
  const filePath = path.join(process.cwd(), 'data', 'songs.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n').slice(1);

  return lines.map(line => {
    const [name, artist, album] = line.split(',');
    return { name, artist, album };
  });
}
