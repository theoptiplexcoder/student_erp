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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@student-erp/ui';
import {
  IndianRupee,
  TrendingUp,
  AlertOctagon,
  Users2,
  Layers,
  Receipt,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import {
  useFinanceStats,
  useProcessOverdueInstallments,
  usePaymentReceipt,
} from '@/hooks/api/admin/useFinance';

export default function FinanceOverviewPage() {
  const { data: stats, isLoading, refetch, isRefetching } = useFinanceStats();
  const processOverdueMutation = useProcessOverdueInstallments();
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  const { data: receiptData, isLoading: receiptLoading } = usePaymentReceipt(
    selectedReceiptId || '',
  );

  const handleRunScan = async () => {
    try {
      await processOverdueMutation.mutateAsync();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const kpis = [
    {
      title: 'Total Revenue Expected',
      value: formatCurrency(stats?.totalExpected),
      description: 'Across all active fee plans',
      icon: TrendingUp,
      badge: 'Target',
      variant: 'default',
    },
    {
      title: 'Total Collected',
      value: formatCurrency(stats?.totalCollected),
      description: `${stats?.collectionRate || 0}% collection rate`,
      icon: IndianRupee,
      badge: `${stats?.collectionRate || 0}%`,
      variant: 'success',
    },
    {
      title: 'Pending Dues',
      value: formatCurrency(stats?.totalOutstanding),
      description: 'Outstanding uncollected balance',
      icon: Clock,
      badge: 'Pending',
      variant: 'warning',
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(stats?.overdueAmount),
      description: `${stats?.defaultersCount || 0} students with overdue fees`,
      icon: AlertOctagon,
      badge: `${stats?.defaultersCount || 0} defaulters`,
      variant: 'destructive',
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Finance & Fee Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Centralized fee structures, student fee plans, multi-channel collections, and defaulter
            tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            variant="outline"
            size="sm"
            onClick={handleRunScan}
            disabled={processOverdueMutation.isPending}
            className="flex items-center gap-2"
          >
            <AlertOctagon className="h-4 w-4" />
            {processOverdueMutation.isPending ? 'Processing...' : 'Run Overdue Scan'}
          </Button>

          <Link href="/admin/finance/payments">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Record Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                  <Icon className="text-foreground h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : kpi.value}</div>
                <p className="text-muted-foreground mt-1 text-xs">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Collection Progress Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Overall Collection Progress</CardTitle>
              <CardDescription>
                Collected {formatCurrency(stats?.totalCollected)} of{' '}
                {formatCurrency(stats?.totalExpected)}
              </CardDescription>
            </div>
            <span className="text-lg font-bold">{stats?.collectionRate || 0}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, stats?.collectionRate || 0))}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation Modules */}
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Finance Operations</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/finance/structures" className="group">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="bg-muted group-hover:bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                    <Layers className="text-foreground group-hover:text-primary h-5 w-5 transition-colors" />
                  </div>
                  <ArrowUpRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <CardTitle className="mt-3 text-base">Fee Structures</CardTitle>
                <CardDescription className="text-xs">
                  Create and manage tuition, hostel, transport, and custom fee component templates.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-muted-foreground text-xs font-medium">
                  {stats?.activeStructuresCount || 0} active structures
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/finance/plans" className="group">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="bg-muted group-hover:bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                    <Users2 className="text-foreground group-hover:text-primary h-5 w-5 transition-colors" />
                  </div>
                  <ArrowUpRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <CardTitle className="mt-3 text-base">Student Fee Plans</CardTitle>
                <CardDescription className="text-xs">
                  Assign fee templates to students or batches, schedule installments, and apply
                  waivers.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-muted-foreground text-xs font-medium">
                  Manage individual & batch plans
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/finance/payments" className="group">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="bg-muted group-hover:bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                    <Receipt className="text-foreground group-hover:text-primary h-5 w-5 transition-colors" />
                  </div>
                  <ArrowUpRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <CardTitle className="mt-3 text-base">Payment Terminal</CardTitle>
                <CardDescription className="text-xs">
                  Record cash, bank transfer, and DD payments, allocate to installments, and print
                  receipts.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-muted-foreground text-xs font-medium">
                  Collect payments & print receipts
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/finance/defaulters" className="group">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="bg-muted group-hover:bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                    <AlertOctagon className="text-foreground group-hover:text-primary h-5 w-5 transition-colors" />
                  </div>
                  <ArrowUpRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
                <CardTitle className="mt-3 text-base">Defaulters</CardTitle>
                <CardDescription className="text-xs">
                  Monitor overdue student accounts, send reminders, and manage fee restriction
                  policies.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-muted-foreground text-xs font-medium">
                  {stats?.defaultersCount || 0} accounts needing attention
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Payments Ledger */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            <CardDescription>Latest fee payment settlements recorded in the system</CardDescription>
          </div>
          <Link href="/admin/finance/payments">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              View all transactions <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b text-xs font-medium">
                <tr>
                  <th className="pb-3">Receipt No</th>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-sm">
                      Loading recent transactions...
                    </td>
                  </tr>
                ) : !stats?.recentPayments?.length ? (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground py-6 text-center text-sm">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  stats.recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 font-medium">{p.receiptNumber}</td>
                      <td className="py-3">
                        <div className="font-medium">{p.studentName}</div>
                        {p.rollNumber && (
                          <div className="text-muted-foreground text-xs">{p.rollNumber}</div>
                        )}
                      </td>
                      <td className="py-3 font-semibold">{formatCurrency(p.amount)}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          {p.paymentMethod}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground py-3 text-xs">
                        {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReceiptId(p.id)}
                          className="h-8 px-2"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" /> View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      <Dialog
        open={!!selectedReceiptId}
        onOpenChange={(open) => !open && setSelectedReceiptId(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Payment Receipt</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1"
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
            </DialogTitle>
          </DialogHeader>

          {receiptLoading ? (
            <div className="py-8 text-center text-sm">Loading receipt details...</div>
          ) : receiptData ? (
            <div
              className="border-border space-y-4 rounded-lg border p-4 text-sm"
              id="printable-receipt"
            >
              <div className="border-border flex justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold">{receiptData.institution?.name || 'Institution'}</h3>
                  <p className="text-muted-foreground text-xs">Official Fee Receipt</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">Receipt #: {receiptData.receiptNumber}</p>
                  <p className="text-muted-foreground text-xs">
                    Date: {new Date(receiptData.paymentDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Student Name: </span>
                  <span className="font-semibold">
                    {receiptData.student?.user?.firstName} {receiptData.student?.user?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Roll No / ID: </span>
                  <span className="font-semibold">
                    {receiptData.student?.rollNumber ||
                      receiptData.student?.admissionNumber ||
                      'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Program: </span>
                  <span className="font-semibold">
                    {receiptData.student?.program?.name || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Method: </span>
                  <span className="font-semibold">{receiptData.paymentMethod}</span>
                </div>
                {receiptData.transactionReference && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Transaction Ref: </span>
                    <span className="font-mono text-xs">{receiptData.transactionReference}</span>
                  </div>
                )}
              </div>

              {receiptData.allocations?.length > 0 && (
                <div className="border-border border-t pt-3">
                  <h4 className="mb-2 text-xs font-semibold">Installment Allocations</h4>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b">
                        <th className="pb-1">Installment #</th>
                        <th className="pb-1">Due Date</th>
                        <th className="pb-1 text-right">Allocated Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {receiptData.allocations.map((a: any) => (
                        <tr key={a.id}>
                          <td className="py-1">Installment {a.installment?.installmentNumber}</td>
                          <td className="text-muted-foreground py-1">
                            {a.installment?.dueDate
                              ? new Date(a.installment.dueDate).toLocaleDateString('en-IN')
                              : 'N/A'}
                          </td>
                          <td className="py-1 text-right font-medium">
                            {formatCurrency(a.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="border-border flex items-center justify-between border-t pt-3 font-bold">
                <span>Total Paid:</span>
                <span className="text-base">{formatCurrency(receiptData.amount)}</span>
              </div>

              <div className="text-muted-foreground flex items-center justify-between pt-2 text-[11px]">
                <span>Status: {receiptData.status}</span>
                <span>Computer generated receipt</span>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground py-4 text-center">Receipt not found</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
