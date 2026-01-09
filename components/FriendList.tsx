'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Friend } from '@/lib/friends'

interface FriendListProps {
	friends: Friend[]
}

export default function FriendList({ friends }: FriendListProps) {
	const [visibleFriends, setVisibleFriends] = useState<Set<number>>(new Set())
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (containerRef.current) {
			const friendCards = containerRef.current.querySelectorAll('.friend-card')
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const friendIndex = entry.target.getAttribute('data-friend-index')
							if (friendIndex !== null) {
								setVisibleFriends((prev) => new Set(prev).add(parseInt(friendIndex)))
							}
						}
					})
				},
				{ threshold: 0.1, rootMargin: '50px' }
			)

			let visibleIndex = 0
			friendCards.forEach((card) => {
				const rect = card.getBoundingClientRect()
				if (rect.top < window.innerHeight && rect.bottom > 0) {
					const friendIndex = card.getAttribute('data-friend-index')
					if (friendIndex !== null) {
						setTimeout(() => {
							setVisibleFriends((prev) => new Set(prev).add(parseInt(friendIndex)))
						}, visibleIndex * 100)
						visibleIndex++
					}
				} else {
					observer.observe(card)
				}
			})

			return () => observer.disconnect()
		}
	}, [friends])

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4" ref={containerRef}>
			{friends.map((friend, index) => (
				<a
					key={index}
					href={friend.url}
					target="_blank"
					rel="noopener noreferrer"
					data-friend-index={index}
					className={`friend-card bg-white dark:bg-gray-800/50 rounded-lg p-6 transition-all duration-800 ${
						visibleFriends.has(index) ? 'post-visible' : 'post-hidden'
					}`}
				>
					<div className="flex gap-4 items-center">
						<Image
							src={friend.avatar}
							alt={friend.title}
							width={64}
							height={64}
							className="rounded-lg flex-shrink-0"
						/>
						<div className="flex-1 min-w-0">
							<h2 className="text-lg font-semibold mb-1 truncate">{friend.title}</h2>
							<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
								{friend.description}
							</p>
						</div>
					</div>
				</a>
			))}
		</div>
	)
}
