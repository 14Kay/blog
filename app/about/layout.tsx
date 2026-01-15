import type { Metadata } from 'next'
import { getSteamProfile } from '@/lib/steam'

export async function generateMetadata(): Promise<Metadata> {
	const profile = await getSteamProfile()
	return {
		title: profile ? `About ${profile.personaname}` : 'About',
		description: 'Talk is cheap. Show me the code. 前端开发者，热爱技术与开源',
	}
}

export default function AboutLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return children
}
