const fs = require('fs');

let schema = fs.readFileSync('libs/database/prisma/schema.prisma', 'utf8');

const feeModels = `
enum PaymentMode {
  ANNUAL
  INSTALLMENTS
}

enum FeePlanStatus {
  ACTIVE
  COMPLETED
  OVERDUE
  CANCELLED
}

enum InstallmentStatus {
  PENDING
  PARTIAL
  PAID
  OVERDUE
}

model StudentFeePlan {
  id             String         @id @default(uuid()) @db.Uuid
  institutionId  String         @map("institution_id") @db.Uuid
  studentId      String         @map("student_id") @db.Uuid
  academicYearId String         @map("academic_year_id") @db.Uuid
  totalAmount    Float          @map("total_amount")
  currency       String         @default("INR")
  paymentMode    PaymentMode    @default(ANNUAL) @map("payment_mode")
  status         FeePlanStatus  @default(ACTIVE)
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  institution  Institution  @relation(fields: [institutionId], references: [id])
  student      Student      @relation(fields: [studentId], references: [id], onDelete: Restrict)
  academicYear AcademicYear @relation(fields: [academicYearId], references: [id], onDelete: Restrict)

  installments FeeInstallment[]

  @@index([institutionId])
  @@index([studentId])
  @@map("student_fee_plans")
}

model FeeInstallment {
  id                String            @id @default(uuid()) @db.Uuid
  studentFeePlanId  String            @map("student_fee_plan_id") @db.Uuid
  installmentNumber Int               @map("installment_number")
  amount            Float
  amountPaid        Float             @default(0) @map("amount_paid")
  dueDate           DateTime          @map("due_date") @db.Date
  status            InstallmentStatus @default(PENDING)
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  studentFeePlan StudentFeePlan @relation(fields: [studentFeePlanId], references: [id], onDelete: Cascade)

  @@index([studentFeePlanId])
  @@map("fee_installments")
}
`;

// Add to Institution
schema = schema.replace(
  '  auditLogs              AuditLog[]',
  '  auditLogs              AuditLog[]\n  studentFeePlans        StudentFeePlan[]',
);

// Add to Student
schema = schema.replace(
  '  studentSocialProfiles  StudentSocialProfile[]',
  '  studentSocialProfiles  StudentSocialProfile[]\n  feePlans               StudentFeePlan[]',
);

// Add to AcademicYear
schema = schema.replace(
  '  timetableEntries TimetableEntry[]\n  enrollments      Enrollment[]',
  '  timetableEntries TimetableEntry[]\n  enrollments      Enrollment[]\n  feePlans         StudentFeePlan[]',
);

schema += '\n' + feeModels;

fs.writeFileSync('libs/database/prisma/schema.prisma', schema);
console.log('Schema updated.');
