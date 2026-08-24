-- ============================================================
-- SEED SCRIPT: Curriculums + Students in under-enrolled sections
-- Run: psql "$DATABASE_URL" -f scripts/seed.sql
-- ============================================================
\set ON_ERROR_STOP on

-- ============================================================
-- SECTION 1: Create curriculums for programs that lack them
-- ============================================================

-- IT Curriculum
DO $$
DECLARE
  v_inst UUID;
  v_prog UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT id INTO v_prog FROM programs WHERE code = 'BTECH-IT' AND institution_id = v_inst;

  IF v_prog IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code = 'BTECH-IT' AND c.version_number = '2026-V1'
  ) THEN
    INSERT INTO curriculums (id, institution_id, program_id, version_number, name, status, effective_from, created_at, updated_at)
    VALUES (gen_random_uuid(), v_inst, v_prog, '2026-V1', '2026 IT Curriculum', 'ACTIVE', '2026-06-01', now(), now());
    RAISE NOTICE 'Created IT curriculum';
  END IF;
END $$;

-- ECE Curriculum
DO $$
DECLARE
  v_inst UUID;
  v_prog UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT id INTO v_prog FROM programs WHERE code = 'BTECH-ECE' AND institution_id = v_inst;

  IF v_prog IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code = 'BTECH-ECE' AND c.version_number = '2026-V1'
  ) THEN
    INSERT INTO curriculums (id, institution_id, program_id, version_number, name, status, effective_from, created_at, updated_at)
    VALUES (gen_random_uuid(), v_inst, v_prog, '2026-V1', '2026 ECE Curriculum', 'ACTIVE', '2026-06-01', now(), now());
    RAISE NOTICE 'Created ECE curriculum';
  END IF;
END $$;

-- BCA Curriculum
DO $$
DECLARE
  v_inst UUID;
  v_prog UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT id INTO v_prog FROM programs WHERE code = 'BCA' AND institution_id = v_inst;

  IF v_prog IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code = 'BCA' AND c.version_number = '2026-V1'
  ) THEN
    INSERT INTO curriculums (id, institution_id, program_id, version_number, name, status, effective_from, created_at, updated_at)
    VALUES (gen_random_uuid(), v_inst, v_prog, '2026-V1', '2026 BCA Curriculum', 'ACTIVE', '2026-06-01', now(), now());
    RAISE NOTICE 'Created BCA curriculum';
  END IF;
END $$;

-- MBA Curriculum (picks whichever MBA program exists first)
DO $$
DECLARE
  v_inst UUID;
  v_prog UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT id INTO v_prog FROM programs WHERE code IN ('MBA-PROG', 'MBA') AND institution_id = v_inst LIMIT 1;

  IF v_prog IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code IN ('MBA-PROG', 'MBA') AND c.version_number = '2026-V1'
  ) THEN
    INSERT INTO curriculums (id, institution_id, program_id, version_number, name, status, effective_from, created_at, updated_at)
    VALUES (gen_random_uuid(), v_inst, v_prog, '2026-V1', '2026 MBA Curriculum', 'ACTIVE', '2026-06-01', now(), now());
    RAISE NOTICE 'Created MBA curriculum';
  END IF;
END $$;

-- ============================================================
-- SECTION 2: Create curriculum terms (semesters) for new curriculums
-- ============================================================

-- IT: 8 semesters
DO $$
DECLARE
  v_inst UUID;
  v_curr UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT c.id INTO v_curr FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code = 'BTECH-IT' AND c.version_number = '2026-V1';
  IF v_curr IS NULL THEN RETURN; END IF;

  INSERT INTO curriculum_terms (id, institution_id, curriculum_id, name, sequence, credit_requirement, created_at, updated_at)
  SELECT gen_random_uuid(), v_inst, v_curr, 'Semester ' || s, s, 20, now(), now()
  FROM generate_series(1, 8) s
  ON CONFLICT (curriculum_id, sequence) DO NOTHING;
  RAISE NOTICE 'Created IT curriculum terms';
END $$;

-- ECE: 8 semesters
DO $$
DECLARE
  v_inst UUID;
  v_curr UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT c.id INTO v_curr FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code = 'BTECH-ECE' AND c.version_number = '2026-V1';
  IF v_curr IS NULL THEN RETURN; END IF;

  INSERT INTO curriculum_terms (id, institution_id, curriculum_id, name, sequence, credit_requirement, created_at, updated_at)
  SELECT gen_random_uuid(), v_inst, v_curr, 'Semester ' || s, s, 20, now(), now()
  FROM generate_series(1, 8) s
  ON CONFLICT (curriculum_id, sequence) DO NOTHING;
  RAISE NOTICE 'Created ECE curriculum terms';
END $$;

-- BCA: 6 semesters
DO $$
DECLARE
  v_inst UUID;
  v_curr UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT c.id INTO v_curr FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code = 'BCA' AND c.version_number = '2026-V1';
  IF v_curr IS NULL THEN RETURN; END IF;

  INSERT INTO curriculum_terms (id, institution_id, curriculum_id, name, sequence, credit_requirement, created_at, updated_at)
  SELECT gen_random_uuid(), v_inst, v_curr, 'Semester ' || s, s, 20, now(), now()
  FROM generate_series(1, 6) s
  ON CONFLICT (curriculum_id, sequence) DO NOTHING;
  RAISE NOTICE 'Created BCA curriculum terms';
END $$;

-- MBA: 4 semesters
DO $$
DECLARE
  v_inst UUID;
  v_curr UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT c.id INTO v_curr FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code IN ('MBA-PROG', 'MBA') AND c.version_number = '2026-V1';
  IF v_curr IS NULL THEN RETURN; END IF;

  INSERT INTO curriculum_terms (id, institution_id, curriculum_id, name, sequence, credit_requirement, created_at, updated_at)
  SELECT gen_random_uuid(), v_inst, v_curr, 'Semester ' || s, s, 20, now(), now()
  FROM generate_series(1, 4) s
  ON CONFLICT (curriculum_id, sequence) DO NOTHING;
  RAISE NOTICE 'Created MBA curriculum terms';
END $$;

-- ============================================================
-- SECTION 3: Create courses and link to curriculums (Semester 1 only)
-- ============================================================

-- IT Semester 1 courses
DO $$
DECLARE
  v_inst UUID;
  v_curr UUID;
  v_term UUID;
  v_seq INT := 1;
  v_cid UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT c.id INTO v_curr FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code = 'BTECH-IT' AND c.version_number = '2026-V1';
  IF v_curr IS NULL THEN RETURN; END IF;
  SELECT id INTO v_term FROM curriculum_terms WHERE curriculum_id = v_curr AND sequence = 1;
  IF v_term IS NULL THEN RETURN; END IF;

  -- Create IT-specific courses
  INSERT INTO courses (id, institution_id, code, name, description, credit_value, max_marks, passing_marks, is_practical, course_type, status, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inst, 'IT101', 'Introduction to Information Technology', 'Basics of IT', 4, 100, 40, false, 'THEORY', 'ACTIVE', now(), now())
  ON CONFLICT (institution_id, code) DO NOTHING;

  INSERT INTO courses (id, institution_id, code, name, description, credit_value, max_marks, passing_marks, is_practical, course_type, status, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inst, 'IT102', 'Programming in C', 'C programming fundamentals', 4, 100, 40, true, 'LAB', 'ACTIVE', now(), now())
  ON CONFLICT (institution_id, code) DO NOTHING;

  -- Link courses to curriculum term
  FOR v_cid IN SELECT id FROM courses WHERE code IN ('IT101', 'IT102', 'MA101', 'PH101', 'HS101') AND institution_id = v_inst ORDER BY code LOOP
    INSERT INTO curriculum_courses (id, institution_id, curriculum_term_id, course_id, sequence, credit_value, is_mandatory, created_at, updated_at)
    VALUES (gen_random_uuid(), v_inst, v_term, v_cid, v_seq, 4, true, now(), now())
    ON CONFLICT (curriculum_term_id, course_id) DO NOTHING;
    v_seq := v_seq + 1;
  END LOOP;
  RAISE NOTICE 'Linked IT Semester 1 courses';
END $$;

-- ECE Semester 1 courses
DO $$
DECLARE
  v_inst UUID;
  v_curr UUID;
  v_term UUID;
  v_seq INT := 1;
  v_cid UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT c.id INTO v_curr FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code = 'BTECH-ECE' AND c.version_number = '2026-V1';
  IF v_curr IS NULL THEN RETURN; END IF;
  SELECT id INTO v_term FROM curriculum_terms WHERE curriculum_id = v_curr AND sequence = 1;
  IF v_term IS NULL THEN RETURN; END IF;

  INSERT INTO courses (id, institution_id, code, name, description, credit_value, max_marks, passing_marks, is_practical, course_type, status, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inst, 'EC101', 'Basic Electronics', 'Introduction to electronics', 4, 100, 40, false, 'THEORY', 'ACTIVE', now(), now())
  ON CONFLICT (institution_id, code) DO NOTHING;

  INSERT INTO courses (id, institution_id, code, name, description, credit_value, max_marks, passing_marks, is_practical, course_type, status, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inst, 'EC102', 'Digital Logic Design', 'Boolean algebra and logic gates', 4, 100, 40, false, 'THEORY', 'ACTIVE', now(), now())
  ON CONFLICT (institution_id, code) DO NOTHING;

  FOR v_cid IN SELECT id FROM courses WHERE code IN ('EC101', 'EC102', 'MA101', 'PH101', 'HS101') AND institution_id = v_inst ORDER BY code LOOP
    INSERT INTO curriculum_courses (id, institution_id, curriculum_term_id, course_id, sequence, credit_value, is_mandatory, created_at, updated_at)
    VALUES (gen_random_uuid(), v_inst, v_term, v_cid, v_seq, 4, true, now(), now())
    ON CONFLICT (curriculum_term_id, course_id) DO NOTHING;
    v_seq := v_seq + 1;
  END LOOP;
  RAISE NOTICE 'Linked ECE Semester 1 courses';
END $$;

-- BCA Semester 1 courses
DO $$
DECLARE
  v_inst UUID;
  v_curr UUID;
  v_term UUID;
  v_seq INT := 1;
  v_cid UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT c.id INTO v_curr FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code = 'BCA' AND c.version_number = '2026-V1';
  IF v_curr IS NULL THEN RETURN; END IF;
  SELECT id INTO v_term FROM curriculum_terms WHERE curriculum_id = v_curr AND sequence = 1;
  IF v_term IS NULL THEN RETURN; END IF;

  INSERT INTO courses (id, institution_id, code, name, description, credit_value, max_marks, passing_marks, is_practical, course_type, status, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inst, 'BCA101', 'Computer Fundamentals', 'Introduction to computers and OS', 4, 100, 40, false, 'THEORY', 'ACTIVE', now(), now())
  ON CONFLICT (institution_id, code) DO NOTHING;

  INSERT INTO courses (id, institution_id, code, name, description, credit_value, max_marks, passing_marks, is_practical, course_type, status, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inst, 'BCA102', 'Programming in Python', 'Python programming fundamentals', 4, 100, 40, true, 'LAB', 'ACTIVE', now(), now())
  ON CONFLICT (institution_id, code) DO NOTHING;

  FOR v_cid IN SELECT id FROM courses WHERE code IN ('BCA101', 'BCA102', 'MA101', 'HS101') AND institution_id = v_inst ORDER BY code LOOP
    INSERT INTO curriculum_courses (id, institution_id, curriculum_term_id, course_id, sequence, credit_value, is_mandatory, created_at, updated_at)
    VALUES (gen_random_uuid(), v_inst, v_term, v_cid, v_seq, 4, true, now(), now())
    ON CONFLICT (curriculum_term_id, course_id) DO NOTHING;
    v_seq := v_seq + 1;
  END LOOP;
  RAISE NOTICE 'Linked BCA Semester 1 courses';
END $$;

-- MBA Semester 1 courses
DO $$
DECLARE
  v_inst UUID;
  v_curr UUID;
  v_term UUID;
  v_seq INT := 1;
  v_cid UUID;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT c.id INTO v_curr FROM curriculums c JOIN programs p ON p.id = c.program_id
    WHERE p.code IN ('MBA-PROG', 'MBA') AND c.version_number = '2026-V1';
  IF v_curr IS NULL THEN RETURN; END IF;
  SELECT id INTO v_term FROM curriculum_terms WHERE curriculum_id = v_curr AND sequence = 1;
  IF v_term IS NULL THEN RETURN; END IF;

  INSERT INTO courses (id, institution_id, code, name, description, credit_value, max_marks, passing_marks, is_practical, course_type, status, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inst, 'MBA101', 'Principles of Management', 'Management fundamentals', 4, 100, 40, false, 'THEORY', 'ACTIVE', now(), now())
  ON CONFLICT (institution_id, code) DO NOTHING;

  INSERT INTO courses (id, institution_id, code, name, description, credit_value, max_marks, passing_marks, is_practical, course_type, status, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inst, 'MBA102', 'Business Economics', 'Micro and macro economics for managers', 4, 100, 40, false, 'THEORY', 'ACTIVE', now(), now())
  ON CONFLICT (institution_id, code) DO NOTHING;

  INSERT INTO courses (id, institution_id, code, name, description, credit_value, max_marks, passing_marks, is_practical, course_type, status, created_at, updated_at)
  VALUES (gen_random_uuid(), v_inst, 'MBA103', 'Financial Accounting', 'Accounting fundamentals for managers', 4, 100, 40, false, 'THEORY', 'ACTIVE', now(), now())
  ON CONFLICT (institution_id, code) DO NOTHING;

  FOR v_cid IN SELECT id FROM courses WHERE code IN ('MBA101', 'MBA102', 'MBA103') AND institution_id = v_inst ORDER BY code LOOP
    INSERT INTO curriculum_courses (id, institution_id, curriculum_term_id, course_id, sequence, credit_value, is_mandatory, created_at, updated_at)
    VALUES (gen_random_uuid(), v_inst, v_term, v_cid, v_seq, 4, true, now(), now())
    ON CONFLICT (curriculum_term_id, course_id) DO NOTHING;
    v_seq := v_seq + 1;
  END LOOP;
  RAISE NOTICE 'Linked MBA Semester 1 courses';
END $$;

-- ============================================================
-- SECTION 4: Create students in sections with < 3 students
-- ============================================================
DO $$
DECLARE
  rec RECORD;
  v_inst UUID;
  v_ay UUID;
  v_user_id UUID;
  v_student_id UUID;
  v_curr_id UUID;
  v_seq INT;
  names_m TEXT[] := ARRAY['Arjun','Vikram','Rahul','Aditya','Karthik','Rohit','Nikhil','Suresh','Amit','Prakash','Deepak','Manish','Vivek','Sanjay','Ravi'];
  names_f TEXT[] := ARRAY['Priya','Ananya','Deepika','Neha','Kavya','Ishita','Pooja','Sneha','Riya','Tanvi','Meera','Shreya','Divya','Nisha','Anjali'];
  names_l TEXT[] := ARRAY['Sharma','Patel','Kumar','Singh','Reddy','Nair','Gupta','Joshi','Rao','Mishra','Verma','Das','Menon','Iyer','Mehta'];
  v_first TEXT;
  v_last TEXT;
  v_gender TEXT;
  v_email TEXT;
  v_usn TEXT;
  v_adm TEXT;
  v_dob DATE;
BEGIN
  SELECT id INTO v_inst FROM institutions LIMIT 1;
  SELECT id INTO v_ay FROM academic_years WHERE is_active = true AND institution_id = v_inst LIMIT 1;
  IF v_ay IS NULL THEN
    RAISE NOTICE 'No active academic year found - skipping student creation';
    RETURN;
  END IF;

  RAISE NOTICE '=== Creating students in under-enrolled sections ===';

  FOR rec IN
    SELECT s.id AS sid, s.name AS sname, s.code AS scode,
           s.program_id, s.batch_id, s.academic_year_id,
           p.code AS pcode,
           (SELECT count(*) FROM students st WHERE st."sectionId" = s.id) AS cnt
    FROM sections s
    JOIN programs p ON p.id = s.program_id
    WHERE s.academic_year_id = v_ay
    ORDER BY p.code, s.code
  LOOP
    IF rec.cnt >= 3 THEN
      RAISE NOTICE 'Section % already has % students - skipping', rec.scode, rec.cnt;
      CONTINUE;
    END IF;

    RAISE NOTICE 'Section % has % students - adding % more', rec.scode, rec.cnt, (3 - rec.cnt);

    -- Get curriculum for this program
    SELECT c.id INTO v_curr_id FROM curriculums c
      WHERE c.program_id = rec.program_id AND c.version_number = '2026-V1' LIMIT 1;

    -- Section-scoped sequence: start from 1 each section
    v_seq := 0;

    -- Create students to fill up to 3
    FOR i IN 1..(3 - rec.cnt) LOOP
      v_seq := v_seq + 1;

      IF v_seq % 2 = 0 THEN
        v_gender := 'MALE';
        v_first := names_m[1 + (abs(hashtext(rec.scode || i::text)) % array_length(names_m, 1))];
      ELSE
        v_gender := 'FEMALE';
        v_first := names_f[1 + (abs(hashtext(rec.scode || i::text)) % array_length(names_f, 1))];
      END IF;
      v_last := names_l[1 + (abs(hashtext(rec.scode || i::text || 'last')) % array_length(names_l, 1))];

      v_adm := 'ADM-' || upper(replace(rec.scode, '-', '')) || '-' || lpad(v_seq::text, 3, '0');
      v_usn := upper(replace(rec.scode, '-', '')) || '-' || lpad(v_seq::text, 3, '0');
      v_email := lower(v_first) || '.' || lower(v_last) || lower(replace(rec.scode, '-', '')) || v_seq || '@student.edu';
      v_dob := ('2003-01-01'::date + (abs(hashtext(rec.scode || v_seq::text)) % 730))::date;

      -- Create User
      v_user_id := gen_random_uuid();
      BEGIN
        INSERT INTO users (id, auth_user_id, institution_id, email, first_name, last_name, role, status, created_at, updated_at)
        VALUES (v_user_id, gen_random_uuid(), v_inst, v_email, v_first, v_last, 'STUDENT', 'ACTIVE', now(), now());
      EXCEPTION WHEN unique_violation THEN
        -- User already exists, find it
        SELECT id INTO v_user_id FROM users WHERE email = v_email AND institution_id = v_inst;
      END;

      -- Create Student
      v_student_id := gen_random_uuid();
      BEGIN
        INSERT INTO students (id, institution_id, user_id, admission_number, student_code, lifecycle_status, date_of_birth, gender, admission_date, roll_number, "programId", "sectionId", curriculum_id, created_at, updated_at)
        VALUES (
          v_student_id, v_inst, v_user_id, v_adm, v_usn, 'ENROLLED',
          v_dob, v_gender::"Gender", '2026-06-15'::date, v_usn,
          rec.program_id, rec.sid, v_curr_id, now(), now()
        );
      EXCEPTION WHEN unique_violation THEN
        -- Student already exists, find it by admission_number in this section
        SELECT id INTO v_student_id FROM students
          WHERE institution_id = v_inst AND admission_number = v_adm AND "sectionId" = rec.sid;
        IF v_student_id IS NULL THEN
          -- Different section has this admission_number; generate unique one
          v_adm := v_adm || '-' || v_seq;
          v_usn := v_usn || '-' || v_seq;
          BEGIN
            INSERT INTO students (id, institution_id, user_id, admission_number, student_code, lifecycle_status, date_of_birth, gender, admission_date, roll_number, "programId", "sectionId", curriculum_id, created_at, updated_at)
            VALUES (
              v_student_id, v_inst, v_user_id, v_adm, v_usn, 'ENROLLED',
              v_dob, v_gender::"Gender", '2026-06-15'::date, v_usn,
              rec.program_id, rec.sid, v_curr_id, now(), now()
            );
          EXCEPTION WHEN unique_violation THEN
            RAISE NOTICE '  Could not create student % % in % - skipping', v_first, v_last, rec.scode;
            CONTINUE;
          END;
        END IF;
      END;

      -- Create Enrollment (check first to avoid duplicates)
      IF NOT EXISTS (
        SELECT 1 FROM enrollments
        WHERE student_id = v_student_id AND academic_year_id = v_ay AND section_id = rec.sid
      ) THEN
        INSERT INTO enrollments (id, institution_id, student_id, academic_year_id, program_id, curriculum_id, section_id, batch_id, roll_number, status, enrolled_at, created_at, updated_at)
        VALUES (
          gen_random_uuid(), v_inst, v_student_id, v_ay,
          rec.program_id, v_curr_id, rec.sid, rec.batch_id,
          v_usn, 'ACTIVE', now(), now(), now()
        );
      END IF;

      RAISE NOTICE '  Created: % % (%) in %', v_first, v_last, v_usn, rec.scode;
    END LOOP;
  END LOOP;

  RAISE NOTICE '=== Student seeding complete ===';
END $$;

-- ============================================================
-- SECTION 5: Summary
-- ============================================================
SELECT '=== SEED COMPLETE ===' AS status;

SELECT p.name AS program,
  (SELECT count(*) FROM curriculums c WHERE c.program_id = p.id) AS curriculums
FROM programs p ORDER BY p.name;

SELECT s.code AS section, p.name AS program,
  (SELECT count(*) FROM students st WHERE st."sectionId" = s.id) AS students
FROM sections s
JOIN programs p ON p.id = s.program_id
JOIN academic_years ay ON ay.id = s.academic_year_id AND ay.is_active = true
ORDER BY p.name, s.code;
