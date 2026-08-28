import { useState, useEffect } from 'react';

export interface AdmissionDraft {
  id: string;
  updatedAt: number;
  data: any;
}

export function getDrafts(): AdmissionDraft[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('admissions_drafts');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveDraft(id: string, data: any) {
  if (typeof window === 'undefined') return;
  const drafts = getDrafts();

  // Exclude File objects before saving to prevent quota issues
  const cleanData = { ...data, documents: [], photo: null };

  const existingIndex = drafts.findIndex((d) => d.id === id);
  if (existingIndex >= 0) {
    drafts[existingIndex].data = cleanData;
    drafts[existingIndex].updatedAt = Date.now();
  } else {
    drafts.push({
      id,
      data: cleanData,
      updatedAt: Date.now(),
    });
  }

  localStorage.setItem('admissions_drafts', JSON.stringify(drafts));
}

export function removeDraft(id: string) {
  if (typeof window === 'undefined') return;
  const drafts = getDrafts();
  const newDrafts = drafts.filter((d) => d.id !== id);
  localStorage.setItem('admissions_drafts', JSON.stringify(newDrafts));
}
