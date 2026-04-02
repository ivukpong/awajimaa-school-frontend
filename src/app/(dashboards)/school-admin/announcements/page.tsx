"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, del } from "@/lib/api";
import { Megaphone, PlusCircle, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface Announcement {
  id: number;
  title: string;
  body: string;
  audience: string[];
  is_published: boolean;
  published_at?: string;
  author: { name: string };
}

const AUDIENCE_OPTIONS = ["student", "teacher", "parent", "all"];
const emptyForm = {
  title: "",
  body: "",
  audience: [] as string[],
  is_published: false,
};

export default function AnnouncementsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const toggleAudience = (val: string) =>
    setForm((f) => ({
      ...f,
      audience: f.audience.includes(val)
        ? f.audience.filter((a) => a !== val)
        : [...f.audience, val],
    }));

  const createAnnouncement = useMutation({
    mutationFn: (f: typeof emptyForm) =>
      post("/announcements", {
        school_id: user?.school_id,
        title: f.title,
        body: f.body,
        audience: f.audience,
        is_published: f.is_published,
      }),
    onSuccess: () => {
      toast.success("Announcement created");
      qc.invalidateQueries({ queryKey: ["announcements"] });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Failed to create announcement"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => get<{ data: Announcement[] }>("/announcements"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => del(`/announcements/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const announcements = data?.data.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Announcements
        </h1>
        <Button
          leftIcon={<PlusCircle size={16} />}
          onClick={() => setShowForm(true)}
        >
          New Announcement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>New Announcement</CardTitle>
              <button onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Body *</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  rows={4}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Write your announcement..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Audience *
                </label>
                <div className="flex flex-wrap gap-3">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm capitalize cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.audience.includes(opt)}
                        onChange={() => toggleAudience(opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="is_published_ann"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({ ...form, is_published: e.target.checked })
                  }
                />
                <label htmlFor="is_published_ann" className="text-sm">
                  Publish immediately
                </label>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createAnnouncement.mutate(form)}
                  disabled={
                    createAnnouncement.isPending ||
                    !form.title ||
                    !form.body ||
                    form.audience.length === 0
                  }
                >
                  {createAnnouncement.isPending
                    ? "Posting..."
                    : "Post Announcement"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <Megaphone size={20} className="text-brand" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{a.title}</h3>
                      <Badge
                        variant={a.is_published ? "green" : "yellow"}
                        size="sm"
                      >
                        {a.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {a.body}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>By {a.author?.name}</span>
                      {a.published_at && <span>{timeAgo(a.published_at)}</span>}
                      <div className="flex gap-1">
                        {a.audience.map((aud) => (
                          <Badge key={aud} variant="blue" size="sm">
                            {aud}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost">
                    <Eye size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => confirm("Delete?") && remove.mutate(a.id)}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && announcements.length === 0 && (
          <Card>
            <CardContent className="text-center py-12 text-gray-400">
              No announcements yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
