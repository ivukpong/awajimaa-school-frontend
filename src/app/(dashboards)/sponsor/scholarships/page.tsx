"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { PlusCircle, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface ScholarshipItem {
  id: number;
  category: string;
  description: string;
  amount: number;
}
interface Scholarship {
  id: number;
  name: string;
  description: string;
  items: ScholarshipItem[];
  total_amount: number;
  students_count: number;
}

export default function SponsorScholarshipsPage() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["scholarships"],
    queryFn: () => get<{ data: Scholarship[] }>("/scholarships"),
  });

  const scholarships = data?.data.data ?? [];
  const totalAmount = scholarships.reduce((a, s) => a + s.total_amount, 0);
  const totalStudents = scholarships.reduce((a, s) => a + s.students_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Scholarships
        </h1>
        <Button leftIcon={<PlusCircle size={16} />}>New Scholarship</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Scholarships"
          value={scholarships.length}
          icon={<DollarSign size={20} />}
          color="blue"
        />
        <StatCard
          title="Total Value"
          value={`₦${totalAmount.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          color="green"
        />
        <StatCard
          title="Students Sponsoring"
          value={totalStudents}
          icon={<Users size={20} />}
          color="purple"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {scholarships.map((s) => (
          <Card key={s.id}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.description}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs text-gray-400">Total Value</p>
                    <p className="font-bold text-brand">
                      ₦{s.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="blue" size="sm">
                    {s.students_count} students
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {expanded === s.id && (
              <CardContent className="border-t dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  Items
                </h4>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {s.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {item.description}
                        </p>
                        <Badge variant="yellow" size="sm">
                          {item.category}
                        </Badge>
                      </div>
                      <span className="font-semibold text-sm">
                        ₦{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {!isLoading && scholarships.length === 0 && (
          <Card>
            <CardContent className="text-center py-12 text-gray-400">
              No scholarships yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
