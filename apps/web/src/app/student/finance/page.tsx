'use client';

import React, { useState } from 'react';
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
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Label,
} from '@student-erp/ui';
import {
  IndianRupee,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Receipt,
  CreditCard,
  Printer,
  Eye,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  useStudentDues,
  useStudentPayments,
  useStudentReceipt,
  useInitiatePayment,
  useVerifyPayment,
} from '@/hooks/api/student/useStudentFinance';
import { FeeInstallment } from '@/hooks/api/admin/useFinance';

export default function StudentFinancePage() {
  const { data: duesData, isLoading: duesLoading, refetch: refetchDues } = useStudentDues();
  const {
    data: payments,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useStudentPayments();

  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const { data: receiptData, isLoading: receiptLoading } = useStudentReceipt(
    selectedReceiptId || '',
  );

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<FeeInstallment | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [gatewayStep, setGatewayStep] = useState<'DETAILS' | 'CHECKOUT' | 'SUCCESS'>('DETAILS');
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<'UPI' | 'CARD' | 'NET_BANKING'>(
    'UPI',
  );
  const [activePaymentId, setActivePaymentId] = useState<string>('');

  const initiateMutation = useInitiatePayment();
  const verifyMutation = useVerifyPayment();

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-xs text-green-700 dark:text-green-400"
          >
            Paid
          </Badge>
        );
      case 'PARTIAL':
        return (
          <Badge
            variant="outline"
            className="border-amber-500 text-xs text-amber-700 dark:text-amber-400"
          >
            Partially Paid
          </Badge>
        );
      case 'OVERDUE':
        return (
          <Badge variant="destructive" className="text-xs">
            Overdue
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Pending
          </Badge>
        );
    }
  };

  const handleOpenPay = (inst?: FeeInstallment) => {
    if (inst) {
      setSelectedInstallment(inst);
      setPayAmount(inst.amount - inst.amountPaid);
    } else {
      setSelectedInstallment(null);
      const activePlan = duesData?.feePlans?.[0];
      const remaining = activePlan ? activePlan.balanceDue : 0;
      setPayAmount(remaining);
    }
    setGatewayStep('DETAILS');
    setIsPayModalOpen(true);
  };

  const handleProceedToGateway = async () => {
    if (!duesData?.feePlans?.length || payAmount <= 0) return;

    try {
      const activePlan = duesData.feePlans[0];
      const res = await initiateMutation.mutateAsync({
        studentFeePlanId: activePlan.id,
        amount: payAmount,
        installmentIds: selectedInstallment ? [selectedInstallment.id] : undefined,
        gatewayProvider: 'RAZORPAY_MOCK',
      });

      setActivePaymentId(res.paymentId);
      setGatewayStep('CHECKOUT');
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    try {
      await verifyMutation.mutateAsync({
        paymentId: activePaymentId,
        gatewayPaymentId: `pay_mock_${Date.now()}`,
        status: 'SUCCESS',
      });

      setGatewayStep('SUCCESS');
      refetchDues();
      refetchPayments();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Payment verification failed');
    }
  };

  const activePlan = duesData?.feePlans?.[0];

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Fees & Dues</h1>
          <p className="text-muted-foreground text-sm">
            View your fee structure, installment schedule, download receipts, and pay online.
          </p>
        </div>
        {activePlan && activePlan.balanceDue > 0 && (
          <Button onClick={() => handleOpenPay()} className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Pay Outstanding Fees
          </Button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Academic Fee
            </CardTitle>
            <Layers className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {duesLoading ? '...' : formatCurrency(duesData?.summary?.totalFee)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {activePlan?.academicYear?.name || 'Current Year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Amount Paid
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {duesLoading ? '...' : formatCurrency(duesData?.summary?.totalPaid)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Verified payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Remaining Balance
            </CardTitle>
            <IndianRupee className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-primary text-2xl font-bold">
              {duesLoading ? '...' : formatCurrency(duesData?.summary?.totalOutstanding)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {duesData?.summary?.totalOutstanding === 0
                ? 'All dues cleared!'
                : 'Pending settlement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Next Due Date
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {duesLoading
                ? '...'
                : duesData?.summary?.nextUpcomingInstallment?.dueDate
                  ? new Date(duesData.summary.nextUpcomingInstallment.dueDate).toLocaleDateString(
                      'en-IN',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      },
                    )
                  : 'None Pending'}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {duesData?.summary?.hasOverdue ? (
                <span className="text-destructive font-semibold">Overdue warning</span>
              ) : (
                'Upcoming installment'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="installments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="installments">Installment Schedule</TabsTrigger>
          <TabsTrigger value="breakdown">Fee Breakdown</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        {/* Tab 1: Installments */}
        <TabsContent value="installments" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Installment Schedule</CardTitle>
              <CardDescription>
                Track your payment deadlines and installment statuses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground border-b text-xs font-medium">
                    <tr>
                      <th className="pb-3">Installment</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3">Amount Paid</th>
                      <th className="pb-3">Balance</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {duesLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-sm">
                          Loading installments...
                        </td>
                      </tr>
                    ) : !activePlan?.installments?.length ? (
                      <tr>
                        <td colSpan={7} className="text-muted-foreground py-8 text-center text-sm">
                          No installment schedule assigned yet.
                        </td>
                      </tr>
                    ) : (
                      activePlan.installments.map((inst) => {
                        const balance = inst.amount - inst.amountPaid;
                        const isPayable = inst.status !== 'PAID';

                        return (
                          <tr key={inst.id} className="hover:bg-muted/40 transition-colors">
                            <td className="text-foreground py-3 font-semibold">
                              Installment {inst.installmentNumber}
                            </td>
                            <td className="text-muted-foreground py-3 text-xs">
                              {new Date(inst.dueDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3 font-medium">{formatCurrency(inst.amount)}</td>
                            <td className="py-3 font-medium text-green-700 dark:text-green-400">
                              {formatCurrency(inst.amountPaid)}
                            </td>
                            <td className="text-foreground py-3 font-bold">
                              {formatCurrency(balance)}
                            </td>
                            <td className="py-3">{getStatusBadge(inst.status)}</td>
                            <td className="py-3 text-right">
                              {isPayable ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenPay(inst)}
                                  className="h-8 px-3 text-xs"
                                >
                                  Pay Now
                                </Button>
                              ) : (
                                <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                  ✓ Cleared
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Breakdown */}
        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Fee Structure Breakdown</CardTitle>
              <CardDescription>
                Detailed itemization of academic, facility, and administrative components.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground border-b text-xs font-medium">
                    <tr>
                      <th className="pb-2">Component</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {!activePlan?.components?.length ? (
                      <tr>
                        <td colSpan={3} className="text-muted-foreground py-6 text-center text-sm">
                          Standard fee plan breakdown.
                        </td>
                      </tr>
                    ) : (
                      activePlan.components.map((c, i) => (
                        <tr key={i}>
                          <td className="py-2.5 font-medium">{c.name}</td>
                          <td className="text-muted-foreground py-2.5 text-xs">{c.type}</td>
                          <td className="py-2.5 text-right font-semibold">
                            {formatCurrency(c.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Waivers list */}
              {activePlan?.waivers && activePlan.waivers.length > 0 && (
                <div className="border-border space-y-2 rounded-lg border p-4">
                  <h4 className="text-xs font-semibold">Scholarships & Fee Concessions</h4>
                  <div className="space-y-1">
                    {activePlan.waivers.map((w) => (
                      <div key={w.id} className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">{w.title}</span>
                        <span className="font-bold text-green-700 dark:text-green-400">
                          -{formatCurrency(w.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-border flex items-center justify-between border-t pt-3 font-bold">
                <span>Net Total Fee Payable:</span>
                <span className="text-primary text-lg">
                  {formatCurrency(activePlan?.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Payment History */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Payment History</CardTitle>
              <CardDescription>
                All completed online and offline transactions with official receipts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground border-b text-xs font-medium">
                    <tr>
                      <th className="pb-3">Receipt No</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paymentsLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm">
                          Loading payments...
                        </td>
                      </tr>
                    ) : !payments?.length ? (
                      <tr>
                        <td colSpan={6} className="text-muted-foreground py-8 text-center text-sm">
                          No payment history recorded yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                          <td className="text-foreground py-3 font-semibold">{p.receiptNumber}</td>
                          <td className="text-muted-foreground py-3 text-xs">
                            {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3">
                            <Badge variant="outline" className="text-xs font-normal">
                              {p.paymentMethod}
                            </Badge>
                          </td>
                          <td className="text-foreground py-3 font-bold">
                            {formatCurrency(p.amount)}
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
        </TabsContent>
      </Tabs>

      {/* Online Payment Modal */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {gatewayStep === 'SUCCESS' ? 'Payment Successful' : 'Make Fee Payment'}
            </DialogTitle>
          </DialogHeader>

          {gatewayStep === 'DETAILS' && (
            <div className="space-y-4 text-sm">
              <div className="border-border bg-muted/20 space-y-1.5 rounded-lg border p-3">
                <div className="text-muted-foreground text-xs">
                  {selectedInstallment
                    ? `Paying Installment #${selectedInstallment.installmentNumber}`
                    : 'Paying Current Outstanding Balance'}
                </div>
                <div className="text-primary text-xl font-bold">{formatCurrency(payAmount)}</div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customPayAmt">Payment Amount (₹)</Label>
                <Input
                  id="customPayAmt"
                  type="number"
                  min={1}
                  max={
                    selectedInstallment
                      ? selectedInstallment.amount - selectedInstallment.amountPaid
                      : activePlan?.balanceDue || 999999
                  }
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Choose Payment Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethodChoice('UPI')}
                    className={`border-border flex flex-col items-center justify-center rounded-lg border p-3 text-xs transition-colors ${
                      paymentMethodChoice === 'UPI'
                        ? 'border-primary bg-primary/5 text-primary font-bold'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <IndianRupee className="mb-1 h-4 w-4" />
                    UPI / QR
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodChoice('CARD')}
                    className={`border-border flex flex-col items-center justify-center rounded-lg border p-3 text-xs transition-colors ${
                      paymentMethodChoice === 'CARD'
                        ? 'border-primary bg-primary/5 text-primary font-bold'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <CreditCard className="mb-1 h-4 w-4" />
                    Cards
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodChoice('NET_BANKING')}
                    className={`border-border flex flex-col items-center justify-center rounded-lg border p-3 text-xs transition-colors ${
                      paymentMethodChoice === 'NET_BANKING'
                        ? 'border-primary bg-primary/5 text-primary font-bold'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <ShieldCheck className="mb-1 h-4 w-4" />
                    NetBanking
                  </button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPayModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleProceedToGateway}
                  disabled={initiateMutation.isPending || payAmount <= 0}
                  className="flex items-center gap-1"
                >
                  {initiateMutation.isPending ? 'Connecting...' : 'Proceed to Pay'}{' '}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {gatewayStep === 'CHECKOUT' && (
            <div className="space-y-4 py-4 text-center">
              <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <CreditCard className="text-primary h-8 w-8" />
              </div>
              <div>
                <h3 className="text-base font-bold">Payment Gateway Simulation</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Ready to process payment of{' '}
                  <span className="text-foreground font-bold">{formatCurrency(payAmount)}</span> via{' '}
                  {paymentMethodChoice}
                </p>
              </div>

              <div className="border-border bg-card space-y-2 rounded-lg border p-4 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono">{activePaymentId.slice(0, 18)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merchant:</span>
                  <span>Student ERP Institution</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Amount:</span>
                  <span>{formatCurrency(payAmount)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setGatewayStep('DETAILS')}>
                  Back
                </Button>
                <Button
                  onClick={handleSimulatePaymentSuccess}
                  disabled={verifyMutation.isPending}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  {verifyMutation.isPending ? 'Verifying...' : 'Simulate Success'}
                </Button>
              </div>
            </div>
          )}

          {gatewayStep === 'SUCCESS' && (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Payment Verified & Settled!</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Thank you! Your fee installment has been credited and official receipt issued.
                </p>
              </div>

              <DialogFooter className="sm:justify-center">
                <Button
                  onClick={() => {
                    setIsPayModalOpen(false);
                    if (activePaymentId) {
                      setSelectedReceiptId(activePaymentId);
                    }
                  }}
                >
                  View Payment Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
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
              <span>Payment Receipt</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1 text-xs"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
            </DialogTitle>
          </DialogHeader>

          {receiptLoading ? (
            <div className="py-8 text-center text-sm">Loading receipt...</div>
          ) : receiptData ? (
            <div
              className="border-border space-y-4 rounded-lg border p-4 text-sm"
              id="student-receipt"
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
                  <span className="text-muted-foreground">Roll / ID: </span>
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
              </div>

              {receiptData.allocations?.length > 0 && (
                <div className="border-border border-t pt-3">
                  <h4 className="mb-2 text-xs font-semibold">Allocations</h4>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b">
                        <th className="pb-1">Installment</th>
                        <th className="pb-1 text-right">Allocated Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {receiptData.allocations.map((a: any) => (
                        <tr key={a.id}>
                          <td className="py-1">Installment #{a.installment?.installmentNumber}</td>
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
                <span>Amount Paid:</span>
                <span className="text-primary text-base">{formatCurrency(receiptData.amount)}</span>
              </div>

              <div className="text-muted-foreground flex items-center justify-between pt-2 text-[11px]">
                <span>Status: {receiptData.status}</span>
                <span>System Verified</span>
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
