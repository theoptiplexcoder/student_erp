import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface BulkValidationSummary {
  departments: number;
  courses: number;
  programs: number;
  terms: number;
  sections: number;
}

export interface BulkValidationError {
  entity: string;
  code: string;
  message: string;
}

export interface BulkValidationResponse {
  valid: boolean;
  errors: BulkValidationError[];
  summary: BulkValidationSummary;
}

export interface BulkIngestResponse {
  success: boolean;
  countSummary: BulkValidationSummary;
}

export function useValidateBulkImport() {
  return useMutation<BulkValidationResponse, Error, any>({
    mutationFn: async (payload) => {
      const res = await apiClient.post<BulkValidationResponse>('/academic/bulk/validate', payload);
      return res.data;
    },
  });
}

export function useIngestBulkImport() {
  return useMutation<BulkIngestResponse, Error, any>({
    mutationFn: async (payload) => {
      const res = await apiClient.post<BulkIngestResponse>('/academic/bulk/ingest', payload);
      return res.data;
    },
  });
}
