"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, del } from "@/lib/api";
import { Megaphone, PlusCircle, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

interface Announcement {
  id: number;
  title: string;
  body: string;
  audience: string[];
  is_published: boolean;
  published_at?: string;
  author: { name: string };
}

export default function AnnouncementsPage() {
  const qc = useQueryClient();

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
        <Button leftIcon={<PlusCircle size={16} />}>New Announcement</Button>
      </div>

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
