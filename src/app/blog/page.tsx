"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  ChevronRight,
  Loader2,
  Newspaper,
} from "lucide-react";
import { usePublicBlogPosts } from "@/hooks/useBlog";
import { BlogCategory } from "@/types";
import { Logo } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";

// ─── Category filter pills ────────────────────────────────────────────────────

const CATEGORIES: { label: string; value: BlogCategory | "" }[] = [
  { label: "All", value: "" },
  { label: "Achievement", value: "achievement" },
  { label: "Education", value: "education" },
  { label: "Innovation", value: "innovation" },
  { label: "Policy", value: "policy" },
  { label: "Event", value: "event" },
];

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

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  slug,
  title,
  excerpt,
  category,
  cover_image,
  published_at,
  source_credit,
}: {
  slug: string;
  title: string;
  excerpt?: string;
  category: BlogCategory;
  cover_image?: string;
  published_at?: string;
  source_credit?: string;
}) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {cover_image ? (
        <img
          src={cover_image}
          alt={title}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="h-44 w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Newspaper className="h-12 w-12 text-indigo-300" />
        </div>
      )}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="flex items-center justify-between">
          <Badge variant={CATEGORY_BADGE[category]}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
          {published_at && (
            <span className="text-xs text-gray-400">
              {formatDate(published_at)}
            </span>
          )}
        </div>
        <h2 className="text-base font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
          {title}
        </h2>
        {excerpt && (
          <p className="text-sm text-gray-500 line-clamp-3">{excerpt}</p>
        )}
        {source_credit && (
          <p className="text-xs text-gray-400 mt-auto">
            Source: {source_credit}
          </p>
        )}
        <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-1">
          Read more <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [category, setCategory] = useState<BlogCategory | "">("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const { data, isLoading, isError } = usePublicBlogPosts(
    category || undefined,
    q || undefined,
  );

  const posts = data?.data?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-12 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 mb-4">
            <BookOpen className="h-4 w-4" />
            Education News &amp; Stories
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Inspiring Stories from Nigerian Education
          </h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto text-base">
            Celebrating student achievements, policy changes, and innovations
            shaping the future of education in Nigeria.
          </p>

          {/* Search */}
          <form
            className="mt-6 flex max-w-md mx-auto gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQ(search);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (!e.target.value) setQ("");
                }}
                placeholder="Search stories…"
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Category filters */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${
                category === c.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        )}

        {isError && (
          <p className="text-center text-red-500 py-20">
            Failed to load posts. Please try again.
          </p>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <p className="text-center text-gray-400 py-20">No stories found.</p>
        )}

        {!isLoading && !isError && posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
