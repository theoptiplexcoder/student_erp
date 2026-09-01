import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  FeePlanStatus,
  InstallmentStatus,
  PaymentMethod,
  PaymentStatus,
  FeeComponentItem,
  FeeInstallment,
  FeeWaiver,
  Payment,
} from '../admin/useFinance';

export interface StudentDuesResponse {
  student: {
    id: string;
    rollNumber?: string;
    admissionNumber?: string;
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
  feePlans: {
    id: string;
    academicYear: { id: string; name: string };
    feeStructure?: { id: string; name: string; code: string };
    totalAmount: number;
    currency: string;
    paymentMode: 'ANNUAL' | 'INSTALLMENTS';
    status: FeePlanStatus;
    totalPaid: number;
    balanceDue: number;
    components: FeeComponentItem[];
    installments: FeeInstallment[];
    waivers: FeeWaiver[];
    payments: Payment[];
  }[];
  summary: {
    totalFee: number;
    totalPaid: number;
    totalOutstanding: number;
    currency: string;
    hasOverdue: boolean;
    nextUpcomingInstallment?: FeeInstallment & { academicYear: string };
  };
}

export interface InitiatePaymentResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface InitiatePaymentDto {
  studentFeePlanId: string;
  amount: number;
  installmentIds?: string[];
  gatewayProvider?: string;
}

export interface VerifyPaymentDto {
  paymentId: string;
  gatewayPaymentId: string;
  gatewaySignature?: string;
  gatewayOrderId?: string;
  status: 'SUCCESS' | 'FAILED';
}

export const useStudentDues = () => {
  return useQuery({
    queryKey: ['student', 'finance', 'my-dues'],
    queryFn: async () => {
      const response = await apiClient.get<StudentDuesResponse>('/student/finance/my-dues');
      return response.data;
    },
  });
};

export const useStudentPayments = () => {
  return useQuery({
    queryKey: ['student', 'finance', 'my-payments'],
    queryFn: async () => {
      const response = await apiClient.get<Payment[]>('/student/finance/my-payments');
      return response.data;
    },
  });
};

export const useStudentReceipt = (id: string) => {
  return useQuery({
    queryKey: ['student', 'finance', 'payments', id, 'receipt'],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/student/finance/payments/${id}/receipt`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: async (data: InitiatePaymentDto) => {
      const response = await apiClient.post<InitiatePaymentResponse>(
        '/student/finance/payments/initiate',
        data,
      );
      return response.data;
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VerifyPaymentDto) => {
      const response = await apiClient.post('/student/finance/payments/verify', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'finance', 'my-dues'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'finance', 'my-payments'] });
    },
  });
};
