'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Invoice {
  id: number;
  invoice_number: string;
  student: { full_name: string };
  amount_due: number;
  amount_paid: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid';
  due_date: string;
}

const statusVariant: Record<string, 'green' | 'yellow' | 'red'> = {
  paid: 'green', partial: 'yellow', unpaid: 'red',
};

export default function ParentFeesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => get<{ data: Invoice[]; summary: any }>('/finance/invoices'),
  });

  const invoices = data?.data ?? [];
  const s = data?.summary ?? {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fees & Payments</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Due" value={`₦${(s.total_due ?? 0).toLocaleString()}`} icon={<DollarSign size={20} />} color="blue" />
        <StatCard title="Total Paid" value={`₦${(s.total_paid ?? 0).toLocaleString()}`} icon={<CheckCircle size={20} />} color="green" />
        <StatCard title="Balance" value={`₦${(s.total_balance ?? 0).toLocaleString()}`} icon={<AlertCircle size={20} />} color="red" />
        <StatCard title="Overdue" value={s.overdue_count ?? 0} icon={<Clock size={20} />} color="yellow" />
      </div>

      {isLoading && <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />}

      <Card>
        <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['Invoice #', 'Student', 'Amount Due', 'Paid', 'Balance', 'Due Date', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-brand">{inv.invoice_number}</td>
                  <td className="px-4 py-3 font-medium">{inv.student?.full_name}</td>
                  <td className="px-4 py-3">₦{inv.amount_due.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-600">₦{inv.amount_paid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-500">₦{inv.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(inv.due_date)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[inv.status]} size="sm">{inv.status}</Badge>
                  </td>
                </tr>
              ))}
              {!isLoading && invoices.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No invoices found</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
