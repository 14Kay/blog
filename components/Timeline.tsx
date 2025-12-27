'use client';

import { Post } from '@/lib/posts';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image'

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

  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  return `${diffDays}天前`;
}

export default function Timeline({ posts }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lastImage, setLastImage] = useState<string>('');
  const [visiblePosts, setVisiblePosts] = useState<Set<string>>(new Set());

  const totalChars = posts.reduce((sum, post) =>
    sum + post.content.replace(/<[^>]*>/g, '').length, 0
  );

  // 保存最后选择的图片，避免重新加载
  useEffect(() => {
    if (selectedImage) {
      setLastImage(selectedImage);
    }
  }, [selectedImage]);

  const postsContent = useMemo(() => (
    <div className='container'>
      {posts.map((post, index) => (
        <div
          key={post.id}
          data-post-id={post.id}
          className={`post-card mb-3 p-6 bg-white dark:bg-gray-800/50 rounded-lg transition-all duration-800 ${
            visiblePosts.has(post.id) ? 'post-visible' : 'post-hidden'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <a className="font-bold" href={`#${posts.length - index}`}>#{posts.length - index}</a>
            <span>·</span>
            <span>{getTimeAgo(post.date)}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{new Date(post.date).toLocaleString('zh-CN')}</span>
          </div>
          <div
            className="prose prose-sm dark:prose-invert max-w-none leading-6 text-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      ))}
    </div>
  ), [posts, visiblePosts]);

  useEffect(() => {
    if (containerRef.current) {
      const images = containerRef.current.querySelectorAll('img');
      images.forEach(img => {
        img.loading = 'lazy';
        img.style.cursor = 'pointer';
        img.style.marginTop = '1rem';
        img.style.marginBottom = '1rem';
        img.onclick = () => {
          setSelectedImage(img.src);
        };
      });

      const postCards = containerRef.current.querySelectorAll('.post-card');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const postId = entry.target.getAttribute('data-post-id');
              if (postId) {
                setVisiblePosts((prev) => new Set(prev).add(postId));
              }
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
          const postId = card.getAttribute('data-post-id');
          if (postId) {
            setTimeout(() => {
              setVisiblePosts((prev) => new Set(prev).add(postId));
            }, visibleIndex * 100);
            visibleIndex++;
          }
        } else {
          // 不在视口内的卡片：使用 Observer 监听滚动
          observer.observe(card);
        }
      });

      return () => observer.disconnect();
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
        className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/20 transition-opacity duration-300 ${
          selectedImage ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSelectedImage(null)}
      >
        {lastImage && (
          <Image
            src={lastImage}
            alt="Last captured image"
            width={800}
            height={600}
            unoptimized
            className="max-w-[90vw] max-h-[90vh] w-auto h-auto"
          />
        )}
      </div>
    </>
  );
}
