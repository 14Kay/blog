'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Friend } from '@/lib/friends'

import FriendCard from './FriendCard'

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
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" ref={containerRef}>
			{friends.map((friend, index) => (
				<FriendCard
					key={index}
					friend={friend}
					index={index}
					isVisible={visibleFriends.has(index)}
				/>
			))}
		</div>
	)
}
