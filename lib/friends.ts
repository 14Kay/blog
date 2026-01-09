import fs from 'node:fs'
import path from 'node:path'

export interface Friend {
	title: string
	url: string
	avatar: string
	description: string
	author: string
}

export async function getAllFriends(): Promise<Friend[]> {
	const filePath = path.join(process.cwd(), 'data', 'friends.json')
	const fileContents = fs.readFileSync(filePath, 'utf8')
	return JSON.parse(fileContents)
}
