import { fetch, ProxyAgent } from 'undici'

const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY
const LAST_FM_USER_NAME = process.env.LAST_FM_USER_NAME
const PROXY_URL = process.env.STEAM_PROXY || process.env.HTTPS_PROXY

const dispatcher = PROXY_URL ? new ProxyAgent(PROXY_URL) : undefined

export interface NowPlayingTrack {
	name: string
	artist: string
	album: string
	image: string
	isNowPlaying: boolean
}

export async function getNowPlaying(): Promise<NowPlayingTrack | null> {
	if (!LAST_FM_API_KEY || !LAST_FM_USER_NAME) return null

	try {
		const res = await fetch(
			`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LAST_FM_USER_NAME}&api_key=${LAST_FM_API_KEY}&format=json&limit=1`,
			{ dispatcher }
		)
		const data = await res.json() as any
		const tracks = data?.recenttracks?.track
		if (!tracks || tracks.length === 0) return null

		const track = Array.isArray(tracks) ? tracks[0] : tracks
		const isNowPlaying = track['@attr']?.nowplaying === 'true'

		return {
			name: track.name,
			artist: track.artist['#text'],
			album: track.album['#text'],
			image: track.image?.find((img: { size: string }) => img.size === 'medium')?.['#text'] || '',
			isNowPlaying,
		}
	} catch (error) {
		console.error('获取 Last.fm 当前播放失败:', error)
		return null
	}
}
