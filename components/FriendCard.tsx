'use client';

import Image from 'next/image';
import type { Friend } from '@/lib/friends';

interface FriendCardProps {
    friend: Friend;
    index?: number;
    isVisible?: boolean;
    className?: string; // Allow custom classes for positioning/margins
}

export default function FriendCard({ friend, index = 0, isVisible = true, className = '' }: FriendCardProps) {
    return (
        <a
            href={friend.url}
            target="_blank"
            rel="noopener noreferrer"
            data-friend-index={index}
            className={`group friend-card relative flex items-center gap-4 bg-white dark:bg-gray-800/40 rounded-xl p-4 border border-gray-200/60 dark:border-gray-700/50 transition-all duration-300  hover:-translate-y-1 hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                } ${className}`}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <Image
                    src={friend.avatar}
                    alt={friend.title}
                    width={56}
                    height={56}
                    className="rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {friend.title}
                    </h2>
                    {/* External Link Icon - Subtle fade in */}
                    <svg
                        className="w-4 h-4 text-gray-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {friend.description}
                </p>
            </div>
        </a>
    );
}
