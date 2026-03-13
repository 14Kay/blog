'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import { usePlayer } from '@/app/context/PlayerContext'
import type { Song } from '@/lib/songs'

const NAV_ITEMS = [
	{ href: '/', label: '瞎哔哔' },
	{ href: '/songs', label: '我的歌单' },
	{ href: '/games', label: '游戏库' },
	{ href: '/friends', label: '友链' },
	{ href: '/about', label: '关于' },
]

interface NowPlayingTrack {
	name: string
	artist: string
	album: string
	image: string
	isNowPlaying: boolean
	matchedSong: Song | null
}

function AvatarWithNowPlaying() {
	const [track, setTrack] = useState<NowPlayingTrack | null>(null)
	const { playSong } = usePlayer()

	useEffect(() => {
		let cancelled = false

		async function fetchNowPlaying() {
			try {
				const res = await fetch('/api/now-playing', { cache: 'no-store' })
				const data = await res.json()
				if (!cancelled) setTrack(data?.isNowPlaying ? data : null)
			} catch {
				// 忽略错误
			}
		}

		fetchNowPlaying()
		const interval = setInterval(fetchNowPlaying, 30_000)
		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [])

	return (
		<div className="relative group">
			<div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden shrink-0 cursor-pointer">
				<Image src="/avatar.png" alt="avatar" width={36} height={36} className="w-full h-full object-cover" />
			</div>
			{track && (
				<>
					<span className="absolute -bottom-1 -right-1.5 flex items-end gap-[2px] h-3">
						<span className="w-[3px] rounded-full bg-green-500" style={{ height: '40%', animation: 'musicBar 0.8s ease-in-out infinite', animationDelay: '0ms' }} />
						<span className="w-[3px] rounded-full bg-green-500" style={{ height: '40%', animation: 'musicBar 0.8s ease-in-out infinite', animationDelay: '200ms' }} />
						<span className="w-[3px] rounded-full bg-green-500" style={{ height: '40%', animation: 'musicBar 0.8s ease-in-out infinite', animationDelay: '400ms' }} />
					</span>
					<div className="absolute top-9 left-0 z-50 flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-3 w-52 pointer-events-auto opacity-0 -translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-200 ease-out pointer-events-none group-hover:pointer-events-auto">
						<div className="absolute -top-3 left-0 right-0 h-3" />
						<p className="text-xs text-gray-400 dark:text-gray-500">14K 正在听</p>
						<div className="flex items-center gap-2">
							{track.image
								? <img src={track.image} alt={track.album} className="w-10 h-10 rounded-md object-cover shrink-0" />
								: <div className="w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0" />
							}
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium truncate">{track.name}</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 truncate">{track.artist}</p>
							</div>
							{track.matchedSong && (
								<button
									onClick={() => playSong(track.matchedSong!)}
									className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:scale-110 active:scale-95 transition-transform cursor-pointer"
									title="在歌单中播放"
								>
									<Play size={12} className="fill-current" />
								</button>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default function Header() {
	const pathname = usePathname()

	return (
		<header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-transparent backdrop-blur-md border-gray-200 z-50">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
				<AvatarWithNowPlaying />
				<nav className="flex gap-4 sm:gap-6 text-sm items-center">
					{NAV_ITEMS.map((item) => {
						const isActive = item.href === '/'
							? pathname === '/'
							: pathname?.startsWith(item.href) && (pathname === item.href || pathname[item.href.length] === '/')

						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'transition-colors duration-200 hover:text-blue-500',
									isActive
										? 'text-blue-600 dark:text-blue-400 font-bold'
										: 'text-gray-600 dark:text-gray-300'
								)}
							>
								{item.label}
							</Link>
						)
					})}
					<div className="flex items-center">
						<ThemeToggle />
					</div>
				</nav>
			</div>
		</header>
	)
}
