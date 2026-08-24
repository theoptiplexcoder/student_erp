#!/usr/bin/env bash
# ============================================================
# SEED SCRIPT via API endpoints
# Usage: bash scripts/seed-api.sh <AUTH_TOKEN>
# Get token: curl -X POST https://<supabase-url>/auth/v1/token?grant_type=password \
#   -H "apikey: [REDACTED]" -H "Content-Type: application/json" \
#   -d '{"email":"[REDACTED]","password":"password"}' | jq -r '.access_token'
# ============================================================
set -euo pipefail

API_BASE="http://localhost:4000/api/v1"
TOKEN="[REDACTED] $0 <AUTH_TOKEN>}"

auth_header() {
  echo -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"
}

post() {
  local endpoint="$1" body="$2" label="$3"
  echo "--- Creating: $label ---"
  local resp
  resp=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE$endpoint" $(auth_header) -d "$body")
  local http_code=$(echo "$resp" | tail -n1)
  local body_resp=$(echo "$resp" | sed '$d')
  if [[ "$http_code" =~ ^2 ]]; then
    echo "  ✓ $label (HTTP $http_code)"
    echo "$body_resp" | jq -r '.id // .data.id // "no-id"' 2>/dev/null || echo "$body_resp" | head -c 200
  else
    echo "  ✗ $label FAILED (HTTP $http_code)"
    echo "  $body_resp" | head -c 500
  fi
  echo ""
}

get_ids() {
  curl -s "$API_BASE$1" $(auth_header) | jq -r "$2"
}

echo "============================================"
echo "  SEED: Curriculums + Students"
echo "============================================"

# ─── STEP 1: Discover existing data ───────────────
echo ""
echo "=== Discovering existing programs ==="
PROGRAM_IDS=$(curl -s "$API_BASE/admin/programs" $(auth_header) | jq -r '.data[]? // .[]? | "\(.id)|\(.code)|\(.name)"')
echo "$PROGRAM_IDS"

echo ""
echo "=== Discovering existing academic years ==="
AY_DATA=$(curl -s "$API_BASE/institution/academic-years" $(auth_header) | jq -r '.data[]? // .[]? | "\(.id)|\(.name)|\(.isActive)"')
echo "$AY_DATA"

# Find active academic year
ACTIVE_AY=$(echo "$AY_DATA" | grep '|true' | head -1 | cut -d'|' -f1)
echo "Active Academic Year: $ACTIVE_AY"

# Find program IDs
PROG_IT=$(echo "$PROGRAM_IDS" | grep '|BTECH-IT|' | cut -d'|' -f1)
PROG_ECE=$(echo "$PROGRAM_IDS" | grep '|BTECH-ECE|' | cut -d'|' -f1)
PROG_BCA=$(echo "$PROGRAM_IDS" | grep '|BCA|' | cut -d'|' -f1)
PROG_MBA=$(echo "$PROGRAM_IDS" | grep 'MBA' | head -1 | cut -d'|' -f1)

echo ""
echo "Program IDs:"
echo "  IT:  $PROG_IT"
echo "  ECE: $PROG_ECE"
echo "  BCA: $PROG_BCA"
echo "  MBA: $PROG_MBA"

# ─── STEP 2: Discover sections ────────────────────
echo ""
echo "=== Sections with student counts ==="
SECTIONS=$(curl -s "$API_BASE/admin/sections" $(auth_header) | jq -r '.data[]? // .[]? | "\(.id)|\(.code)|\(.name)|\(.programId // "null")|\(if .students then (.students | length) else 0 end)"')
echo "$SECTIONS"

# ─── STEP 3: Create curriculums ───────────────────
echo ""
echo "=== Creating Curriculums ==="

# IT Curriculum
if [ -n "$PROG_IT" ]; then
  post "/academic/curriculums" \
    "{\"programId\":\"$PROG_IT\",\"name\":\"2026 IT Curriculum\",\"versionNumber\":\"2026-V1\",\"effectiveFrom\":\"2026-06-01\"}" \
    "IT Curriculum"
fi

# ECE Curriculum
if [ -n "$PROG_ECE" ]; then
  post "/academic/curriculums" \
    "{\"programId\":\"$PROG_ECE\",\"name\":\"2026 ECE Curriculum\",\"versionNumber\":\"2026-V1\",\"effectiveFrom\":\"2026-06-01\"}" \
    "ECE Curriculum"
fi

# BCA Curriculum
if [ -n "$PROG_BCA" ]; then
  post "/academic/curriculums" \
    "{\"programId\":\"$PROG_BCA\",\"name\":\"2026 BCA Curriculum\",\"versionNumber\":\"2026-V1\",\"effectiveFrom\":\"2026-06-01\"}" \
    "BCA Curriculum"
fi

# MBA Curriculum
if [ -n "$PROG_MBA" ]; then
  post "/academic/curriculums" \
    "{\"programId\":\"$PROG_MBA\",\"name\":\"2026 MBA Curriculum\",\"versionNumber\":\"2026-V1\",\"effectiveFrom\":\"2026-06-01\"}" \
    "MBA Curriculum"
fi

# ─── STEP 4: Create curriculum terms ──────────────
echo ""
echo "=== Creating Curriculum Terms ==="

# Discover curriculum IDs
CURRICULUMS=$(curl -s "$API_BASE/academic/curriculums" $(auth_header) | jq -r '.data[]? // .[]? | "\(.id)|\(.programId)|\(.versionNumber)|\(.name)"')
echo "Existing curriculums:"
echo "$CURRICULUMS"

# Create terms for each new curriculum (8 semesters for UG, 6 for BCA, 4 for MBA)
create_terms() {
  local curr_id="$1" num_semesters="$2" label="$3"
  for seq in $(seq 1 $num_semesters); do
    post "/academic/curriculum-terms" \
      "{\"curriculumId\":\"$curr_id\",\"name\":\"Semester $seq\",\"sequence\":$seq,\"creditRequirement\":20}" \
      "$label - Semester $seq"
  done
}

# IT terms (8 semesters)
IT_CURR=$(echo "$CURRICULUMS" | grep '|BTECH-IT|2026-V1|' | cut -d'|' -f1)
if [ -n "$IT_CURR" ]; then
  create_terms "$IT_CURR" 8 "IT Curriculum"
fi

# ECE terms (8 semesters)
ECE_CURR=$(echo "$CURRICULUMS" | grep '|BTECH-ECE|2026-V1|' | cut -d'|' -f1)
if [ -n "$ECE_CURR" ]; then
  create_terms "$ECE_CURR" 8 "ECE Curriculum"
fi

# BCA terms (6 semesters)
BCA_CURR=$(echo "$CURRICULUMS" | grep '|BCA|2026-V1|' | cut -d'|' -f1)
if [ -n "$BCA_CURR" ]; then
  create_terms "$BCA_CURR" 6 "BCA Curriculum"
fi

# MBA terms (4 semesters)
MBA_CURR=$(echo "$CURRICULUMS" | grep 'MBA|2026-V1|' | cut -d'|' -f1)
if [ -n "$MBA_CURR" ]; then
  create_terms "$MBA_CURR" 4 "MBA Curriculum"
fi

# ─── STEP 5: Create curriculum courses ────────────
echo ""
echo "=== Creating Curriculum Courses ==="

# Discover existing courses
COURSES=$(curl -s "$API_BASE/admin/courses" $(auth_header) | jq -r '.data[]? // .[]? | "\(.id)|\(.code)|\(.name)"')
echo "Existing courses:"
echo "$COURSES" | head -20

# Create courses for IT, ECE, BCA, MBA programs
create_course() {
  local code="$1" name="$2" credit="${3:-4}" practical="${4:-false}"
  post "/admin/courses" \
    "{\"code\":\"$code\",\"name\":\"$name\",\"creditValue\":$credit,\"maxMarks\":100,\"passingMarks\":40,\"isPractical\":$practical,\"courseType\":$( [ "$practical" = "true" ] && echo '"LAB"' || echo '"THEORY"' )}" \
    "$code - $name"
}

# IT courses
echo ""
echo "--- IT Courses ---"
create_course "IT101" "Introduction to Information Technology" 4 false
create_course "IT102" "Programming in C" 4 true
create_course "IT201" "Data Structures and Algorithms" 4 false
create_course "IT202" "Database Management Systems" 4 false
create_course "IT301" "Computer Networks" 4 false
create_course "IT302" "Web Development" 4 true
create_course "IT401" "Software Engineering" 4 false
create_course "IT402" "Cloud Computing" 4 false

# ECE courses
echo ""
echo "--- ECE Courses ---"
create_course "ECE201" "Signals and Systems" 4 false
create_course "ECE202" "Analog Electronics" 4 false
create_course "ECE203" "Electromagnetic Theory" 4 false
create_course "ECE301" "Digital Signal Processing" 4 false
create_course "ECE302" "VLSI Design" 4 true
create_course "ECE401" "Communication Systems" 4 false
create_course "ECE402" "Embedded Systems" 4 true

# BCA courses
echo ""
echo "--- BCA Courses ---"
create_course "BCA101" "Computer Fundamentals" 4 false
create_course "BCA102" "Programming in Python" 4 true
create_course "BCA201" "Object Oriented Programming" 4 false
create_course "BCA202" "Web Technologies" 4 true
create_course "BCA301" "Mobile Application Development" 4 true
create_course "BCA302" "Machine Learning Basics" 4 false

# MBA courses
echo ""
echo "--- MBA Courses ---"
create_course "MBA101" "Principles of Management" 4 false
create_course "MBA102" "Business Economics" 4 false
create_course "MBA103" "Financial Accounting" 4 false
create_course "MBA201" "Marketing Management" 4 false
create_course "MBA202" "Human Resource Management" 4 false
create_course "MBA301" "Operations Research" 4 false

# ─── STEP 6: Add courses to curriculum terms ──────
echo ""
echo ""
echo "=== Adding courses to curriculum terms ==="

# Re-fetch curriculums and terms
CURRICULUMS=$(curl -s "$API_BASE/academic/curriculums" $(auth_header) | jq -r '.data[]? // .[]? | "\(.id)|\(.programId)|\(.versionNumber)"')
COURSES=$(curl -s "$API_BASE/admin/courses" $(auth_header) | jq -r '.data[]? // .[]? | "\(.id)|\(.code)"')

add_course_to_term() {
  local term_id="$1" course_id="$2" seq="$3" credit="${4:-4}"
  post "/academic/curriculum-courses" \
    "{\"curriculumTermId\":\"$term_id\",\"courseId\":\"$course_id\",\"sequence\":$seq,\"creditValue\":$credit,\"isMandatory\":true}" \
    "Course $seq in term"
}

# For each curriculum, get its terms and add courses
for curr_line in $CURRICULUMS; do
  curr_id=$(echo "$curr_line" | cut -d'|' -f1)
  prog_id=$(echo "$curr_line" | cut -d'|' -f2)
  ver=$(echo "$curr_line" | cut -d'|' -f3)

  echo "Processing curriculum $curr_id (program: $prog_id)"

  # Get terms for this curriculum
  TERMS=$(curl -s "$API_BASE/academic/curriculum-terms?curriculumId=$curr_id" $(auth_header) | jq -r '.data[]? // .[]? | "\(.id)|\(.sequence)"')

  # Add courses to first semester as demo
  FIRST_TERM=$(echo "$TERMS" | grep '|1$' | cut -d'|' -f1)
  if [ -n "$FIRST_TERM" ]; then
    seq=1
    for course_line in $(echo "$COURSES" | head -5); do
      course_id=$(echo "$course_line" | cut -d'|' -f1)
      add_course_to_term "$FIRST_TERM" "$course_id" "$seq" 4
      seq=$((seq + 1))
    done
  fi
done

# ─── STEP 7: Create students in sections with < 3 ──
echo ""
echo "=== Creating Students ==="

# First, re-discover sections with their student counts
SECTIONS=$(curl -s "$API_BASE/admin/sections" $(auth_header) | jq -r '.data[]? // .[]? | "\(.id)|\(.code)|\(if .students then (.students | length) else 0 end)|\(.programId // "")|\.batchId // ""')

FIRST_NAMES_M=("Arjun" "Vikram" "Rahul" "Aditya" "Karthik" "Rohit" "Nikhil" "Suresh" "Amit" "Prakash" "Deepak" "Manish" "Vivek" "Sanjay" "Ravi")
FIRST_NAMES_F=("Priya" "Ananya" "Deepika" "Neha" "Kavya" "Ishita" "Pooja" "Sneha" "Riya" "Tanvi" "Meera" "Shreya" "Divya" "Nisha" "Anjali")
LAST_NAMES=("Sharma" "Patel" "Kumar" "Singh" "Reddy" "Nair" "Gupta" "Joshi" "Rao" "Mishra" "Verma" "Das" "Menon" "Iyer" "Mehta")

student_counter=2000

for section_line in $SECTIONS; do
  sec_id=$(echo "$section_line" | cut -d'|' -f1)
  sec_code=$(echo "$section_line" | cut -d'|' -f2)
  current_count=$(echo "$section_line" | cut -d'|' -f3)
  prog_id=$(echo "$section_line" | cut -d'|' -f4)
  batch_id=$(echo "$section_line" | cut -d'|' -f5)

  needed=$((3 - current_count))
  if [ "$needed" -le 0 ]; then
    echo "Section $sec_code: $current_count students - OK"
    continue
  fi

  echo "Section $sec_code: $current_count students - adding $needed"

  for i in $(seq 1 $needed); do
    student_counter=$((student_counter + 1))

    # Alternate gender
    if [ $((student_counter % 2)) -eq 0 ]; then
      gender="MALE"
      fn_idx=$((student_counter % ${#FIRST_NAMES_M[@]}))
      first_name="${FIRST_NAMES_M[$fn_idx]}"
    else
      gender="FEMALE"
      fn_idx=$((student_counter % ${#FIRST_NAMES_F[@]}))
      first_name="${FIRST_NAMES_F[$fn_idx]}"
    fi

    ln_idx=$((student_counter % ${#LAST_NAMES[@]}))
    last_name="${LAST_NAMES[$ln_idx]}"

    usn="STU-2026-$(printf '%03d' $student_counter)"
    email="$(echo $first_name | tr '[:upper:]' '[:lower:]').$(echo $last_name | tr '[:upper:]' '[:lower:]')${student_counter}@student.edu"

    body=$(cat <<EOF
{
  "firstName": "$first_name",
  "lastName": "$last_name",
  "email": "$email",
  "gender": "$gender",
  "dateOfBirth": "2004-$(printf '%02d' $((1 + student_counter % 12)))-$(printf '%02d' $((1 + student_counter % 28)))",
  "phone": "98765$(printf '%05d' $student_counter)",
  "fatherName": "Mr. ${last_name}",
  "motherName": "Mrs. ${last_name}",
  "usn": "$usn",
  "admissionDate": "2026-06-15",
  "academicYearId": "$ACTIVE_AY",
  "programId": "$prog_id",
  "sectionId": "$sec_id",
  "batchId": "$batch_id"
}
EOF
)

    post "/admin/admissions/direct-students" "$body" "$first_name $last_name → $sec_code"
  done
done

# ─── STEP 8: Summary ──────────────────────────────
echo ""
echo "============================================"
echo "  SEED COMPLETE"
echo "============================================"
echo ""
echo "Final section counts:"
curl -s "$API_BASE/admin/sections" $(auth_header) | jq -r '.data[]? // .[]? | "\(.code): \(.students | length // 0) students"'
