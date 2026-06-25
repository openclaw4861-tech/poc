"use client";

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { posts, getPhotoId } from './posts';
import type { BlogPost } from './posts';

const CATEGORIES = ['All', 'Leadership', 'Lean', 'Software', 'Equipment', 'Life', 'Business'];
const POSTS_PER_PAGE = 12;

const categoryEmojis: Record<string, string> = {
  Leadership: '👥',
  Lean: '🏭',
  Software: '💻',
  Equipment: '🔧',
  Life: '🌿',
  Business: '🏢',
};

const categoryColors: Record<string, string> = {
  Leadership: 'bg-indigo-100 text-indigo-800',
  Lean: 'bg-emerald-100 text-emerald-800',
  Software: 'bg-blue-100 text-blue-800',
  Equipment: 'bg-orange-100 text-orange-800',
  Life: 'bg-rose-100 text-rose-800',
  Business: 'bg-purple-100 text-purple-800',
};

export default function BlogPage() {
  const [filter, setFilter] = useState<string>('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (filter === 'All') return posts;
    return posts.filter(p => p.category === filter);
  }, [filter]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paged = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-amber-600">
              🔧 PGC Field Tools
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-amber-600 transition-colors">
                ← Back to Home
              </Link>
              <span className="text-amber-600 font-medium border-b-2 border-amber-500 pb-0.5">Blog</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-3">✍️ Division8 Blog</h1>
          <p className="text-xl text-amber-100 mb-6">Leadership, lean, software, and life in the curtainwall industry</p>
          <p className="text-amber-200 text-sm">{posts.length} posts spanning 2007–2018 · by Steve Watts</p>
          <div className="flex gap-2 flex-wrap mt-6">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setFilter(cat); setPage(1); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === cat ? 'bg-white text-amber-700' : 'bg-amber-500/40 text-white hover:bg-amber-400/60'
                }`}
              >
                {cat === 'All' ? '📋 All Posts' : `${categoryEmojis[cat] || '📄'} ${cat}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paged.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>

        {paged.length === 0 && (
          <div className="text-center py-16"><p className="text-gray-500 text-lg">No posts found in this category.</p></div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  page === p ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 hover:bg-amber-100 border border-gray-200'
                }`}
              >{p}</button>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">© 2026 Pacific Glazing Corporation · Division8 Blog</p>
          <p className="text-xs text-gray-500 mt-2">Originally published on division8.com</p>
        </div>
      </footer>
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  const photoId = getPhotoId(post.category, post.slug);
  const colorClass = categoryColors[post.category] || 'bg-gray-100 text-gray-800';
  const emoji = categoryEmojis[post.category] || '📄';

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          <img
            src={`https://images.unsplash.com/${photoId}?w=600&h=338&fit=crop&auto=format`}
            alt={post.category}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className={`absolute top-3 left-3 ${colorClass} text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1`}>
            <span>{emoji}</span>
            <span>{post.category}</span>
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">{post.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
          <div className="mt-4 text-amber-600 font-medium text-sm group-hover:text-amber-700 transition-colors">Read More →</div>
        </div>
      </div>
    </Link>
  );
}
