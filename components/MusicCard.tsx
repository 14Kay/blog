'use client'

import { Music, Play, Pause, Volume2 } from 'lucide-react'
import { MusicData } from '@/lib/music'
import { useRef, useState, useEffect, useMemo } from 'react'
import Image from 'next/image'

interface MusicCardProps {
	music: MusicData
}

interface LyricLine {
	time: number
	text: string
}

function parseLyrics(lrc?: string): LyricLine[] {
	if (!lrc) return []
	const lines = lrc.split('\n')
	const parsed: LyricLine[] = []

	for (const line of lines) {
		const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
		if (match) {
			const minutes = parseInt(match[1])
			const seconds = parseInt(match[2])
			const ms = parseInt(match[3].padEnd(3, '0'))
			const time = minutes * 60 + seconds + ms / 1000
			const text = match[4].trim()
			if (text) parsed.push({ time, text })
		}
	}
	return parsed
}

export default function MusicCard({ music }: MusicCardProps) {
	const audioRef = useRef<HTMLAudioElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [volume, setVolume] = useState(() => {
		// Load volume from localStorage, default to 0.3
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('musicVolume')
			return saved ? parseFloat(saved) : 0.3
		}
		return 0.3
	})

	const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(40).fill(10))
	const audioContextRef = useRef<AudioContext | null>(null)
	const [bgGradient, setBgGradient] = useState<string>('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
	const [textColor, setTextColor] = useState<string>('text-white')

	const lyrics = useMemo(() => parseLyrics(music.lyrics), [music.lyrics])

	// Save volume to localStorage when it changes
	useEffect(() => {
		localStorage.setItem('musicVolume', volume.toString())
	}, [volume])

	const currentLyricIndex = useMemo(() => {
		return lyrics.findIndex((line, i) => {
			const nextLine = lyrics[i + 1]
			return currentTime >= line.time && (!nextLine || currentTime < nextLine.time)
		})
	}, [currentTime, lyrics])

	// Extract colors from cover image
	useEffect(() => {
		// Use cached colors if available (from server-side extraction)
		if (music.bgGradient && music.textColor) {
			setBgGradient(music.bgGradient)
			setTextColor(music.textColor)
			return
		}

		// Fallback: try client-side extraction (may fail due to CORS)
		if (!music.pic) {
			setBgGradient('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
			setTextColor('text-white')
			return
		}

		const img = document.createElement('img') as HTMLImageElement
		img.crossOrigin = 'anonymous'
		img.src = music.pic

		img.onload = () => {
			try {
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')
				if (!ctx) return

				canvas.width = 100
				canvas.height = 100
				ctx.drawImage(img, 0, 0, 100, 100)

				const imageData = ctx.getImageData(0, 0, 100, 100).data
				const colorMap = new Map<string, number>()

				// Sample and count colors
				for (let i = 0; i < imageData.length; i += 4) {
					const r = imageData[i]
					const g = imageData[i + 1]
					const b = imageData[i + 2]
					const a = imageData[i + 3]

					// Skip transparent pixels
					if (a < 128) continue

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
					setBgGradient('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
					setTextColor('text-white')
					return
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

				// Create richer gradient with color variations
				// Darken for color1, lighten for color2
				const color1 = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`
				const color2 = `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`

				setBgGradient(`linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`)

				// Calculate luminance for text color
				const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
				setTextColor(luminance > 0.45 ? 'text-gray-900' : 'text-white')
			} catch (e) {
				console.error('Failed to extract colors:', e)
				setBgGradient('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
				setTextColor('text-white')
			}
		}

		img.onerror = () => {
			setBgGradient('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
			setTextColor('text-white')
		}
	}, [music.pic, music.bgGradient, music.textColor])

	// Generate static waveform for the whole song
	useEffect(() => {
		if (!music.url) return

		let active = true;
		let observer: IntersectionObserver | null = null;
		const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
		audioContextRef.current = ctx;

		const generateWaveform = async () => {
			try {
				// Use server-generated waveform if available
				if (music.waveform && music.waveform.length > 0) {
					if (active) {
						setFrequencyData(new Uint8Array(music.waveform));
						console.log('Loaded waveform from server cache');
						return;
					}
				}

				// Check localStorage cache
				const cacheKey = `waveform_v3_${music.url}`;
				const cached = localStorage.getItem(cacheKey);

				if (cached) {
					try {
						const cachedData = JSON.parse(cached);
						if (active) {
							setFrequencyData(new Uint8Array(cachedData));
							console.log('Loaded waveform from localStorage');
							return;
						}
					} catch (e) {
						// Invalid cache, continue to generate
						localStorage.removeItem(cacheKey);
					}
				}

				// Fetch the entire audio file
				// First, get the final URL after redirects, then upgrade to HTTPS
				try {
					// Use HEAD request to follow redirects without downloading
					const headResponse = await fetch(music.url, {
						method: 'HEAD',
						redirect: 'follow'
					});

					// Get the final URL after all redirects
					let finalUrl = headResponse.url;

					// Upgrade HTTP to HTTPS to avoid Mixed Content
					if (finalUrl.startsWith('http://')) {
						finalUrl = finalUrl.replace('http://', 'https://');
						console.log('Upgraded URL to HTTPS:', finalUrl);
					}

					// Now fetch the actual audio data with HTTPS URL
					const response = await fetch(finalUrl);
					const arrayBuffer = await response.arrayBuffer();

					if (!active) return;

					// Decode to PCM data
					const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

					// Calculate peaks for 40 bars (Higher resolution)
					const channelData = audioBuffer.getChannelData(0);
					const bars = 40;
					const step = Math.ceil(channelData.length / bars);
					const rawData = new Float32Array(bars);

					// 1. Calculate RMS with larger context window
					// Use overlapping windows to capture overall energy distribution
					let maxRms = 0;
					let minRms = Infinity;

					for (let i = 0; i < bars; i++) {
						let sum = 0;
						const start = i * step;
						const end = Math.min(start + step, channelData.length);

						// Extend window to include neighboring samples for better context
						const windowStart = Math.max(0, start - Math.floor(step * 0.5));
						const windowEnd = Math.min(channelData.length, end + Math.floor(step * 0.5));
						const len = windowEnd - windowStart;

						if (len > 0) {
							for (let j = windowStart; j < windowEnd; j++) {
								sum += channelData[j] * channelData[j];
							}
							const rms = Math.sqrt(sum / len);
							rawData[i] = rms;
							if (rms > maxRms) maxRms = rms;
							if (rms < minRms) minRms = rms;
						} else {
							rawData[i] = 0;
						}
					}

					// Avoid flatline division
					if (minRms === Infinity) minRms = 0;
					const range = maxRms - minRms || 1;

					// 2. Adaptive Normalization and Exaggerate
					const tempBars = new Float32Array(bars);
					for (let i = 0; i < bars; i++) {
						const normalized = Math.max(0, (rawData[i] - minRms) / range);
						const exaggerated = Math.pow(normalized, 3.0);
						tempBars[i] = exaggerated * 255;
					}

					// 3. Enhanced Smoothing for fluid transitions
					const newData = new Uint8Array(bars);
					for (let i = 0; i < bars; i++) {
						const prev = tempBars[i - 1] || tempBars[i];
						const curr = tempBars[i];
						const next = tempBars[i + 1] || tempBars[i];
						const smoothed = prev * 0.15 + curr * 0.7 + next * 0.15;
						newData[i] = Math.max(3, Math.floor(smoothed));
					}

					if (active) {
						setFrequencyData(newData);
						// Save to cache
						try {
							localStorage.setItem(cacheKey, JSON.stringify(Array.from(newData)));
							console.log('Saved waveform to cache');
						} catch (e) {
							// localStorage might be full, ignore
							console.warn('Failed to cache waveform:', e);
						}
					}
				} catch (urlError) {
					// URL upgrade failed, this will be caught by outer catch
					console.warn('URL upgrade failed:', urlError);
					throw urlError;
				}
			} catch (err) {
				console.error("Failed to generate waveform:", err);
				if (active) {
					const randomData = new Uint8Array(40).map(() => Math.random() * 255);
					setFrequencyData(randomData);
				}
			}
		};

		const initObserver = () => {
			const element = document.getElementById(`music-card-${music.id || music.url}`);
			if (element) {
				observer = new IntersectionObserver((entries) => {
					if (entries[0].isIntersecting) {
						generateWaveform();
						observer?.disconnect();
					}
				});
				observer.observe(element);
			} else {
				// Fallback if element not found immediately
				generateWaveform();
			}
		};

		// Schedule observer initialization
		setTimeout(initObserver, 100);

		return () => {
			active = false;
			if (audioContextRef.current?.state !== 'closed') {
				audioContextRef.current?.close()
			}
			observer?.disconnect();
		}
	}, [music.url, music.waveform, music.id])

	useEffect(() => {
		if (!audioRef.current) return
		audioRef.current.volume = volume
	}, [volume])

	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return

		const updateTime = () => setCurrentTime(audio.currentTime)
		const updateDuration = () => setDuration(audio.duration)

		audio.addEventListener('timeupdate', updateTime)
		audio.addEventListener('loadedmetadata', updateDuration)

		return () => {
			audio.removeEventListener('timeupdate', updateTime)
			audio.removeEventListener('loadedmetadata', updateDuration)
		}
	}, [])

	const togglePlay = () => {
		if (!audioRef.current) return
		if (isPlaying) {
			audioRef.current.pause()
		} else {
			audioRef.current.play()
		}
		setIsPlaying(!isPlaying)
	}

	const formatTime = (time: number) => {
		const mins = Math.floor(time / 60)
		const secs = Math.floor(time % 60)
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!audioRef.current) return
		const rect = e.currentTarget.getBoundingClientRect()
		const percent = (e.clientX - rect.left) / rect.width
		audioRef.current.currentTime = percent * duration
	}

	return (
		<div
			id={`music-card-${music.id || music.url}`}
			className="w-full max-w-[250px] mx-0 backdrop-blur-md rounded-[1rem] p-4 overflow-hidden"
			style={{ background: bgGradient }}
		>
			{/* Cover Image & Play Button - Smaller & Left flow */}
			<div
				className="relative w-44 mx-auto aspect-square rounded-[1.25rem] overflow-hidden group cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
				onClick={(e) => {
					// Prevent play/pause when clicking volume slider
					if ((e.target as HTMLElement).closest('.volume-control')) {
						e.stopPropagation()
						return
					}
					togglePlay()
				}}
			>
				{music.pic ? (
					<Image
						src={music.pic}
						alt={music.title}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110"
						unoptimized
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
						<Music className="w-12 h-12 text-white/50" />
					</div>
				)}

				{/* Dark Overlay */}
				<div className={`absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 ${isPlaying ? 'bg-black/10' : ''}`} />

				{/* Play Button - Centered on Image */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className={`
						w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30
						flex items-center justify-center text-white
						transform transition-all duration-300
						${isPlaying ? 'scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100' : 'scale-100 opacity-100 shadow-[0_0_30px_rgba(0,0,0,0.3)]'}
					`}>
						{isPlaying ? (
							<Pause className="w-5 h-5 fill-current" />
						) : (
							<Play className="w-5 h-5 ml-0.5 fill-current" />
						)}
					</div>
				</div>

				{/* Volume Control - Hover to show */}
				<div className="volume-control absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<div className="flex items-center gap-2">
						<Volume2 className="w-3.5 h-3.5 text-white" />
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={volume}
							onChange={(e) => setVolume(parseFloat(e.target.value))}
							onClick={(e) => e.stopPropagation()}
							className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
						/>
					</div>
				</div>
			</div>

			{/* Info Area - Left Aligned */}
			<div className="mt-4 text-center space-y-1">
				<h3 className={`text-lg font-bold ${textColor} tracking-tight truncate px-1`}>
					{music.title}
				</h3>
				<p className={`text-xs ${textColor} opacity-70 font-medium truncate px-1`}>
					{music.artist}
				</p>
			</div>

			{/* Waveform / Progress Area */}
			<div className="mt-4 px-1 relative">
				{/* Current Time - Absolute Left */}
				<span className={`absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-medium ${textColor} opacity-60 font-mono tabular-nums`}>
					{formatTime(currentTime)}
				</span>

				{/* Interactive Waveform */}
				<div
					className="w-full flex items-center justify-center gap-[1.8px] h-8 cursor-pointer group select-none touch-none"
					onClick={handleProgressClick}
				>
					{Array.from({ length: 40 }).map((_, i) => {
						const progress = duration ? (currentTime / duration) : 0;
						const barProgress = i / 40;
						const isPlayed = barProgress < progress;
						const value = frequencyData[i] || 10;
						// Allow lower lows (3%) and higher highs (100%)
						const heightPercent = Math.max(3, (value / 255) * 100);

						return (
							<div
								key={i}
								className={`w-0.5 rounded-full transition-all duration-75 ${isPlayed
									? textColor === 'text-white' ? 'bg-white' : 'bg-gray-900'
									: textColor === 'text-white' ? 'bg-white/30' : 'bg-gray-900/30'
									}`}
								style={{
									height: `${heightPercent}%`,
								}}
							/>
						)
					})}
				</div>

				{/* Duration - Absolute Right */}
				<span className={`absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-medium ${textColor} opacity-60 font-mono tabular-nums`}>
					{formatTime(duration)}
				</span>
			</div>

			{/* Lyrics */}
			{lyrics.length > 0 && currentLyricIndex >= 0 && (
				<div className="mt-2 h-5 flex items-center justify-center overflow-hidden">
					<p className={`text-xs ${textColor} opacity-80 font-medium animate-fade-in-up truncate w-full text-center ml-1`}>
						{lyrics[currentLyricIndex].text}
					</p>
				</div>
			)}

			<audio
				ref={audioRef}
				src={music.url}
				crossOrigin="anonymous"
				onEnded={() => setIsPlaying(false)}
			/>
		</div>
	)
}
