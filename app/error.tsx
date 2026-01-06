'use client'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">出错了</h1>
				<p className="text-gray-600 dark:text-gray-400 mb-6">
					{error.message || '发生了一个错误'}
				</p>
				<button
					onClick={reset}
					className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
				>
					重试
				</button>
			</div>
		</div>
	)
}
