import { apiClient } from '@/lib/api-client';

export interface AdmissionDraft {
  id: string;
  updatedAt: string | number;
  data: any;
}

export async function getDrafts(): Promise<AdmissionDraft[]> {
  try {
    const res = await apiClient.get('/admin/admissions/drafts');
    return res.data;
  } catch (e) {
    return [];
  }
}

export async function getDraft(id: string): Promise<AdmissionDraft | null> {
  try {
    const res = await apiClient.get(`/admin/admissions/drafts/${id}`);
    return res.data;
  } catch (e) {
    return null;
  }
}

export async function saveDraft(id: string, data: any) {
  const cleanData = { ...data, documents: [], photo: null };
  try {
    await apiClient.put(`/admin/admissions/drafts/${id}`, cleanData);
  } catch (e) {
    console.error('Failed to save draft', e);
  }
}

export async function removeDraft(id: string) {
  try {
    await apiClient.delete(`/admin/admissions/drafts/${id}`);
  } catch (e) {
    console.error('Failed to remove draft', e);
  }
}
