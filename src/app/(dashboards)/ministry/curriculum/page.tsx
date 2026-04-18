"use client";
import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookMarked, Plus, FileText, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { get } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface Curriculum {
  id: number;
  title: string;
  description?: string;
  academic_session: string;
  term: string;
  school_types?: string[];
  class_levels?: string[];
  file_url?: string;
  file_name?: string;
  is_published: boolean;
  created_at: string;
  regulator?: { id: number; name: string };
}

interface ApprovedBook {
  id: number;
  title: string;
  author?: string;
  isbn?: string;
  subject_name?: string;
  academic_session?: string;
  class_levels?: string[];
  is_ebook: boolean;
  is_published: boolean;
  created_at: string;
}

const TERM_VARIANT: Record<string, "blue" | "green" | "yellow" | "purple"> = {
  first: "blue",
  second: "green",
  third: "yellow",
  full_year: "purple",
};

const TERM_LABELS: Record<string, string> = {
  first: "First Term",
  second: "Second Term",
  third: "Third Term",
  full_year: "Full Year",
};

const SCHOOL_TYPES = ["nursery", "primary", "secondary", "tertiary"];

const EMPTY_CURRICULUM_FORM = {
  title: "",
  description: "",
  academic_session: "",
  term: "first",
  school_types: [] as string[],
  class_levels: "",
  is_published: true,
};

const EMPTY_BOOK_FORM = {
  title: "",
  author: "",
  isbn: "",
  subject_name: "",
  academic_session: "",
  class_levels: "",
  is_ebook: false,
  is_published: true,
};

function postFormData(url: string, formData: FormData) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return fetch(`${baseUrl}${url}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (res) => {
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  });
}

export default function MinistryCurriculumPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"curricula" | "books">("curricula");

  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);

  const [curriculumForm, setCurriculumForm] = useState(EMPTY_CURRICULUM_FORM);
  const [bookForm, setBookForm] = useState(EMPTY_BOOK_FORM);

  const curriculumFileRef = useRef<HTMLInputElement>(null);
  const bookFileRef = useRef<HTMLInputElement>(null);

  const { data: curriculaData, isLoading: loadingCurricula } = useQuery<{
    data: Curriculum[];
  }>({
    queryKey: ["curricula"],
    queryFn: () =>
      get<{ data: Curriculum[] }>("/curricula").then((r) => r.data),
  });

  const { data: booksData, isLoading: loadingBooks } = useQuery<{
    data: ApprovedBook[];
  }>({
    queryKey: ["approved-books"],
    queryFn: () =>
      get<{ data: ApprovedBook[] }>("/approved-books").then((r) => r.data),
  });

  const createCurriculumMutation = useMutation({
    mutationFn: (fd: FormData) => postFormData("/curricula", fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["curricula"] });
      toast.success("Curriculum uploaded.");
      setShowCurriculumModal(false);
      setCurriculumForm(EMPTY_CURRICULUM_FORM);
    },
    onError: () => toast.error("Failed to upload curriculum."),
  });

  const createBookMutation = useMutation({
    mutationFn: (fd: FormData) => postFormData("/approved-books", fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approved-books"] });
      toast.success("Book added.");
      setShowBookModal(false);
      setBookForm(EMPTY_BOOK_FORM);
    },
    onError: () => toast.error("Failed to add book."),
  });

  function toggleSchoolType(type: string) {
    setCurriculumForm((prev) => ({
      ...prev,
      school_types: prev.school_types.includes(type)
        ? prev.school_types.filter((t) => t !== type)
        : [...prev.school_types, type],
    }));
  }

  function handleCurriculumSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!curriculumForm.title) return toast.error("Title is required.");
    if (!curriculumForm.academic_session)
      return toast.error("Academic session is required.");
    const file = curriculumFileRef.current?.files?.[0];
    if (!file) return toast.error("Please select a PDF/DOC file.");

    const fd = new FormData();
    fd.append("title", curriculumForm.title);
    fd.append("academic_session", curriculumForm.academic_session);
    fd.append("term", curriculumForm.term);
    fd.append("is_published", curriculumForm.is_published ? "1" : "0");
    if (curriculumForm.description)
      fd.append("description", curriculumForm.description);
    curriculumForm.school_types.forEach((t) => fd.append("school_types[]", t));
    if (curriculumForm.class_levels) {
      curriculumForm.class_levels
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((l) => fd.append("class_levels[]", l));
    }
    fd.append("file", file);
    createCurriculumMutation.mutate(fd);
  }

  function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookForm.title) return toast.error("Title is required.");

    const fd = new FormData();
    fd.append("title", bookForm.title);
    fd.append("is_published", bookForm.is_published ? "1" : "0");
    fd.append("is_ebook", bookForm.is_ebook ? "1" : "0");
    if (bookForm.author) fd.append("author", bookForm.author);
    if (bookForm.isbn) fd.append("isbn", bookForm.isbn);
    if (bookForm.subject_name) fd.append("subject_name", bookForm.subject_name);
    if (bookForm.academic_session)
      fd.append("academic_session", bookForm.academic_session);
    if (bookForm.class_levels) {
      bookForm.class_levels
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((l) => fd.append("class_levels[]", l));
    }
    const file = bookFileRef.current?.files?.[0];
    if (file) fd.append("file", file);
    createBookMutation.mutate(fd);
  }

  const curricula = curriculaData?.data ?? [];
  const books = booksData?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Curriculum & Books
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Approve and publish curricula, subjects and books for state schools
          </p>
        </div>
        {tab === "curricula" ? (
          <Button onClick={() => setShowCurriculumModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Upload Curriculum
          </Button>
        ) : (
          <Button onClick={() => setShowBookModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Book
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["curricula", "books"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t === "curricula" ? "Curricula" : "Approved Books"}
          </button>
        ))}
      </div>

      {/* Curricula Tab */}
      {tab === "curricula" && (
        <Card>
          <CardHeader>
            <CardTitle>Curricula ({curricula.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCurricula ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : curricula.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400">
                <FileText className="h-10 w-10 mb-3" />
                <p className="text-sm">No curricula uploaded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Title
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Session
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Term
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        School Types
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Published
                      </th>
                      <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                        File
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {curricula.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {c.title}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {c.academic_session}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={TERM_VARIANT[c.term] ?? "gray"}>
                            {TERM_LABELS[c.term] ?? c.term}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {c.school_types?.join(", ") || "All"}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={c.is_published ? "green" : "gray"}>
                            {c.is_published ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {c.file_url ? (
                            <a
                              href={c.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs"
                            >
                              {c.file_name ?? "Download"}
                            </a>
                          ) : (
                            "—"
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
      )}

      {/* Approved Books Tab */}
      {tab === "books" && (
        <Card>
          <CardHeader>
            <CardTitle>Approved Books ({books.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBooks ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400">
                <BookOpen className="h-10 w-10 mb-3" />
                <p className="text-sm">No books added yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Title
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Author
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Subject
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        Session
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                        eBook
                      </th>
                      <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {b.title}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {b.author ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {b.subject_name ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {b.academic_session ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={b.is_ebook ? "blue" : "gray"}>
                            {b.is_ebook ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={b.is_published ? "green" : "gray"}>
                            {b.is_published ? "Published" : "Draft"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Curriculum Modal */}
      <Modal
        open={showCurriculumModal}
        onClose={() => setShowCurriculumModal(false)}
        title="Upload Curriculum"
      >
        <form onSubmit={handleCurriculumSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={curriculumForm.title}
              onChange={(e) =>
                setCurriculumForm({ ...curriculumForm, title: e.target.value })
              }
              placeholder="e.g. Science Curriculum 2024/2025"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Academic Session *
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={curriculumForm.academic_session}
                onChange={(e) =>
                  setCurriculumForm({
                    ...curriculumForm,
                    academic_session: e.target.value,
                  })
                }
                placeholder="2024/2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Term *
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={curriculumForm.term}
                onChange={(e) =>
                  setCurriculumForm({ ...curriculumForm, term: e.target.value })
                }
              >
                <option value="first">First Term</option>
                <option value="second">Second Term</option>
                <option value="third">Third Term</option>
                <option value="full_year">Full Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              rows={2}
              value={curriculumForm.description}
              onChange={(e) =>
                setCurriculumForm({
                  ...curriculumForm,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              School Types
            </label>
            <div className="flex flex-wrap gap-3">
              {SCHOOL_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={curriculumForm.school_types.includes(type)}
                    onChange={() => toggleSchoolType(type)}
                    className="rounded"
                  />
                  <span className="capitalize text-gray-700 dark:text-gray-300">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Class Levels (comma separated)
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={curriculumForm.class_levels}
              onChange={(e) =>
                setCurriculumForm({
                  ...curriculumForm,
                  class_levels: e.target.value,
                })
              }
              placeholder="e.g. JSS1, JSS2, JSS3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File (PDF/DOC) *
            </label>
            <input
              ref={curriculumFileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="w-full text-sm text-gray-700 dark:text-gray-300"
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={curriculumForm.is_published}
              onChange={(e) =>
                setCurriculumForm({
                  ...curriculumForm,
                  is_published: e.target.checked,
                })
              }
              className="rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Publish immediately
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCurriculumModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCurriculumMutation.isPending}>
              {createCurriculumMutation.isPending ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Book Modal */}
      <Modal
        open={showBookModal}
        onClose={() => setShowBookModal(false)}
        title="Add Approved Book"
      >
        <form onSubmit={handleBookSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={bookForm.title}
              onChange={(e) =>
                setBookForm({ ...bookForm, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={bookForm.author}
                onChange={(e) =>
                  setBookForm({ ...bookForm, author: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ISBN
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={bookForm.isbn}
                onChange={(e) =>
                  setBookForm({ ...bookForm, isbn: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={bookForm.subject_name}
                onChange={(e) =>
                  setBookForm({ ...bookForm, subject_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Academic Session
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={bookForm.academic_session}
                onChange={(e) =>
                  setBookForm({ ...bookForm, academic_session: e.target.value })
                }
                placeholder="2024/2025"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Class Levels (comma separated)
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={bookForm.class_levels}
              onChange={(e) =>
                setBookForm({ ...bookForm, class_levels: e.target.value })
              }
              placeholder="e.g. JSS1, JSS2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Book File (optional)
            </label>
            <input
              ref={bookFileRef}
              type="file"
              accept=".pdf,.epub"
              className="w-full text-sm text-gray-700 dark:text-gray-300"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={bookForm.is_ebook}
                onChange={(e) =>
                  setBookForm({ ...bookForm, is_ebook: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">eBook</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={bookForm.is_published}
                onChange={(e) =>
                  setBookForm({ ...bookForm, is_published: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">
                Publish immediately
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowBookModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBookMutation.isPending}>
              {createBookMutation.isPending ? "Saving…" : "Add Book"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
