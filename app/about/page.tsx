'use client'

import { useEffect, useRef, useState } from 'react'
import CopyButton from '@/components/CopyButton';

export default function AboutPage() {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const sections = containerRef.current.querySelectorAll('.about-section');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const sectionIndex = entry.target.getAttribute('data-section-index');
              if (sectionIndex !== null) {
                setVisibleSections((prev) => new Set(prev).add(parseInt(sectionIndex)));
              }
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      let visibleIndex = 0;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const sectionIndex = section.getAttribute('data-section-index');
          if (sectionIndex !== null) {
            setTimeout(() => {
              setVisibleSections((prev) => new Set(prev).add(parseInt(sectionIndex)));
            }, visibleIndex * 100);
            visibleIndex++;
          }
        } else {
          observer.observe(section);
        }
      });

      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="about max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8" ref={containerRef}>
      <h1 className="text-2xl sm:text-2xl font-bold mb-2 sm:mb-4">
        <span className='uppercase'>Talk is cheap. Show me the code. 💻</span>
      </h1>
      <div className="space-y-4">
        {/* 自我介绍 */}
        <section
          data-section-index={0}
          className={`about-section bg-white dark:bg-gray-800/50 rounded-lg p-6 transition-all duration-800 ${
            visibleSections.has(0) ? 'post-visible' : 'post-hidden'
          }`}
        >
          <h2 className="text-xl font-semibold mb-3">👋 自我介绍</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            你好！我是14K，一名前端开发者，专注于 Web 开发和开源贡献。
            热衷于探索前沿技术，通过代码解决实际问题，创造有价值的产品。
          </p>
        </section>

        {/* 技术栈 */}
        <section
          data-section-index={1}
          className={`about-section bg-white dark:bg-gray-800/50 rounded-lg p-6 transition-all duration-800 ${
            visibleSections.has(1) ? 'post-visible' : 'post-hidden'
          }`}
        >
          <h2 className="text-xl font-semibold mb-3">🛠️ 技术栈</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">前端</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">Vue.js</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">React</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">Next.js</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">TypeScript</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">Tailwind CSS</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">Less</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">后端</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">Node.js</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">工具</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">Git</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">VS Code</span>
              </div>
            </div>
          </div>
        </section>

        {/* 开源项目 */}
        <section
          data-section-index={2}
          className={`about-section bg-white dark:bg-gray-800/50 rounded-lg p-6 transition-all duration-800 ${
            visibleSections.has(2) ? 'post-visible' : 'post-hidden'
          }`}
        >
          <h2 className="text-xl font-semibold mb-3">🚀 开源项目</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium">
                <a href="https://github.com/14Kay/totp-auth" target='_blank'>totp-auth</a>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">100% 纯 JavaScript 编写的 TOTP 身份验证器，无任何依赖项。可以在任何 JavaScript 环境中使用。</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium">
                <a href="https://github.com/14Kay/scripts" target='_blank'>scripts</a>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">放闲的没事写的脚本</p>
              
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium">
                <a href="https://github.com/14Kay/chrome-bili-ads-remove" target='_blank'>chrome-bili-ads-remove</a>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">用于移除B站广告的 Chrome 扩展</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium">
                <a href="https://github.com/14Kay/chrome-bilibili-dynamic-group-view" target='_blank'>chrome-bilibili-dynamic-group-view</a>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">用于B站动态分组浏览功能的 Chrome 扩展</p>
            </div>
          </div>
        </section>

        {/* 联系方式 */}
        <section
          data-section-index={3}
          className={`about-section bg-white dark:bg-gray-800/50 rounded-lg p-6 transition-all duration-800 ${
            visibleSections.has(3) ? 'post-visible' : 'post-hidden'
          }`}
        >
          <h2 className="text-xl font-semibold mb-3">📬 联系方式</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">GitHub:</span>
              <a href="https://github.com/14Kay" className="text-blue-500 hover:underline" target='_blank'>
                @14Kay
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <a href="mailto:rsndm.14k@gmail.com" className="text-blue-500 hover:underline" target='_blank'>
                rsndm.14k@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">LINUX.DO:</span>
              <a href="https://linux.do/u/14k/summary" className="text-blue-500 hover:underline" target='_blank'>
                @14K
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Bilibili:</span>
              <a href="https://space.bilibili.com/265725283" className="text-blue-500 hover:underline" target='_blank'>
                @网友14K
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">QQ:</span>
              <a href="http://wpa.qq.com/msgrd?v=3&uin=619113277&site=qq&menu=yes" className="text-blue-500 hover:underline" target='_blank'>
                619113277
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Steam:</span>
              <a href="https://steamcommunity.com/profiles/76561198268671173/" className="text-blue-500 hover:underline" target='_blank'>@14K</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">LOL(联盟一区):</span>
              <CopyButton text="14K#43629" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">三角洲行动:</span>
              <CopyButton text="185863596717415974114" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
