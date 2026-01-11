import fs from 'node:fs'
import path from 'node:path'

export interface BilibiliVideoData {
	bvid: string
	title: string
	desc: string
	pic: string
	owner: {
		name: string
		mid: number
	}
	stat: {
		view: number
		like: number
		coin: number
		favorite: number
	}
	duration: number
}

const cacheDir = path.join(process.cwd(), 'data', '.bilibili-cache')

export async function getBilibiliVideoInfo(bvid: string): Promise<BilibiliVideoData | null> {
	// 检查缓存
	if (!fs.existsSync(cacheDir)) {
		fs.mkdirSync(cacheDir, { recursive: true })
	}

	const cacheFile = path.join(cacheDir, `${bvid}.json`)
	if (fs.existsSync(cacheFile)) {
		const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
		return cached
	}

	// 请求 B 站 API
	try {
		const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`)
		const json = await response.json()

		if (json.code !== 0 || !json.data) {
			console.error(`获取 B 站视频 ${bvid} 失败:`, json.message)
			return null
		}

		const data: BilibiliVideoData = {
			bvid: json.data.bvid,
			title: json.data.title,
			desc: json.data.desc,
			pic: json.data.pic,
			owner: {
				name: json.data.owner.name,
				mid: json.data.owner.mid,
			},
			stat: {
				view: json.data.stat.view,
				like: json.data.stat.like,
				coin: json.data.stat.coin,
				favorite: json.data.stat.favorite,
			},
			duration: json.data.duration,
		}

		// 保存缓存
		fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2))
		return data
	} catch (error) {
		console.error(`请求 B 站 API 失败 (${bvid}):`, error)
		return null
	}
}
