import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: '关于 | 14K',
	description: 'Talk is cheap. Show me the code. 前端开发者，热爱技术与开源',
}

export default function AboutLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return children
}
