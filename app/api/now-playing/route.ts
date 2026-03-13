import { getNowPlaying } from '@/lib/lastfm'
import { getAllSongs } from '@/lib/songs'
import { NextResponse } from 'next/server'

export const revalidate = 0

function normalize(str: string) {
	return str.toLowerCase().replace(/[\s\-_]/g, '')
}

export async function GET() {
	const track = await getNowPlaying()
	if (!track) return NextResponse.json(null, { headers: { 'Cache-Control': 'no-store, max-age=0' } })

	const songs = getAllSongs()
	const trackName = normalize(track.name)
	const trackArtist = normalize(track.artist)

	const matched = songs.find(song => {
		const songName = normalize(song.name)
		const songArtist = normalize(song.artist)
		return songName === trackName ||
			(songName === trackName && songArtist.includes(trackArtist)) ||
			(songName.includes(trackName) && songArtist.includes(trackArtist))
	})

	return NextResponse.json({ ...track, matchedSong: matched ?? null }, {
		headers: { 'Cache-Control': 'no-store, max-age=0' }
	})
}
