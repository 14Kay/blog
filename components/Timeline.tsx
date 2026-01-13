'use client'

import { Post } from '@/lib/posts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import BilibiliVideoCard from './BilibiliVideoCard'
import MusicCard from './MusicCard'

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lastImage, setLastImage] = useState<string>('');
  const [imageRect, setImageRect] = useState<DOMRect | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  const totalChars = posts.reduce((sum, post) =>
    sum + post.content.replace(/<[^>]*>/g, '').length, 0
  );

  // 保存最后选择的图片，避免重新加载
  useEffect(() => {
    if (selectedImage) {
      setLastImage(selectedImage);
      document.body.style.overflow = 'hidden';
      // Start with zoom-out state, then animate to zoom-in
      setIsZooming(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsZooming(true));
      });
    } else {
      document.body.style.overflow = '';
    }
  }, [selectedImage]);

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
            <span>{getTimeAgo(post.date)}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{formatDateTime(post.date)}</span>
            {post.edited && (
              <>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">编辑于 {formatDateTime(post.edited)}</span>
              </>
            )}
          </div>
          <div
            className="prose prose-sm dark:prose-invert max-w-none leading-6 text-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
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

      // Event delegation for image clicks
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG') {
          const img = target as HTMLImageElement;
          flushSync(() => {
            setImageRect(img.getBoundingClientRect());
          });
          setSelectedImage(img.src);
        }
      };
      container.addEventListener('click', handleClick);

      const images = container.querySelectorAll('.prose img')
      images.forEach(img => {
        const imgElement = img as HTMLImageElement
        imgElement.style.cursor = 'pointer'
        imgElement.style.marginTop = '1rem'
        imgElement.style.marginBottom = '1rem'
      })

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
          // 在视口内的卡片：使用 setTimeout 实现顺序动画
          setTimeout(() => {
            card.classList.remove('post-hidden')
            card.classList.add('post-visible')
          }, visibleIndex * 100);
          visibleIndex++;
        } else {
          // 不在视口内的卡片：使用 Observer 监听滚动
          observer.observe(card);
        }
      });

      return () => {
        container.removeEventListener('click', handleClick);
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

      <div
        className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/20 transition-opacity duration-300 ${selectedImage ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => {
          setIsZooming(false)
          setTimeout(() => setSelectedImage(null), 300)
        }}
      >
        {selectedImage && lastImage && imageRect && (
          <img
            src={lastImage}
            alt="放大图片"
            className="transition-all duration-300 ease-out"
            style={{
              width: isZooming ? 'auto' : `${imageRect.width}px`,
              height: isZooming ? 'auto' : `${imageRect.height}px`,
              maxWidth: isZooming ? '90vw' : 'none',
              maxHeight: isZooming ? '90vh' : 'none',
              transform: isZooming
                ? 'translate(0, 0) scale(1.5)'
                : `translate(${imageRect.left + imageRect.width / 2 - window.innerWidth / 2}px, ${imageRect.top + imageRect.height / 2 - window.innerHeight / 2}px)`,
              opacity: isZooming ? 1 : 0,
            }}
          />
        )}
      </div>
    </>
  );
}
