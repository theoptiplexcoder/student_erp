import { ParsedAcademicData } from './csv-parser';

export interface FuzzyMatch {
  value: string;
  label?: string;
  score: number; // 0 to 100
}

export interface ConflictGroup {
  id: string;
  type: 'department' | 'program' | 'course';
  unresolvedCode: string;
  usedInCount: number;
  description: string;
  suggestions: FuzzyMatch[];
}

/**
 * Standard Levenshtein distance implementation
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity percentage between two strings (0-100)
 */
export function calculateSimilarity(s1: string, s2: string): number {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(s1, s2);
  const score = Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));

  // Boost score if one is a substring of the other or acronym
  const upper1 = s1.toUpperCase();
  const upper2 = s2.toUpperCase();
  if (upper1.includes(upper2) || upper2.includes(upper1)) {
    return Math.max(score, 75);
  }
  return score;
}

/**
 * Detect relational foreign key conflicts in parsed academic data
 */
export function detectCodeConflicts(data: ParsedAcademicData): ConflictGroup[] {
  const conflicts: ConflictGroup[] = [];
  const deptCodes = new Set(data.departments.map((d) => d.code.toUpperCase()));
  const progCodes = new Set(data.programs.map((p) => p.code.toUpperCase()));
  const courseCodes = new Set(data.courses.map((c) => c.code.toUpperCase()));

  // 1. Check Course -> Department references
  const missingDeptInCourses = new Map<string, number>();
  data.courses.forEach((c) => {
    if (c.departmentCode && !deptCodes.has(c.departmentCode.toUpperCase())) {
      const code = c.departmentCode.toUpperCase();
      missingDeptInCourses.set(code, (missingDeptInCourses.get(code) || 0) + 1);
    }
  });

  missingDeptInCourses.forEach((count, code) => {
    const suggestions: FuzzyMatch[] = data.departments
      .map((d) => ({
        value: d.code,
        label: `${d.code} (${d.name})`,
        score: Math.max(calculateSimilarity(code, d.code), calculateSimilarity(code, d.name)),
      }))
      .filter((s) => s.score > 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    conflicts.push({
      id: `dept-course-${code}`,
      type: 'department',
      unresolvedCode: code,
      usedInCount: count,
      description: `Referenced by ${count} course${count > 1 ? 's' : ''}`,
      suggestions,
    });
  });

  // 2. Check Program -> Department references
  const missingDeptInPrograms = new Map<string, number>();
  data.programs.forEach((p) => {
    if (p.departmentCode && !deptCodes.has(p.departmentCode.toUpperCase())) {
      const code = p.departmentCode.toUpperCase();
      missingDeptInPrograms.set(code, (missingDeptInPrograms.get(code) || 0) + 1);
    }
  });

  missingDeptInPrograms.forEach((count, code) => {
    // Skip if already captured in department conflicts
    if (conflicts.some((c) => c.unresolvedCode === code && c.type === 'department')) return;

    const suggestions: FuzzyMatch[] = data.departments
      .map((d) => ({
        value: d.code,
        label: `${d.code} (${d.name})`,
        score: Math.max(calculateSimilarity(code, d.code), calculateSimilarity(code, d.name)),
      }))
      .filter((s) => s.score > 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    conflicts.push({
      id: `dept-prog-${code}`,
      type: 'department',
      unresolvedCode: code,
      usedInCount: count,
      description: `Referenced by ${count} program${count > 1 ? 's' : ''}`,
      suggestions,
    });
  });

  // 3. Check Curriculum -> Program references
  const missingProgInCurr = new Map<string, number>();
  data.curriculums.forEach((curr) => {
    if (curr.programCode && !progCodes.has(curr.programCode.toUpperCase())) {
      const code = curr.programCode.toUpperCase();
      missingProgInCurr.set(code, (missingProgInCurr.get(code) || 0) + 1);
    }
  });

  missingProgInCurr.forEach((count, code) => {
    const suggestions: FuzzyMatch[] = data.programs
      .map((p) => ({
        value: p.code,
        label: `${p.code} (${p.name})`,
        score: Math.max(calculateSimilarity(code, p.code), calculateSimilarity(code, p.name)),
      }))
      .filter((s) => s.score > 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    conflicts.push({
      id: `prog-curr-${code}`,
      type: 'program',
      unresolvedCode: code,
      usedInCount: count,
      description: `Referenced by ${count} curriculum scheme${count > 1 ? 's' : ''}`,
      suggestions,
    });
  });

  // 4. Check Curriculum Term Course -> Course references
  const missingCourseInTerms = new Map<string, number>();
  data.curriculums.forEach((curr) => {
    curr.terms.forEach((t) => {
      t.courses.forEach((tc) => {
        if (tc.courseCode && !courseCodes.has(tc.courseCode.toUpperCase())) {
          const code = tc.courseCode.toUpperCase();
          missingCourseInTerms.set(code, (missingCourseInTerms.get(code) || 0) + 1);
        }
      });
    });
  });

  missingCourseInTerms.forEach((count, code) => {
    const suggestions: FuzzyMatch[] = data.courses
      .map((c) => ({
        value: c.code,
        label: `${c.code} (${c.title})`,
        score: Math.max(calculateSimilarity(code, c.code), calculateSimilarity(code, c.title)),
      }))
      .filter((s) => s.score > 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    conflicts.push({
      id: `course-term-${code}`,
      type: 'course',
      unresolvedCode: code,
      usedInCount: count,
      description: `Referenced in ${count} curriculum term slot${count > 1 ? 's' : ''}`,
      suggestions,
    });
  });

  return conflicts;
}

/**
 * Apply resolved mappings across the in-memory ParsedAcademicData object
 */
export function applyResolutionMappings(
  data: ParsedAcademicData,
  mappings: Record<string, string>, // oldCode -> newCode
): ParsedAcademicData {
  const nextData = structuredClone(data);

  for (const [oldCode, newCode] of Object.entries(mappings)) {
    if (!newCode || oldCode === newCode) continue;

    // Replace in courses
    nextData.courses.forEach((c) => {
      if (c.departmentCode.toUpperCase() === oldCode.toUpperCase()) {
        c.departmentCode = newCode.toUpperCase();
      }
    });

    // Replace in programs
    nextData.programs.forEach((p) => {
      if (p.departmentCode.toUpperCase() === oldCode.toUpperCase()) {
        p.departmentCode = newCode.toUpperCase();
      }
      if (p.code.toUpperCase() === oldCode.toUpperCase()) {
        p.code = newCode.toUpperCase();
      }
    });

    // Replace in curriculums
    nextData.curriculums.forEach((curr) => {
      if (curr.programCode.toUpperCase() === oldCode.toUpperCase()) {
        curr.programCode = newCode.toUpperCase();
      }
      curr.terms.forEach((t) => {
        t.courses.forEach((tc) => {
          if (tc.courseCode.toUpperCase() === oldCode.toUpperCase()) {
            tc.courseCode = newCode.toUpperCase();
          }
          if (tc.prerequisites) {
            tc.prerequisites = tc.prerequisites.map((pr) =>
              pr.toUpperCase() === oldCode.toUpperCase() ? newCode.toUpperCase() : pr,
            );
          }
        });
      });
    });
  }

  return nextData;
}
