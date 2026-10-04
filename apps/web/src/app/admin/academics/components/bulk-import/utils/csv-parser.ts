import * as XLSX from 'xlsx';

export interface ParsedDepartment {
  code: string;
  name: string;
}

export interface ParsedCourse {
  code: string;
  title: string;
  credits: number;
  departmentCode: string;
  type?: string;
}

export interface ParsedProgram {
  code: string;
  name: string;
  level: string;
  durationYears: number;
  departmentCode: string;
}

export interface ParsedSection {
  code: string;
  name: string;
  capacity: number;
  academicYearCode?: string;
}

export interface ParsedTermCourse {
  courseCode: string;
  isMandatory: boolean;
  prerequisites?: string[];
}

export interface ParsedTerm {
  sequence: number;
  name: string;
  courses: ParsedTermCourse[];
  sections: ParsedSection[];
}

export interface ParsedCurriculum {
  programCode: string;
  curriculumName: string;
  versionNumber?: string;
  terms: ParsedTerm[];
}

export interface ParsedAcademicData {
  academicYearCode?: string;
  departments: ParsedDepartment[];
  courses: ParsedCourse[];
  programs: ParsedProgram[];
  curriculums: ParsedCurriculum[];
}

export interface ParseError {
  file: string;
  row?: number;
  message: string;
}

// -------------------------------------------------------------
// Helper: read raw sheet rows from a File object
// -------------------------------------------------------------
async function readSheetRows(file: File): Promise<any[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) return [];
  return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
}

function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

function getField(row: any, candidates: string[]): string {
  const normMap: Record<string, string> = {};
  for (const k of Object.keys(row)) {
    normMap[normalizeKey(k)] = row[k] !== undefined && row[k] !== null ? String(row[k]).trim() : '';
  }
  for (const c of candidates) {
    const val = normMap[normalizeKey(c)];
    if (val !== undefined && val !== '') return val;
  }
  return '';
}

// -------------------------------------------------------------
// Detect file role from headers
// -------------------------------------------------------------
export type AcademicFileType =
  'departments' | 'courses' | 'programs' | 'curriculum' | 'sections' | 'unknown';

export function detectFileType(headers: string[]): AcademicFileType {
  const normHeaders = headers.map(normalizeKey);
  const has = (key: string) => normHeaders.some((h) => h.includes(normalizeKey(key)));

  if (has('sectioncode') || (has('capacity') && has('section'))) return 'sections';
  if (has('curriculum') || has('termsequence') || has('ismandatory')) return 'curriculum';
  if (has('duration') || has('durationyears') || (has('program') && has('level')))
    return 'programs';
  if (has('credit') || has('credits') || has('coursetitle')) return 'courses';
  if (has('deptcode') || (has('code') && has('name') && !has('credit') && !has('duration'))) {
    return 'departments';
  }
  return 'unknown';
}

// -------------------------------------------------------------
// Main parse function for multiple files
// -------------------------------------------------------------
export async function parseAcademicFiles(files: File[]): Promise<{
  data: ParsedAcademicData;
  errors: ParseError[];
  detected: Record<string, AcademicFileType>;
}> {
  const errors: ParseError[] = [];
  const detected: Record<string, AcademicFileType> = {};

  let departments: ParsedDepartment[] = [];
  let courses: ParsedCourse[] = [];
  let programs: ParsedProgram[] = [];
  const rawCurriculums: any[] = [];
  const rawSections: any[] = [];

  for (const file of files) {
    try {
      const rows = await readSheetRows(file);
      if (rows.length === 0) {
        errors.push({ file: file.name, message: 'File is empty' });
        continue;
      }
      const headers = Object.keys(rows[0]);
      const fileType = detectFileType(headers);
      detected[file.name] = fileType;

      if (fileType === 'departments') {
        rows.forEach((r, idx) => {
          const code = getField(r, ['code', 'dept_code', 'department_code', 'deptcode']);
          const name = getField(r, ['name', 'dept_name', 'department_name', 'deptname']);
          if (!code || !name) {
            errors.push({ file: file.name, row: idx + 2, message: 'Missing code or name' });
            return;
          }
          departments.push({ code: code.toUpperCase(), name });
        });
      } else if (fileType === 'courses') {
        rows.forEach((r, idx) => {
          const code = getField(r, ['code', 'course_code', 'coursecode']);
          const title = getField(r, ['title', 'name', 'course_title', 'coursename']);
          const creditsStr = getField(r, ['credits', 'credit_value', 'creditvalue', 'credit']);
          const departmentCode = getField(r, [
            'department_code',
            'dept_code',
            'departmentcode',
            'dept',
          ]);
          const type = getField(r, ['type', 'course_type', 'coursetype']) || 'THEORY';

          if (!code || !title) {
            errors.push({ file: file.name, row: idx + 2, message: 'Missing course code or title' });
            return;
          }
          courses.push({
            code: code.toUpperCase(),
            title,
            credits: parseFloat(creditsStr) || 3,
            departmentCode: departmentCode.toUpperCase(),
            type,
          });
        });
      } else if (fileType === 'programs') {
        rows.forEach((r, idx) => {
          const code = getField(r, ['code', 'program_code', 'programcode']);
          const name = getField(r, ['name', 'program_name', 'programname']);
          const level = getField(r, ['level', 'program_level']) || 'UNDERGRADUATE';
          const durationStr = getField(r, ['duration_years', 'durationyears', 'duration']) || '4';
          const departmentCode = getField(r, [
            'department_code',
            'dept_code',
            'departmentcode',
            'dept',
          ]);

          if (!code || !name) {
            errors.push({ file: file.name, row: idx + 2, message: 'Missing program code or name' });
            return;
          }
          programs.push({
            code: code.toUpperCase(),
            name,
            level: level.toUpperCase(),
            durationYears: parseInt(durationStr, 10) || 4,
            departmentCode: departmentCode.toUpperCase(),
          });
        });
      } else if (fileType === 'curriculum') {
        rawCurriculums.push(...rows.map((r, idx) => ({ ...r, _file: file.name, _row: idx + 2 })));
      } else if (fileType === 'sections') {
        rawSections.push(...rows.map((r, idx) => ({ ...r, _file: file.name, _row: idx + 2 })));
      } else {
        errors.push({
          file: file.name,
          message: `Unrecognized file format or headers. Could not match with academic entities.`,
        });
      }
    } catch (err: any) {
      errors.push({ file: file.name, message: err.message || 'Failed to read file' });
    }
  }

  // Deduplicate departments by code
  const deptMap = new Map<string, ParsedDepartment>();
  departments.forEach((d) => deptMap.set(d.code, d));
  departments = Array.from(deptMap.values());

  // Deduplicate courses by code
  const courseMap = new Map<string, ParsedCourse>();
  courses.forEach((c) => courseMap.set(c.code, c));
  courses = Array.from(courseMap.values());

  // Deduplicate programs by code
  const progMap = new Map<string, ParsedProgram>();
  programs.forEach((p) => progMap.set(p.code, p));
  programs = Array.from(progMap.values());

  // Aggregate curriculum progression into hierarchical tree
  // Map key: `${programCode}::${curriculumName}`
  const curriculumMap = new Map<
    string,
    {
      programCode: string;
      curriculumName: string;
      termsMap: Map<
        number,
        {
          sequence: number;
          name: string;
          courses: ParsedTermCourse[];
        }
      >;
    }
  >();

  rawCurriculums.forEach((r) => {
    const programCode = getField(r, ['program_code', 'programcode', 'program']).toUpperCase();
    const curriculumName =
      getField(r, ['curriculum_name', 'curriculumname', 'curriculum']) || 'Scheme 2026';
    const seqStr = getField(r, ['term_sequence', 'termsequence', 'sequence', 'semester', 'term']);
    const termSequence = parseInt(seqStr, 10) || 1;
    const termName = getField(r, ['term_name', 'termname']) || `Semester ${termSequence}`;
    const courseCode = getField(r, ['course_code', 'coursecode', 'code']).toUpperCase();
    const isMandatoryStr = getField(r, ['is_mandatory', 'ismandatory', 'mandatory']);
    const isMandatory =
      isMandatoryStr === '' ? true : !['false', '0', 'no'].includes(isMandatoryStr.toLowerCase());
    const prereqRaw = getField(r, ['prerequisite_course_codes', 'prerequisites', 'prereq']);
    const prerequisites = prereqRaw
      ? prereqRaw
          .split(/[,|;]/)
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      : [];

    if (!programCode || !courseCode) return;

    const currKey = `${programCode}::${curriculumName}`;
    if (!curriculumMap.has(currKey)) {
      curriculumMap.set(currKey, {
        programCode,
        curriculumName,
        termsMap: new Map(),
      });
    }

    const curr = curriculumMap.get(currKey)!;
    if (!curr.termsMap.has(termSequence)) {
      curr.termsMap.set(termSequence, {
        sequence: termSequence,
        name: termName,
        courses: [],
      });
    }

    const termObj = curr.termsMap.get(termSequence)!;
    if (!termObj.courses.some((c) => c.courseCode === courseCode)) {
      termObj.courses.push({
        courseCode,
        isMandatory,
        prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
      });
    }
  });

  // Aggregate sections
  // Map key: `${programCode}::${termSequence}`
  const sectionMap = new Map<string, ParsedSection[]>();
  let fallbackAcademicYear = '';

  rawSections.forEach((r) => {
    const programCode = getField(r, ['program_code', 'programcode', 'program']).toUpperCase();
    const seqStr = getField(r, ['term_sequence', 'termsequence', 'sequence', 'semester', 'term']);
    const termSequence = parseInt(seqStr, 10) || 1;
    const code = getField(r, ['section_code', 'sectioncode', 'code', 'section']).toUpperCase();
    const name = getField(r, ['section_name', 'sectionname', 'name']) || `Section ${code}`;
    const capStr = getField(r, ['capacity', 'seats', 'size']) || '60';
    const capacity = parseInt(capStr, 10) || 60;
    const academicYearCode = getField(r, [
      'academic_year_code',
      'academicyearcode',
      'academic_year',
      'year',
    ]);
    if (academicYearCode && !fallbackAcademicYear) {
      fallbackAcademicYear = academicYearCode;
    }

    if (!programCode || !code) return;

    const secKey = `${programCode}::${termSequence}`;
    if (!sectionMap.has(secKey)) {
      sectionMap.set(secKey, []);
    }
    const list = sectionMap.get(secKey)!;
    if (!list.some((s) => s.code === code)) {
      list.push({ code, name, capacity, academicYearCode: academicYearCode || undefined });
    }
  });

  // Merge sections into curriculums
  const curriculums: ParsedCurriculum[] = [];

  curriculumMap.forEach((c) => {
    const terms: ParsedTerm[] = [];
    const sortedSeqs = Array.from(c.termsMap.keys()).sort((a, b) => a - b);

    sortedSeqs.forEach((seq) => {
      const t = c.termsMap.get(seq)!;
      const secKey = `${c.programCode}::${seq}`;
      const sections = sectionMap.get(secKey) || [];
      terms.push({
        sequence: t.sequence,
        name: t.name,
        courses: t.courses,
        sections,
      });
    });

    curriculums.push({
      programCode: c.programCode,
      curriculumName: c.curriculumName,
      terms,
    });
  });

  return {
    data: {
      academicYearCode: fallbackAcademicYear || undefined,
      departments,
      courses,
      programs,
      curriculums,
    },
    errors,
    detected,
  };
}

// -------------------------------------------------------------
// Downloadable Starter Templates
// -------------------------------------------------------------
export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadStarterTemplates() {
  const templates: Record<string, string> = {
    '1_departments.csv': `code,name
MATH,Mathematics
SCI,Science
ENG,English
SOC,Social Studies`,
    '2_courses.csv': `code,title,credits,department_code,type
MAT1,Mathematics 1,1,MATH,THEORY
MAT2,Mathematics 2,1,MATH,THEORY
SCI1,Science 1,1,SCI,THEORY
SCI2,Science 2,1,SCI,THEORY
ENG1,English 1,1,ENG,THEORY
ENG2,English 2,1,ENG,THEORY
SOC1,Social Studies 1,1,SOC,THEORY
SOC2,Social Studies 2,1,SOC,THEORY`,
    '3_programs.csv': `code,name,level,duration_years,department_code
STD1,Standard 1,PRIMARY,1,MATH
STD2,Standard 2,PRIMARY,1,MATH
STD3,Standard 3,PRIMARY,1,MATH
STD4,Standard 4,PRIMARY,1,MATH
STD5,Standard 5,PRIMARY,1,MATH
STD6,Standard 6,SECONDARY,1,MATH
STD7,Standard 7,SECONDARY,1,MATH
STD8,Standard 8,SECONDARY,1,MATH
STD9,Standard 9,SECONDARY,1,MATH
STD10,Standard 10,SECONDARY,1,MATH`,
    '4_curriculum_progression.csv': `program_code,curriculum_name,term_sequence,term_name,course_code,is_mandatory,prerequisite_course_codes
STD1,K-10 School Curriculum,1,Term 1,MAT1,true,
STD1,K-10 School Curriculum,1,Term 1,SCI1,true,
STD1,K-10 School Curriculum,1,Term 1,ENG1,true,
STD1,K-10 School Curriculum,1,Term 1,SOC1,true,
STD2,K-10 School Curriculum,2,Term 1,MAT2,true,MAT1
STD2,K-10 School Curriculum,2,Term 1,SCI2,true,SCI1
STD2,K-10 School Curriculum,2,Term 1,ENG2,true,ENG1
STD2,K-10 School Curriculum,2,Term 1,SOC2,true,SOC1`,
    '5_sections.csv': `program_code,term_sequence,section_code,section_name,capacity,academic_year_code
STD1,1,A,Section A,35,AY-2026-27
STD1,1,B,Section B,35,AY-2026-27
STD2,2,A,Section A,35,AY-2026-27
STD2,2,B,Section B,35,AY-2026-27`,
  };

  let delay = 0;
  for (const [filename, content] of Object.entries(templates)) {
    setTimeout(() => {
      downloadCSV(filename, content);
    }, delay);
    delay += 250;
  }
}
