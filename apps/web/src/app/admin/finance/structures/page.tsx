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
  Plus,
  Trash2,
  Edit2,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Calendar,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import {
  useFeeStructures,
  useCreateFeeStructure,
  useUpdateFeeStructure,
  useDeleteFeeStructure,
  FeeStructure,
  FeeComponentType,
  PaymentFrequency,
} from '@/hooks/api/admin/useFinance';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const COMPONENT_TYPES: { label: string; value: FeeComponentType }[] = [
  { label: 'Tuition Fee', value: 'TUITION' },
  { label: 'Admission / Registration', value: 'ADMISSION' },
  { label: 'Examination Fee', value: 'EXAMINATION' },
  { label: 'Hostel / Accommodation', value: 'HOSTEL' },
  { label: 'Transport / Bus Fee', value: 'TRANSPORT' },
  { label: 'Library & Learning Resources', value: 'LIBRARY' },
  { label: 'Laboratory / Equipment', value: 'LABORATORY' },
  { label: 'Sports & Student Activities', value: 'SPORTS' },
  { label: 'Campus Development', value: 'DEVELOPMENT' },
  { label: 'Miscellaneous / Other', value: 'MISCELLANEOUS' },
];

export default function FeeStructuresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [viewingStructure, setViewingStructure] = useState<FeeStructure | null>(null);

  // Queries
  const { data: structures, isLoading } = useFeeStructures({
    programId: selectedProgramId || undefined,
  });

  const { data: programsData } = useAdminPrograms(1, 100);
  const programs = programsData?.data || [];

  const { data: academicYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/admin/institution/academic-years');
      return res.data;
    },
  });

  const createMutation = useCreateFeeStructure();
  const updateMutation = useUpdateFeeStructure();
  const deleteMutation = useDeleteFeeStructure();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    academicYearId: '',
    programId: '',
    defaultPaymentMode: 'INSTALLMENTS' as 'ANNUAL' | 'INSTALLMENTS',
    installmentCount: 2,
    installmentIntervalMonths: 6,
    components: [
      {
        name: 'Tuition Fee',
        type: 'TUITION' as FeeComponentType,
        amount: 50000,
        frequency: 'ANNUAL' as PaymentFrequency,
        isOptional: false,
        description: 'Standard academic tuition fee',
      },
    ],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      academicYearId: academicYears?.[0]?.id || '',
      programId: '',
      defaultPaymentMode: 'INSTALLMENTS',
      installmentCount: 2,
      installmentIntervalMonths: 6,
      components: [
        {
          name: 'Tuition Fee',
          type: 'TUITION',
          amount: 50000,
          frequency: 'ANNUAL',
          isOptional: false,
          description: 'Standard academic tuition fee',
        },
      ],
    });
    setEditingStructure(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    if (academicYears && academicYears.length > 0) {
      setFormData((prev) => ({ ...prev, academicYearId: academicYears[0].id }));
    }
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (structure: FeeStructure) => {
    setEditingStructure(structure);
    setFormData({
      name: structure.name,
      code: structure.code,
      description: structure.description || '',
      academicYearId: structure.academicYearId,
      programId: structure.programId || '',
      defaultPaymentMode: structure.defaultPaymentMode || 'INSTALLMENTS',
      installmentCount: structure.installmentCount || 2,
      installmentIntervalMonths: structure.installmentIntervalMonths || 6,
      components: structure.components.map((c) => ({
        name: c.name,
        type: c.type,
        amount: c.amount,
        frequency: c.frequency || 'ANNUAL',
        isOptional: !!c.isOptional,
        description: c.description || '',
      })),
    });
    setIsCreateOpen(true);
  };

  const handleAddComponent = () => {
    setFormData((prev) => ({
      ...prev,
      components: [
        ...prev.components,
        {
          name: 'Additional Fee',
          type: 'MISCELLANEOUS',
          amount: 5000,
          frequency: 'ANNUAL',
          isOptional: false,
          description: '',
        },
      ],
    }));
  };

  const handleRemoveComponent = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== idx),
    }));
  };

  const handleComponentChange = (idx: number, field: string, value: any) => {
    setFormData((prev) => {
      const nextComponents = [...prev.components];
      nextComponents[idx] = { ...nextComponents[idx], [field]: value };
      return { ...prev, components: nextComponents };
    });
  };

  const totalCalculatedAmount = formData.components.reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.academicYearId) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (editingStructure) {
        await updateMutation.mutateAsync({
          id: editingStructure.id,
          data: {
            ...formData,
            programId: formData.programId || undefined,
            components: formData.components.map((c) => ({
              ...c,
              amount: Number(c.amount),
            })),
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          programId: formData.programId || undefined,
          components: formData.components.map((c) => ({
            ...c,
            amount: Number(c.amount),
          })),
        });
      }
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to save fee structure');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err?.response?.data?.message || 'Cannot delete fee structure');
      }
    }
  };

  const filteredStructures = (structures || []).filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Fee Structures</h1>
            <p className="text-muted-foreground text-sm">
              Define standard fee blueprints by program, department, and academic year.
            </p>
          </div>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Fee Structure
        </Button>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              placeholder="Search structure name, code, or program..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48">
              <select
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
              >
                <option value="">All Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Structures Grid / List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-sm">Loading fee structures...</div>
        ) : filteredStructures.length === 0 ? (
          <div className="border-border col-span-full rounded-lg border border-dashed py-12 text-center">
            <Layers className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
            <h3 className="text-base font-semibold">No fee structures found</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Get started by creating your first fee structure blueprint.
            </p>
            <Button onClick={handleOpenCreate} variant="outline" size="sm" className="mt-4">
              <Plus className="mr-1 h-3.5 w-3.5" /> Create Structure
            </Button>
          </div>
        ) : (
          filteredStructures.map((structure) => (
            <Card key={structure.id} className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {structure.code}
                    </Badge>
                    <CardTitle className="mt-1 text-lg font-bold">{structure.name}</CardTitle>
                  </div>
                  <Badge
                    variant={structure.isActive ? 'default' : 'secondary'}
                    className="text-[11px]"
                  >
                    {structure.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {structure.description && (
                  <CardDescription className="line-clamp-2 text-xs">
                    {structure.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3 pb-3 text-sm">
                <div className="border-border space-y-1.5 rounded-md border p-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Academic Year:</span>
                    <span className="font-medium">{structure.academicYear?.name || 'All'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program:</span>
                    <span className="font-medium">
                      {structure.program?.name || 'General / All'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installments:</span>
                    <span className="font-medium">
                      {structure.defaultPaymentMode === 'ANNUAL'
                        ? 'Annual (Single)'
                        : `${structure.installmentCount} installments (${structure.installmentIntervalMonths}m interval)`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    {structure.components?.length || 0} Components
                  </span>
                  <div className="text-right">
                    <span className="text-muted-foreground text-xs">Total: </span>
                    <span className="text-foreground text-base font-bold">
                      {formatCurrency(structure.totalAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>

              <div className="border-border bg-muted/20 flex items-center justify-between border-t p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingStructure(structure)}
                  className="h-8 text-xs"
                >
                  View Details
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(structure)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(structure.id)}
                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Structure Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStructure ? 'Edit Fee Structure' : 'Create New Fee Structure'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Structure Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. B.Tech Computer Science - Year 1 Standard"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code">Structure Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g. BT-CSE-Y1-2025"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="academicYear">Academic Year *</Label>
                <select
                  id="academicYear"
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  value={formData.academicYearId}
                  onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                  required
                >
                  <option value="">Select Academic Year</option>
                  {(academicYears || []).map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="program">Target Program (Optional)</Label>
                <select
                  id="program"
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  value={formData.programId}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                >
                  <option value="">All Programs / General Template</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentMode">Default Payment Schedule</Label>
                <select
                  id="paymentMode"
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  value={formData.defaultPaymentMode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultPaymentMode: e.target.value as 'ANNUAL' | 'INSTALLMENTS',
                    })
                  }
                >
                  <option value="INSTALLMENTS">Installments</option>
                  <option value="ANNUAL">Annual (Lump-sum)</option>
                </select>
              </div>

              {formData.defaultPaymentMode === 'INSTALLMENTS' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="installmentCount">Number of Installments</Label>
                    <Input
                      id="installmentCount"
                      type="number"
                      min={1}
                      max={12}
                      value={formData.installmentCount}
                      onChange={(e) =>
                        setFormData({ ...formData, installmentCount: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="installmentIntervalMonths">
                      Interval Between Installments (Months)
                    </Label>
                    <Input
                      id="installmentIntervalMonths"
                      type="number"
                      min={1}
                      max={12}
                      value={formData.installmentIntervalMonths}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          installmentIntervalMonths: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description">Description / Notes</Label>
                <Input
                  id="description"
                  placeholder="Optional notes regarding this structure"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Component Builder */}
            <div className="border-border space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Fee Components Breakdown</h3>
                  <p className="text-muted-foreground text-xs">
                    Define tuition, facility, transport, hostel and other fee line items.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddComponent}
                  className="flex items-center gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Component
                </Button>
              </div>

              <div className="space-y-3">
                {formData.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className="border-border bg-card/60 grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-12 sm:items-center"
                  >
                    <div className="sm:col-span-4">
                      <Label className="text-[11px]">Component Name</Label>
                      <Input
                        value={comp.name}
                        onChange={(e) => handleComponentChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Tuition Fee"
                        className="h-8 text-xs"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <Label className="text-[11px]">Type</Label>
                      <select
                        className="border-input bg-background h-8 w-full rounded-md border px-2 text-xs"
                        value={comp.type}
                        onChange={(e) => handleComponentChange(idx, 'type', e.target.value)}
                      >
                        {COMPONENT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <Label className="text-[11px]">Amount (₹)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={comp.amount}
                        onChange={(e) => handleComponentChange(idx, 'amount', e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between sm:col-span-2 sm:justify-end sm:gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          id={`opt-${idx}`}
                          checked={comp.isOptional}
                          onChange={(e) =>
                            handleComponentChange(idx, 'isOptional', e.target.checked)
                          }
                          className="h-3.5 w-3.5"
                        />
                        <Label htmlFor={`opt-${idx}`} className="cursor-pointer text-[11px]">
                          Optional
                        </Label>
                      </div>

                      {formData.components.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveComponent(idx)}
                          className="text-destructive h-7 w-7"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="border-border flex items-center justify-between border-t pt-3">
                <span className="text-sm font-semibold">Total Fee Structure Amount:</span>
                <span className="text-primary text-lg font-bold">
                  {formatCurrency(totalCalculatedAmount)}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingStructure
                    ? 'Update Structure'
                    : 'Save Structure'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Structure Modal */}
      <Dialog open={!!viewingStructure} onOpenChange={(open) => !open && setViewingStructure(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Fee Structure Details</DialogTitle>
          </DialogHeader>
          {viewingStructure && (
            <div className="space-y-4 text-sm">
              <div className="border-border flex justify-between border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold">{viewingStructure.name}</h3>
                  <p className="text-muted-foreground font-mono text-xs">{viewingStructure.code}</p>
                </div>
                <Badge variant={viewingStructure.isActive ? 'default' : 'secondary'}>
                  {viewingStructure.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Academic Year: </span>
                  <span className="font-semibold">
                    {viewingStructure.academicYear?.name || 'All'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Program: </span>
                  <span className="font-semibold">
                    {viewingStructure.program?.name || 'General / All'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Installment Mode: </span>
                  <span className="font-semibold">{viewingStructure.defaultPaymentMode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Installment Count: </span>
                  <span className="font-semibold">{viewingStructure.installmentCount}</span>
                </div>
              </div>

              <div className="border-border border-t pt-3">
                <h4 className="mb-2 text-xs font-semibold">Line Items Breakdown</h4>
                <table className="w-full text-left text-xs">
                  <thead className="text-muted-foreground border-b">
                    <tr>
                      <th className="pb-1">Component</th>
                      <th className="pb-1">Type</th>
                      <th className="pb-1">Status</th>
                      <th className="pb-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {viewingStructure.components.map((c, i) => (
                      <tr key={i}>
                        <td className="py-2 font-medium">{c.name}</td>
                        <td className="text-muted-foreground py-2">{c.type}</td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-[10px]">
                            {c.isOptional ? 'Optional' : 'Mandatory'}
                          </Badge>
                        </td>
                        <td className="py-2 text-right font-semibold">
                          {formatCurrency(c.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-border flex items-center justify-between border-t pt-3 font-bold">
                <span>Total Structure Amount:</span>
                <span className="text-primary text-base">
                  {formatCurrency(viewingStructure.totalAmount)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
