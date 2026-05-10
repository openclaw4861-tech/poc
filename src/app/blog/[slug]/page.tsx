"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { posts, getPhotoId } from '../posts';
import type { BlogPost } from '../posts';

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

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = posts.find(p => p.slug === slug);
  const photoId = post ? getPhotoId(post.category) : '';
  const colorClass = post ? categoryColors[post.category] || 'bg-gray-100 text-gray-800' : '';
  const emoji = post ? categoryEmojis[post.category] || '📄' : '';

  if (!post) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link href="/blog" className="text-amber-600 hover:text-amber-700 underline">← Back to all posts</Link>
        </div>
      </div>
    );
  }

  // Related posts: same category, different slug, max 3
  const related = posts.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-amber-600">🔧 PGC Field Tools</Link>
            <div className="flex items-center space-x-4">
              <Link href="/blog" className="text-gray-700 hover:text-amber-600 transition-colors">← Blog</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={`https://images.unsplash.com/photo-${photoId}?w=1200&h=450&fit=crop&auto=format`}
          alt={post.category}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className={`${colorClass} text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1`}>
                <span>{emoji}</span>
                <span>{post.category}</span>
              </span>
              <span className="text-gray-300 text-sm">{post.date}</span>
              <span className="text-gray-400 text-sm">·</span>
              <span className="text-gray-300 text-sm">{post.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{post.title}</h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-amber-600 transition-colors">Blog</Link>
          <span>/</span>
          <Link href={`/blog?filter=${post.category}`} className="hover:text-amber-600 transition-colors">{post.category}</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{post.title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
          {/* Category + meta row */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <span className={`${colorClass} text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1`}>
              <span>{emoji}</span>
              <span>{post.category}</span>
            </span>
            <span className="text-gray-400 text-sm">{post.date}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 text-sm">{post.readTime}</span>
          </div>

          {/* Post body */}
          <div
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Back link */}
          <div className="mt-12 pt-6 border-t border-gray-100">
            <Link href="/blog" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors">
              <span>←</span>
              <span>Back to all posts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map(rp => {
              const rpColor = categoryColors[rp.category] || 'bg-gray-100 text-gray-800';
              const rpEmoji = categoryEmojis[rp.category] || '📄';
              const rpPhoto = getPhotoId(rp.category);
              return (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="block group">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="relative h-32 overflow-hidden">
                      <img src={`https://images.unsplash.com/photo-${rpPhoto}?w=400&h=200&fit=crop&auto=format`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      <span className={`absolute top-2 left-2 ${rpColor} text-xs font-semibold px-2 py-0.5 rounded-full`}>{rpEmoji} {rp.category}</span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-1">{rp.date}</p>
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-amber-600 transition-colors">{rp.title}</h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">© 2026 Pacific Glazing Corporation · Division8 Blog</p>
          <p className="text-xs text-gray-500 mt-2">Originally published on division8.com</p>
        </div>
      </footer>

      <style jsx global>{`
        .prose-custom p { margin-bottom: 1rem; color: #374151; line-height: 1.8; font-size: 1.0625rem; }
        .prose-custom h2 { font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 2rem; margin-bottom: 0.75rem; }
        .prose-custom blockquote {
          border-left: 4px solid #f59e0b;
          padding: 0.75rem 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
          background: #fffbeb;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .prose-custom ul { margin-bottom: 1rem; }
        .prose-custom li { margin-bottom: 0.25rem; color: #374151; line-height: 1.7; }
        .prose-custom hr { margin: 2rem 0; border-color: #e5e7eb; }
        .prose-custom a { color: #d97706; text-decoration: underline; }
        .prose-custom a:hover { color: #b45309; }
      `}</style>
    </div>
  );
}
