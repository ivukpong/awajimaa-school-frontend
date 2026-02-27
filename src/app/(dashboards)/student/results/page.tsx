'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Result {
  id: number;
  subject: { name: string };
  term: { name: string };
  academic_year: { name: string };
  ca1: number; ca2: number; ca3: number; exam: number;
  total: number; grade: string;
}

const gradeColor: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  A: 'green', B: 'blue', C: 'yellow', D: 'yellow', E: 'red', F: 'red',
};

export default function StudentResultsPage() {
  const [yearId, setYearId] = useState('');
  const [termId, setTermId] = useState('');

  const { data: years } = useQuery({ queryKey: ['academic-years'], queryFn: () => get<any>('/academic/years') });
  const { data: terms } = useQuery({ queryKey: ['terms'], queryFn: () => get<any>('/academic/terms') });
  const { data, isLoading } = useQuery({
    queryKey: ['results', yearId, termId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (yearId) params.append('academic_year_id', yearId);
      if (termId) params.append('term_id', termId);
      return get<{ data: Result[] }>(`/results?${params}`);
    },
  });

  const results = data?.data ?? [];
  const avg = results.length ? Math.round(results.reduce((a, r) => a + r.total, 0) / results.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Results</h1>
        {results.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Average Score</p>
            <p className="text-2xl font-bold text-brand">{avg}%</p>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-4 flex gap-4 flex-wrap">
          {[
            { label: 'Academic Year', val: yearId, set: setYearId, items: years?.data ?? [] },
            { label: 'Term', val: termId, set: setTermId, items: terms?.data ?? [] },
          ].map(({ label, val, set, items }) => (
            <div key={label}>
              <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
              <select value={val} onChange={e => set(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                <option value="">All {label}s</option>
                {items.map((it: any) => <option key={it.id} value={it.id}>{it.name}</option>)}
              </select>
            </div>
          ))}
        </CardContent>
      </Card>

      {isLoading && <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />}

      {!isLoading && results.length === 0 && (
        <Card><CardContent className="text-center py-12 text-gray-400">No results found</CardContent></Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['Subject', 'Term', 'CA1', 'CA2', 'CA3', 'Exam', 'Total', 'Grade'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {results.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium">{r.subject?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{r.term?.name}</td>
                    <td className="px-4 py-3">{r.ca1}</td>
                    <td className="px-4 py-3">{r.ca2}</td>
                    <td className="px-4 py-3">{r.ca3}</td>
                    <td className="px-4 py-3">{r.exam}</td>
                    <td className="px-4 py-3 font-semibold">{r.total}</td>
                    <td className="px-4 py-3">
                      <Badge variant={gradeColor[r.grade] ?? 'yellow'} size="sm">{r.grade}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
