import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    try {
        // Fetch audio from external server (allows HTTP)
        // Server-side fetch doesn't have Mixed Content restrictions
        // Add browser-like headers to bypass anti-bot checks
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'identity',
                'Origin': 'https://y.qq.com',
                'Referer': 'https://y.qq.com/',
            },
            redirect: 'follow', // Follow redirects automatically
        })

        if (!response.ok) {
            console.error(`Proxy failed: ${response.status} for ${url}`)
            return NextResponse.json(
                { error: 'Failed to fetch audio', status: response.status, url },
                { status: response.status }
            )
        }

        const arrayBuffer = await response.arrayBuffer()

        // Return audio data with appropriate headers
        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
            },
        })
    } catch (error) {
        console.error('Audio proxy error:', error)
        return NextResponse.json(
            { error: 'Failed to proxy audio', details: String(error) },
            { status: 500 }
        )
    }
}
