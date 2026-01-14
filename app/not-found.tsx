import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="relative">
        {/* Layered Text for Depth */}
        <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-gray-100 dark:text-gray-800/50 select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-gray-900 dark:bg-gray-100 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-gray-900 dark:bg-gray-100 rounded-full animate-bounce mx-2" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-gray-900 dark:bg-gray-100 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">
        这里空空如也
      </h2>

      <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm leading-relaxed">
        可能是链接输入有误，或者这篇内容已经因为过于害羞而躲起来了。
      </p>

      <Link
        href="/"
        className="group relative inline-flex items-center justify-center px-8 py-3 text-sm font-medium transition-all duration-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-600"
      >
        <span>返回首页</span>
        <svg
          className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  )
}
