'use client';

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { TramFront } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import ThemeToggle from './ThemeToggle'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: '瞎哔哔' },
  { href: '/songs', label: '我的歌单' },
  { href: '/games', label: '游戏库' },
  { href: '/friends', label: '友链' },
  { href: '/about', label: '关于' }
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-transparent backdrop-blur-md border-gray-200 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
          <Image src="/avatar.png" alt="avatar" width={32} height={32} className="w-full h-full object-cover" />
        </div>
        <nav className="flex gap-4 sm:gap-6 text-sm items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item.href) && (pathname === item.href || pathname[item.href.length] === '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors duration-200 hover:text-blue-500",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-gray-600 dark:text-gray-300"
                )}
              >
                {item.label}
              </Link>
            )
          })}
          <div className="flex items-center">
            {/* <a
              href="https://www.travellings.cn/plain.html"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              title="Travellings"
            >
              <TramFront className="w-5 h-5" />
            </a> */}
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
