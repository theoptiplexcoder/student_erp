'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { useCreateDirectAdmission } from '@/hooks/api/admin/useAdmissions';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { createClient } from '@/lib/supabase/client';
import { apiClient } from '@/lib/api-client';

const steps = [
  { id: 1, title: 'Student Info', icon: User },
  { id: 2, title: 'Academic Details', icon: BookOpen },
  { id: 3, title: 'Fee', icon: IndianRupee },
  { id: 4, title: 'Preview & Submit', icon: CheckCircle2 },
];

export default function DirectAdmissionPage() {
  const router = useRouter();
  const { mutateAsync: createAdmission, isPending } = useCreateDirectAdmission();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetched data
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [institutionType, setInstitutionType] = useState<'SCHOOL' | 'COLLEGE'>('SCHOOL');

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [ayRes, progRes, settingsRes] = await Promise.all([
          apiClient.get('/admin/institution/academic-years'),
          apiClient.get('/admin/programs'),
          apiClient.get('/admin/institution/profile'),
        ]);
        const fetchedAYs = ayRes.data || [];
        setAcademicYears(fetchedAYs);
        setPrograms(progRes.data.data || []);
        setInstitutionType(settingsRes.data.institutionType || 'SCHOOL');

        // Automatically select the active academic year
        const activeAy = fetchedAYs.find((ay: any) => ay.isActive);
        if (activeAy) {
          setFormData((prev) => ({ ...prev, academicYearId: activeAy.id }));
        }
      } catch (e) {
        console.error('Failed to fetch dropdowns', e);
      }
    };
    loadDropdowns();
  }, []);

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
    usn: '',

    totalFee: 0,
    installmentsCount: 1,
    installments: [] as { amount: number; dueDate: string }[],
  });

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
    if (step === 1) {
      if (!formData.firstName) newErrors['firstName'] = 'First name is required';
      if (!formData.fatherEmail && !formData.motherEmail)
        newErrors['parentEmail'] = 'At least one parent email is required';
    }
    if (step === 2) {
      if (!formData.academicYearId) newErrors['academicYearId'] = 'Academic Year is required';
      if (!formData.batchId) newErrors['batchId'] = 'Batch is required';
      if (!formData.sectionId) newErrors['sectionId'] = 'Section is required';
      if (!formData.usn) newErrors['usn'] = 'USN / Registration No. is required';
    }
    if (step === 3) {
      const sum = formData.installments.reduce((acc, curr) => acc + Number(curr.amount), 0);
      if (Math.abs(sum - formData.totalFee) > 0.01) {
        newErrors['totalFee'] =
          `Installments sum (${sum}) must equal Annual Fee (${formData.totalFee})`;
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
        usn: formData.usn || undefined,

        feePlan:
          formData.totalFee > 0
            ? {
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

      router.push(`/admin/students/${studentCode}`);
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
        installments: Array.from({ length: count }).map(() => ({
          amount: Math.round(amount * 100) / 100,
          dueDate: '',
        })),
      };
    });
  };

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
                      <Label>Last Name</Label>
                      <Input name="lastName" value={formData.lastName} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
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
                      <Label>Photo (student_profile_bucket)</Label>
                      <Input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, photo: e.target.files?.[0] || null }))
                        }
                      />
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
                      <Label>Father Name</Label>
                      <Input
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Father Phone</Label>
                      <PhoneInput
                        international={false}
                        defaultCountry="IN"
                        value={formData.fatherPhone}
                        onChange={(v) => handlePhoneChange('fatherPhone', v)}
                        className="border-input bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Father Email</Label>
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
                  <h2 className="mb-4 text-xl font-semibold">Accomplishments</h2>
                  <div className="space-y-4">
                    {formData.accomplishments.map((acc, index) => (
                      <div key={index} className="flex items-end gap-4 rounded-md border p-4">
                        <div className="flex-1 space-y-2">
                          <Label>Type</Label>
                          <select
                            value={acc.type}
                            onChange={(e) => {
                              const newAcc = [...formData.accomplishments];
                              newAcc[index].type = e.target.value;
                              setFormData((p) => ({ ...p, accomplishments: newAcc }));
                            }}
                            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                          >
                            <option value="PROJECT">Project</option>
                            <option value="WORKSHOP">Workshop</option>
                            <option value="CERTIFICATE">Certificate</option>
                            {institutionType === 'COLLEGE' && (
                              <option value="PUBLICATION">Publication</option>
                            )}
                            {institutionType === 'COLLEGE' && (
                              <option value="PATENT">Patent</option>
                            )}
                          </select>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={acc.title}
                            onChange={(e) => {
                              const newAcc = [...formData.accomplishments];
                              newAcc[index].title = e.target.value;
                              setFormData((p) => ({ ...p, accomplishments: newAcc }));
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => {
                            const newAcc = [...formData.accomplishments];
                            newAcc.splice(index, 1);
                            setFormData((p) => ({ ...p, accomplishments: newAcc }));
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
                          accomplishments: [
                            ...p.accomplishments,
                            { type: 'PROJECT', title: '', description: '' },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Accomplishment
                    </Button>
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
                      <Input
                        type="file"
                        accept="application/pdf"
                        className="w-auto"
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
                      {errors['academicYearId'] && (
                        <span className="text-xs text-red-500">{errors['academicYearId']}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Program</Label>
                      <select
                        name="programId"
                        value={formData.programId}
                        onChange={(e) => {
                          handleChange(e);
                          setFormData((p) => ({ ...p, courseId: '', batchId: '', sectionId: '' }));
                        }}
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      >
                        <option value="">Select Program</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Section <span className="text-red-500">*</span>
                      </Label>
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
                      {errors['sectionId'] && (
                        <span className="text-xs text-red-500">{errors['sectionId']}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Batch <span className="text-red-500">*</span>
                      </Label>
                      <select
                        name="batchId"
                        value={formData.batchId}
                        onChange={(e) => {
                          handleChange(e);
                          setFormData((p) => ({ ...p, sectionId: '' }));
                        }}
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      >
                        <option value="">Select Batch</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      {errors['batchId'] && (
                        <span className="text-xs text-red-500">{errors['batchId']}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Registration No. <span className="text-red-500">*</span>
                      </Label>
                      <Input name="usn" value={formData.usn} onChange={handleChange} />
                      {errors['usn'] && (
                        <span className="text-xs text-red-500">{errors['usn']}</span>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* STEP 3: FEE */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-8 duration-300">
                <h2 className="mb-4 text-xl font-semibold">Fee Configuration</h2>
                {errors['totalFee'] && (
                  <p className="text-sm font-semibold text-red-500">{errors['totalFee']}</p>
                )}
                <div className="grid max-w-md grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label>Annual Fee (₹)</Label>
                    <Input
                      name="totalFee"
                      type="number"
                      value={formData.totalFee}
                      onChange={handleChange}
                    />
                  </div>

                  {formData.totalFee > 0 && (
                    <div className="space-y-2">
                      <Label>Installment Plan</Label>
                      <select
                        value={formData.installmentsCount}
                        onChange={handleInstallmentCountChange}
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      >
                        <option value={1}>1 Installment</option>
                        <option value={2}>2 Installments</option>
                        <option value={3}>3 Installments</option>
                        <option value={4}>4 Installments</option>
                      </select>

                      <div className="bg-muted/30 mt-4 space-y-3 rounded-lg border p-4">
                        <p className="text-sm font-medium">Installment Schedule</p>
                        {formData.installments.map((inst, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <span className="text-muted-foreground text-sm font-semibold whitespace-nowrap">
                              Inst {idx + 1}
                            </span>
                            <Input
                              type="number"
                              value={inst.amount}
                              onChange={(e) => {
                                const newInst = [...formData.installments];
                                newInst[idx].amount = Number(e.target.value);
                                setFormData((p) => ({ ...p, installments: newInst }));
                              }}
                            />
                            <Input
                              type="date"
                              value={inst.dueDate}
                              onChange={(e) => {
                                const newInst = [...formData.installments];
                                newInst[idx].dueDate = e.target.value;
                                setFormData((p) => ({ ...p, installments: newInst }));
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    <p>
                      <strong>USN:</strong> {formData.usn}
                    </p>
                  </div>
                  <div className="space-y-2 rounded-md border p-4 text-sm md:col-span-2">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Fee Details</h3>
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)}>
                        Edit
                      </Button>
                    </div>
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
