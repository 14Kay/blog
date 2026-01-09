import { getAllFriends } from '@/lib/friends'
import FriendList from '@/components/FriendList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: '友链 | 14K',
	description: '我的朋友们，一起分享生活与技术',
}

export default async function FriendsPage() {
	const friends = await getAllFriends()

	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
			<h1 className="text-2xl sm:text-2xl font-bold mb-2 sm:mb-4">
				<span className="uppercase">Friends are treasures. 🤝</span>
			</h1>
			<p className="text-base text-gray-500 mb-6">共 {friends.length} 个友链</p>
			<FriendList friends={friends} />
		</div>
	)
}
