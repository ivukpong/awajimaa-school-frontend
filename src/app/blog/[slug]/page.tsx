"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Calendar,
  Tag,
  Newspaper,
} from "lucide-react";
import { useBlogPost } from "@/hooks/useBlog";
import { BlogCategory } from "@/types";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import { normalizeApiAssetUrl } from "@/lib/media";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_BADGE: Record<
  BlogCategory,
  "green" | "blue" | "purple" | "yellow" | "gray"
> = {
  achievement: "green",
  education: "blue",
  innovation: "purple",
  policy: "yellow",
  event: "gray",
};

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const { data, isLoading, isError } = useBlogPost(slug);

  const post = data?.data;
  const coverImageUrl = normalizeApiAssetUrl(post?.cover_image);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/blog"
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            All Stories
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        )}

        {isError && (
          <p className="text-center text-red-500 py-32">
            Story not found or unavailable.
          </p>
        )}

        {post && (
          <article>
            {/* Cover */}
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={post.title}
                className="w-full rounded-2xl object-cover max-h-80 mb-8"
              />
            ) : (
              <div className="w-full rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 h-48 flex items-center justify-center mb-8">
                <Newspaper className="h-16 w-16 text-indigo-200" />
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant={CATEGORY_BADGE[post.category]}>
                <Tag className="h-3 w-3 mr-1" />
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </Badge>
              {post.published_at && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.published_at)}
                </span>
              )}
              {post.author && (
                <span className="text-sm text-gray-400">
                  By {post.author.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-gray-600 font-medium border-l-4 border-indigo-400 pl-4 mb-8 italic">
                {post.excerpt}
              </p>
            )}

            {/* Body */}
            <div
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />

            {/* Source attribution */}
            {(post.source_credit || post.source_url) && (
              <div className="mt-10 rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-500">
                <span className="font-semibold text-gray-700">Source: </span>
                {post.source_url ? (
                  <a
                    href={post.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                  >
                    {post.source_credit ?? post.source_url}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  post.source_credit
                )}
              </div>
            )}
          </article>
        )}

        <div className="mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all stories
          </Link>
        </div>
      </main>
    </div>
  );
}
