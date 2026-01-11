import Image from 'next/image'
import { BilibiliVideoData } from '@/lib/bilibili'

interface BilibiliVideoCardProps {
	video: BilibiliVideoData
}

function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const secs = seconds % 60
	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
	}
	return `${minutes}:${String(secs).padStart(2, '0')}`
}

function formatNumber(num: number): string {
	if (num >= 10000) {
		return `${(num / 10000).toFixed(1)}万`
	}
	return num.toString()
}

export default function BilibiliVideoCard({ video }: BilibiliVideoCardProps) {
	const picUrl = video.pic.replace(/^https?:/, 'https:')
	const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(picUrl)}`

	return (
		<a
			href={`https://www.bilibili.com/video/${video.bvid}`}
			target="_blank"
			rel="noopener noreferrer"
			className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors my-4 no-underline"
		>
			{/* 左侧封面 */}
			<div className="relative flex-shrink-0 w-40 h-24 rounded overflow-hidden">
				<Image
					src={proxyUrl}
					alt={video.title}
					fill
					className="object-cover"
					unoptimized
				/>
				<div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
					{formatDuration(video.duration)}
				</div>
			</div>

			{/* 右侧信息 */}
			<div className="flex-1 min-w-0 flex flex-col justify-between">
				<div>
					<h3 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-gray-100 mb-1">
						{video.title}
					</h3>
					{video.desc && (
						<p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
							{video.desc}
						</p>
					)}
				</div>
				<div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
					<span>{video.owner.name}</span>
					<span>·</span>
					<span>{formatNumber(video.stat.view)} 播放</span>
				</div>
			</div>
		</a>
	)
}
