import { getAllSongs } from '@/lib/songs';
import SongList from '@/components/SongList';

export default async function SongsPage() {
  const songs = await getAllSongs();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-2xl font-bold mb-2 sm:mb-4">
        <span className='uppercase'>Life is cheap. Show me the music. 🎵</span>
      </h1>
      <p className="text-base text-gray-500 mb-6"> 共 {songs.length} 首</p>
      <SongList songs={songs} />
    </div>
  );
}
