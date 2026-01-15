import { getAllFriends } from '@/lib/friends'
import { getSteamProfile } from '@/lib/steam'
import FriendList from '@/components/FriendList'
import FriendCard from '@/components/FriendCard'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
	const profile = await getSteamProfile()
	return {
		title: profile ? `${profile.personaname}'s Friends` : 'Friends',
		description: '我的朋友们，一起分享生活与技术',
	}
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

			<div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
				<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
					交换友链
				</h2>

				<div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
					<p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-2xl">
						欢迎交换友链！请确保您的网站能够正常访问。
						<br />
						请将申请发送至 <a href="mailto:rsndm.14k@gmail.com" className="link text-blue-600 dark:text-blue-400 font-medium">rsndm.14k@gmail.com</a>
					</p>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
						{/* Application Format */}
						<div className="space-y-4">
							<h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-lg">
								<span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs">1</span>
								申请格式
							</h3>
							<div className="bg-white dark:bg-gray-950 rounded-xl p-5 font-mono text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 shadow-inner">
								<div className="space-y-2 select-all">
									<p><span className="text-purple-600 dark:text-purple-400">name:</span> 14K</p>
									<p><span className="text-purple-600 dark:text-purple-400">link:</span> https://14k.cc.cd/</p>
									<p><span className="text-purple-600 dark:text-purple-400">avatar:</span> https://14k.cc.cd/avatar.png</p>
									<p><span className="text-purple-600 dark:text-purple-400">bio:</span> Code for fun, run for life.</p>
								</div>
							</div>
							<p className="text-xs text-gray-400 pl-1">
								* 点击上方内容可直接复制。
							</p>
						</div>

						{/* My Info Preview */}
						<div className="space-y-4">
							<h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-lg">
								<span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs">2</span>
								我的信息
							</h3>

							{/* Preview Card mimicking FriendList style */}
							<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700/50 flex gap-4 items-center transform hover:scale-[1.02] transition-transform duration-300">
								<img
									src="https://14k.cc.cd/avatar.png"
									alt="14K"
									className="w-16 h-16 rounded-lg flex-shrink-0 bg-gray-100 dark:bg-gray-700 object-cover"
								/>
								<div className="flex-1 min-w-0">
									<h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">14K</h2>
									<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">Code for fun, run for life.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
