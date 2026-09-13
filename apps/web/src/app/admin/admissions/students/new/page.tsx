'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Separator,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@student-erp/ui';
import {
  CheckCircle2,
  User,
  BookOpen,
  Users,
  IndianRupee,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  X,
  Upload,
  Camera,
  RefreshCw,
  ZoomIn,
} from 'lucide-react';
import { useCreateDirectAdmission } from '@/hooks/api/admin/useAdmissions';
import {
  useFeeStructures,
  useCreateFeeStructure,
  FeeStructure,
  FeeComponentType,
} from '@/hooks/api/admin/useFinance';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { createClient } from '@/lib/supabase/client';
import { apiClient } from '@/lib/api-client';
import { getDrafts, getDraft, saveDraft, removeDraft } from '@/hooks/useAdmissionDrafts';

const PROGRAM_LEVELS = [
  'PRIMARY',
  'SECONDARY',
  'HIGHER_SECONDARY',
  'DIPLOMA',
  'UNDERGRADUATE',
  'POSTGRADUATE',
  'DOCTORAL',
  'CERTIFICATE',
];

const steps = [
  { id: 1, title: 'Student Info', icon: User },
  { id: 2, title: 'Academic Details', icon: BookOpen },
  { id: 3, title: 'Fee', icon: IndianRupee },
  { id: 4, title: 'Preview & Submit', icon: CheckCircle2 },
];

function DirectAdmissionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draftId');

  // Use existing draftId or create a new one
  const [draftId] = useState(draftIdParam || crypto.randomUUID());

  const { mutateAsync: createAdmission, isPending } = useCreateDirectAdmission();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const documentInputRef = React.useRef<HTMLInputElement>(null);
  const [isPhotoViewOpen, setIsPhotoViewOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err?.message?.includes('Permission denied') || err?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : 'Unable to access camera. Please check your device camera.',
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `profile-capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          setFormData((p) => ({ ...p, photo: file }));
          stopCamera();
        }
      },
      'image/jpeg',
      0.92,
    );
  };

  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Form Data State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    about: '',
    skills: [] as string[],

    fatherName: '',
    motherName: '',
    guardianName: '',
    fatherPhone: '',
    motherPhone: '',
    guardianPhone: '',
    fatherEmail: '',
    motherEmail: '',

    accomplishments: [] as { type: string; title: string; description: string; issuer?: string }[],
    documents: [] as { file: File; fileName: string; size: number; mimeType: string }[],
    previousEducation: [] as { institutionName: string; academicYear: string }[],
    photo: null as File | null,

    academicYearId: '',
    programId: '',
    courseId: '',
    sectionId: '',
    batchId: '',

    feeStructureId: '',
    totalFee: 0,
    installmentsCount: 1,
    installments: [] as { amount: number; dueDate: string }[],
  });

  useEffect(() => {
    if (formData.photo) {
      const url = URL.createObjectURL(formData.photo);
      setPhotoPreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setPhotoPreview(null);
    return undefined;
  }, [formData.photo]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [institutionType, setInstitutionType] = useState<'SCHOOL' | 'COLLEGE'>('SCHOOL');
  const [departments, setDepartments] = useState<any[]>([]);

  // Load Draft
  useEffect(() => {
    if (draftIdParam) {
      getDraft(draftIdParam).then((existingDraft) => {
        if (existingDraft && existingDraft.data) {
          setFormData((prev) => ({
            ...prev,
            ...existingDraft.data,
            // Explicitly keep empty arrays/nulls for files since they can't be saved in localStorage
            documents: [],
            photo: null,
          }));
        }
      });
    }
  }, [draftIdParam]);

  // Auto-Save Draft
  useEffect(() => {
    // Only save if we have some meaningful data entered to avoid saving empty drafts immediately
    const hasData = formData.firstName || formData.lastName || formData.email || formData.phone;
    if (hasData && !isSubmitting) {
      const timeoutId = setTimeout(() => {
        saveDraft(draftId, formData);
      }, 1000); // 1s debounce
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [formData, draftId, isSubmitting]);

  // Quick Add States
  const [isAyDialogOpen, setIsAyDialogOpen] = useState(false);
  const [ayFormData, setAyFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isActive: false,
  });
  const [isAySubmitting, setIsAySubmitting] = useState(false);

  const [isProgDialogOpen, setIsProgDialogOpen] = useState(false);
  const [progFormData, setProgFormData] = useState({
    name: '',
    code: '',
    level: 'UNDERGRADUATE',
    durationYears: 3,
  });
  const [isProgSubmitting, setIsProgSubmitting] = useState(false);

  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [batchFormData, setBatchFormData] = useState({
    name: '',
    admissionYear: new Date().getFullYear(),
    programId: '',
  });
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);

  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    code: '',
    capacity: 60,
    academicYearId: '',
    departmentId: '',
    programId: '',
    batchId: '',
  });
  const [isSectionSubmitting, setIsSectionSubmitting] = useState(false);

  const handleCreateAy = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAySubmitting(true);
    try {
      const res = await apiClient.post('/admin/institution/academic-years', ayFormData);
      const newAy = res.data;
      setAcademicYears((prev) => [...prev, newAy]);
      setFormData((prev) => ({ ...prev, academicYearId: newAy.id }));
      setIsAyDialogOpen(false);
      setAyFormData({ name: '', startDate: '', endDate: '', isActive: false });
    } catch (e) {
      console.error(e);
      alert('Failed to create Academic Year');
    } finally {
      setIsAySubmitting(false);
    }
  };

  const handleCreateProg = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsProgSubmitting(true);
    try {
      const payload = {
        ...progFormData,
        durationYears: Number(progFormData.durationYears),
      };
      const res = await apiClient.post('/admin/programs', payload);
      const newProg = res.data;
      setPrograms((prev) => [...prev, newProg]);
      setFormData((prev) => ({
        ...prev,
        programId: newProg.id,
        courseId: '',
        batchId: '',
        sectionId: '',
      }));
      setIsProgDialogOpen(false);
      setProgFormData({
        name: '',
        code: '',
        level: 'UNDERGRADUATE',
        durationYears: 3,
      });
    } catch (e) {
      console.error(e);
      alert('Failed to create Program');
    } finally {
      setIsProgSubmitting(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBatchSubmitting(true);
    try {
      if (!formData.sectionId) throw new Error('Section is required for batch');
      const payload = {
        ...batchFormData,
        admissionYear: Number(batchFormData.admissionYear),
        programId: formData.programId || batchFormData.programId,
      };
      if (!payload.programId) throw new Error('Program is required for batch');
      const res = await apiClient.post('/admin/batches', payload);
      const newBatch = res.data;
      setBatches((prev) => [...prev, newBatch]);
      setFormData((prev) => ({ ...prev, batchId: newBatch.id, sectionId: '' }));
      setIsBatchDialogOpen(false);
      setBatchFormData({ name: '', admissionYear: new Date().getFullYear(), programId: '' });
    } catch (e) {
      console.error(e);
      alert('Failed to create Batch');
    } finally {
      setIsBatchSubmitting(false);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSectionSubmitting(true);
    try {
      const { departmentId, ...restSectionData } = sectionFormData;
      const payload = {
        ...restSectionData,
        capacity: Number(sectionFormData.capacity),
        academicYearId: formData.academicYearId || sectionFormData.academicYearId,
        programId: formData.programId || sectionFormData.programId || undefined,
        batchId: formData.batchId || sectionFormData.batchId || undefined,
      };
      if (!payload.academicYearId) throw new Error('Academic Year is required');
      if (!payload.programId) throw new Error('Program is required to create a section');
      const res = await apiClient.post('/admin/sections', payload);
      const newSection = res.data;
      setSections((prev) => [...prev, newSection]);
      setFormData((prev) => ({ ...prev, sectionId: newSection.id }));
      setIsSectionDialogOpen(false);
      setSectionFormData({
        name: '',
        code: '',
        capacity: 60,
        academicYearId: '',
        departmentId: '',
        programId: '',
        batchId: '',
      });
    } catch (e) {
      console.error(e);
      alert('Failed to create Section');
    } finally {
      setIsSectionSubmitting(false);
    }
  };

  // Quick Add Fee Structure State
  const [isFeeStructDialogOpen, setIsFeeStructDialogOpen] = useState(false);
  const [feeStructFormData, setFeeStructFormData] = useState({
    name: '',
    code: '',
    description: '',
    academicYearId: '',
    programId: '',
    batchId: '',
    defaultPaymentMode: 'INSTALLMENTS' as 'ANNUAL' | 'INSTALLMENTS',
    installmentCount: 2,
    installmentIntervalMonths: 6,
    components: [
      {
        name: 'Tuition Fee',
        type: 'TUITION' as FeeComponentType,
        amount: 50000,
        isOptional: false,
        description: 'Standard academic tuition fee',
      },
    ],
  });
  const createFeeStructureMutation = useCreateFeeStructure();

  const handleFeeStructureChange = (structureId: string) => {
    if (!structureId) {
      setFormData((prev) => ({
        ...prev,
        feeStructureId: '',
      }));
      return;
    }

    const structure = allFeeStructures.find((s) => s.id === structureId);
    if (!structure) return;

    const count = 4;
    const amount = structure.totalAmount / count;
    const now = new Date();
    const intervalMonths = 3;

    setFormData((prev) => ({
      ...prev,
      feeStructureId: structure.id,
      totalFee: structure.totalAmount,
      installmentsCount: count,
      installments: Array.from({ length: count }).map((_, idx) => {
        const dueDate = new Date(now);
        dueDate.setMonth(dueDate.getMonth() + idx * intervalMonths);
        return {
          amount: Math.round(amount * 100) / 100,
          dueDate: dueDate.toISOString().split('T')[0],
        };
      }),
    }));
  };

  const handleCreateFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const payload = {
        name: feeStructFormData.name,
        code: feeStructFormData.code,
        academicYearId: feeStructFormData.academicYearId || formData.academicYearId,
        programId: feeStructFormData.programId || formData.programId || undefined,
        batchId: feeStructFormData.batchId || formData.batchId || undefined,
        components: feeStructFormData.components.map((c) => ({
          name: c.name,
          type: c.type,
          amount: Number(c.amount),
          isOptional: c.isOptional,
          description: c.description || undefined,
        })),
      };

      if (!payload.name || !payload.code || !payload.academicYearId) {
        alert('Please provide Structure Name, Code, and Academic Year.');
        return;
      }

      const created = await createFeeStructureMutation.mutateAsync(payload);
      setIsFeeStructDialogOpen(false);
      handleFeeStructureChange(created.id);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to create fee structure');
    }
  };

  // Fee structures fetched dynamically
  const { data: allFeeStructures = [], isLoading: isFeeStructuresLoading } = useFeeStructures({
    isActive: true,
  });

  const selectedFeeStructure = React.useMemo(() => {
    return allFeeStructures.find((fs) => fs.id === formData.feeStructureId) || null;
  }, [allFeeStructures, formData.feeStructureId]);

  // Filter fee structures based on academic year and program if selected
  const matchingFeeStructures = React.useMemo(() => {
    return allFeeStructures.filter((fs) => {
      const matchAy =
        !formData.academicYearId ||
        !fs.academicYearId ||
        fs.academicYearId === formData.academicYearId;
      const matchProg = !formData.programId || !fs.programId || fs.programId === formData.programId;
      return matchAy && matchProg;
    });
  }, [allFeeStructures, formData.academicYearId, formData.programId]);

  // Automatically link the fee structure when academic year and program are selected
  useEffect(() => {
    if (!formData.academicYearId || !formData.programId || allFeeStructures.length === 0) {
      return;
    }

    // Find the best match:
    // 1. Exact match for both academicYearId and programId (and optionally batchId if present)
    const exactMatch =
      (formData.batchId &&
        allFeeStructures.find(
          (fs) =>
            fs.academicYearId === formData.academicYearId &&
            fs.programId === formData.programId &&
            fs.batchId === formData.batchId,
        )) ||
      allFeeStructures.find(
        (fs) =>
          fs.academicYearId === formData.academicYearId && fs.programId === formData.programId,
      );

    if (exactMatch) {
      // If no fee structure is selected yet or the current selection is from another program/academic year
      setFormData((prev) => {
        if (prev.feeStructureId === exactMatch.id) return prev;

        const count = 4;
        const amount = exactMatch.totalAmount / count;
        const now = new Date();
        const intervalMonths = 3;

        return {
          ...prev,
          feeStructureId: exactMatch.id,
          totalFee: exactMatch.totalAmount,
          installmentsCount: count,
          installments: Array.from({ length: count }).map((_, idx) => {
            const dueDate = new Date(now);
            dueDate.setMonth(dueDate.getMonth() + idx * intervalMonths);
            return {
              amount: Math.round(amount * 100) / 100,
              dueDate: dueDate.toISOString().split('T')[0],
            };
          }),
        };
      });
    }
  }, [formData.academicYearId, formData.programId, formData.batchId, allFeeStructures]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [ayRes, progRes, settingsRes, depRes] = await Promise.all([
          apiClient.get('/admin/institution/academic-years'),
          apiClient.get('/admin/programs'),
          apiClient.get('/admin/institution/profile'),
          apiClient.get('/admin/departments?pageSize=100'),
        ]);
        const fetchedAYs = ayRes.data || [];
        setAcademicYears(fetchedAYs);
        setPrograms(progRes.data.data || []);
        setInstitutionType(settingsRes.data.institutionType || 'SCHOOL');
        setDepartments(depRes.data.data || []);

        // Automatically select the active academic year
        const activeAy = fetchedAYs.find((ay: any) => ay.isActive);
        if (activeAy) {
          setFormData((prev) => ({
            ...prev,
            academicYearId: prev.academicYearId || activeAy.id,
          }));
        }
      } catch (e) {
        console.error('Failed to fetch dropdowns', e);
      }
    };
    loadDropdowns();
  }, []);

  const [skillInput, setSkillInput] = useState('');

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = skillInput.trim().toLowerCase();
      if (val && !formData.skills.includes(val)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, val],
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  useEffect(() => {
    const loadCoursesAndBatches = async () => {
      try {
        if (formData.programId && institutionType === 'COLLEGE') {
          const cRes = await apiClient.get(`/admin/courses?programId=${formData.programId}`);
          setCourses(cRes.data.data || []);
        } else {
          setCourses([]);
        }

        if (formData.programId) {
          const bRes = await apiClient.get(`/admin/batches?programId=${formData.programId}`);
          setBatches(bRes.data.data || []);
        } else {
          setBatches([]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadCoursesAndBatches();
  }, [formData.programId, institutionType]);

  useEffect(() => {
    const loadSections = async () => {
      try {
        if (formData.batchId) {
          const sRes = await apiClient.get(`/admin/sections?batchId=${formData.batchId}`);
          setSections(sRes.data.data || []);
        } else if (formData.programId) {
          const sRes = await apiClient.get(`/admin/sections?programId=${formData.programId}`);
          setSections(sRes.data.data || []);
        } else {
          setSections([]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSections();
  }, [formData.batchId, formData.programId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handlePhoneChange = (name: string, value: string | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: value || '' }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step >= 1) {
      if (!formData.firstName) newErrors['firstName'] = 'First name is required';
      if (!formData.lastName) newErrors['lastName'] = 'Last name is required';
      if (!formData.dateOfBirth) newErrors['dateOfBirth'] = 'Date of birth is required';
      if (!formData.fatherEmail && !formData.motherEmail)
        newErrors['parentEmail'] = 'At least one parent email is required';
    }
    if (step >= 2) {
      if (!formData.academicYearId) newErrors['academicYearId'] = 'Academic Year is required';
      if (!formData.sectionId) newErrors['sectionId'] = 'Section is required';
    }
    if (step >= 3) {
      if (formData.totalFee > 0) {
        const sum = formData.installments.reduce((acc, curr) => acc + Number(curr.amount), 0);
        if (Math.abs(sum - formData.totalFee) > 0.01) {
          newErrors['totalFee'] =
            `Installments sum (${sum}) must equal Annual Fee (${formData.totalFee})`;
        }
        formData.installments.forEach((inst, index) => {
          if (!inst.dueDate) {
            newErrors[`installment_${index}_dueDate`] =
              `Due date is required for installment ${index + 1}`;
          }
        });
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        middleName: formData.middleName || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        about: formData.about || undefined,
        skills: formData.skills.length > 0 ? formData.skills : undefined,

        fatherName: formData.fatherName || undefined,
        motherName: formData.motherName || undefined,
        guardianName: formData.guardianName || undefined,
        fatherPhone: formData.fatherPhone || undefined,
        motherPhone: formData.motherPhone || undefined,
        guardianPhone: formData.guardianPhone || undefined,
        fatherEmail: formData.fatherEmail || undefined,
        motherEmail: formData.motherEmail || undefined,

        accomplishments: formData.accomplishments.length > 0 ? formData.accomplishments : undefined,
        previousEducation:
          formData.previousEducation.length > 0 ? formData.previousEducation : undefined,

        academicYearId: formData.academicYearId,
        programId: formData.programId || undefined,
        courseId: formData.courseId || undefined,
        batchId: formData.batchId || undefined,
        sectionId: formData.sectionId || undefined,

        feePlan:
          formData.totalFee > 0
            ? {
                feeStructureId: formData.feeStructureId || undefined,
                totalAmount: formData.totalFee,
                currency: 'INR',
                paymentMode: formData.installmentsCount > 1 ? 'INSTALLMENTS' : 'ANNUAL',
                installmentsCount: formData.installmentsCount,
                installments: formData.installments.map((i) => ({
                  amount: Number(i.amount),
                  dueDate: i.dueDate || new Date().toISOString(),
                })),
              }
            : undefined,
      };

      const result = await createAdmission(payload);
      const studentId = result.id;
      const studentCode = result.studentCode || result.id;
      const dobStr = formData.dateOfBirth ? formData.dateOfBirth.replace(/-/g, '') : 'nodob';

      // Upload Photo
      if (formData.photo) {
        const photoExt = formData.photo.name.split('.').pop();
        const photoName = `${studentId}/profile_${Date.now()}.${photoExt}`;
        const { data: uploadData, error } = await supabase.storage
          .from('student_profile_bucket')
          .upload(photoName, formData.photo);
        if (!error && uploadData) {
          const photoUrl = supabase.storage.from('student_profile_bucket').getPublicUrl(photoName)
            .data.publicUrl;
          await apiClient.put(`/admin/students/${studentId}/photo`, { photoUrl });
        }
      }

      // Upload Documents
      for (const doc of formData.documents) {
        const ext = doc.file.name.split('.').pop();
        const safeName = formData.firstName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const docName = `${studentId}/${studentId}_${dobStr}_${safeName}_${doc.fileName.replace(/[^a-z0-9]/gi, '_')}.${ext}`;
        const { data: uploadData, error } = await supabase.storage
          .from('student_docs_bucket')
          .upload(docName, doc.file);
        if (!error && uploadData) {
          const fileUrl = supabase.storage.from('student_docs_bucket').getPublicUrl(docName)
            .data.publicUrl;
          await apiClient.post(`/admin/students/${studentId}/documents`, {
            fileName: doc.fileName,
            fileUrl,
            mimeType: doc.mimeType,
            size: doc.size,
          });
        }
      }

      await removeDraft(draftId);
      router.push(`/admin/students/${encodeURIComponent(studentCode)}`);
    } catch (error) {
      console.error('Failed to create admission', error);
      alert('Failed to create admission. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleInstallmentCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = Number(e.target.value);
    setFormData((prev) => {
      const amount = prev.totalFee / count;
      return {
        ...prev,
        installmentsCount: count,
        installments: Array.from({ length: count }).map((_, idx) => {
          const existing = prev.installments[idx];
          return {
            amount: Math.round(amount * 100) / 100,
            dueDate: existing?.dueDate || '',
          };
        }),
      };
    });
  };

  const filteredPrograms = programs;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Direct Student Admission</h1>
          <p className="text-muted-foreground mt-1">Enroll a student seamlessly.</p>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="bg-border absolute top-1/2 left-0 -z-10 h-0.5 w-full -translate-y-1/2" />
        <div className="flex justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="bg-background flex flex-col items-center gap-2 px-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isCurrent
                        ? 'bg-background border-primary text-primary'
                        : 'bg-background border-border text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* STEP 1: STUDENT INFO */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-300">
                <section>
                  <h2 className="mb-4 text-xl font-semibold">Basic Student Information</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-3">
                      <Label>Profile Photo</Label>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div
                          className="border-border bg-muted/30 group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 shadow-sm transition hover:opacity-90"
                          onClick={() => {
                            if (photoPreview || formData.photo) {
                              setIsPhotoViewOpen(true);
                            }
                          }}
                          title={
                            photoPreview || formData.photo
                              ? 'Click to view photo'
                              : 'Profile photo preview'
                          }
                        >
                          <img
                            src={photoPreview || '/passport.png'}
                            alt="Student profile preview"
                            className="h-full w-full object-cover"
                          />
                          {(photoPreview || formData.photo) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <ZoomIn className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                          <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setFormData((p) => ({ ...p, photo: file }));
                            }}
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => photoInputRef.current?.click()}
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              {formData.photo ? 'Change Photo' : 'Upload Photo'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={startCamera}
                              className="flex items-center gap-2"
                            >
                              <Camera className="h-4 w-4" />
                              Take Photo
                            </Button>
                            {formData.photo && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFormData((p) => ({ ...p, photo: null }));
                                  if (photoInputRef.current) photoInputRef.current.value = '';
                                }}
                                className="text-destructive hover:bg-destructive/10 h-8 px-2 text-xs"
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                              </Button>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Accepts JPG, PNG, or WEBP, or capture directly using your camera.
                            Defaults to standard passport photo if left blank.
                          </p>

                          {/* CAMERA CAPTURE DIALOG */}
                          <Dialog
                            open={isCameraOpen}
                            onOpenChange={(open) => {
                              if (!open) stopCamera();
                            }}
                          >
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Camera className="h-5 w-5" />
                                  Capture Profile Photo
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {cameraError ? (
                                  <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
                                    <p className="font-medium">Camera Error</p>
                                    <p className="mt-1 text-xs">{cameraError}</p>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={startCamera}
                                      className="mt-3 flex items-center gap-1.5"
                                    >
                                      <RefreshCw className="h-3.5 w-3.5" />
                                      Retry
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-black shadow-inner">
                                    <video
                                      ref={videoRef}
                                      autoPlay
                                      playsInline
                                      muted
                                      className="h-full w-full -scale-x-100 object-cover"
                                    />
                                    {/* Passport photo guideline overlay */}
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                      <div className="h-4/5 w-3/5 rounded-full border-2 border-dashed border-white/60" />
                                    </div>
                                  </div>
                                )}
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={stopCamera}>
                                    Cancel
                                  </Button>
                                  {!cameraError && (
                                    <Button
                                      type="button"
                                      onClick={capturePhoto}
                                      className="flex items-center gap-2"
                                    >
                                      <Camera className="h-4 w-4" />
                                      Capture & Use
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* PHOTO PREVIEW MODAL */}
                          <Dialog open={isPhotoViewOpen} onOpenChange={setIsPhotoViewOpen}>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Profile Photo Preview</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col items-center justify-center gap-4 py-2">
                                <div className="border-border bg-muted/30 relative max-h-[70vh] w-full max-w-sm overflow-hidden rounded-lg border shadow-sm">
                                  <img
                                    src={photoPreview || '/passport.png'}
                                    alt="Student profile preview"
                                    className="h-auto w-full object-contain"
                                  />
                                </div>
                                <div className="flex w-full justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsPhotoViewOpen(false)}
                                  >
                                    Close
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input name="firstName" value={formData.firstName} onChange={handleChange} />
                      {errors['firstName'] && (
                        <span className="text-xs text-red-500">{errors['firstName']}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Middle Name</Label>
                      <Input
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input name="lastName" value={formData.lastName} onChange={handleChange} />
                      {errors['lastName'] && (
                        <span className="text-xs text-red-500">{errors['lastName']}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="dateOfBirth"
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                      {errors['dateOfBirth'] && (
                        <span className="text-xs text-red-500">{errors['dateOfBirth']}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Student Phone</Label>
                      <PhoneInput
                        international={false}
                        defaultCountry="IN"
                        value={formData.phone}
                        onChange={(v) => handlePhoneChange('phone', v)}
                        className="border-input bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Student Email</Label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Input name="address" value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label>About</Label>
                      <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        rows={3}
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label>Skills</Label>
                      <div className="flex flex-col gap-2">
                        <Input
                          placeholder="e.g. communication, drawing (Press Enter to add)"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleSkillKeyDown}
                        />
                        {formData.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {skill}
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                                  onClick={() => removeSkill(skill)}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="mb-4 text-xl font-semibold">Family Information</h2>
                  {errors['parentEmail'] && (
                    <p className="mb-2 text-xs text-red-500">{errors['parentEmail']}</p>
                  )}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>
                        Father Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Father Phone <span className="text-red-500">*</span>
                      </Label>
                      <PhoneInput
                        international={false}
                        defaultCountry="IN"
                        value={formData.fatherPhone}
                        onChange={(v) => handlePhoneChange('fatherPhone', v)}
                        className="border-input bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Father Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="fatherEmail"
                        type="email"
                        value={formData.fatherEmail}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mother Name</Label>
                      <Input
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mother Phone</Label>
                      <PhoneInput
                        international={false}
                        defaultCountry="IN"
                        value={formData.motherPhone}
                        onChange={(v) => handlePhoneChange('motherPhone', v)}
                        className="border-input bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mother Email</Label>
                      <Input
                        name="motherEmail"
                        type="email"
                        value={formData.motherEmail}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Guardian Name (Optional)</Label>
                      <Input
                        name="guardianName"
                        value={formData.guardianName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Guardian Phone (Optional)</Label>
                      <PhoneInput
                        international={false}
                        defaultCountry="IN"
                        value={formData.guardianPhone}
                        onChange={(v) => handlePhoneChange('guardianPhone', v)}
                        className="border-input bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2"
                      />
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="mb-4 text-xl font-semibold">Student Documents</h2>
                  <div className="space-y-4">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-end gap-4 rounded-md border p-4">
                        <div className="flex-1 space-y-2">
                          <Label>File Name / Description</Label>
                          <Input
                            value={doc.fileName}
                            onChange={(e) => {
                              const newDocs = [...formData.documents];
                              newDocs[index].fileName = e.target.value;
                              setFormData((p) => ({ ...p, documents: newDocs }));
                            }}
                            placeholder="e.g. Aadhaar Card"
                          />
                        </div>
                        <div className="flex-1 overflow-hidden pt-4 text-sm">{doc.file.name}</div>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => {
                            const newDocs = [...formData.documents];
                            newDocs.splice(index, 1);
                            setFormData((p) => ({ ...p, documents: newDocs }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-4">
                      <input
                        ref={documentInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setFormData((p) => ({
                              ...p,
                              documents: [
                                ...p.documents,
                                {
                                  file,
                                  fileName: file.name.replace(/\.pdf$/i, ''),
                                  size: file.size,
                                  mimeType: file.type,
                                },
                              ],
                            }));
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => documentInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Document
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* STEP 2: ACADEMIC DETAILS */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-300">
                <section>
                  <h2 className="mb-4 text-xl font-semibold">Previous Education</h2>
                  <div className="space-y-4">
                    {formData.previousEducation.map((edu, index) => (
                      <div key={index} className="flex items-end gap-4 rounded-md border p-4">
                        <div className="bg-muted mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>Institution Name</Label>
                          <Input
                            value={edu.institutionName}
                            onChange={(e) => {
                              const newEdu = [...formData.previousEducation];
                              newEdu[index].institutionName = e.target.value;
                              setFormData((p) => ({ ...p, previousEducation: newEdu }));
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>Academic Year</Label>
                          <Input
                            value={edu.academicYear}
                            placeholder="e.g. 2018-2019"
                            onChange={(e) => {
                              const newEdu = [...formData.previousEducation];
                              newEdu[index].academicYear = e.target.value;
                              setFormData((p) => ({ ...p, previousEducation: newEdu }));
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => {
                            const newEdu = [...formData.previousEducation];
                            newEdu.splice(index, 1);
                            setFormData((p) => ({ ...p, previousEducation: newEdu }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          previousEducation: [
                            ...p.previousEducation,
                            { institutionName: '', academicYear: '' },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Previous Education
                    </Button>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="mb-4 text-xl font-semibold">Current Admission</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>
                        Academic Year <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <select
                          name="academicYearId"
                          value={formData.academicYearId}
                          onChange={handleChange}
                          className="border-input bg-background ring-offset-background w-full rounded-md border px-3 py-2 text-sm"
                        >
                          <option value="">Select Academic Year</option>
                          {academicYears.map((y) => (
                            <option key={y.id} value={y.id}>
                              {y.name}
                            </option>
                          ))}
                        </select>
                        <Dialog open={isAyDialogOpen} onOpenChange={setIsAyDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Academic Year</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateAy} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Name (e.g. 2024-2025)</Label>
                                <Input
                                  required
                                  value={ayFormData.name}
                                  onChange={(e) =>
                                    setAyFormData((p) => ({ ...p, name: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                  required
                                  type="date"
                                  value={ayFormData.startDate}
                                  onChange={(e) =>
                                    setAyFormData((p) => ({ ...p, startDate: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                  required
                                  type="date"
                                  value={ayFormData.endDate}
                                  onChange={(e) =>
                                    setAyFormData((p) => ({ ...p, endDate: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="ay-active"
                                  checked={ayFormData.isActive}
                                  onChange={(e) =>
                                    setAyFormData((p) => ({ ...p, isActive: e.target.checked }))
                                  }
                                />
                                <Label htmlFor="ay-active">Is Active?</Label>
                              </div>
                              <Button type="submit" disabled={isAySubmitting}>
                                {isAySubmitting ? 'Saving...' : 'Save'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {errors['academicYearId'] && (
                        <span className="text-xs text-red-500">{errors['academicYearId']}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Program</Label>
                      <div className="flex items-center gap-2">
                        <select
                          name="programId"
                          value={formData.programId}
                          onChange={(e) => {
                            handleChange(e);
                            setFormData((p) => ({
                              ...p,
                              courseId: '',
                              batchId: '',
                              sectionId: '',
                            }));
                          }}
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        >
                          <option value="">Select Program</option>
                          {filteredPrograms.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.code})
                            </option>
                          ))}
                        </select>
                        <Dialog open={isProgDialogOpen} onOpenChange={setIsProgDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Program</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateProg} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  required
                                  value={progFormData.name}
                                  onChange={(e) =>
                                    setProgFormData((p) => ({ ...p, name: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Code</Label>
                                <Input
                                  required
                                  value={progFormData.code}
                                  onChange={(e) =>
                                    setProgFormData((p) => ({ ...p, code: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Level</Label>
                                <select
                                  required
                                  className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                  value={progFormData.level}
                                  onChange={(e) =>
                                    setProgFormData((p) => ({ ...p, level: e.target.value }))
                                  }
                                >
                                  {PROGRAM_LEVELS.map((level) => (
                                    <option key={level} value={level}>
                                      {level.replace(/_/g, ' ')}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>Duration (Years)</Label>
                                <Input
                                  required
                                  type="number"
                                  value={progFormData.durationYears}
                                  onChange={(e) =>
                                    setProgFormData((p) => ({
                                      ...p,
                                      durationYears: Number(e.target.value),
                                    }))
                                  }
                                />
                              </div>
                              <Button type="submit" disabled={isProgSubmitting}>
                                {isProgSubmitting ? 'Saving...' : 'Save'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Section <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-2">
                        <select
                          name="sectionId"
                          value={formData.sectionId}
                          onChange={handleChange}
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        >
                          <option value="">Select Section</option>
                          {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                              disabled={!formData.academicYearId || !formData.programId}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Section</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSection} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Name (e.g. A, B)</Label>
                                <Input
                                  required
                                  value={sectionFormData.name}
                                  onChange={(e) =>
                                    setSectionFormData((p) => ({ ...p, name: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Code (e.g. SEC-A)</Label>
                                <Input
                                  required
                                  value={sectionFormData.code}
                                  onChange={(e) =>
                                    setSectionFormData((p) => ({ ...p, code: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Capacity</Label>
                                <Input
                                  required
                                  type="number"
                                  value={sectionFormData.capacity}
                                  onChange={(e) =>
                                    setSectionFormData((p) => ({
                                      ...p,
                                      capacity: Number(e.target.value),
                                    }))
                                  }
                                />
                              </div>
                              <Button type="submit" disabled={isSectionSubmitting}>
                                {isSectionSubmitting ? 'Saving...' : 'Save'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {errors['sectionId'] && (
                        <span className="text-xs text-red-500">{errors['sectionId']}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Batch</Label>
                      <div className="flex items-center gap-2">
                        <select
                          name="batchId"
                          value={formData.batchId}
                          onChange={(e) => {
                            handleChange(e);
                            setFormData((p) => ({ ...p, sectionId: '' }));
                          }}
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        >
                          <option value="">Select Batch (Optional)</option>
                          {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                              disabled={!formData.programId || !formData.sectionId}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Batch</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateBatch} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  required
                                  placeholder="e.g. 2024-2028"
                                  value={batchFormData.name}
                                  onChange={(e) =>
                                    setBatchFormData((p) => ({ ...p, name: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Admission Year</Label>
                                <Input
                                  required
                                  type="number"
                                  value={batchFormData.admissionYear}
                                  onChange={(e) =>
                                    setBatchFormData((p) => ({
                                      ...p,
                                      admissionYear: Number(e.target.value),
                                    }))
                                  }
                                />
                              </div>
                              <Button type="submit" disabled={isBatchSubmitting}>
                                {isBatchSubmitting ? 'Saving...' : 'Save'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {errors['batchId'] && (
                        <span className="text-xs text-red-500">{errors['batchId']}</span>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* STEP 3: FEE */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-300">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold">Fee Configuration</h2>
                  <p className="text-muted-foreground text-sm">
                    Fee details are automatically populated based on the selected fee structure
                    template.
                  </p>
                </div>
                {errors['totalFee'] && (
                  <p className="text-sm font-semibold text-red-500">{errors['totalFee']}</p>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="feeStructureSelect">Fee Structure Template</Label>
                    <div className="flex max-w-md items-center gap-2">
                      <select
                        id="feeStructureSelect"
                        value={formData.feeStructureId}
                        onChange={(e) => handleFeeStructureChange(e.target.value)}
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      >
                        <option value="">
                          {isFeeStructuresLoading
                            ? 'Loading fee structures...'
                            : matchingFeeStructures.length > 0
                              ? 'Select a fee structure...'
                              : 'No fee structures match the selected program/year'}
                        </option>
                        {matchingFeeStructures.map((fs) => (
                          <option key={fs.id} value={fs.id}>
                            {fs.name} (₹{fs.totalAmount?.toLocaleString('en-IN')})
                            {fs.code ? ` - ${fs.code}` : ''}
                          </option>
                        ))}
                        {/* Show other active structures if they don't match current program/year */}
                        {allFeeStructures.length > matchingFeeStructures.length && (
                          <optgroup label="Other Fee Structures">
                            {allFeeStructures
                              .filter((fs) => !matchingFeeStructures.some((m) => m.id === fs.id))
                              .map((fs) => (
                                <option key={fs.id} value={fs.id}>
                                  {fs.name} (₹{fs.totalAmount?.toLocaleString('en-IN')})
                                  {fs.academicYear?.name ? ` • ${fs.academicYear.name}` : ''}
                                  {fs.program?.name ? ` • ${fs.program.name}` : ''}
                                </option>
                              ))}
                          </optgroup>
                        )}
                      </select>

                      <Dialog
                        open={isFeeStructDialogOpen}
                        onOpenChange={(open) => {
                          setIsFeeStructDialogOpen(open);
                          if (open) {
                            setFeeStructFormData({
                              name: '',
                              code: '',
                              description: '',
                              academicYearId: formData.academicYearId || academicYears[0]?.id || '',
                              programId: formData.programId || '',
                              batchId: formData.batchId || '',
                              defaultPaymentMode: 'INSTALLMENTS',
                              installmentCount: 2,
                              installmentIntervalMonths: 6,
                              components: [
                                {
                                  name: 'Tuition Fee',
                                  type: 'TUITION',
                                  amount: 50000,
                                  isOptional: false,
                                  description: 'Standard academic tuition fee',
                                },
                              ],
                            });
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            title="Create New Fee Structure"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create Fee Structure</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateFeeStructure} className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <Label>Structure Name *</Label>
                                <Input
                                  required
                                  placeholder="e.g. B.Tech Standard 2024-25"
                                  value={feeStructFormData.name}
                                  onChange={(e) =>
                                    setFeeStructFormData((p) => ({ ...p, name: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label>Structure Code *</Label>
                                <Input
                                  required
                                  placeholder="e.g. FS-BTECH-2024"
                                  value={feeStructFormData.code}
                                  onChange={(e) =>
                                    setFeeStructFormData((p) => ({
                                      ...p,
                                      code: e.target.value.toUpperCase(),
                                    }))
                                  }
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label>Academic Year *</Label>
                                <select
                                  required
                                  value={feeStructFormData.academicYearId}
                                  onChange={(e) =>
                                    setFeeStructFormData((p) => ({
                                      ...p,
                                      academicYearId: e.target.value,
                                    }))
                                  }
                                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                                >
                                  <option value="">Select Academic Year</option>
                                  {academicYears.map((ay) => (
                                    <option key={ay.id} value={ay.id}>
                                      {ay.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <Label>Program (Optional)</Label>
                                <select
                                  value={feeStructFormData.programId}
                                  onChange={(e) =>
                                    setFeeStructFormData((p) => ({
                                      ...p,
                                      programId: e.target.value,
                                    }))
                                  }
                                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                                >
                                  <option value="">All Programs</option>
                                  {programs.map((prog) => (
                                    <option key={prog.id} value={prog.id}>
                                      {prog.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <Label>Payment Mode</Label>
                                <select
                                  value={feeStructFormData.defaultPaymentMode}
                                  onChange={(e) =>
                                    setFeeStructFormData((p) => ({
                                      ...p,
                                      defaultPaymentMode: e.target.value as
                                        'ANNUAL' | 'INSTALLMENTS',
                                    }))
                                  }
                                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                                >
                                  <option value="INSTALLMENTS">Installments</option>
                                  <option value="ANNUAL">Annual (Single Payment)</option>
                                </select>
                              </div>

                              {feeStructFormData.defaultPaymentMode === 'INSTALLMENTS' && (
                                <>
                                  <div className="space-y-1.5">
                                    <Label>Installment Count</Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={12}
                                      value={feeStructFormData.installmentCount}
                                      onChange={(e) =>
                                        setFeeStructFormData((p) => ({
                                          ...p,
                                          installmentCount: Number(e.target.value),
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label>Interval (Months)</Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={12}
                                      value={feeStructFormData.installmentIntervalMonths}
                                      onChange={(e) =>
                                        setFeeStructFormData((p) => ({
                                          ...p,
                                          installmentIntervalMonths: Number(e.target.value),
                                        }))
                                      }
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="space-y-3 rounded-lg border p-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold">Fee Components</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setFeeStructFormData((p) => ({
                                      ...p,
                                      components: [
                                        ...p.components,
                                        {
                                          name: 'Additional Fee',
                                          type: 'MISC',
                                          amount: 5000,
                                          isOptional: false,
                                          description: '',
                                        },
                                      ],
                                    }))
                                  }
                                  className="flex items-center gap-1 text-xs"
                                >
                                  <Plus className="h-3 w-3" /> Add Item
                                </Button>
                              </div>

                              <div className="space-y-2">
                                {feeStructFormData.components.map((comp, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-muted/40 grid grid-cols-1 gap-2 rounded-md border p-2 sm:grid-cols-12 sm:items-center"
                                  >
                                    <div className="sm:col-span-5">
                                      <Input
                                        placeholder="Component Name"
                                        value={comp.name}
                                        required
                                        onChange={(e) => {
                                          const next = [...feeStructFormData.components];
                                          next[idx].name = e.target.value;
                                          setFeeStructFormData((p) => ({ ...p, components: next }));
                                        }}
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                    <div className="sm:col-span-4">
                                      <Input
                                        type="number"
                                        min={0}
                                        placeholder="Amount"
                                        value={comp.amount}
                                        required
                                        onChange={(e) => {
                                          const next = [...feeStructFormData.components];
                                          next[idx].amount = Number(e.target.value);
                                          setFeeStructFormData((p) => ({ ...p, components: next }));
                                        }}
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                    <div className="flex items-center justify-end sm:col-span-3">
                                      {feeStructFormData.components.length > 1 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="text-destructive h-8 w-8"
                                          onClick={() =>
                                            setFeeStructFormData((p) => ({
                                              ...p,
                                              components: p.components.filter((_, i) => i !== idx),
                                            }))
                                          }
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-between pt-1 text-xs font-medium">
                                <span>Total Amount:</span>
                                <span>
                                  ₹
                                  {feeStructFormData.components
                                    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
                                    .toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFeeStructDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={createFeeStructureMutation.isPending}
                                className="bg-admin-primary hover:bg-admin-primary/90"
                              >
                                {createFeeStructureMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save & Apply Structure
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {formData.feeStructureId && (
                      <div className="flex items-center gap-2 pt-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Fee structure linked and schedule populated automatically.</span>
                      </div>
                    )}
                  </div>

                  {/* Detailed Overview of Selected Fee Structure */}
                  {selectedFeeStructure && (
                    <div className="bg-card space-y-4 rounded-lg border p-4 md:p-6">
                      <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{selectedFeeStructure.name}</h3>
                            {selectedFeeStructure.code && (
                              <Badge variant="outline" className="text-xs">
                                {selectedFeeStructure.code}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {[
                              selectedFeeStructure.academicYear?.name,
                              selectedFeeStructure.program?.name,
                              selectedFeeStructure.batch?.name,
                            ]
                              .filter(Boolean)
                              .join(' • ')}
                          </p>
                        </div>
                        <div className="mt-2 text-left sm:mt-0 sm:text-right">
                          <span className="text-muted-foreground block text-xs">
                            Total Structure Fee
                          </span>
                          <span className="text-lg font-bold">
                            ₹{selectedFeeStructure.totalAmount?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {selectedFeeStructure.components &&
                        selectedFeeStructure.components.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                              Fee Components Breakdown
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="text-muted-foreground border-b">
                                  <tr>
                                    <th className="pb-2 font-medium">Component</th>
                                    <th className="pb-2 font-medium">Type</th>
                                    <th className="pb-2 font-medium">Nature</th>
                                    <th className="pb-2 text-right font-medium">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {selectedFeeStructure.components.map((c, i) => (
                                    <tr key={i} className="hover:bg-muted/40 transition-colors">
                                      <td className="py-2.5 font-medium">
                                        {c.name}
                                        {c.description && (
                                          <p className="text-muted-foreground text-[11px] font-normal">
                                            {c.description}
                                          </p>
                                        )}
                                      </td>
                                      <td className="text-muted-foreground py-2.5">
                                        <Badge variant="secondary" className="text-[10px]">
                                          {c.type}
                                        </Badge>
                                      </td>
                                      <td className="py-2.5">
                                        <Badge variant="outline" className="text-[10px]">
                                          {c.isOptional ? 'Optional' : 'Mandatory'}
                                        </Badge>
                                      </td>
                                      <td className="py-2.5 text-right font-semibold">
                                        ₹{Number(c.amount).toLocaleString('en-IN')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  <div className="grid max-w-md grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label>Annual Fee (₹)</Label>
                      <Input
                        name="totalFee"
                        type="number"
                        value={formData.totalFee}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>

                    {formData.totalFee > 0 && (
                      <div className="space-y-2">
                        <Label>Installment Plan</Label>
                        <select
                          value={formData.installmentsCount}
                          disabled
                          className="border-input bg-muted w-full cursor-not-allowed rounded-md border px-3 py-2 text-sm"
                        >
                          <option value={1}>1 Installment</option>
                          <option value={2}>2 Installments</option>
                          <option value={3}>3 Installments</option>
                          <option value={4}>4 Installments</option>
                        </select>

                        <div className="bg-muted/30 mt-4 space-y-3 rounded-lg border p-4">
                          <p className="text-sm font-medium">Installment Schedule</p>
                          {formData.installments.map((inst, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <div className="flex items-center gap-4">
                                <span className="text-muted-foreground text-sm font-semibold whitespace-nowrap">
                                  Inst {idx + 1}
                                </span>
                                <Input
                                  type="number"
                                  value={inst.amount}
                                  disabled
                                  className="bg-muted cursor-not-allowed"
                                />
                                <div className="w-full flex-1">
                                  <Input
                                    type="date"
                                    required
                                    value={inst.dueDate}
                                    disabled
                                    className="bg-muted cursor-not-allowed"
                                  />
                                </div>
                              </div>
                              {errors[`installment_${idx}_dueDate`] && (
                                <span className="text-right text-xs text-red-500">
                                  {errors[`installment_${idx}_dueDate`]}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PREVIEW */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-300">
                <h2 className="mb-4 text-xl font-semibold">Preview & Submit</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-2 rounded-md border p-4 text-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Student Info</h3>
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                        Edit
                      </Button>
                    </div>
                    <p>
                      <strong>Name:</strong> {formData.firstName} {formData.middleName}{' '}
                      {formData.lastName}
                    </p>
                    <p>
                      <strong>DOB:</strong> {formData.dateOfBirth}
                    </p>
                    <p>
                      <strong>Gender:</strong> {formData.gender}
                    </p>
                    <p>
                      <strong>Phone:</strong> {formData.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {formData.email}
                    </p>
                    <p>
                      <strong>Parents:</strong> {formData.fatherName} & {formData.motherName}
                    </p>
                    <p>
                      <strong>Documents:</strong> {formData.documents.length} files attached
                    </p>
                  </div>
                  <div className="space-y-2 rounded-md border p-4 text-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Academic Details</h3>
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                        Edit
                      </Button>
                    </div>
                    <p>
                      <strong>Program ID:</strong> {formData.programId}
                    </p>
                    {institutionType === 'COLLEGE' && (
                      <p>
                        <strong>Course ID:</strong> {formData.courseId}
                      </p>
                    )}
                    <p>
                      <strong>Section ID:</strong> {formData.sectionId}
                    </p>
                    <p>
                      <strong>Batch ID:</strong> {formData.batchId}
                    </p>
                    {formData.previousEducation.length > 0 && (
                      <div className="pt-2">
                        <p className="font-semibold">Previous Education:</p>
                        <ul className="list-inside list-disc pl-1">
                          {formData.previousEducation.map((edu, idx) => (
                            <li key={idx}>
                              {edu.institutionName} ({edu.academicYear})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 rounded-md border p-4 text-sm md:col-span-2">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Fee Details</h3>
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)}>
                        Edit
                      </Button>
                    </div>
                    {formData.feeStructureId && (
                      <p>
                        <strong>Fee Structure:</strong>{' '}
                        {allFeeStructures.find((s) => s.id === formData.feeStructureId)?.name ||
                          'Linked Structure'}
                      </p>
                    )}
                    <p>
                      <strong>Annual Fee:</strong> ₹{formData.totalFee}
                    </p>
                    <p>
                      <strong>Installments:</strong> {formData.installmentsCount}
                    </p>
                    <div className="mt-2 flex gap-4">
                      {formData.installments.map((inst, i) => (
                        <div key={i} className="bg-muted rounded-md p-2">
                          <p>
                            Inst {i + 1}: ₹{inst.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              {currentStep < steps.length ? (
                <Button type="button" onClick={nextStep}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="bg-admin-primary hover:bg-admin-primary/90"
                >
                  {isSubmitting || isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Create Student Admission
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DirectAdmissionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        </div>
      }
    >
      <DirectAdmissionForm />
    </Suspense>
  );
}
