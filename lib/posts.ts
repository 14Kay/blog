import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import rehypeExternalLinks from 'rehype-external-links'
import { getBilibiliVideoInfo, type BilibiliVideoData } from './bilibili'

export interface Post {
	id: string
	date: string
	edited?: string
	content: string
	bilibiliVideo?: BilibiliVideoData
}

const postsDirectory = path.join(process.cwd(), 'data')

export async function getAllPosts(): Promise<Post[]> {
	try {
		const fileNames = fs.readdirSync(postsDirectory)
		const allPostsData = await Promise.all(
			fileNames
				.filter(fileName => fileName.endsWith('.md'))
				.map(async (fileName) => {
					const id = fileName.replace(/\.md$/, '')
					const fullPath = path.join(postsDirectory, fileName)
					const fileContents = fs.readFileSync(fullPath, 'utf8')
					const matterResult = matter(fileContents)
					const processedContent = await remark()
						.use(remarkGfm)
						.use(remarkMath)
						.use(remarkRehype)
						.use(rehypeKatex)
						.use(rehypePrettyCode, {
							theme: {
								light: 'one-light',
								dark: 'github-dark',
							},
						})
						.use(rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] })
						.use(rehypeStringify)
						.process(matterResult.content)
					const content = processedContent.toString()

					// 处理 B 站视频
					let bilibiliVideo: BilibiliVideoData | undefined
					if (matterResult.data.bvid) {
						bilibiliVideo = await getBilibiliVideoInfo(matterResult.data.bvid) || undefined
					}

					return {
						id,
						date: matterResult.data.date,
						edited: matterResult.data.edited,
						content,
						bilibiliVideo,
					}
				})
		)

		return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
	} catch (error) {
		console.error('读取文章数据失败:', error)
		return []
	}
}
