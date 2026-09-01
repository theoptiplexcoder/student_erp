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
  Users2,
  Receipt,
  Eye,
  IndianRupee,
  Gift,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ChevronRight,
} from 'lucide-react';
import {
  useFeePlans,
  useFeePlan,
  useGenerateFeePlan,
  useApplyWaiver,
  useFeeStructures,
  StudentFeePlan,
} from '@/hooks/api/admin/useFinance';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminBatches } from '@/hooks/api/admin/useBatches';
import { useAdminStudents } from '@/hooks/api/admin/useStudents';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function StudentFeePlansPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isWaiverOpen, setIsWaiverOpen] = useState(false);
  const [waiverTargetPlanId, setWaiverTargetPlanId] = useState<string | null>(null);

  // Queries
  const { data: feePlans, isLoading } = useFeePlans({
    search: searchQuery || undefined,
    status: selectedStatus || undefined,
    programId: selectedProgramId || undefined,
    batchId: selectedBatchId || undefined,
  });

  const { data: selectedPlanDetails, isLoading: planDetailsLoading } = useFeePlan(
    selectedPlanId || '',
  );

  const { data: feeStructures } = useFeeStructures({ isActive: true });
  const { data: programsData } = useAdminPrograms(1, 100);
  const { data: batchesData } = useAdminBatches(1, 100);
  const { data: studentsData } = useAdminStudents({ pageSize: 200 });

  const { data: academicYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/admin/institution/academic-years');
      return res.data;
    },
  });

  const generateMutation = useGenerateFeePlan();
  const applyWaiverMutation = useApplyWaiver();

  // Generation form
  const [targetType, setTargetType] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [generateForm, setGenerateForm] = useState({
    studentId: '',
    batchId: '',
    feeStructureId: '',
    academicYearId: '',
    paymentMode: 'INSTALLMENTS' as 'ANNUAL' | 'INSTALLMENTS',
    customInstallmentCount: 2,
    customFirstDueDate: new Date().toISOString().split('T')[0],
    optionalComponentIds: [] as string[],
    discountAmount: 0,
    discountReason: '',
  });

  // Waiver form
  const [waiverForm, setWaiverForm] = useState({
    title: 'Merit Scholarship',
    reason: 'Academic Excellence Award',
    amount: 10000,
  });

  const resetGenerateForm = () => {
    setGenerateForm({
      studentId: '',
      batchId: '',
      feeStructureId: feeStructures?.[0]?.id || '',
      academicYearId: academicYears?.[0]?.id || '',
      paymentMode: 'INSTALLMENTS',
      customInstallmentCount: 2,
      customFirstDueDate: new Date().toISOString().split('T')[0],
      optionalComponentIds: [],
      discountAmount: 0,
      discountReason: '',
    });
  };

  const handleOpenGenerate = () => {
    resetGenerateForm();
    if (feeStructures?.length) {
      setGenerateForm((prev) => ({
        ...prev,
        feeStructureId: feeStructures[0].id,
      }));
    }
    if (academicYears?.length) {
      setGenerateForm((prev) => ({
        ...prev,
        academicYearId: academicYears[0].id,
      }));
    }
    setIsGenerateOpen(true);
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateForm.feeStructureId || !generateForm.academicYearId) {
      alert('Please select Fee Structure and Academic Year');
      return;
    }

    if (targetType === 'SINGLE' && !generateForm.studentId) {
      alert('Please select a student');
      return;
    }

    if (targetType === 'BATCH' && !generateForm.batchId) {
      alert('Please select a batch');
      return;
    }

    try {
      await generateMutation.mutateAsync({
        studentId: targetType === 'SINGLE' ? generateForm.studentId : undefined,
        batchId: targetType === 'BATCH' ? generateForm.batchId : undefined,
        feeStructureId: generateForm.feeStructureId,
        academicYearId: generateForm.academicYearId,
        paymentMode: generateForm.paymentMode,
        customInstallmentCount:
          generateForm.paymentMode === 'INSTALLMENTS'
            ? Number(generateForm.customInstallmentCount)
            : 1,
        customFirstDueDate: generateForm.customFirstDueDate || undefined,
        optionalComponentIds: generateForm.optionalComponentIds,
        discountAmount: Number(generateForm.discountAmount) || undefined,
        discountReason: generateForm.discountReason || undefined,
      });

      setIsGenerateOpen(false);
      resetGenerateForm();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to generate fee plan');
    }
  };

  const handleApplyWaiverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverTargetPlanId || !waiverForm.amount || !waiverForm.title) {
      alert('Please fill waiver fields');
      return;
    }

    try {
      await applyWaiverMutation.mutateAsync({
        studentFeePlanId: waiverTargetPlanId,
        title: waiverForm.title,
        reason: waiverForm.reason,
        amount: Number(waiverForm.amount),
      });

      setIsWaiverOpen(false);
      setWaiverForm({
        title: 'Merit Scholarship',
        reason: 'Academic Excellence Award',
        amount: 10000,
      });
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to apply waiver');
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-xs text-green-700 dark:text-green-400"
          >
            Paid in Full
          </Badge>
        );
      case 'OVERDUE':
        return (
          <Badge variant="destructive" className="text-xs">
            Overdue
          </Badge>
        );
      case 'ACTIVE':
      default:
        return (
          <Badge variant="default" className="text-xs">
            Active
          </Badge>
        );
    }
  };

  const getInstallmentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-[10px] text-green-700 dark:text-green-400"
          >
            Paid
          </Badge>
        );
      case 'PARTIAL':
        return (
          <Badge
            variant="outline"
            className="border-amber-500 text-[10px] text-amber-700 dark:text-amber-400"
          >
            Partial
          </Badge>
        );
      case 'OVERDUE':
        return (
          <Badge variant="destructive" className="text-[10px]">
            Overdue
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge variant="secondary" className="text-[10px]">
            Pending
          </Badge>
        );
    }
  };

  const selectedStructureObj = feeStructures?.find((s) => s.id === generateForm.feeStructureId);

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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Student Fee Plans</h1>
            <p className="text-muted-foreground text-sm">
              Manage student fee assignments, installment schedules, and financial waivers.
            </p>
          </div>
        </div>
        <Button onClick={handleOpenGenerate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Generate Fee Plan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              placeholder="Search student or roll no..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active (Pending Payments)</option>
              <option value="OVERDUE">Overdue</option>
              <option value="COMPLETED">Completed (Paid Full)</option>
            </select>
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

      {/* Fee Plans Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Student Fee Plans</CardTitle>
          <CardDescription>
            Showing {feePlans?.length || 0} student fee plan records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b text-xs font-medium">
                <tr>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Program / Batch</th>
                  <th className="pb-3">Fee Structure</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Paid / Due</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm">
                      Loading fee plans...
                    </td>
                  </tr>
                ) : !feePlans?.length ? (
                  <tr>
                    <td colSpan={7} className="text-muted-foreground py-8 text-center text-sm">
                      No fee plans found. Generate a plan to get started.
                    </td>
                  </tr>
                ) : (
                  feePlans.map((plan) => {
                    const paid = plan.amountPaid || 0;
                    const balance =
                      plan.balanceAmount !== undefined
                        ? plan.balanceAmount
                        : plan.totalAmount - paid;

                    return (
                      <tr key={plan.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3">
                          <div className="text-foreground font-semibold">
                            {plan.student.user.firstName} {plan.student.user.lastName}
                          </div>
                          <div className="text-muted-foreground font-mono text-xs">
                            {plan.student.rollNumber || plan.student.admissionNumber || 'No Roll #'}
                          </div>
                        </td>
                        <td className="py-3 text-xs">
                          <div className="font-medium">{plan.student.program?.name || 'N/A'}</div>
                          <div className="text-muted-foreground">{plan.academicYear.name}</div>
                        </td>
                        <td className="py-3 text-xs">
                          <div className="font-medium">
                            {plan.feeStructure?.name || 'Custom Plan'}
                          </div>
                          <div className="text-muted-foreground capitalize">
                            {plan.paymentMode.toLowerCase()} ({plan.installments.length}{' '}
                            installments)
                          </div>
                        </td>
                        <td className="text-foreground py-3 font-semibold">
                          {formatCurrency(plan.totalAmount)}
                        </td>
                        <td className="py-3 text-xs">
                          <div className="font-medium text-green-700 dark:text-green-400">
                            Paid: {formatCurrency(paid)}
                          </div>
                          <div className="text-muted-foreground">
                            Balance: {formatCurrency(balance)}
                          </div>
                        </td>
                        <td className="py-3">{getStatusBadge(plan.status)}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPlanId(plan.id)}
                              className="h-8 px-2 text-xs"
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" /> Details
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setWaiverTargetPlanId(plan.id);
                                setIsWaiverOpen(true);
                              }}
                              className="h-8 px-2 text-xs"
                            >
                              <Gift className="mr-1 h-3.5 w-3.5" /> Waiver
                            </Button>
                          </div>
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

      {/* Plan Details Modal */}
      <Dialog open={!!selectedPlanId} onOpenChange={(open) => !open && setSelectedPlanId(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Fee Plan Details</DialogTitle>
          </DialogHeader>

          {planDetailsLoading ? (
            <div className="py-8 text-center text-sm">Loading plan breakdown...</div>
          ) : selectedPlanDetails ? (
            <div className="space-y-5 text-sm">
              {/* Student Overview Header */}
              <div className="border-border bg-muted/20 space-y-2 rounded-lg border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold">
                      {selectedPlanDetails.student.user.firstName}{' '}
                      {selectedPlanDetails.student.user.lastName}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      ID / Roll: {selectedPlanDetails.student.rollNumber || 'N/A'} • Email:{' '}
                      {selectedPlanDetails.student.user.email}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">{getStatusBadge(selectedPlanDetails.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <div>
                    <span className="text-muted-foreground">Program: </span>
                    <span className="font-semibold">
                      {selectedPlanDetails.student.program?.name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Academic Year: </span>
                    <span className="font-semibold">{selectedPlanDetails.academicYear.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Mode: </span>
                    <span className="font-semibold">{selectedPlanDetails.paymentMode}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Structure: </span>
                    <span className="font-semibold">
                      {selectedPlanDetails.feeStructure?.name || 'Custom'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Installments Table */}
              <div className="border-border space-y-2 rounded-lg border p-4">
                <h4 className="text-xs font-semibold">Installments Schedule</h4>
                <table className="w-full text-left text-xs">
                  <thead className="text-muted-foreground border-b">
                    <tr>
                      <th className="pb-2">#</th>
                      <th className="pb-2">Due Date</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Paid</th>
                      <th className="pb-2">Balance</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedPlanDetails.installments.map((inst) => (
                      <tr key={inst.id}>
                        <td className="py-2 font-medium">Installment {inst.installmentNumber}</td>
                        <td className="text-muted-foreground py-2">
                          {new Date(inst.dueDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-2 font-medium">{formatCurrency(inst.amount)}</td>
                        <td className="py-2 font-medium text-green-700 dark:text-green-400">
                          {formatCurrency(inst.amountPaid)}
                        </td>
                        <td className="py-2 font-medium">
                          {formatCurrency(inst.amount - inst.amountPaid)}
                        </td>
                        <td className="py-2 text-right">{getInstallmentBadge(inst.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Waivers & Discounts */}
              {selectedPlanDetails.waivers && selectedPlanDetails.waivers.length > 0 && (
                <div className="border-border space-y-2 rounded-lg border p-4">
                  <h4 className="text-xs font-semibold">Applied Waivers & Scholarships</h4>
                  <table className="w-full text-left text-xs">
                    <thead className="text-muted-foreground border-b">
                      <tr>
                        <th className="pb-2">Waiver / Scholarship</th>
                        <th className="pb-2">Reason</th>
                        <th className="pb-2 text-right">Discount Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedPlanDetails.waivers.map((w) => (
                        <tr key={w.id}>
                          <td className="py-2 font-medium">{w.title}</td>
                          <td className="text-muted-foreground py-2">{w.reason || 'N/A'}</td>
                          <td className="py-2 text-right font-semibold text-green-700 dark:text-green-400">
                            -{formatCurrency(w.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Total Financial Summary */}
              <div className="border-border flex items-center justify-between border-t pt-3 font-bold">
                <div>
                  <span className="text-muted-foreground text-xs">Total Plan Value: </span>
                  <span className="text-base">
                    {formatCurrency(selectedPlanDetails.totalAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-xs">Outstanding: </span>
                  <span className="text-primary text-base">
                    {formatCurrency(
                      selectedPlanDetails.totalAmount - (selectedPlanDetails.amountPaid || 0),
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground py-4 text-center">Fee plan not found</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Fee Plan Modal */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Student Fee Plan</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleGenerateSubmit} className="space-y-4 text-sm">
            {/* Target Mode: Single vs Batch */}
            <div className="border-border flex rounded-lg border p-1">
              <button
                type="button"
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                  targetType === 'SINGLE'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setTargetType('SINGLE')}
              >
                Individual Student
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                  targetType === 'BATCH'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setTargetType('BATCH')}
              >
                Batch / Class Rollout
              </button>
            </div>

            {targetType === 'SINGLE' ? (
              <div className="space-y-1.5">
                <Label htmlFor="studentSelect">Select Student *</Label>
                <select
                  id="studentSelect"
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  value={generateForm.studentId}
                  onChange={(e) => setGenerateForm({ ...generateForm, studentId: e.target.value })}
                  required
                >
                  <option value="">Choose a student...</option>
                  {(studentsData?.data || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user.firstName} {s.user.lastName} (
                      {s.studentCode || s.admissionNumber || s.user.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="batchSelect">Select Target Batch *</Label>
                <select
                  id="batchSelect"
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  value={generateForm.batchId}
                  onChange={(e) => setGenerateForm({ ...generateForm, batchId: e.target.value })}
                  required
                >
                  <option value="">Choose a batch...</option>
                  {(batchesData?.data || []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.program?.name || 'Program'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="structureSelect">Fee Structure Template *</Label>
                <select
                  id="structureSelect"
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  value={generateForm.feeStructureId}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, feeStructureId: e.target.value })
                  }
                  required
                >
                  <option value="">Select structure...</option>
                  {(feeStructures || []).map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({formatCurrency(st.totalAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="academicYearSelect">Academic Year *</Label>
                <select
                  id="academicYearSelect"
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  value={generateForm.academicYearId}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, academicYearId: e.target.value })
                  }
                  required
                >
                  <option value="">Select academic year...</option>
                  {(academicYears || []).map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="scheduleMode">Payment Schedule</Label>
                <select
                  id="scheduleMode"
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  value={generateForm.paymentMode}
                  onChange={(e) =>
                    setGenerateForm({
                      ...generateForm,
                      paymentMode: e.target.value as 'ANNUAL' | 'INSTALLMENTS',
                    })
                  }
                >
                  <option value="INSTALLMENTS">Installments</option>
                  <option value="ANNUAL">Annual (1 Full Payment)</option>
                </select>
              </div>

              {generateForm.paymentMode === 'INSTALLMENTS' && (
                <div className="space-y-1.5">
                  <Label htmlFor="installCount">Installment Count</Label>
                  <Input
                    id="installCount"
                    type="number"
                    min={1}
                    max={12}
                    value={generateForm.customInstallmentCount}
                    onChange={(e) =>
                      setGenerateForm({
                        ...generateForm,
                        customInstallmentCount: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="firstDueDate">First Installment Due Date</Label>
                <Input
                  id="firstDueDate"
                  type="date"
                  value={generateForm.customFirstDueDate}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, customFirstDueDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Optional Components Selection */}
            {selectedStructureObj?.components?.some((c) => c.isOptional) && (
              <div className="border-border space-y-2 rounded-lg border p-3">
                <h4 className="text-xs font-semibold">Optional Add-on Components</h4>
                <div className="space-y-2">
                  {selectedStructureObj.components
                    .filter((c) => c.isOptional)
                    .map((comp) => (
                      <label
                        key={comp.name}
                        className="flex cursor-pointer items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={generateForm.optionalComponentIds.includes(
                              comp.id || comp.name,
                            )}
                            onChange={(e) => {
                              const id = comp.id || comp.name;
                              if (e.target.checked) {
                                setGenerateForm({
                                  ...generateForm,
                                  optionalComponentIds: [...generateForm.optionalComponentIds, id],
                                });
                              } else {
                                setGenerateForm({
                                  ...generateForm,
                                  optionalComponentIds: generateForm.optionalComponentIds.filter(
                                    (x) => x !== id,
                                  ),
                                });
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <span>{comp.name}</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(comp.amount)}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            {/* Initial Discount / Waiver */}
            <div className="border-border grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <h4 className="text-xs font-semibold">Initial Scholarship / Discount (Optional)</h4>
              </div>
              <div className="space-y-1">
                <Label htmlFor="discAmount" className="text-xs">
                  Discount Amount (₹)
                </Label>
                <Input
                  id="discAmount"
                  type="number"
                  min={0}
                  value={generateForm.discountAmount}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, discountAmount: Number(e.target.value) })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="discReason" className="text-xs">
                  Reason / Scheme
                </Label>
                <Input
                  id="discReason"
                  placeholder="e.g. Merit Concession"
                  value={generateForm.discountReason}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, discountReason: e.target.value })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsGenerateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? 'Generating...' : 'Generate Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Waiver Modal */}
      <Dialog open={isWaiverOpen} onOpenChange={setIsWaiverOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Fee Waiver / Scholarship</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleApplyWaiverSubmit} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="waiverTitle">Waiver / Scholarship Title *</Label>
              <Input
                id="waiverTitle"
                value={waiverForm.title}
                onChange={(e) => setWaiverForm({ ...waiverForm, title: e.target.value })}
                placeholder="e.g. Merit Scholarship"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="waiverAmount">Waiver Amount (₹) *</Label>
              <Input
                id="waiverAmount"
                type="number"
                min={1}
                value={waiverForm.amount}
                onChange={(e) => setWaiverForm({ ...waiverForm, amount: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="waiverReason">Reason / Sanction Details</Label>
              <Input
                id="waiverReason"
                value={waiverForm.reason}
                onChange={(e) => setWaiverForm({ ...waiverForm, reason: e.target.value })}
                placeholder="e.g. Approved by Dean on 01-Sep-2025"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsWaiverOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={applyWaiverMutation.isPending}>
                {applyWaiverMutation.isPending ? 'Applying...' : 'Apply Waiver'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
