import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "katex/dist/katex.min.css";
import Header from "@/components/Header";

const googleSans = localFont({
	src: "./fonts/GoogleSans-Regular.ttf",
	variable: "--font-google-sans",
	display: "swap",
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
				className={`${googleSans.variable} antialiased`}
			>
				<Header />
				<main className="pt-[60px]">
					{children}
				</main>
			</body>
		</html>
	);
}
