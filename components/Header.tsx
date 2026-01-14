import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-transparent backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
          <Image src="/avatar.png" alt="avatar" width={32} height={32} className="w-full h-full object-cover" />
        </div>
        <nav className="flex gap-4 sm:gap-6 text-sm items-center">
          <Link href="/" className="hover:text-blue-500">瞎哔哔</Link>
          <Link href="/songs" className="hover:text-blue-500">我的歌单</Link>
          <Link href="/games" className="hover:text-blue-500">游戏库</Link>
          <Link href="/friends" className="hover:text-blue-500">友链</Link>
          <Link href="/about" className="hover:text-blue-500">关于</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
