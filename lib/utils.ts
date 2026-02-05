import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSongUrl = (song: { id: string, source: string }) => {
  const id = song.id.replace(/^(wy|tx|kg|mg)_/, '');
  const platform = song.source;
  if (platform === 'wy') return `https://api.viki.moe/ncm/songs/${id}/play`;
  if (platform === 'tx') return `https://api.viki.moe/qqm/songs/${id}/play`;
  return '';
};
