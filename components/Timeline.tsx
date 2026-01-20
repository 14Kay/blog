'use client'

import { Post } from '@/lib/posts'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Zoom from 'react-medium-image-zoom'
import parse, { DOMNode, Element, domToReact } from 'html-react-parser'
import 'react-medium-image-zoom/dist/styles.css'

const BilibiliVideoCard = dynamic(() => import('./BilibiliVideoCard'), {
  loading: () => <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
})
const MusicCard = dynamic(() => import('./MusicCard'), {
  loading: () => <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
})

interface TimelineProps {
  posts: Post[];
}

function getTimeAgo(dates: string): string {
  const now = new Date();
  const postDate = new Date(dates);
  const diffMs = now.getTime() - postDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  return `${diffDays} 天前`;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];
  return `${year}-${month}-${day} ${hours}:${minutes} 周${weekday}`;
}

export default function Timeline({ posts }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const totalChars = posts.reduce((sum, post) =>
    sum + post.content.replace(/<[^>]*>/g, '').length, 0
  );

  // HTML Parser configuration to replace <img> with <Zoom> component
  const parseOptions = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element && domNode.name === 'img') {
        const { src, alt, class: className, ...rest } = domNode.attribs;
        return (
          <Zoom classDialog="custom-zoom-dialog">
            <img
              src={src}
              alt={alt}
              className={`${className || ''} rounded-lg cursor-zoom-in`}
              {...rest}
            />
          </Zoom>
        );
      }
    }
  };

  const postsContent = useMemo(() => (
    <div className='container'>
      {posts.map((post, index) => (
        <div
          key={post.id}
          data-post-id={post.id}
          className="post-card mb-3 p-6 bg-white dark:bg-gray-800/50 rounded-lg transition-all duration-800 post-hidden"
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <a className="font-bold" href={`#${posts.length - index}`}>#{posts.length - index}</a>
            <span>·</span>
            <TimeAgo key={post.date} date={post.date} />
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline" suppressHydrationWarning>{formatDateTime(post.date)}</span>
            {post.edited && (
              <>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline" suppressHydrationWarning>编辑于 {formatDateTime(post.edited)}</span>
              </>
            )}
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none leading-6 text-sm">
            {parse(post.content, parseOptions)}
          </div>

          {post.bilibiliVideo && (
            <BilibiliVideoCard video={post.bilibiliVideo} />
          )}
          {post.music && (
            <MusicCard music={post.music} />
          )}
        </div>
      ))}
    </div>
  ), [posts]);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const postCards = container.querySelectorAll('.post-card');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove('post-hidden')
              entry.target.classList.add('post-visible')
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      let visibleIndex = 0;
      postCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          // Cards in viewport: animate sequentially
          setTimeout(() => {
            card.classList.remove('post-hidden')
            card.classList.add('post-visible')
          }, visibleIndex * 100);
          visibleIndex++;
        } else {
          // Cards outside viewport: use observer
          observer.observe(card);
        }
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [posts]);

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8" ref={containerRef}>
        <h1 className="text-2xl sm:text-2xl font-bold mb-2 sm:mb-4"><span className='uppercase'>Life is cheap. Show me the post. 📄</span></h1>

        <p className="text-base text-gray-500 dark:text-gray-400 mb-6"> 共 {posts.length} 条 · {totalChars} 字</p>
        {postsContent}
      </div>
    </>
  );
}

function TimeAgo({ date }: { date: string }) {
  const [timeAgo, setTimeAgo] = useState(getTimeAgo(date));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeAgo(getTimeAgo(date));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [date]);

  return <span suppressHydrationWarning>{timeAgo}</span>;
}
