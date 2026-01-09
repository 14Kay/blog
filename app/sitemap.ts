import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = 'https://blog.14kay.top'

	const posts = await getAllPosts()
	const postUrls = posts.map((post) => ({
		url: `${baseUrl}/#${post.id}`,
		lastModified: post.edited || post.date,
		changeFrequency: 'weekly' as const,
		priority: 0.8,
	}))

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/songs`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${baseUrl}/friends`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		...postUrls,
	]
}
