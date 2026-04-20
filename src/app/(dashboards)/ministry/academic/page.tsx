"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, BookOpen, Library, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import { get, post, postForm } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

type Tab = "academic" | "books" | "elibrary";

interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface Book {
  id: number;
  title: string;
  author?: string;
  subject?: string;
  class_level?: string;
  description?: string;
}

interface LibraryFile {
  id: number;
  title: string;
  subject?: string;
  class_level?: string;
  file_url?: string;
  created_at: string;
}

const CLASS_LEVELS = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SSS 1",
  "SSS 2",
  "SSS 3",
];

const EMPTY_YEAR = {
  name: "",
  start_date: "",
  end_date: "",
  is_current: false,
};
const EMPTY_BOOK = {
  title: "",
  author: "",
  subject: "",
  class_level: "",
  description: "",
};
const EMPTY_LIB = {
  title: "",
  subject: "",
  class_level: "",
  file: null as File | null,
};

export default function MinistryAcademicPage() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) ?? "academic",
  );

  // Academic Year state
  const [showYearModal, setShowYearModal] = useState(false);
  const [yearForm, setYearForm] = useState(EMPTY_YEAR);

  // Books state
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookForm, setBookForm] = useState(EMPTY_BOOK);

  // E-library state
  const [showLibModal, setShowLibModal] = useState(false);
  const [libForm, setLibForm] = useState(EMPTY_LIB);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /* ── Queries ───────────────────────────────────────────────── */
  const { data: yearsData, isLoading: loadingYears } = useQuery<{
    data: AcademicYear[];
  }>({
    queryKey: ["academic-years"],
    queryFn: () =>
      get<{ data: AcademicYear[] }>("/ministry/academic-years").then(
        (r) => r.data,
      ),
  });

  const { data: booksData, isLoading: loadingBooks } = useQuery<{
    data: Book[];
  }>({
    queryKey: ["ministry-books"],
    queryFn: () => get<{ data: Book[] }>("/ministry/books").then((r) => r.data),
    enabled: tab === "books",
  });

  const { data: libData, isLoading: loadingLib } = useQuery<{
    data: LibraryFile[];
  }>({
    queryKey: ["ministry-library"],
    queryFn: () =>
      get<{ data: LibraryFile[] }>("/ministry/library").then((r) => r.data),
    enabled: tab === "elibrary",
  });

  /* ── Mutations ─────────────────────────────────────────────── */
  const yearMutation = useMutation({
    mutationFn: (p: typeof EMPTY_YEAR) => post("/ministry/academic-years", p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["academic-years"] });
      toast.success("Academic year created.");
      setShowYearModal(false);
      setYearForm(EMPTY_YEAR);
    },
    onError: () => toast.error("Failed to create academic year."),
  });

  const bookMutation = useMutation({
    mutationFn: (p: typeof EMPTY_BOOK) => post("/ministry/books", p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-books"] });
      toast.success("Book added.");
      setShowBookModal(false);
      setBookForm(EMPTY_BOOK);
    },
    onError: () => toast.error("Failed to add book."),
  });

  const libMutation = useMutation({
    mutationFn: ({ title, subject, class_level, file }: typeof EMPTY_LIB) => {
      const fd = new FormData();
      fd.append("title", title);
      if (subject) fd.append("subject", subject);
      if (class_level) fd.append("class_level", class_level);
      if (file) fd.append("file", file);
      return postForm("/ministry/library", fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-library"] });
      toast.success("File uploaded.");
      setShowLibModal(false);
      setLibForm(EMPTY_LIB);
    },
    onError: () => toast.error("Failed to upload file."),
  });

  /* ── Submit handlers ───────────────────────────────────────── */
  function handleYearSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!yearForm.name) {
      toast.error("Name is required.");
      return;
    }
    yearMutation.mutate(yearForm);
  }

  function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookForm.title) {
      toast.error("Title is required.");
      return;
    }
    bookMutation.mutate(bookForm);
  }

  function handleLibSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!libForm.title) {
      toast.error("Title is required.");
      return;
    }
    if (!libForm.file) {
      toast.error("Please select a file.");
      return;
    }
    libMutation.mutate(libForm);
  }

  /* ── Data ──────────────────────────────────────────────────── */
  const years = yearsData?.data ?? [];
  const books = booksData?.data ?? [];
  const files = libData?.data ?? [];

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "academic",
      label: "Academic Year",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      key: "books",
      label: "Recommended Books",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      key: "elibrary",
      label: "E-Library",
      icon: <Library className="h-4 w-4" />,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Academic Resources
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage academic years, books, and the state e-library
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Academic Year Tab ─────────────────────────────────── */}
      {tab === "academic" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowYearModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Academic Year
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Academic Years ({years.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingYears ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : years.length === 0 ? (
                <p className="text-sm text-gray-500">No academic years yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                        <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                          Name
                        </th>
                        <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                          Start Date
                        </th>
                        <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                          End Date
                        </th>
                        <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {years.map((y) => (
                        <tr
                          key={y.id}
                          className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                            {y.name}
                          </td>
                          <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                            {y.start_date
                              ? new Date(y.start_date).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                            {y.end_date
                              ? new Date(y.end_date).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-3">
                            {y.is_current ? (
                              <Badge variant="green">Current</Badge>
                            ) : (
                              <Badge variant="gray">Past</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Recommended Books Tab ─────────────────────────────── */}
      {tab === "books" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowBookModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Book
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recommended Books ({books.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBooks ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : books.length === 0 ? (
                <p className="text-sm text-gray-500">No books added yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-1"
                    >
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {b.title}
                      </p>
                      {b.author && (
                        <p className="text-xs text-gray-500">by {b.author}</p>
                      )}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {b.subject && <Badge variant="blue">{b.subject}</Badge>}
                        {b.class_level && (
                          <Badge variant="gray">{b.class_level}</Badge>
                        )}
                      </div>
                      {b.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 pt-1">
                          {b.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── E-Library Tab ─────────────────────────────────────── */}
      {tab === "elibrary" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowLibModal(true)}>
              <Upload className="h-4 w-4 mr-2" /> Upload File
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>E-Library ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLib ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : files.length === 0 ? (
                <p className="text-sm text-gray-500">No files uploaded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                        <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                          Title
                        </th>
                        <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                          Subject
                        </th>
                        <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                          Level
                        </th>
                        <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                          Uploaded
                        </th>
                        <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                          Download
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((f) => (
                        <tr
                          key={f.id}
                          className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                            {f.title}
                          </td>
                          <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                            {f.subject ?? "—"}
                          </td>
                          <td className="py-3 pr-4">
                            {f.class_level ? (
                              <Badge variant="gray">{f.class_level}</Badge>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 pr-4 text-gray-500 text-xs">
                            {new Date(f.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            {f.file_url ? (
                              <a
                                href={f.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs"
                              >
                                Download
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Academic Year Modal ───────────────────────────────── */}
      <Modal
        open={showYearModal}
        onClose={() => {
          setShowYearModal(false);
          setYearForm(EMPTY_YEAR);
        }}
        title="New Academic Year"
      >
        <form onSubmit={handleYearSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="e.g. 2024/2025"
              value={yearForm.name}
              onChange={(e) =>
                setYearForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={yearForm.start_date}
                onChange={(e) =>
                  setYearForm((f) => ({ ...f, start_date: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={yearForm.end_date}
                onChange={(e) =>
                  setYearForm((f) => ({ ...f, end_date: e.target.value }))
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={yearForm.is_current}
              onChange={(e) =>
                setYearForm((f) => ({ ...f, is_current: e.target.checked }))
              }
              className="rounded"
            />
            Mark as current academic year
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowYearModal(false);
                setYearForm(EMPTY_YEAR);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={yearMutation.isPending}>
              {yearMutation.isPending ? "Saving..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Book Modal ────────────────────────────────────────── */}
      <Modal
        open={showBookModal}
        onClose={() => {
          setShowBookModal(false);
          setBookForm(EMPTY_BOOK);
        }}
        title="Add Recommended Book"
      >
        <form onSubmit={handleBookSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={bookForm.title}
              onChange={(e) =>
                setBookForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={bookForm.author}
                onChange={(e) =>
                  setBookForm((f) => ({ ...f, author: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={bookForm.subject}
                onChange={(e) =>
                  setBookForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Class Level
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={bookForm.class_level}
              onChange={(e) =>
                setBookForm((f) => ({ ...f, class_level: e.target.value }))
              }
            >
              <option value="">Select level...</option>
              {CLASS_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={bookForm.description}
              onChange={(e) =>
                setBookForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowBookModal(false);
                setBookForm(EMPTY_BOOK);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={bookMutation.isPending}>
              {bookMutation.isPending ? "Saving..." : "Add Book"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── E-Library Upload Modal ────────────────────────────── */}
      <Modal
        open={showLibModal}
        onClose={() => {
          setShowLibModal(false);
          setLibForm(EMPTY_LIB);
        }}
        title="Upload to E-Library"
      >
        <form onSubmit={handleLibSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              value={libForm.title}
              onChange={(e) =>
                setLibForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={libForm.subject}
                onChange={(e) =>
                  setLibForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Class Level
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                value={libForm.class_level}
                onChange={(e) =>
                  setLibForm((f) => ({ ...f, class_level: e.target.value }))
                }
              >
                <option value="">Select level...</option>
                {CLASS_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File (PDF / ebook) <span className="text-red-500">*</span>
            </label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {libForm.file ? (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {libForm.file.name}
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  Click to select a PDF or ebook file
                </p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.epub,.mobi"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setLibForm((f) => ({ ...f, file }));
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowLibModal(false);
                setLibForm(EMPTY_LIB);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={libMutation.isPending}>
              {libMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
