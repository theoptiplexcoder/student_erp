'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@student-erp/ui';
import {
  Search,
  ArrowLeft,
  AlertOctagon,
  Bell,
  Lock,
  RefreshCw,
  IndianRupee,
  Phone,
  Mail,
  User,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Eye,
} from 'lucide-react';
import {
  useDefaulters,
  useDefaulterAction,
  useProcessOverdueInstallments,
  DefaulterStudent,
} from '@/hooks/api/admin/useFinance';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminBatches } from '@/hooks/api/admin/useBatches';

export default function DefaultersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedDefaulter, setSelectedDefaulter] = useState<DefaulterStudent | null>(null);

  // Queries
  const {
    data: defaulters,
    isLoading,
    refetch,
    isRefetching,
  } = useDefaulters({
    search: searchQuery || undefined,
    programId: selectedProgramId || undefined,
    batchId: selectedBatchId || undefined,
  });

  const { data: programsData } = useAdminPrograms(1, 100);
  const { data: batchesData } = useAdminBatches(1, 100);

  const actionMutation = useDefaulterAction();
  const processOverdueMutation = useProcessOverdueInstallments();

  const handleAction = async (
    studentId: string,
    action: 'SEND_REMINDER' | 'RESTRICT_PORTAL' | 'MARK_OVERDUE',
  ) => {
    try {
      const res = await actionMutation.mutateAsync({ studentId, action });
      alert(res?.message || 'Action completed successfully');
      refetch();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to execute action');
    }
  };

  const handleRunScan = async () => {
    try {
      const res = await processOverdueMutation.mutateAsync();
      alert(res?.message || 'Scan completed');
      refetch();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to scan overdue installments');
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalOverdueAmount = (defaulters || []).reduce((sum, d) => sum + d.overdueAmount, 0);

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/finance">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Defaulter Management</h1>
            <p className="text-muted-foreground text-sm">
              Identify overdue student accounts, send automated payment reminders, and apply policy
              restrictions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleRunScan}
            disabled={processOverdueMutation.isPending}
            className="flex items-center gap-2"
          >
            <AlertOctagon className="h-4 w-4" />
            {processOverdueMutation.isPending ? 'Scanning...' : 'Scan & Update Overdues'}
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Overdue Amount
            </CardTitle>
            <AlertOctagon className="text-destructive h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-destructive text-2xl font-bold">
              {formatCurrency(totalOverdueAmount)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Across all overdue fee installments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Defaulter Students
            </CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{defaulters?.length || 0} Accounts</div>
            <p className="text-muted-foreground mt-1 text-xs">Students with passed due dates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Enforcement Actions
            </CardTitle>
            <Lock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="mt-1 space-y-1 text-xs">
              <div className="text-muted-foreground">
                • Push instant payment reminder notifications
              </div>
              <div className="text-muted-foreground">• Enforce exam/portal clearance blockades</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              placeholder="Search student, roll no, email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
            >
              <option value="">All Programs</option>
              {(programsData?.data || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
            >
              <option value="">All Batches</option>
              {(batchesData?.data || []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Defaulters Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Overdue Accounts List</CardTitle>
          <CardDescription>
            Showing {defaulters?.length || 0} students with overdue fee payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b text-xs font-medium">
                <tr>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Program / Class</th>
                  <th className="pb-3">Overdue Amount</th>
                  <th className="pb-3">Overdue Since</th>
                  <th className="pb-3">Guardian Contact</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm">
                      Loading defaulters list...
                    </td>
                  </tr>
                ) : !defaulters?.length ? (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground py-8 text-center text-sm">
                      No overdue fee accounts found. All students are up to date!
                    </td>
                  </tr>
                ) : (
                  defaulters.map((d) => (
                    <tr key={d.studentId} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3">
                        <div className="text-foreground font-semibold">{d.name}</div>
                        <div className="text-muted-foreground font-mono text-xs">
                          {d.rollNumber} • {d.email}
                        </div>
                      </td>
                      <td className="py-3 text-xs">
                        <div className="font-medium">{d.program}</div>
                        {d.section && (
                          <div className="text-muted-foreground">Section: {d.section}</div>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="text-destructive font-bold">
                          {formatCurrency(d.overdueAmount)}
                        </div>
                        <div className="text-muted-foreground text-[11px]">
                          {d.overdueInstallmentsCount} installment(s)
                        </div>
                      </td>
                      <td className="py-3 text-xs">
                        <Badge variant="destructive" className="text-[10px]">
                          {d.daysOverdue} days overdue
                        </Badge>
                        <div className="text-muted-foreground mt-0.5 text-[11px]">
                          Due: {new Date(d.earliestDueDate).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="py-3 text-xs">
                        <div className="font-medium">{d.guardianName}</div>
                        <div className="text-muted-foreground text-[11px]">{d.guardianPhone}</div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDefaulter(d)}
                            className="h-8 px-2 text-xs"
                            title="View Overdue Breakdown"
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(d.studentId, 'SEND_REMINDER')}
                            className="h-8 px-2 text-xs"
                            title="Send Notification"
                          >
                            <Bell className="mr-1 h-3.5 w-3.5" /> Remind
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(d.studentId, 'RESTRICT_PORTAL')}
                            className="h-8 px-2 text-xs"
                            title="Restrict Access"
                          >
                            <Lock className="mr-1 h-3.5 w-3.5" /> Restrict
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Defaulter Detail Modal */}
      <Dialog
        open={!!selectedDefaulter}
        onOpenChange={(open) => !open && setSelectedDefaulter(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Defaulter Breakdown</DialogTitle>
          </DialogHeader>

          {selectedDefaulter && (
            <div className="space-y-4 text-sm">
              <div className="border-border bg-muted/20 rounded-lg border p-3">
                <h3 className="font-bold">{selectedDefaulter.name}</h3>
                <div className="text-muted-foreground mt-1 grid grid-cols-2 gap-1 text-xs">
                  <div>Roll No: {selectedDefaulter.rollNumber}</div>
                  <div>Program: {selectedDefaulter.program}</div>
                  <div>Email: {selectedDefaulter.email}</div>
                  <div>Phone: {selectedDefaulter.phone}</div>
                  <div>Guardian: {selectedDefaulter.guardianName}</div>
                  <div>Guardian Phone: {selectedDefaulter.guardianPhone}</div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold">Overdue Installments</h4>
                <div className="space-y-2">
                  {selectedDefaulter.plans.map((p, idx) => (
                    <div
                      key={idx}
                      className="border-border space-y-2 rounded-md border p-3 text-xs"
                    >
                      <div className="text-foreground font-semibold">
                        Academic Year: {p.academicYear}
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead className="text-muted-foreground border-b">
                          <tr>
                            <th className="pb-1">Installment #</th>
                            <th className="pb-1">Due Date</th>
                            <th className="pb-1">Total</th>
                            <th className="pb-1 text-right">Overdue Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {p.overdueInstallments.map((inst: any) => (
                            <tr key={inst.id}>
                              <td className="py-1 font-medium">
                                Installment {inst.installmentNumber}
                              </td>
                              <td className="text-muted-foreground py-1">
                                {new Date(inst.dueDate).toLocaleDateString('en-IN')}
                              </td>
                              <td className="py-1">{formatCurrency(inst.amount)}</td>
                              <td className="text-destructive py-1 text-right font-bold">
                                {formatCurrency(inst.amount - inst.amountPaid)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-border flex items-center justify-between border-t pt-3 font-bold">
                <span>Total Overdue:</span>
                <span className="text-destructive text-base">
                  {formatCurrency(selectedDefaulter.overdueAmount)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
