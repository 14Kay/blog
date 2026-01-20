import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "katex/dist/katex.min.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";

const googleSans = localFont({
	src: "./fonts/GoogleSans-Regular.ttf",
	variable: "--font-google-sans",
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: 'Code for fun, run for life.',
		template: '%s | Code for fun, run for life.',
	},
	description: '记录生活，分享音乐',
	keywords: ['博客', '前端开发', '音乐', 'Next.js', 'React', 'TypeScript'],
	authors: [{ name: '14K', url: 'https://github.com/14Kay' }],
	creator: '14K',
	openGraph: {
		type: 'website',
		locale: 'zh_CN',
		url: 'https://14k.cc.cd',
		title: 'Code for fun, run for life.',
		description: '记录生活，分享音乐',
		siteName: '14K',
	},
	twitter: {
		card: 'summary',
		title: 'Code for fun, run for life.',
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
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />

			</head>
			<body
				className={`${googleSans.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Header />
					<main className="pt-[60px]">
						{children}
					</main>
				</ThemeProvider>
			</body>
		</html>
	);
}
