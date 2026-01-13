import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import Header from "@/components/Header";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: '14K | Life & Music',
		template: '%s | 14K',
	},
	description: '记录生活，分享音乐',
	keywords: ['博客', '前端开发', '音乐', 'Next.js', 'React', 'TypeScript'],
	authors: [{ name: '14K', url: 'https://github.com/14Kay' }],
	creator: '14K',
	openGraph: {
		type: 'website',
		locale: 'zh_CN',
		url: 'https://blog.14kay.top',
		title: '14K | Life & Music',
		description: '记录生活，分享音乐',
		siteName: '14K',
	},
	twitter: {
		card: 'summary',
		title: '14K | Life & Music',
		description: '记录生活，分享音乐',
	},
	robots: {
		index: true,
		follow: true,
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Header />
				<main className="pt-16">
					{children}
				</main>
			</body>
		</html>
	);
}
