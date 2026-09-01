import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export type FeeComponentType =
  | 'TUITION'
  | 'ADMISSION'
  | 'EXAMINATION'
  | 'HOSTEL'
  | 'TRANSPORT'
  | 'LIBRARY'
  | 'LABORATORY'
  | 'SPORTS'
  | 'DEVELOPMENT'
  | 'MISCELLANEOUS'
  | 'OTHER';

export type PaymentFrequency = 'ANNUAL' | 'SEMESTER' | 'QUARTERLY' | 'MONTHLY' | 'ONE_TIME';

export type PaymentMethod =
  'CASH' | 'CARD' | 'UPI' | 'NET_BANKING' | 'BANK_TRANSFER' | 'CHEQUE' | 'DEMAND_DRAFT' | 'GATEWAY';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export type InstallmentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export type FeePlanStatus = 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export interface FeeComponentItem {
  id?: string;
  name: string;
  type: FeeComponentType;
  amount: number;
  frequency?: PaymentFrequency;
  isOptional?: boolean;
  description?: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  code: string;
  description?: string;
  totalAmount: number;
  currency: string;
  academicYearId: string;
  programId?: string;
  batchId?: string;
  defaultPaymentMode: 'ANNUAL' | 'INSTALLMENTS';
  installmentCount: number;
  installmentIntervalMonths: number;
  isActive: boolean;
  academicYear?: { id: string; name: string };
  program?: { id: string; name: string; code: string };
  batch?: { id: string; name: string };
  components: FeeComponentItem[];
  _count?: { feePlans: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeeStructureDto {
  name: string;
  code: string;
  description?: string;
  academicYearId: string;
  programId?: string;
  batchId?: string;
  defaultPaymentMode?: 'ANNUAL' | 'INSTALLMENTS';
  installmentCount?: number;
  installmentIntervalMonths?: number;
  components: {
    name: string;
    type: FeeComponentType;
    amount: number;
    frequency?: PaymentFrequency;
    isOptional?: boolean;
    description?: string;
  }[];
}

export interface UpdateFeeStructureDto extends Partial<CreateFeeStructureDto> {
  isActive?: boolean;
}

export interface FeeInstallment {
  id: string;
  studentFeePlanId: string;
  installmentNumber: number;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: InstallmentStatus;
  allocations?: {
    id: string;
    amount: number;
    payment: {
      id: string;
      receiptNumber: string;
      paymentDate: string;
      paymentMethod: PaymentMethod;
    };
  }[];
}

export interface FeeWaiver {
  id: string;
  title: string;
  reason?: string;
  amount: number;
  percentage?: number;
  studentFeePlanId: string;
  appliedBy?: string;
  createdAt: string;
}

export interface StudentFeePlan {
  id: string;
  studentId: string;
  academicYearId: string;
  feeStructureId?: string;
  totalAmount: number;
  currency: string;
  paymentMode: 'ANNUAL' | 'INSTALLMENTS';
  status: FeePlanStatus;
  createdAt: string;
  student: {
    id: string;
    rollNumber?: string;
    admissionNumber?: string;
    guardianName?: string;
    guardianPhone?: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    program?: { id: string; name: string; code: string };
    batch?: { id: string; name: string };
    section?: { id: string; name: string };
  };
  academicYear: { id: string; name: string };
  feeStructure?: { id: string; name: string; code: string };
  components?: {
    id: string;
    name: string;
    type: FeeComponentType;
    amount: number;
    isOptional: boolean;
  }[];
  installments: FeeInstallment[];
  waivers?: FeeWaiver[];
  payments?: Payment[];
  amountPaid?: number;
  balanceAmount?: number;
}

export interface PaymentAllocation {
  id: string;
  amount: number;
  installment: FeeInstallment;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentFeePlanId?: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  remarks?: string;
  collectedBy?: string;
  student?: {
    id: string;
    rollNumber?: string;
    admissionNumber?: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    program?: { name: string; code: string };
    section?: { name: string };
  };
  feePlan?: {
    id: string;
    academicYear: { name: string };
  };
  allocations?: PaymentAllocation[];
}

export interface DefaulterStudent {
  studentId: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  program: string;
  programCode: string;
  section: string;
  overdueAmount: number;
  overdueInstallmentsCount: number;
  daysOverdue: number;
  earliestDueDate: string;
  plans: {
    feePlanId: string;
    academicYear: string;
    overdueInstallments: FeeInstallment[];
  }[];
}

export interface FinanceStats {
  totalExpected: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueAmount: number;
  collectionRate: number;
  defaultersCount: number;
  activeStructuresCount: number;
  recentPayments: {
    id: string;
    receiptNumber: string;
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    studentName: string;
    rollNumber?: string;
  }[];
}

export interface GenerateFeePlanDto {
  studentId?: string;
  studentIds?: string[];
  batchId?: string;
  feeStructureId: string;
  academicYearId: string;
  paymentMode?: 'ANNUAL' | 'INSTALLMENTS';
  customInstallmentCount?: number;
  customFirstDueDate?: string;
  optionalComponentIds?: string[];
  discountAmount?: number;
  discountReason?: string;
}

export interface RecordOfflinePaymentDto {
  studentId: string;
  studentFeePlanId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  transactionReference?: string;
  remarks?: string;
  allocations?: {
    installmentId: string;
    amount: number;
  }[];
}

export interface ApplyWaiverDto {
  studentFeePlanId: string;
  title: string;
  reason?: string;
  amount: number;
  percentage?: number;
}

// 1. Finance Stats Hook
export const useFinanceStats = () => {
  return useQuery({
    queryKey: ['admin', 'finance', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<FinanceStats>('/admin/finance/stats');
      return response.data;
    },
  });
};

// 2. Fee Structures Hooks
export const useFeeStructures = (filters?: {
  programId?: string;
  batchId?: string;
  academicYearId?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['admin', 'finance', 'fee-structures', filters],
    queryFn: async () => {
      const response = await apiClient.get<FeeStructure[]>('/admin/finance/fee-structures', {
        params: filters,
      });
      return response.data;
    },
  });
};

export const useFeeStructure = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'finance', 'fee-structures', id],
    queryFn: async () => {
      const response = await apiClient.get<FeeStructure>(`/admin/finance/fee-structures/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFeeStructureDto) => {
      const response = await apiClient.post<FeeStructure>('/admin/finance/fee-structures', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'fee-structures'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'stats'] });
    },
  });
};

export const useUpdateFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFeeStructureDto }) => {
      const response = await apiClient.put<FeeStructure>(
        `/admin/finance/fee-structures/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'fee-structures'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'fee-structures', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'stats'] });
    },
  });
};

export const useDeleteFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/finance/fee-structures/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'fee-structures'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'stats'] });
    },
  });
};

// 3. Fee Plans Hooks
export const useFeePlans = (filters?: {
  studentId?: string;
  academicYearId?: string;
  programId?: string;
  batchId?: string;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['admin', 'finance', 'fee-plans', filters],
    queryFn: async () => {
      const response = await apiClient.get<StudentFeePlan[]>('/admin/finance/fee-plans', {
        params: filters,
      });
      return response.data;
    },
  });
};

export const useFeePlan = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'finance', 'fee-plans', id],
    queryFn: async () => {
      const response = await apiClient.get<StudentFeePlan>(`/admin/finance/fee-plans/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useGenerateFeePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GenerateFeePlanDto) => {
      const response = await apiClient.post('/admin/finance/fee-plans/generate', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'fee-plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'defaulters'] });
    },
  });
};

export const useApplyWaiver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ApplyWaiverDto) => {
      const response = await apiClient.post<FeeWaiver>('/admin/finance/waivers', data);
      return response.data;
    },
    onSuccess: (_, { studentFeePlanId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'fee-plans'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'finance', 'fee-plans', studentFeePlanId],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'stats'] });
    },
  });
};

// 4. Payments Hooks
export const usePayments = (filters?: {
  studentId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['admin', 'finance', 'payments', filters],
    queryFn: async () => {
      const response = await apiClient.get<Payment[]>('/admin/finance/payments', {
        params: filters,
      });
      return response.data;
    },
  });
};

export const usePaymentReceipt = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'finance', 'payments', id, 'receipt'],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/admin/finance/payments/${id}/receipt`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useRecordOfflinePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RecordOfflinePaymentDto) => {
      const response = await apiClient.post<Payment>('/admin/finance/payments/offline', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'fee-plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'defaulters'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'stats'] });
    },
  });
};

// 5. Defaulters Hooks
export const useDefaulters = (filters?: {
  programId?: string;
  batchId?: string;
  academicYearId?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['admin', 'finance', 'defaulters', filters],
    queryFn: async () => {
      const response = await apiClient.get<DefaulterStudent[]>('/admin/finance/defaulters', {
        params: filters,
      });
      return response.data;
    },
  });
};

export const useDefaulterAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      studentId: string;
      action: 'SEND_REMINDER' | 'RESTRICT_PORTAL' | 'MARK_OVERDUE';
    }) => {
      const response = await apiClient.post('/admin/finance/defaulters/action', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'defaulters'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'fee-plans'] });
    },
  });
};

export const useProcessOverdueInstallments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/admin/finance/defaulters/process-overdue');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'defaulters'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'fee-plans'] });
    },
  });
};
