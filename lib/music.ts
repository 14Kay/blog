import fs from 'node:fs'
import path from 'node:path'

export interface MusicData {
	id: string
	title: string
	artist: string
	album?: string
	pic?: string
	url: string
	source: string
	lyrics?: string
	bgGradient?: string
	textColor?: string
	waveform?: number[]
}

const cacheDir = path.join(process.cwd(), 'data', '.music-cache')


async function extractColorsFromImage(imageUrl: string): Promise<{ bgGradient: string; textColor: string }> {
	try {
		// Fetch image
		const response = await fetch(imageUrl)
		const arrayBuffer = await response.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		// Use sharp to process image (if available)
		try {
			const { default: sharp } = await import('sharp')
			const { data, info } = await sharp(buffer)
				.resize(100, 100, { fit: 'cover' })
				.raw()
				.toBuffer({ resolveWithObject: true })

			const colorMap = new Map<string, number>()

			// Sample and count colors
			for (let i = 0; i < data.length; i += info.channels) {
				const r = data[i]
				const g = data[i + 1]
				const b = data[i + 2]

				// Skip very dark or very light colors
				const brightness = (r + g + b) / 3
				if (brightness < 30 || brightness > 220) continue

				// Calculate saturation
				const max = Math.max(r, g, b)
				const min = Math.min(r, g, b)
				const saturation = max === 0 ? 0 : (max - min) / max

				// Skip low saturation (gray) colors
				if (saturation < 0.2) continue

				// Quantize to reduce similar colors
				const qr = Math.floor(r / 10) * 10
				const qg = Math.floor(g / 10) * 10
				const qb = Math.floor(b / 10) * 10
				const key = `${qr},${qg},${qb}`

				colorMap.set(key, (colorMap.get(key) || 0) + 1)
			}

			if (colorMap.size === 0) {
				return {
					bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					textColor: 'text-white'
				}
			}

			// Find most common saturated color
			let dominantColor = { r: 102, g: 126, b: 234, count: 0 }
			for (const [key, count] of colorMap.entries()) {
				if (count > dominantColor.count) {
					const [r, g, b] = key.split(',').map(Number)
					dominantColor = { r, g, b, count }
				}
			}

			const { r, g, b } = dominantColor

			// Create gradient
			const color1 = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`
			const color2 = `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`

			const bgGradient = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`

			// Calculate luminance for text color
			const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
			const textColor = luminance > 0.45 ? 'text-gray-900' : 'text-white'

			return { bgGradient, textColor }
		} catch (sharpError) {
			// Sharp not available, use default
			console.warn('Sharp not available, using default colors')
			return {
				bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				textColor: 'text-white'
			}
		}
	} catch (error) {
		console.error('Failed to extract colors:', error)
		return {
			bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			textColor: 'text-white'
		}
	}
}

async function generateWaveformData(audioUrl: string): Promise<number[] | undefined> {
	try {
		// For now, return undefined to let client generate waveform
		// Server-side audio processing would require additional dependencies
		// like ffmpeg or node-web-audio-api which are complex to set up
		return undefined
	} catch (error) {
		console.error('Failed to generate waveform:', error)
		return undefined
	}
}

export async function getMusicInfo(keyword: string, source: string): Promise<MusicData | null> {
	if (!fs.existsSync(cacheDir)) {
		fs.mkdirSync(cacheDir, { recursive: true })
	}

	const cacheKey = `${source}-${keyword}`
	const cacheFile = path.join(cacheDir, `${cacheKey}.json`)
	if (fs.existsSync(cacheFile)) {
		const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
		return cached
	}

	try {
		const response = await fetch(`https://music-dl.sayqz.com/api/?source=${source}&type=search&keyword=${encodeURIComponent(keyword)}&limit=1`)
		const json = await response.json()

		if (!json.data || json.data.length === 0) {
			console.error(`获取音乐 ${keyword} 失败`)
			return null
		}

		const item = json.data.results[0]

		// 获取歌词
		let lyrics: string | undefined
		try {
			// Upgrade HTTP to HTTPS for lyrics URL
			const secureLrcUrl = item.lrc?.replace(/^http:/, 'https:') || item.lrc
			const lrcResponse = await fetch(secureLrcUrl)
			lyrics = await lrcResponse.text()
		} catch (error) {
			console.error(`获取歌词失败 (${item.id}):`, error)
		}

		// 提取封面颜色
		let bgGradient: string | undefined
		let textColor: string | undefined
		if (item.pic) {
			const colors = await extractColorsFromImage(item.pic)
			bgGradient = colors.bgGradient
			textColor = colors.textColor
		}

		// Upgrade HTTP to HTTPS to avoid Mixed Content warnings
		const secureUrl = item.url?.replace(/^http:/, 'https:') || item.url
		const securePic = item.pic?.replace(/^http:/, 'https:') || item.pic

		const data: MusicData = {
			id: item.id,
			title: item.name,
			artist: item.artist,
			album: item.album,
			pic: securePic,
			url: secureUrl,
			source,
			lyrics,
			bgGradient,
			textColor,
		}

		fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2))
		return data
	} catch (error) {
		console.error(`请求音乐 API 失败 (${keyword}):`, error)
		return null
	}
}
