"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Download, Library, BookOpen } from "lucide-react";
import { useELibrary, type ApprovedBook } from "@/hooks/useRegulatoryResources";

function BookCard({ book }: { book: ApprovedBook }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="h-16 w-16 text-indigo-300" />
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 leading-snug">
          {book.title}
        </h3>
        {book.author && (
          <p className="text-xs text-gray-500 mt-1">{book.author}</p>
        )}
        {book.publisher && (
          <p className="text-xs text-gray-400">{book.publisher}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-1">
          <Badge variant="info" className="text-xs">
            {book.subject_name}
          </Badge>
          {book.academic_session && (
            <Badge variant="default" className="text-xs">
              {book.academic_session}
            </Badge>
          )}
        </div>

        <div className="mt-auto pt-3">
          <a
            href={book.file_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 transition-colors"
          >
            <Download className="h-4 w-4" />
            Read / Download
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ELibraryPage() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubject] = useState("");

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (subjectFilter) params.subject_name = subjectFilter;

  const { data, isLoading } = useELibrary(params);
  const books = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Library className="h-6 w-6 text-indigo-600" /> E-Library
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          State-approved digital books available to your school. Read or
          download any title below.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by title, author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Input
          placeholder="Filter by subject"
          value={subjectFilter}
          onChange={(e) => setSubject(e.target.value)}
          className="w-48"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700 aspect-[3/4]"
            />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Library className="h-14 w-14 mx-auto mb-4 opacity-40" />
          <p className="text-sm">
            No e-books are available yet. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
