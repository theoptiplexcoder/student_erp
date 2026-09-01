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
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@student-erp/ui';
import {
  Search,
  Plus,
  ArrowLeft,
  Receipt,
  Eye,
  Printer,
  CreditCard,
  Banknote,
  CheckCircle2,
  Clock,
  Filter,
  IndianRupee,
} from 'lucide-react';
import {
  usePayments,
  useRecordOfflinePayment,
  usePaymentReceipt,
  useFeePlans,
  PaymentMethod,
  PaymentStatus,
} from '@/hooks/api/admin/useFinance';
import { useAdminStudents } from '@/hooks/api/admin/useStudents';

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: 'Cash', value: 'CASH' },
  { label: 'UPI / QR', value: 'UPI' },
  { label: 'Debit / Credit Card', value: 'CARD' },
  { label: 'Bank Transfer / NEFT / RTGS', value: 'BANK_TRANSFER' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Demand Draft (DD)', value: 'DEMAND_DRAFT' },
  { label: 'Online Gateway', value: 'GATEWAY' },
];

export default function PaymentsTerminalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | ''>('');
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Queries
  const { data: payments, isLoading } = usePayments({
    paymentMethod: (selectedMethod as PaymentMethod) || undefined,
    status: (selectedStatus as PaymentStatus) || undefined,
  });

  const { data: receiptData, isLoading: receiptLoading } = usePaymentReceipt(
    selectedReceiptId || '',
  );

  const { data: studentsData } = useAdminStudents({ pageSize: 200 });
  const recordPaymentMutation = useRecordOfflinePayment();

  // Terminal Form State
  const [terminalForm, setTerminalForm] = useState({
    studentId: '',
    studentFeePlanId: '',
    amount: 10000,
    paymentMethod: 'CASH' as PaymentMethod,
    paymentDate: new Date().toISOString().split('T')[0],
    transactionReference: '',
    remarks: '',
  });

  // Query student fee plans when a student is selected in the terminal
  const { data: studentPlans } = useFeePlans({
    studentId: terminalForm.studentId || undefined,
  });

  const activePlan =
    studentPlans?.find((p) => p.id === terminalForm.studentFeePlanId) ||
    studentPlans?.find((p) => p.status === 'ACTIVE' || p.status === 'OVERDUE') ||
    studentPlans?.[0];

  const resetTerminalForm = () => {
    setTerminalForm({
      studentId: '',
      studentFeePlanId: '',
      amount: 10000,
      paymentMethod: 'CASH',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionReference: '',
      remarks: '',
    });
  };

  const handleOpenTerminal = () => {
    resetTerminalForm();
    setIsTerminalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalForm.studentId || !terminalForm.amount || terminalForm.amount <= 0) {
      alert('Please select a student and valid payment amount');
      return;
    }

    try {
      const payment = await recordPaymentMutation.mutateAsync({
        studentId: terminalForm.studentId,
        studentFeePlanId: activePlan?.id || undefined,
        amount: Number(terminalForm.amount),
        paymentMethod: terminalForm.paymentMethod,
        paymentDate: terminalForm.paymentDate || undefined,
        transactionReference: terminalForm.transactionReference || undefined,
        remarks: terminalForm.remarks || undefined,
      });

      setIsTerminalOpen(false);
      resetTerminalForm();
      if (payment?.id) {
        setSelectedReceiptId(payment.id);
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to record payment');
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredPayments = (payments || []).filter((p) => {
    const name = `${p.student?.user?.firstName || ''} ${p.student?.user?.lastName || ''}`;
    const roll = p.student?.rollNumber || p.student?.admissionNumber || '';
    const receipt = p.receiptNumber || '';
    const q = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      roll.toLowerCase().includes(q) ||
      receipt.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/finance">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Payment Terminal & Ledger
            </h1>
            <p className="text-muted-foreground text-sm">
              Record manual offline fee payments, distribute installment allocations, and print
              receipts.
            </p>
          </div>
        </div>
        <Button onClick={handleOpenTerminal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Record Offline Payment
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              placeholder="Search receipt #, student name, or roll no..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
            >
              <option value="">All Payment Modes</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PaymentStatus)}
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Payment Transactions</CardTitle>
          <CardDescription>Showing {filteredPayments.length} recorded payments</CardDescription>
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
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm">
                      Loading payments ledger...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-muted-foreground py-8 text-center text-sm">
                      No payment transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="text-foreground py-3 font-semibold">{p.receiptNumber}</td>
                      <td className="py-3">
                        <div className="font-medium">
                          {p.student?.user?.firstName} {p.student?.user?.lastName}
                        </div>
                        <div className="text-muted-foreground font-mono text-xs">
                          {p.student?.rollNumber || p.student?.admissionNumber || 'N/A'} •{' '}
                          {p.student?.program?.name || ''}
                        </div>
                      </td>
                      <td className="text-foreground py-3 font-bold">{formatCurrency(p.amount)}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-xs font-normal">
                          {p.paymentMethod}
                        </Badge>
                        {p.transactionReference && (
                          <div className="text-muted-foreground mt-0.5 max-w-[120px] truncate font-mono text-[10px]">
                            {p.transactionReference}
                          </div>
                        )}
                      </td>
                      <td className="text-muted-foreground py-3 text-xs">
                        {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={p.status === 'SUCCESS' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReceiptId(p.id)}
                          className="h-8 px-2 text-xs"
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

      {/* Record Offline Payment Modal */}
      <Dialog open={isTerminalOpen} onOpenChange={setIsTerminalOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offline Payment Terminal</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRecordPayment} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="studentSelectTerminal">Student *</Label>
              <select
                id="studentSelectTerminal"
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={terminalForm.studentId}
                onChange={(e) => setTerminalForm({ ...terminalForm, studentId: e.target.value })}
                required
              >
                <option value="">Select student...</option>
                {(studentsData?.data || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user.firstName} {s.user.lastName} (
                    {s.studentCode || s.admissionNumber || s.user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Display Active Dues info if student is chosen */}
            {activePlan && (
              <div className="border-border bg-muted/20 space-y-2 rounded-lg border p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Active Plan: {activePlan.academicYear.name}</span>
                  <Badge variant="outline">{activePlan.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Plan Fee:</span>
                  <span>{formatCurrency(activePlan.totalAmount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Outstanding Due:</span>
                  <span className="text-primary font-bold">
                    {formatCurrency(activePlan.totalAmount - (activePlan.amountPaid || 0))}
                  </span>
                </div>

                <div className="border-border border-t pt-2">
                  <span className="font-semibold">Pending Installments (FIFO Allocation):</span>
                  <div className="mt-1 space-y-1">
                    {activePlan.installments
                      .filter((i) => i.status !== 'PAID')
                      .map((inst) => (
                        <div
                          key={inst.id}
                          className="text-muted-foreground flex justify-between text-[11px]"
                        >
                          <span>
                            Inst #{inst.installmentNumber} (Due:{' '}
                            {new Date(inst.dueDate).toLocaleDateString('en-IN')})
                          </span>
                          <span>{formatCurrency(inst.amount - inst.amountPaid)} due</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="paymentAmount">Amount Paid (₹) *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min={1}
                  value={terminalForm.amount}
                  onChange={(e) =>
                    setTerminalForm({ ...terminalForm, amount: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <select
                  id="paymentMethod"
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  value={terminalForm.paymentMethod}
                  onChange={(e) =>
                    setTerminalForm({
                      ...terminalForm,
                      paymentMethod: e.target.value as PaymentMethod,
                    })
                  }
                  required
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={terminalForm.paymentDate}
                  onChange={(e) =>
                    setTerminalForm({ ...terminalForm, paymentDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="txRef">Reference / Cheque / UTR #</Label>
                <Input
                  id="txRef"
                  placeholder="e.g. UTR-882390192"
                  value={terminalForm.transactionReference}
                  onChange={(e) =>
                    setTerminalForm({ ...terminalForm, transactionReference: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="remarks">Remarks / Notes</Label>
                <Input
                  id="remarks"
                  placeholder="e.g. Paid in full at admissions desk"
                  value={terminalForm.remarks}
                  onChange={(e) => setTerminalForm({ ...terminalForm, remarks: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTerminalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={recordPaymentMutation.isPending}>
                {recordPaymentMutation.isPending ? 'Recording...' : 'Record Payment & Print'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Printable Receipt Modal */}
      <Dialog
        open={!!selectedReceiptId}
        onOpenChange={(open) => !open && setSelectedReceiptId(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Official Fee Receipt</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1 text-xs"
              >
                <Printer className="h-3.5 w-3.5" /> Print Receipt
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
                  <h3 className="font-bold">
                    {receiptData.institution?.name || 'Institution Admin'}
                  </h3>
                  <p className="text-muted-foreground text-xs">Fee Collection Department</p>
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
                    <span className="text-muted-foreground">Reference No: </span>
                    <span className="font-mono text-xs">{receiptData.transactionReference}</span>
                  </div>
                )}
              </div>

              {receiptData.allocations?.length > 0 && (
                <div className="border-border border-t pt-3">
                  <h4 className="mb-2 text-xs font-semibold">Allocated Installments</h4>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b">
                        <th className="pb-1">Installment #</th>
                        <th className="pb-1">Due Date</th>
                        <th className="pb-1 text-right">Amount Allocated</th>
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
                <span>Total Amount Paid:</span>
                <span className="text-primary text-base">{formatCurrency(receiptData.amount)}</span>
              </div>

              <div className="text-muted-foreground flex items-center justify-between pt-2 text-[11px]">
                <span>Status: {receiptData.status}</span>
                <span>System Verified Receipt</span>
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
