# Prisma seed script for institution (Supabase)

**Session ID:** ses_fa7637ff1ffe7vnFtHgMX0IBOy
**Created:** 8/31/2026, 9:47:26 PM
**Updated:** 8/31/2026, 10:31:56 PM

---

## User

your task is to create a seed script replicating an institution and follow the schema tables and its constraints, relations and foreign keys in @libs/database/prisma/schema.prisma carefully and strictly and generate a seed script.

Make sure you it can be pushed to the supabase by running the script

---

## Assistant (Orchestrator · MiMo V2.5 Free · 10.8s)

_Thinking:_

The user wants me to create a seed script that replicates an institution with all its related data following the schema tables and constraints. Let me first read the rest of the schema to understand the full picture, then I'll create the seed script.

Let me read the remaining part of the schema file.

Let me read the rest of the schema first.

**Tool: read**

**Input:**

```json
{
  "filePath": "/home/ybl/proj/Ellipsonic/ERP/student_erp/libs/database/prisma/schema.prisma",
  "offset": 1495
}
```

**Output:**

```
<path>/home/ybl/proj/Ellipsonic/ERP/student_erp/libs/database/prisma/schema.prisma</path>
<type>file</type>
<content>
1495:   studentId  String         @map("student_id") @db.Uuid
1496:   platform   SocialPlatform
1497:   profileUrl String         @map("profile_url")
1498:   createdAt  DateTime       @default(now()) @map("created_at")
1499:   updatedAt  DateTime       @updatedAt @map("updated_at")
1500:
1501:   student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
1502:
1503:   @@unique([studentId, platform])
1504:   @@map("student_social_profiles")
1505: }
1506:
1507: model StudentAchievement {
1508:   id              String   @id @default(uuid()) @db.Uuid
1509:   institutionId   String   @map("institution_id") @db.Uuid
1510:   studentId       String   @map("student_id") @db.Uuid
1511:   title           String
1512:   description     String?
1513:   achievementDate DateTime @map("achievement_date") @db.Date
1514:   issuer          String?
1515:   documentUrl     String?  @map("document_url")
1516:   createdAt       DateTime @default(now()) @map("created_at")
1517:   updatedAt       DateTime @updatedAt @map("updated_at")
1518:
1519:   institution Institution @relation(fields: [institutionId], references: [id])
1520:   student     Student     @relation(fields: [studentId], references: [id], onDelete: Cascade)
1521:
1522:   @@index([institutionId])
1523:   @@map("student_achievements")
1524: }
1525:
1526: model StudentPreviousEducation {
1527:   id              String   @id @default(uuid()) @db.Uuid
1528:   institutionId   String   @map("institution_id") @db.Uuid
1529:   studentId       String   @map("student_id") @db.Uuid
1530:   institutionName String   @map("institution_name")
1531:   academicYear    String   @map("academic_year")
1532:   sequence        Int      @default(0)
1533:   createdAt       DateTime @default(now()) @map("created_at")
1534:   updatedAt       DateTime @updatedAt @map("updated_at")
1535:
1536:   institution Institution @relation(fields: [institutionId], references: [id])
1537:   student     Student     @relation(fields: [studentId], references: [id], onDelete: Cascade)
1538:
1539:   @@index([institutionId])
1540:   @@map("student_previous_education")
1541: }
1542:
1543: model StudentInternship {
1544:   id             String    @id @default(uuid()) @db.Uuid
1545:   institutionId  String    @map("institution_id") @db.Uuid
1546:   studentId      String    @map("student_id") @db.Uuid
1547:   organization   String
1548:   role           String
1549:   startDate      DateTime  @map("start_date") @db.Date
1550:   endDate        DateTime? @map("end_date") @db.Date
1551:   description    String?
1552:   certificateUrl String?   @map("certificate_url")
1553:   createdAt      DateTime  @default(now()) @map("created_at")
1554:   updatedAt      DateTime  @updatedAt @map("updated_at")
1555:
1556:   institution Institution @relation(fields: [institutionId], references: [id])
1557:   student     Student     @relation(fields: [studentId], references: [id], onDelete: Cascade)
1558:
1559:   @@index([institutionId])
1560:   @@map("student_internships")
1561: }
1562:
1563: model StudentProject {
1564:   id            String    @id @default(uuid()) @db.Uuid
1565:   institutionId String    @map("institution_id") @db.Uuid
1566:   studentId     String    @map("student_id") @db.Uuid
1567:   title         String
1568:   description   String?
1569:   technologies  String?
1570:   projectUrl    String?   @map("project_url")
1571:   githubUrl     String?   @map("github_url")
1572:   startDate     DateTime? @map("start_date") @db.Date
1573:   endDate       DateTime? @map("end_date") @db.Date
1574:   createdAt     DateTime  @default(now()) @map("created_at")
1575:   updatedAt     DateTime  @updatedAt @map("updated_at")
1576:
1577:   institution Institution @relation(fields: [institutionId], references: [id])
1578:   student     Student     @relation(fields: [studentId], references: [id], onDelete: Cascade)
1579:
1580:   @@index([institutionId])
1581:   @@map("student_projects")
1582: }
1583:
1584: model StudentSkill {
1585:   id            String     @id @default(uuid()) @db.Uuid
1586:   institutionId String     @map("institution_id") @db.Uuid
1587:   studentId     String     @map("student_id") @db.Uuid
1588:   name          String
1589:   level         SkillLevel
1590:
1591:   institution Institution @relation(fields: [institutionId], references: [id])
1592:   student     Student     @relation(fields: [studentId], references: [id], onDelete: Cascade)
1593:
1594:   @@unique([studentId, name])
1595:   @@index([institutionId])
1596:   @@map("student_skills")
1597: }
1598:
1599: model StudentLanguage {
1600:   id            String              @id @default(uuid()) @db.Uuid
1601:   institutionId String              @map("institution_id") @db.Uuid
1602:   studentId     String              @map("student_id") @db.Uuid
1603:   language      String
1604:   proficiency   LanguageProficiency
1605:
1606:   institution Institution @relation(fields: [institutionId], references: [id])
1607:   student     Student     @relation(fields: [studentId], references: [id], onDelete: Cascade)
1608:
1609:   @@unique([studentId, language])
1610:   @@index([institutionId])
1611:   @@map("student_languages")
1612: }
1613:
1614: model AuditLog {
1615:   id            String   @id @default(uuid()) @db.Uuid
1616:   institutionId String   @map("institution_id") @db.Uuid
1617:   actorUserId   String   @map("actor_user_id") @db.Uuid
1618:   action        String
1619:   entityType    String   @map("entity_type")
1620:   entityId      String   @map("entity_id")
1621:   beforeData    Json?    @map("before_data")
1622:   afterData     Json?    @map("after_data")
1623:   createdAt     DateTime @default(now()) @map("created_at")
1624:
1625:   institution Institution @relation(fields: [institutionId], references: [id])
1626:
1627:   @@index([institutionId])
1628:   @@index([actorUserId])
1629:   @@index([entityType])
1630:   @@index([createdAt])
1631:   @@map("audit_logs")
1632: }
1633:
1634: // ─── Curriculum Models ──────────────────────────────────
1635:
1636: model Curriculum {
1637:   id            String           @id @default(uuid()) @db.Uuid
1638:   institutionId String           @map("institution_id") @db.Uuid
1639:   programId     String           @map("program_id") @db.Uuid
1640:   versionNumber String           @map("version_number")
1641:   name          String
1642:   status        CurriculumStatus @default(DRAFT)
1643:   effectiveFrom DateTime         @map("effective_from") @db.Date
1644:   createdAt     DateTime         @default(now()) @map("created_at")
1645:   updatedAt     DateTime         @updatedAt @map("updated_at")
1646:
1647:   institution     Institution      @relation(fields: [institutionId], references: [id])
1648:   program         Program          @relation(fields: [programId], references: [id])
1649:   curriculumTerms CurriculumTerm[]
1650:   students        Student[]
1651:   enrollments     Enrollment[]
1652:
1653:   @@unique([programId, versionNumber])
1654:   @@index([institutionId])
1655:   @@map("curriculums")
1656: }
1657:
1658: model CurriculumTerm {
1659:   id                String   @id @default(uuid()) @db.Uuid
1660:   institutionId     String   @map("institution_id") @db.Uuid
1661:   curriculumId      String   @map("curriculum_id") @db.Uuid
1662:   name              String
1663:   sequence          Int
1664:   creditRequirement Float?   @map("credit_requirement")
1665:   createdAt         DateTime @default(now()) @map("created_at")
1666:   updatedAt         DateTime @updatedAt @map("updated_at")
1667:
1668:   institution       Institution               @relation(fields: [institutionId], references: [id])
1669:   curriculum        Curriculum                @relation(fields: [curriculumId], references: [id], onDelete: Cascade)
1670:   curriculumCourses CurriculumCourse[]
1671:   electiveGroups    CurriculumElectiveGroup[]
1672:   studentTerms      StudentTerm[]
1673:
1674:   @@unique([curriculumId, sequence])
1675:   @@unique([curriculumId, name])
1676:   @@index([institutionId])
1677:   @@map("curriculum_terms")
1678: }
1679:
1680: model CurriculumElectiveGroup {
1681:   id               String   @id @default(uuid()) @db.Uuid
1682:   institutionId    String   @map("institution_id") @db.Uuid
1683:   curriculumTermId String   @map("curriculum_term_id") @db.Uuid
1684:   name             String
1685:   requiredCredits  Float?   @map("required_credits")
1686:   requiredCourses  Int?     @map("required_courses")
1687:   createdAt        DateTime @default(now()) @map("created_at")
1688:   updatedAt        DateTime @updatedAt @map("updated_at")
1689:
1690:   institution    Institution        @relation(fields: [institutionId], references: [id])
1691:   curriculumTerm CurriculumTerm     @relation(fields: [curriculumTermId], references: [id], onDelete: Cascade)
1692:   courses        CurriculumCourse[]
1693:
1694:   @@unique([curriculumTermId, name])
1695:   @@index([institutionId])
1696:   @@map("curriculum_elective_groups")
1697: }
1698:
1699: model CurriculumCourse {
1700:   id               String                   @id @default(uuid()) @db.Uuid
1701:   institutionId    String                   @map("institution_id") @db.Uuid
1702:   curriculumTermId String                   @map("curriculum_term_id") @db.Uuid
1703:   courseId         String                   @map("course_id") @db.Uuid
1704:   sequence         Int
1705:   creditValue      Float?                   @map("credit_value")
1706:   isMandatory      Boolean                  @default(true) @map("is_mandatory")
1707:   electiveGroupId  String?                  @map("elective_group_id") @db.Uuid
1708:   electiveGroup    CurriculumElectiveGroup? @relation(fields: [electiveGroupId], references: [id], onDelete: SetNull)
1709:
1710:   createdAt DateTime @default(now()) @map("created_at")
1711:   updatedAt DateTime @updatedAt @map("updated_at")
1712:
1713:   institution    Institution    @relation(fields: [institutionId], references: [id])
1714:   curriculumTerm CurriculumTerm @relation(fields: [curriculumTermId], references: [id], onDelete: Cascade)
1715:   course         Course         @relation(fields: [courseId], references: [id], onDelete: Restrict)
1716:
1717:   @@unique([curriculumTermId, courseId])
1718:   @@unique([curriculumTermId, sequence])
1719:   @@index([institutionId])
1720:   @@map("curriculum_courses")
1721: }
1722:
1723: model CoursePrerequisite {
1724:   id                   String   @id @default(uuid()) @db.Uuid
1725:   institutionId        String   @map("institution_id") @db.Uuid
1726:   courseId             String   @map("course_id") @db.Uuid
1727:   prerequisiteCourseId String   @map("prerequisite_course_id") @db.Uuid
1728:   createdAt            DateTime @default(now()) @map("created_at")
1729:   updatedAt            DateTime @updatedAt @map("updated_at")
1730:
1731:   institution        Institution @relation(fields: [institutionId], references: [id])
1732:   course             Course      @relation("CourseToPrerequisite", fields: [courseId], references: [id], onDelete: Cascade)
1733:   prerequisiteCourse Course      @relation("PrerequisiteToCourse", fields: [prerequisiteCourseId], references: [id], onDelete: Restrict)
1734:
1735:   @@unique([courseId, prerequisiteCourseId])
1736:   @@index([institutionId])
1737:   @@map("course_prerequisites")
1738: }
1739:
1740: enum PaymentMode {
1741:   ANNUAL
1742:   INSTALLMENTS
1743: }
1744:
1745: enum FeePlanStatus {
1746:   ACTIVE
1747:   COMPLETED
1748:   OVERDUE
1749:   CANCELLED
1750: }
1751:
1752: enum InstallmentStatus {
1753:   PENDING
1754:   PARTIAL
1755:   PAID
1756:   OVERDUE
1757: }
1758:
1759: model StudentFeePlan {
1760:   id             String        @id @default(uuid()) @db.Uuid
1761:   institutionId  String        @map("institution_id") @db.Uuid
1762:   studentId      String        @map("student_id") @db.Uuid
1763:   academicYearId String        @map("academic_year_id") @db.Uuid
1764:   totalAmount    Float         @map("total_amount")
1765:   currency       String        @default("INR")
1766:   paymentMode    PaymentMode   @default(ANNUAL) @map("payment_mode")
1767:   status         FeePlanStatus @default(ACTIVE)
1768:   createdAt      DateTime      @default(now()) @map("created_at")
1769:   updatedAt      DateTime      @updatedAt @map("updated_at")
1770:
1771:   institution  Institution  @relation(fields: [institutionId], references: [id])
1772:   student      Student      @relation(fields: [studentId], references: [id], onDelete: Restrict)
1773:   academicYear AcademicYear @relation(fields: [academicYearId], references: [id], onDelete: Restrict)
1774:
1775:   installments FeeInstallment[]
1776:
1777:   @@index([institutionId])
1778:   @@index([studentId])
1779:   @@map("student_fee_plans")
1780: }
1781:
1782: model FeeInstallment {
1783:   id                String            @id @default(uuid()) @db.Uuid
1784:   studentFeePlanId  String            @map("student_fee_plan_id") @db.Uuid
1785:   installmentNumber Int               @map("installment_number")
1786:   amount            Float
1787:   amountPaid        Float             @default(0) @map("amount_paid")
1788:   dueDate           DateTime          @map("due_date") @db.Date
1789:   status            InstallmentStatus @default(PENDING)
1790:   createdAt         DateTime          @default(now()) @map("created_at")
1791:   updatedAt         DateTime          @updatedAt @map("updated_at")
1792:
1793:   studentFeePlan StudentFeePlan @relation(fields: [studentFeePlanId], references: [id], onDelete: Cascade)
1794:
1795:   @@index([studentFeePlanId])
1796:   @@map("fee_installments")
1797: }
1798:
1799: model StudentTerm {
1800:   id               String            @id @default(uuid()) @db.Uuid
1801:   institutionId    String            @map("institution_id") @db.Uuid
1802:   studentId        String            @map("student_id") @db.Uuid
1803:   academicTermId   String            @map("academic_term_id") @db.Uuid
1804:   curriculumTermId String?           @map("curriculum_term_id") @db.Uuid
1805:   status           StudentTermStatus
1806:   termGPA          Float?            @map("term_gpa")
1807:   remarks          String?
1808:   createdAt        DateTime          @default(now()) @map("created_at")
1809:   updatedAt        DateTime          @updatedAt @map("updated_at")
1810:
1811:   institution    Institution     @relation(fields: [institutionId], references: [id])
1812:   student        Student         @relation(fields: [studentId], references: [id], onDelete: Cascade)
1813:   academicTerm   AcademicTerm    @relation(fields: [academicTermId], references: [id], onDelete: Restrict)
1814:   curriculumTerm CurriculumTerm? @relation(fields: [curriculumTermId], references: [id], onDelete: SetNull)
1815:
1816:   @@unique([studentId, academicTermId])
1817:   @@index([institutionId])
1818:   @@index([studentId])
1819:   @@index([academicTermId])
1820:   @@map("student_terms")
1821: }
1822:
1823: enum ApplicationStatus {
1824:   SUBMITTED
1825:   UNDER_REVIEW
1826:   OFFERED
1827:   ACCEPTED
1828:   REJECTED
1829:   ENROLLED
1830: }
1831:
1832: model Application {
1833:   id             String @id @default(uuid()) @db.Uuid
1834:   institutionId  String @map("institution_id") @db.Uuid
1835:   programId      String @map("program_id") @db.Uuid
1836:   academicYearId String @map("academic_year_id") @db.Uuid
1837:
1838:   firstName String  @map("first_name")
1839:   lastName  String  @map("last_name")
1840:   email     String
1841:   phone     String?
1842:
1843:   status         ApplicationStatus @default(SUBMITTED)
1844:   applicationFee Float?            @map("application_fee")
1845:   isFeePaid      Boolean           @default(false) @map("is_fee_paid")
1846:
1847:   submittedAt DateTime  @default(now()) @map("submitted_at")
1848:   reviewedAt  DateTime? @map("reviewed_at")
1849:   offeredAt   DateTime? @map("offered_at")
1850:   acceptedAt  DateTime? @map("accepted_at")
1851:   rejectedAt  DateTime? @map("rejected_at")
1852:   enrolledAt  DateTime? @map("enrolled_at")
1853:
1854:   studentId String? @unique @map("student_id") @db.Uuid
1855:
1856:   institution  Institution  @relation(fields: [institutionId], references: [id], onDelete: Cascade)
1857:   program      Program      @relation(fields: [programId], references: [id], onDelete: Cascade)
1858:   academicYear AcademicYear @relation(fields: [academicYearId], references: [id], onDelete: Cascade)
1859:   student      Student?     @relation(fields: [studentId], references: [id], onDelete: SetNull)
1860:
1861:   @@index([institutionId])
1862:   @@index([programId])
1863:   @@index([status])
1864:   @@map("applications")
1865: }
1866:
1867: model AdmissionDraft {
1868:   id            String   @id @default(uuid()) @db.Uuid
1869:   institutionId String   @map("institution_id") @db.Uuid
1870:   userId        String?  @map("user_id") @db.Uuid
1871:   data          Json
1872:   createdAt     DateTime @default(now()) @map("created_at")
1873:   updatedAt     DateTime @updatedAt @map("updated_at")
1874:
1875:   @@index([institutionId])
1876:   @@index([userId])
1877:   @@map("admission_drafts")
1878: }
1879:
1880: model CustomRole {
1881:   id            String   @id @default(uuid()) @db.Uuid
1882:   institutionId String   @map("institution_id") @db.Uuid
1883:   name          String
1884:   description   String?
1885:   createdAt     DateTime @default(now()) @map("created_at")
1886:   updatedAt     DateTime @updatedAt @map("updated_at")
1887:
1888:   institution Institution      @relation(fields: [institutionId], references: [id], onDelete: Cascade)
1889:   permissions RolePermission[]
1890:   users       User[]
1891:
1892:   @@unique([institutionId, name])
1893:   @@map("custom_roles")
1894: }
1895:
1896: model RolePermission {
1897:   id           String @id @default(uuid()) @db.Uuid
1898:   customRoleId String @map("custom_role_id") @db.Uuid
1899:   resource     String
1900:   action       String // e.g. "CREATE", "READ", "UPDATE", "DELETE", "MANAGE"
1901:
1902:   customRole CustomRole @relation(fields: [customRoleId], references: [id], onDelete: Cascade)
1903:
1904:   @@unique([customRoleId, resource, action])
1905:   @@map("role_permissions")
1906: }
1907:
1908: model LessonPlan {
1909:   id                   String           @id @default(uuid()) @db.Uuid
1910:   institutionId        String           @map("institution_id") @db.Uuid
1911:   courseId             String           @map("course_id") @db.Uuid
1912:   facultyId            String           @map("faculty_id") @db.Uuid
1913:   termId               String           @map("term_id") @db.Uuid
1914:   unitId               String?          @map("unit_id") @db.Uuid
1915:   chapterId            String?          @map("chapter_id") @db.Uuid
1916:   title                String
1917:   description          String?          @db.Text
1918:   sequence             Int
1919:   plannedDate          DateTime         @map("planned_date") @db.Date
1920:   deadline             DateTime?        @map("deadline") @db.Date
1921:   actualCompletionDate DateTime?        @map("actual_completion_date") @db.Date
1922:   durationMinutes      Int?             @map("duration_minutes")
1923:   teachingMethod       TeachingMethod   @default(LECTURE) @map("teaching_method")
1924:   status               LessonPlanStatus @default(DRAFT)
1925:   learningObjectives   Json?            @map("learning_objectives")
1926:   teachingPlan         Json?            @map("teaching_plan")
1927:   teachingNotes        String?          @map("teaching_notes") @db.Text
1928:   reflectionNotes      String?          @map("reflection_notes") @db.Text
1929:   createdAt            DateTime         @default(now()) @map("created_at")
1930:   updatedAt            DateTime         @updatedAt @map("updated_at")
1931:
1932:   institution Institution  @relation(fields: [institutionId], references: [id])
1933:   course      Course       @relation(fields: [courseId], references: [id])
1934:   faculty     Faculty      @relation(fields: [facultyId], references: [id])
1935:   term        AcademicTerm @relation(fields: [termId], references: [id])
1936:
1937:   sections         LessonPlanSection[]
1938:   resources        LessonPlanResource[]
1939:   timetableEntries TimetableEntry[]
1940:
1941:   @@index([institutionId])
1942:   @@index([courseId])
1943:   @@index([facultyId])
1944:   @@index([termId])
1945:   @@index([plannedDate])
1946:   @@map("lesson_plans")
1947: }
1948:
1949: model LessonPlanSection {
1950:   id           String @id @default(uuid()) @db.Uuid
1951:   lessonPlanId String @map("lesson_plan_id") @db.Uuid
1952:   sectionId    String @map("section_id") @db.Uuid
1953:
1954:   lessonPlan LessonPlan @relation(fields: [lessonPlanId], references: [id], onDelete: Cascade)
1955:   section    Section    @relation(fields: [sectionId], references: [id], onDelete: Cascade)
1956:
1957:   @@unique([lessonPlanId, sectionId])
1958:   @@map("lesson_plan_sections")
1959: }
1960:
1961: model LessonPlanResource {
1962:   id           String @id @default(uuid()) @db.Uuid
1963:   lessonPlanId String @map("lesson_plan_id") @db.Uuid
1964:   resourceId   String @map("resource_id") @db.Uuid
1965:   sortOrder    Int    @default(0) @map("sort_order")
1966:
1967:   lessonPlan LessonPlan     @relation(fields: [lessonPlanId], references: [id], onDelete: Cascade)
1968:   resource   CourseResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
1969:
1970:   @@unique([lessonPlanId, resourceId])
1971:   @@map("lesson_plan_resources")
1972: }
1973:
1974: model AdminResource {
1975:   id            String       @id @default(uuid()) @db.Uuid
1976:   institutionId String       @map("institution_id") @db.Uuid
1977:   courseId      String?      @map("course_id") @db.Uuid
1978:   title         String
1979:   description   String?      @db.Text
1980:   resourceType  ResourceType @map("resource_type")
1981:   fileUrl       String?      @map("file_url")
1982:   externalUrl   String?      @map("external_url")
1983:   uploadedBy    String?      @map("uploaded_by") @db.Uuid
1984:   createdAt     DateTime     @default(now()) @map("created_at")
1985:   updatedAt     DateTime     @updatedAt @map("updated_at")
1986:
1987:   institution Institution @relation(fields: [institutionId], references: [id])
1988:   course      Course?     @relation(fields: [courseId], references: [id])
1989:
1990:   @@index([institutionId])
1991:   @@index([courseId])
1992:   @@map("admin_resources")
1993: }

(End of file - total 1993 lines)
</content>
```

---

## Assistant (Orchestrator · MiMo V2.5 Free · 8.2s)

_Thinking:_

Now I have the full schema. Let me check if there's an existing seed script or any database configuration.

Now let me check for existing seed setup and dependencies.

**Tool: glob**

**Input:**

```json
{
  "pattern": "**/prisma/seed*"
}
```

**Output:**

```
No files found
```

**Tool: read**

**Input:**

```json
{
  "filePath": "/home/ybl/proj/Ellipsonic/ERP/student_erp/libs/database"
}
```

**Output:**

```
<path>/home/ybl/proj/Ellipsonic/ERP/student_erp/libs/database</path>
<type>directory</type>
<entries>
.env
.opencode/
node_modules/
package.json
prisma/

(5 entries)
</entries>
```

**Tool: read**

**Input:**

```json
{
  "filePath": "/home/ybl/proj/Ellipsonic/ERP/student_erp/libs/database/package.json"
}
```

**Output:**

```
<path>/home/ybl/proj/Ellipsonic/ERP/student_erp/libs/database/package.json</path>
<type>file</type>
<content>
1: {
2:   "name": "@student-erp/database",
3:   "version": "0.0.0",
4:   "private": true,
5:   "scripts": {
6:     "generate": "prisma generate",
7:     "migrate": "prisma migrate dev",
8:     "migrate:prod": "prisma migrate deploy",
9:     "db:push": "prisma db push",
10:     "studio": "prisma studio"
11:   },
12:   "dependencies": {
13:     "@prisma/client": "^6.19.3",
14:     "@supabase/supabase-js": "^2.112.2"
15:   },
16:   "devDependencies": {
17:     "prisma": "^6.19.3",
18:     "tsx": "^4.7.1"
19:   }
20: }

(End of file - total 20 lines)
</content>
```

---

## Assistant (Orchestrator · MiMo V2.5 Free · 2463.2s)

_Thinking:_

Good. Now I have a full understanding of the schema. Let me create a comprehensive seed script that:

1. Creates an institution (e.g., a university)
2. Creates all the core entities following the proper dependency order
3. Respects all foreign key constraints

The dependency order is roughly:

1. Institution
2. Departments, Academic Years, Class Levels, Buildings
3. Programs, Curriculums, Academic Terms, Rooms, Custom Roles
4. Curriculum Terms, Batches, Sections, Users (Admin, Faculty, Students, Guardians)
5. Faculty, Students (with user links)
6. Courses, Course Offerings, Course Assignments, Buildings/Rooms
7. Enrollments, Attendance Sessions, Assignments, Exams, etc.
8. Various sub-entities

This is a large, bounded implementation task. Let me delegate this to @fixer since the schema is fully read and the requirements are clear.

Actually, let me think about this more carefully. This is a very large seed script with50+ tables and complex relationships. Let me plan the approach:

1. Use a TypeScript seed script with Prisma client
2. Create realistic test data for a university
3. Follow the exact schema constraints

The script needs to be runnable with `npx tsx prisma/seed.ts` or similar, and should work with Supabase (which uses PostgreSQL).

Let me think about whether to delegate or do this myself. The task is well-defined: create a seed script following the schema. It's a single file, large but straightforward. I'll delegate to @fixer with a very detailed prompt since I have all the schema knowledge.

Actually, given the complexity and size, let me write this myself. It's one file, the requirements are crystal clear from the schema, and I need to be careful about the exact field mappings. Let me just write it directly.

Let me plan the seed data structure:

1. **Institution**:1 university
2. **Department**: 2 departments (CS, Math)
3. **Academic Year**: 1 active year (2025-2026)
4. **Academic Terms**: 2 semesters
5. **Class Levels**: e.g., Year 1, Year 2
6. **Programs**: 2 programs (B.Tech CS, B.Tech Math)
7. **Curriculums**: 1 curriculum per program
8. **Curriculum Terms**: 1 per curriculum
9. **Curriculum Courses**: link courses to curriculum terms
10. **Batches**: 1 per program
11. **Sections**: 1 per batch
12. **Buildings**: 1
13. **Rooms**: 2
14. **Custom Roles**: maybe 1
15. **Users**: Admin, 2 Faculty, 4 Students, 2 Guardians
16. **Faculty**: 2 faculty records
17. **Students**: 4 student records
18. **Guardians**: 2 guardian records
19. **Courses**: 4 courses
20. **Course Offerings**: 421. **Course Assignments**: 2 (faculty to courses)
21. **Enrollments**: 4 (students to courses)
22. **Timetable Entries**: a few
23. **Attendance Sessions**: a few
24. **Attendance Records**: a few
25. **Assignments**: a few
26. **Assignment Submissions**: a few
27. **Exams**: 1
28. **Exam Courses**: 1
29. **Marks**: a few
30. **Calendar Events**: 1-2
31. **Announcements**: 1-2
32. **Notifications**: a few
33. **Course Resources**: 1-2
34. **Certificate Requests**: 0-1
35. **Student Documents**: 1-2
36. **Student Skills/Languages/Achievements**: a few
37. **Fee Plans**: 139. **Fee Installments**: 2
38. **Student Terms**: a few
39. **Applications**: 1-2
40. **Lesson Plans**: 1-2
41. **Grievances**: 0-1
42. **Service Requests**: 0-1
43. **Clubs**: 1
44. **Club Memberships**: 1-2
45. **Club Events**: 1
46. **Club Event Registrations**: 1
47. **Feedback Forms**: 1
48. **Feedback Questions**: 1-2
49. **Feedback Submissions**: 1This is a massive amount of work. Let me delegate to @fixer with very precise instructions.

Actually, I think I should write this myself since the schema is complex and I need to be very precise about field mappings (snake_case in DB, camelCase in Prisma). Let me write the script.

Wait - actually the schema already defines `@@map` for all tables. The Prisma client will use camelCase model names but the actual DB tables are snake_case. When using Prisma client, I just use the model names as defined in the schema.

Let me write this seed script. I'll use `@prisma/client` directly.

Let me check if there's a tsconfig or anything in the prisma directory.

Let me just write the seed script directly. I have all the information I need.

For the UUID approach - I'll use fixed UUIDs so the seed is deterministic and can be re-run. I'll use a helper to generate deterministic UUIDs from a string.

Actually, let me use `crypto.randomUUID()` or just hardcode UUIDs. For a seed script, hardcoded UUIDs make it easier to reference across tables. Let me use a simple approach.

Let me write the seed script now. I'll keep it comprehensive but realistic.

The key constraint: this needs to work with Supabase. That means it uses standard PostgreSQL. Prisma db push or migrate should work fine. The seed script should use `prisma` client directly.

For the seed command, I need to add it to package.json as well.

Let me write the full seed script. I'll organize it by dependency order.

This is a large, well-defined bounded task — creating a seed script for ~50+ tables with complex FK dependencies. I'll delegate to @fixer with the complete schema context.

**Tool: task**

**Input:**

```json
{
  "subagent_type": "fixer",
  "description": "Create comprehensive Prisma seed script",
  "prompt": "Create a Prisma seed script at `libs/database/prisma/seed.ts` that seeds a complete realistic institution (a university) following the exact schema in `libs/database/prisma/schema.prisma`.\n\n## Requirements\n1. Read the full schema at `libs/database/prisma/schema.prisma` first\n2. Create a TypeScript seed script using `@prisma/client` (already installed)\n3. Seed ONE institution with realistic data covering ALL tables\n4. Respect every foreign key, unique constraint, and relation order\n5. Use hardcoded UUIDs (deterministic) so the seed is re-runnable with `--force` or delete-first approach\n6. Add a `\"seed\": \"npx tsx prisma/seed.ts\"` script to `libs/database/package.json`\n7. The script should handle cleanup (delete in reverse dependency order) before inserting\n\n## Dependency Order (MUST follow this strictly)\nThe FK dependencies dictate this insertion order:\n\n1. **Institution** (1 university - e.g., \"Ellipsonic Institute of Technology\")\n2. **Department** (2 - Computer Science, Mathematics)\n3. **AcademicYear** (1 active - 2025-2026)\n4. **ClassLevel** (3 - Year 1, Year 2, Year 3)\n5. **Building** (1 - Main Building)\n6. **Room** (3 - Lecture Hall A101, Lab B201, Office C301)\n7. **Program** (2 - B.Tech CS 4yr, B.Tech Math 3yr)\n8. **CustomRole** (1 - \"Department Head\")\n9. **RolePermission** (2 permissions for that role)\n10. **Curriculum** (1 per program = 2)\n11. **AcademicTerm** (2 semesters)\n12. **CurriculumTerm** (1 per curriculum = 2)\n13. **CurriculumElectiveGroup** (1 per curriculum term that needs it = 2)\n14. **Batch** (1 per program = 2)\n15. **Section** (1 per batch = 2)\n16. **Course** (6 courses spread across departments - e.g., Data Structures, Algorithms, OS, Linear Algebra, Calculus, Discrete Math)\n17. **CurriculumCourse** (link courses to curriculum terms, some mandatory some elective)\n18. **CoursePrerequisite** (e.g., Algorithms requires Data Structures)\n19. **User** (Admin=1, Faculty=2, Student=4, Guardian=2)\n20. **Faculty** (2 records linked to faculty users)\n21. **Guardian** (2 records linked to guardian users)\n22. **Student** (4 records linked to student users, with all profile fields)\n23. **CourseOffering** (offer each course in the active term)\n24. **CourseAssignment** (assign faculty to courses/sections/terms)\n25. **Enrollment** (enroll students in courses)\n26. **TimetableEntry** (a few entries)\n27. **AttendanceSession** (2 sessions)\n28. **AttendanceRecord** (records for students in sessions)\n29. **CourseResource** (2 resources)\n30. **Assignment** (2 assignments)\n31. **AssignmentSubmission** (submissions from students)\n32. **Exam** (1 - Midterm)\n33. **ExamCourse** (link exam to courses)\n34. **Mark** (marks for students)\n35. **LessonPlan** (2 lesson plans)\n36. **LessonPlanSection** (link lesson plans to sections)\n37. **LessonPlanResource** (link lesson plans to resources)\n38. **CalendarEvent** (2 events)\n39. **Announcement** (2 announcements)\n40. **Notification** (a few notifications)\n41. **CertificateRequest** (1)\n42. **Certificate** (1 linked to request)\n43. **StudentDocument** (2 docs per student)\n44. **FeedbackForm** (1 form)\n45. **FeedbackQuestion** (2 questions)\n46. **FeedbackSubmission** (1 submission)\n47. **FeedbackAnswer** (answers for the submission)\n48. **ServiceRequest** (1)\n49. **Grievance** (1)\n50. **Club** (1 - \"Tech Club\")\n51. **ClubMembership** (2 members)\n52. **ClubEvent** (1 event)\n53. **ClubEventRegistration** (1 registration)\n54. **StudentSkill** (2 per student)\n55. **StudentLanguage** (1 per student)\n56. **StudentAchievement** (1 per student)\n57. **StudentPreviousEducation** (1 per student)\n58. **StudentInternship** (0 - skip or 1)\n59. **StudentProject** (1 per student)\n60. **StudentSocialProfile** (1 per student)\n61. **StudentTerm** (link students to terms)\n62. **StudentFeePlan** (1 per student)\n63. **FeeInstallment** (2 per fee plan)\n64. **Application** (2 applications - one accepted, one pending)\n65. **AdminResource** (1)\n66. **AuditLog** (2 entries)\n\n## Important Schema Details to Get Right\n- All IDs are UUIDs (`@db.Uuid`)\n- Many fields use `@map` for snake_case DB columns (e.g., `institutionId` maps to `institution_id`)\n- `Institution.id` is referenced by `institutionId` in almost every table\n- `User` has `authUserId` which is nullable and unique\n- `Student` has optional `guardianId`, `programId`, `sectionId`, `curriculumId`\n- `Faculty` requires `userId` (unique), `departmentId`, `teacherCode`, `employmentType`, `hireDate`\n- `Guardian` requires `userId` (unique)\n- `Enrollment` has many optional FK fields: `courseId`, `courseOfferingId`, `programId`, `curriculumId`, `classLevelId`, `batchId`, `sectionId`, `termId`\n- `CourseAssignment` has unique constraint on `[facultyId, courseId, sectionId, termId]`\n- `AttendanceRecord` has unique on `[attendanceSessionId, studentId]`\n- `AssignmentSubmission` has unique on `[assignmentId, studentId]`\n- `ExamCourse` has unique on `[examId, courseId]`\n- `Mark` has unique on `[examCourseId, studentId]`\n- `TimetableEntry` has time fields (`@db.Time`) - use `new Date('1970-01-01T09:00:00')` for time-only values\n- `AttendanceSession` has `date` as `@db.Date`, `startTime`/`endTime` as `@db.Time`\n- `CurriculumCourse` has unique on `[curriculumTermId, courseId]` AND `[curriculumTermId, sequence]`\n- `StudentSkill` has unique on `[studentId, name]`\n- `StudentLanguage` has unique on `[studentId, language]`\n- `ClubMembership` has unique on `[clubId, studentId]`\n- `ClubEventRegistration` has unique on `[clubEventId, studentId]`\n- `StudentTerm` has unique on `[studentId, academicTermId]`\n- `CurriculumTerm` has unique on `[curriculumId, sequence]` AND `[curriculumId, name]`\n- `CustomRole` has unique on `[institutionId, name]`\n- `RolePermission` has unique on `[customRoleId, resource, action]`\n- `Application` has `studentId` as `@unique @db.Uuid` (nullable)\n- `FeedbackAnswer` has NO `institutionId` field - only `submissionId`, `questionId`, `answer`\n- `LessonPlanSection` has NO `institutionId` - only `lessonPlanId`, `sectionId`\n- `LessonPlanResource` has NO `institutionId` - only `lessonPlanId`, `resourceId`, `sortOrder`\n- `FeeInstallment` has NO `institutionId` - only `studentFeePlanId`, fields, and timestamps\n\n## Cleanup Strategy\nAt the start of the seed, delete ALL data in reverse dependency order using `prisma.$executeRawUnsafe` with TRUNCATE CASCADE or manual deletes. Use `prisma.$executeRawUnsafe('DELETE FROM \"tableName\"')` in reverse FK order. This makes the script re-runnable.\n\n## Output\n- Write the complete seed script to `libs/database/prisma/seed.ts`\n- Add `\"seed\": \"npx tsx prisma/seed.ts\"` to `libs/database/package.json` scripts\n- Make sure all imports are correct\n- Use `const { PrismaClient } = require('@prisma/client')` or ES imports\n\n## Data Realism\n- University name: \"Ellipsonic Institute of Technology\"  \n- Code prefix: \"EIT\"\n- Emails: use @eit.edu domain\n- Phone numbers: realistic Indian format (+91-XXXXX-XXXXX)\n- Dates: academic year 2025-2026, semesters Aug-Dec 2025 and Jan-May 2026\n- Student admission numbers: ADM-2025-001 through ADM-2025-004\n- Teacher codes: FAC-001, FAC-002\n- Course codes: CS101, CS201, CS301, MA101, MA201, MA301\n\nReturn a summary of what was created when done."
}
```

**Error:**

```
Subagent failed (task_id: ses_fa7623b05ffeIUqjqZTfZIk5X3): {"message":"Streaming response failed: [504] Upstream idle timeout exceeded","type":"server_error"}
```

---

## Assistant (Orchestrator · MiMo V2.5 Free · 186.8s)

_Thinking:_

The fixer task failed with a timeout. Let me retry with a fresh session. The task is well-defined, I just need to split it or simplify the prompt to avoid timeout.

Actually, let me just write the seed script myself. I have all the schema knowledge and the task is clear. I'll write it directly since the delegate failed.

Delegate timed out. I'll write the seed script directly — I have full schema context.

**Tool: write**

**Input:**

```json
{
  "filePath": "/home/ybl/proj/Ellipsonic/ERP/student_erp/libs/database/prisma/seed.ts",
  "content": "import { PrismaClient } from \"@prisma/client\";\n\nconst prisma = new PrismaClient();\n\n// ─── Deterministic UUIDs ────────────────────────────────\n// Using fixed UUIDs so the seed is deterministic and re-runnable.\nconst IDs = {\n  institution: \"a0000000-0000-0000-0000-000000000001\",\n\n  // Departments\n  deptCS: \"b0000000-0000-0000-0000-000000000001\",\n  deptMath: \"b0000000-0000-0000-0000-000000000002\",\n\n  // Academic Year\n  ay2025: \"c0000000-0000-0000-0000-000000000001\",\n\n  // Academic Terms\n  termSem1: \"d0000000-0000-0000-0000-000000000001\",\n  termSem2: \"d0000000-0000-0000-0000-000000000002\",\n\n  // Class Levels\n  clsYr1: \"e0000000-0000-0000-0000-000000000001\",\n  clsYr2: \"e0000000-0000-0000-0000-000000000002\",\n  clsYr3: \"e0000000-0000-0000-0000-000000000003\",\n\n  // Building & Rooms\n  building: \"f0000000-0000-0000-0000-000000000001\",\n  roomA101: \"f1000000-0000-0000-0000-000000000001\",\n  roomB201: \"f1000000-0000-0000-0000-000000000002\",\n  roomC301: \"f1000000-0000-0000-0000-000000000003\",\n\n  // Programs\n  progBTechCS: \"g0000000-0000-0000-0000-000000000001\",\n  progBTechMath: \"g0000000-0000-0000-0000-000000000002\",\n\n  // Custom Role & Permissions\n  customRole: \"h0000000-0000-0000-0000-000000000001\",\n  perm1: \"h1000000-0000-0000-0000-000000000001\",\n  perm2: \"h1000000-0000-0000-0000-000000000002\",\n\n  // Curriculums\n  currCS: \"i0000000-0000-0000-0000-000000000001\",\n  currMath: \"i0000000-0000-0000-0000-000000000002\",\n\n  // Curriculum Terms\n  currTermCS1: \"i1000000-0000-0000-0000-000000000001\",\n  currTermMath1: \"i1000000-0000-0000-0000-000000000002\",\n\n  // Curriculum Elective Groups\n  electiveGrpCS: \"i2000000-0000-0000-0000-000000000001\",\n  electiveGrpMath: \"i2000000-0000-0000-0000-000000000002\",\n\n  // Batches\n  batchCS2025: \"j0000000-0000-0000-0000-000000000001\",\n  batchMath2025: \"j0000000-0000-0000-0000-000000000002\",\n\n  // Sections\n  sectionCS: \"k0000000-0000-0000-0000-000000000001\",\n  sectionMath: \"k0000000-0000-0000-0000-000000000002\",\n\n  // Courses\n  cs101: \"l0000000-0000-0000-0000-000000000001\",\n  cs201: \"l0000000-0000-0000-0000-000000000002\",\n  cs301: \"l0000000-0000-0000-0000-000000000003\",\n  ma101: \"l0000000-0000-0000-0000-000000000004\",\n  ma201: \"l0000000-0000-0000-0000-000000000005\",\n  ma301: \"l0000000-0000-0000-0000-000000000006\",\n\n  // Curriculum Courses\n  ccCS1: \"l2000000-0000-0000-0000-000000000001\",\n  ccCS2: \"l2000000-0000-0000-0000-000000000002\",\n  ccCS3: \"l2000000-0000-0000-0000-000000000003\",\n  ccMA1: \"l2000000-0000-0000-0000-000000000004\",\n  ccMA2: \"l2000000-0000-0000-0000-000000000005\",\n  ccMA3: \"l2000000-0000-0000-0000-000000000006\",\n\n  // Course Prerequisite\n  prereq1: \"l3000000-0000-0000-0000-000000000001\",\n\n  // Users\n  userAdmin: \"m0000000-0000-0000-0000-000000000001\",\n  userFac1: \"m0000000-0000-0000-0000-000000000002\",\n  userFac2: \"m0000000-0000-0000-0000-000000000003\",\n  userStu1: \"m0000000-0000-0000-0000-000000000004\",\n  userStu2: \"m0000000-0000-0000-0000-000000000005\",\n  userStu3: \"m0000000-0000-0000-0000-000000000006\",\n  userStu4: \"m0000000-0000-0000-0000-000000000007\",\n  userGuard1: \"m0000000-0000-0000-0000-000000000008\",\n  userGuard2: \"m0000000-0000-0000-0000-000000000009\",\n\n  // Faculty\n  fac1: \"n0000000-0000-0000-0000-000000000001\",\n  fac2: \"n0000000-0000-0000-0000-000000000002\",\n\n  // Guardians\n  guard1: \"n1000000-0000-0000-0000-000000000001\",\n  guard2: \"n1000000-0000-0000-0000-000000000002\",\n\n  // Students\n  stu1: \"n2000000-0000-0000-0000-000000000001\",\n  stu2: \"n2000000-0000-0000-0000-000000000002\",\n  stu3: \"n2000000-0000-0000-0000-000000000003\",\n  stu4: \"n2000000-0000-0000-0000-000000000004\",\n\n  // Course Offerings\n  offCS101: \"o0000000-0000-0000-0000-000000000001\",\n  offCS201: \"o0000000-0000-0000-0000-000000000002\",\n  offCS301: \"o0000000-0000-0000-0000-000000000003\",\n  offMA101: \"o0000000-0000-0000-0000-000000000004\",\n  offMA201: \"o0000000-0000-0000-0000-000000000005\",\n  offMA301: \"o0000000-0000-0000-0000-000000000006\",\n\n  // Course Assignments\n  ca1: \"o1000000-0000-0000-0000-000000000001\",\n  ca2: \"o1000000-0000-0000-0000-000000000002\",\n\n  // Enrollments\n  enr1: \"o2000000-0000-0000-0000-000000000001\",\n  enr2: \"o2000000-0000-0000-0000-000000000002\",\n  enr3: \"o2000000-0000-0000-0000-000000000003\",\n  enr4: \"o2000000-0000-0000-0000-000000000004\",\n  enr5: \"o2000000-0000-0000-0000-000000000005\",\n  enr6: \"o2000000-0000-0000-0000-000000000006\",\n  enr7: \"o2000000-0000-0000-0000-000000000007\",\n  enr8: \"o2000000-0000-0000-0000-000000000008\",\n\n  // Timetable Entries\n  tt1: \"p0000000-0000-0000-0000-000000000001\",\n  tt2: \"p0000000-0000-0000-0000-000000000002\",\n\n  // Attendance Sessions\n  attSess1: \"q0000000-0000-0000-0000-000000000001\",\n  attSess2: \"q0000000-0000-0000-0000-000000000002\",\n\n  // Attendance Records\n  attRec1: \"q1000000-0000-0000-0000-000000000001\",\n  attRec2: \"q1000000-0000-0000-0000-000000000002\",\n  attRec3: \"q1000000-0000-0000-0000-000000000003\",\n  attRec4: \"q1000000-0000-0000-0000-000000000004\",\n\n  // Course Resources\n  res1: \"r0000000-0000-0000-0000-000000000001\",\n  res2: \"r0000000-0000-0000-0000-000000000002\",\n\n  // Assignments\n  assign1: \"s0000000-0000-0000-0000-000000000001\",\n  assign2: \"s0000000-0000-0000-0000-000000000002\",\n\n  // Assignment Submissions\n  sub1: \"s1000000-0000-0000-0000-000000000001\",\n  sub2: \"s1000000-0000-0000-0000-000000000002\",\n\n  // Exams\n  exam1: \"t0000000-0000-0000-0000-000000000001\",\n\n  // Exam Courses\n  examCourse1: \"t1000000-0000-0000-0000-000000000001\",\n\n  // Marks\n  mark1: \"u0000000-0000-0000-0000-000000000001\",\n  mark2: \"u0000000-0000-0000-0000-000000000002\",\n\n  // Calendar Events\n  cal1: \"v0000000-0000-0000-0000-000000000001\",\n  cal2: \"v0000000-0000-0000-0000-000000000002\",\n\n  // Announcements\n  ann1: \"w0000000-0000-0000-0000-000000000001\",\n  ann2: \"w0000000-0000-0000-0000-000000000002\",\n\n  // Notifications\n  notif1: \"x0000000-0000-0000-0000-000000000001\",\n  notif2: \"x0000000-0000-0000-0000-000000000002\",\n\n  // Certificate Request & Certificate\n  certReq1: \"y0000000-0000-0000-0000-000000000001\",\n  cert1: \"y1000000-0000-0000-0000-000000000001\",\n\n  // Student Documents\n  stDoc1: \"z0000000-0000-0000-0000-000000000001\",\n  stDoc2: \"z0000000-0000-0000-0000-000000000002\",\n\n  // Feedback\n  fbForm: \"aa000000-0000-0000-0000-000000000001\",\n  fbQ1: \"aa100000-0000-0000-0000-000000000001\",\n  fbQ2: \"aa100000-0000-0000-0000-000000000002\",\n  fbSub: \"aa200000-0000-0000-0000-000000000001\",\n  fbAns1: \"aa300000-0000-0000-0000-000000000001\",\n  fbAns2: \"aa300000-0000-0000-0000-000000000002\",\n\n  // Service Request\n  srvReq: \"ab000000-0000-0000-0000-000000000001\",\n\n  // Grievance\n  grievance: \"ac000000-0000-0000-0000-000000000001\",\n\n  // Clubs\n  club: \"ad000000-0000-0000-0000-000000000001\",\n  clubMem1: \"ad100000-0000-0000-0000-000000000001\",\n  clubMem2: \"ad100000-0000-0000-0000-000000000002\",\n  clubEvt: \"ad200000-0000-0000-0000-000000000001\",\n  clubEvtReg: \"ad300000-0000-0000-0000-000000000001\",\n\n  // Student Skills\n  skill1: \"ae000000-0000-0000-0000-000000000001\",\n  skill2: \"ae000000-0000-0000-0000-000000000002\",\n  skill3: \"ae000000-0000-0000-0000-000000000003\",\n  skill4: \"ae000000-0000-0000-0000-000000000004\",\n  skill5: \"ae000000-0000-0000-0000-000000000005\",\n  skill6: \"ae000000-0000-0000-0000-000000000006\",\n  skill7: \"ae000000-0000-0000-0000-000000000007\",\n  skill8: \"ae000000-0000-0000-0000-000000000008\",\n\n  // Student Languages\n  lang1: \"af000000-0000-0000-0000-000000000001\",\n  lang2: \"af000000-0000-0000-0000-000000000002\",\n  lang3: \"af000000-0000-0000-0000-000000000003\",\n  lang4: \"af000000-0000-0000-0000-000000000004\",\n\n  // Student Achievements\n  ach1: \"ag000000-0000-0000-0000-000000000001\",\n  ach2: \"ag000000-0000-0000-0000-000000000002\",\n\n  // Student Previous Education\n  prevEd1: \"ah000000-0000-0000-0000-000000000001\",\n  prevEd2: \"ah000000-0000-0000-0000-000000000002\",\n\n  // Student Projects\n  proj1: \"ai000000-0000-0000-0000-000000000001\",\n  proj2: \"ai000000-0000-0000-0000-000000000002\",\n\n  // Student Social Profiles\n  socProf1: \"aj000000-0000-0000-0000-000000000001\",\n  socProf2: \"aj000000-0000-0000-0000-000000000002\",\n\n  // Student Terms\n  stTerm1: \"ak000000-0000-0000-0000-000000000001\",\n  stTerm2: \"ak000000-0000-0000-0000-000000000002\",\n\n  // Fee Plans & Installments\n  feePlan1: \"al000000-0000-0000-0000-000000000001\",\n  feePlan2: \"al000000-0000-0000-0000-000000000002\",\n  inst1: \"al100000-0000-0000-0000-000000000001\",\n  inst2: \"al100000-0000-0000-0000-000000000002\",\n  inst3: \"al100000-0000-0000-0000-000000000003\",\n  inst4: \"al100000-0000-0000-0000-000000000004\",\n\n  // Applications\n  app1: \"am000000-0000-0000-0000-000000000001\",\n  app2: \"am000000-0000-0000-0000-000000000002\",\n\n  // Lesson Plans\n  lp1: \"an000000-0000-0000-0000-000000000001\",\n  lp2: \"an000000-0000-0000-0000-000000000002\",\n\n  // Lesson Plan Sections\n  lpSec1: \"an100000-0000-0000-0000-000000000001\",\n\n  // Lesson Plan Resources\n  lpRes1: \"an200000-0000-0000-0000-000000000001\",\n\n  // Admin Resources\n  adminRes: \"ao000000-0000-0000-0000-000000000001\",\n\n  // Audit Logs\n  audit1: \"ap000000-0000-0000-0000-000000000001\",\n  audit2: \"ap000000-0000-0000-0000-000000000002\",\n};\n\n// ─── Helpers ────────────────────────────────────────────\nconst d = (s: string) => new Date(s); // date helper\nconst time = (h: number, m: number) =>\n  new Date(`1970-01-01T${String(h).padStart(2, \"0\")}:${String(m).padStart(2, \"0\")}:00.000Z`);\n\n// ─── Cleanup (reverse FK order) ────────────────────────\nasync function cleanup() {\n  console.log(\"🧹 Cleaning up existing data...\");\n  const tables = [\n    \"audit_logs\",\n    \"admin_resources\",\n    \"lesson_plan_resources\",\n    \"lesson_plan_sections\",\n    \"lesson_plans\",\n    \"applications\",\n    \"fee_installments\",\n    \"student_fee_plans\",\n    \"student_terms\",\n    \"student_social_profiles\",\n    \"student_projects\",\n    \"student_previous_education\",\n    \"student_achievements\",\n    \"student_languages\",\n    \"student_skills\",\n    \"club_event_registrations\",\n    \"club_events\",\n    \"club_memberships\",\n    \"clubs\",\n    \"grievances\",\n    \"service_requests\",\n    \"feedback_answers\",\n    \"feedback_submissions\",\n    \"feedback_questions\",\n    \"feedback_forms\",\n    \"student_documents\",\n    \"certificates\",\n    \"certificate_requests\",\n    \"notifications\",\n    \"announcements\",\n    \"calendar_events\",\n    \"marks\",\n    \"exam_courses\",\n    \"exams\",\n    \"assignment_submissions\",\n    \"assignments\",\n    \"course_resources\",\n    \"attendance_records\",\n    \"attendance_sessions\",\n    \"timetable_entries\",\n    \"course_assignments\",\n    \"enrollments\",\n    \"course_offerings\",\n    \"curriculum_courses\",\n    \"course_prerequisites\",\n    \"curriculum_elective_groups\",\n    \"curriculum_terms\",\n    \"curriculums\",\n    \"courses\",\n    \"sections\",\n    \"batches\",\n    \"academic_terms\",\n    \"rooms\",\n    \"buildings\",\n    \"class_levels\",\n    \"academic_years\",\n    \"programs\",\n    \"role_permissions\",\n    \"custom_roles\",\n    \"students\",\n    \"guardians\",\n    \"faculty\",\n    \"users\",\n    \"departments\",\n    \"institutions\",\n  ];\n  for (const table of tables) {\n    await prisma.$executeRawUnsafe(`DELETE FROM \"${table}\"`);\n  }\n  console.log(\"✅ Cleanup done.\");\n}\n\n// ─── Seed ───────────────────────────────────────────────\nasync function main() {\n  await cleanup();\n\n  const I = IDs;\n  const now = new Date();\n\n  console.log(\"🌱 Seeding institution...\");\n\n  // 1. Institution\n  await prisma.institution.create({\n    data: {\n      id: I.institution,\n      institutionType: \"UNIVERSITY\",\n      legalName: \"Ellipsonic Institute of Technology\",\n      displayName: \"EIT\",\n      branding: { primaryColor: \"#1a365d\", accentColor: \"#e53e3e\" },\n    },\n  });\n\n  // 2. Departments\n  await prisma.department.createMany({\n    data: [\n      { id: I.deptCS, institutionId: I.institution, name: \"Computer Science\", code: \"CS\" },\n      { id: I.deptMath, institutionId: I.institution, name: \"Mathematics\", code: \"MA\" },\n    ],\n  });\n\n  // 3. Academic Year\n  await prisma.academicYear.create({\n    data: {\n      id: I.ay2025,\n      institutionId: I.institution,\n      name: \"2025-2026\",\n      startDate: d(\"2025-08-01\"),\n      endDate: d(\"2026-07-31\"),\n      isActive: true,\n    },\n  });\n\n  // 4. Class Levels\n  await prisma.classLevel.createMany({\n    data: [\n      { id: I.clsYr1, institutionId: I.institution, name: \"Year 1\", code: \"Y1\", sequence: 1 },\n      { id: I.clsYr2, institutionId: I.institution, name: \"Year 2\", code: \"Y2\", sequence: 2 },\n      { id: I.clsYr3, institutionId: I.institution, name: \"Year 3\", code: \"Y3\", sequence: 3 },\n    ],\n  });\n\n  // 5. Building & Rooms\n  await prisma.building.create({\n    data: {\n      id: I.building,\n      institutionId: I.institution,\n      name: \"Main Building\",\n      code: \"MB\",\n      address: \"EIT Campus, Sector 15, Noida, UP\",\n      floors: 4,\n    },\n  });\n\n  await prisma.room.createMany({\n    data: [\n      { id: I.roomA101, institutionId: I.institution, buildingId: I.building, name: \"Lecture Hall A\", number: \"A-101\", floor: 1, capacity: 120, roomType: \"LECTURE_HALL\" },\n      { id: I.roomB201, institutionId: I.institution, buildingId: I.building, name: \"CS Lab B\", number: \"B-201\", floor: 2, capacity: 60, roomType: \"LAB\" },\n      { id: I.roomC301, institutionId: I.institution, buildingId: I.building, name: \"Faculty Office C\", number: \"C-301\", floor: 3, capacity: 4, roomType: \"OFFICE\" },\n    ],\n  });\n\n  // 6. Programs\n  await prisma.program.createMany({\n    data: [\n      { id: I.progBTechCS, institutionId: I.institution, departmentId: I.deptCS, name: \"B.Tech Computer Science\", code: \"BTCS\", level: \"UNDERGRADUATE\", durationYears: 4 },\n      { id: I.progBTechMath, institutionId: I.institution, departmentId: I.deptMath, name: \"B.Tech Mathematics\", code: \"BTMA\", level: \"UNDERGRADUATE\", durationYears: 3 },\n    ],\n  });\n\n  // 7. Custom Role & Permissions\n  await prisma.customRole.create({\n    data: {\n      id: I.customRole,\n      institutionId: I.institution,\n      name: \"Department Head\",\n      description: \"Head of department with full department management access\",\n    },\n  });\n\n  await prisma.rolePermission.createMany({\n    data: [\n      { id: I.perm1, customRoleId: I.customRole, resource: \"faculty\", action: \"MANAGE\" },\n      { id: I.perm2, customRoleId: I.customRole, resource: \"course\", action: \"MANAGE\" },\n    ],\n  });\n\n  // 8. Curriculums\n  await prisma.curriculum.createMany({\n    data: [\n      { id: I.currCS, institutionId: I.institution, programId: I.progBTechCS, versionNumber: \"1.0\", name: \"B.Tech CS Curriculum 2025\", status: \"ACTIVE\", effectiveFrom: d(\"2025-08-01\") },\n      { id: I.currMath, institutionId: I.institution, programId: I.progBTechMath, versionNumber: \"1.0\", name: \"B.Tech Math Curriculum 2025\", status: \"ACTIVE\", effectiveFrom: d(\"2025-08-01\") },\n    ],\n  });\n\n  // 9. Academic Terms\n  await prisma.academicTerm.createMany({\n    data: [\n      { id: I.termSem1, institutionId: I.institution, academicYearId: I.ay2025, name: \"Semester 1\", code: \"SEM1\", semester: 1, termType: \"SEMESTER\", startDate: d(\"2025-08-01\"), endDate: d(\"2025-12-15\"), status: \"ACTIVE\" },\n      { id: I.termSem2, institutionId: I.institution, academicYearId: I.ay2025, name: \"Semester 2\", code: \"SEM2\", semester: 2, termType: \"SEMESTER\", startDate: d(\"2026-01-05\"), endDate: d(\"2026-05-20\"), status: \"UPCOMING\" },\n    ],\n  });\n\n  // 10. Curriculum Terms\n  await prisma.curriculumTerm.createMany({\n    data: [\n      { id: I.currTermCS1, institutionId: I.institution, curriculumId: I.currCS, name: \"Semester 1\", sequence: 1, creditRequirement: 20 },\n      { id: I.currTermMath1, institutionId: I.institution, curriculumId: I.currMath, name: \"Semester 1\", sequence: 1, creditRequirement: 18 },\n    ],\n  });\n\n  // 11. Curriculum Elective Groups\n  await prisma.curriculumElectiveGroup.createMany({\n    data: [\n      { id: I.electiveGrpCS, institutionId: I.institution, curriculumTermId: I.currTermCS1, name: \"CS Electives\", requiredCredits: 6, requiredCourses: 2 },\n      { id: I.electiveGrpMath, institutionId: I.institution, curriculumTermId: I.currTermMath1, name: \"Math Electives\", requiredCredits: 4, requiredCourses: 1 },\n    ],\n  });\n\n  // 12. Batches\n  await prisma.batch.createMany({\n    data: [\n      { id: I.batchCS2025, institutionId: I.institution, programId: I.progBTechCS, name: \"CS Batch 2025\", admissionYear: 2025, startDate: d(\"2025-08-01\"), expectedEndDate: d(\"2029-06-30\") },\n      { id: I.batchMath2025, institutionId: I.institution, programId: I.progBTechMath, name: \"Math Batch 2025\", admissionYear: 2025, startDate: d(\"2025-08-01\"), expectedEndDate: d(\"2028-06-30\") },\n    ],\n  });\n\n  // 13. Sections\n  await prisma.section.createMany({\n    data: [\n      { id: I.sectionCS, institutionId: I.institution, programId: I.progBTechCS, classLevelId: I.clsYr1, batchId: I.batchCS2025, academicYearId: I.ay2025, name: \"CS-A\", code: \"CS-A\", semester: 1, capacity: 60 },\n      { id: I.sectionMath, institutionId: I.institution, programId: I.progBTechMath, classLevelId: I.clsYr1, batchId: I.batchMath2025, academicYearId: I.ay2025, name: \"Math-A\", code: \"MA-A\", semester: 1, capacity: 40 },\n    ],\n  });\n\n  // 14. Courses\n  await prisma.course.createMany({\n    data: [\n      { id: I.cs101, institutionId: I.institution, departmentId: I.deptCS, programId: I.progBTechCS, classLevelId: I.clsYr1, code: \"CS101\", name: \"Introduction to Programming\", description: \"Fundamentals of programming using C and Python\", creditValue: 4, maxMarks: 100, passingMarks: 40, isPractical: false, courseType: \"THEORY\" },\n      { id: I.cs201, institutionId: I.institution, departmentId: I.deptCS, programId: I.progBTechCS, classLevelId: I.clsYr2, code: \"CS201\", name: \"Data Structures\", description: \"Arrays, linked lists, trees, graphs, and algorithm analysis\", creditValue: 4, maxMarks: 100, passingMarks: 40, isPractical: false, courseType: \"THEORY\" },\n      { id: I.cs301, institutionId: I.institution, departmentId: I.deptCS, programId: I.progBTechCS, classLevelId: I.clsYr3, code: \"CS301\", name: \"Operating Systems\", description: \"Process management, memory management, file systems\", creditValue: 4, maxMarks: 100, passingMarks: 40, isPractical: false, courseType: \"THEORY\" },\n      { id: I.ma101, institutionId: I.institution, departmentId: I.deptMath, programId: I.progBTechMath, classLevelId: I.clsYr1, code: \"MA101\", name: \"Linear Algebra\", description: \"Vectors, matrices, eigenvalues, and linear transformations\", creditValue: 3, maxMarks: 100, passingMarks: 40, isPractical: false, courseType: \"THEORY\" },\n      { id: I.ma201, institutionId: I.institution, departmentId: I.deptMath, programId: I.progBTechMath, classLevelId: I.clsYr2, code: \"MA201\", name: \"Calculus II\", description: \"Multivariable calculus, sequences, and series\", creditValue: 3, maxMarks: 100, passingMarks: 40, isPractical: false, courseType: \"THEORY\" },\n      { id: I.ma301, institutionId: I.institution, departmentId: I.deptMath, programId: I.progBTechMath, classLevelId: I.clsYr3, code: \"MA301\", name: \"Discrete Mathematics\", description: \"Logic, sets, combinatorics, graph theory\", creditValue: 3, maxMarks: 100, passingMarks: 40, isPractical: false, courseType: \"THEORY\" },\n    ],\n  });\n\n  // 15. Curriculum Courses\n  await prisma.curriculumCourse.createMany({\n    data: [\n      { id: I.ccCS1, institutionId: I.institution, curriculumTermId: I.currTermCS1, courseId: I.cs101, sequence: 1, creditValue: 4, isMandatory: true },\n      { id: I.ccCS2, institutionId: I.institution, curriculumTermId: I.currTermCS1, courseId: I.cs201, sequence: 2, creditValue: 4, isMandatory: true },\n      { id: I.ccCS3, institutionId: I.institution, curriculumTermId: I.currTermCS1, courseId: I.cs301, sequence: 3, creditValue: 4, isMandatory: false, electiveGroupId: I.electiveGrpCS },\n      { id: I.ccMA1, institutionId: I.institution, curriculumTermId: I.currTermMath1, courseId: I.ma101, sequence: 1, creditValue: 3, isMandatory: true },\n      { id: I.ccMA2, institutionId: I.institution, curriculumTermId: I.currTermMath1, courseId: I.ma201, sequence: 2, creditValue: 3, isMandatory: true },\n      { id: I.ccMA3, institutionId: I.institution, curriculumTermId: I.currTermMath1, courseId: I.ma301, sequence: 3, creditValue: 3, isMandatory: false, electiveGroupId: I.electiveGrpMath },\n    ],\n  });\n\n  // 16. Course Prerequisites\n  await prisma.coursePrerequisite.create({\n    data: {\n      id: I.prereq1,\n      institutionId: I.institution,\n      courseId: I.cs201,\n      prerequisiteCourseId: I.cs101,\n    },\n  });\n\n  // 17. Users\n  await prisma.user.createMany({\n    data: [\n      { id: I.userAdmin, institutionId: I.institution, email: \"admin@eit.edu\", firstName: \"Rajesh\", lastName: \"Kumar\", phone: \"+91-98765-43210\", role: \"ADMIN\", status: \"ACTIVE\" },\n      { id: I.userFac1, institutionId: I.institution, email: \"priya.sharma@eit.edu\", firstName: \"Priya\", lastName: \"Sharma\", phone: \"+91-98765-43211\", role: \"FACULTY\", status: \"ACTIVE\" },\n      { id: I.userFac2, institutionId: I.institution, email: \"amit.patel@eit.edu\", firstName: \"Amit\", lastName: \"Patel\", phone: \"+91-98765-43212\", role: \"FACULTY\", status: \"ACTIVE\" },\n      { id: I.userStu1, institutionId: I.institution, email: \"rahul.verma@student.eit.edu\", firstName: \"Rahul\", lastName: \"Verma\", phone: \"+91-98765-43213\", role: \"STUDENT\", status: \"ACTIVE\" },\n      { id: I.userStu2, institutionId: I.institution, email: \"sneha.gupta@student.eit.edu\", firstName: \"Sneha\", lastName: \"Gupta\", phone: \"+91-98765-43214\", role: \"STUDENT\", status: \"ACTIVE\" },\n      { id: I.userStu3, institutionId: I.institution, email: \"vikram.singh@student.eit.edu\", firstName: \"Vikram\", lastName: \"Singh\", phone: \"+91-98765-43215\", role: \"STUDENT\", status: \"ACTIVE\" },\n      { id: I.userStu4, institutionId: I.institution, email: \"ananya.reddy@student.eit.edu\", firstName: \"Ananya\", lastName: \"Reddy\", phone: \"+91-98765-43216\", role: \"STUDENT\", status: \"ACTIVE\" },\n      { id: I.userGuard1, institutionId: I.institution, email: \"suresh.verma@gmail.com\", firstName: \"Suresh\", lastName: \"Verma\", phone: \"+91-98765-43217\", role: \"GUARDIAN\", status: \"ACTIVE\" },\n      { id: I.userGuard2, institutionId: I.institution, email: \"meena.gupta@gmail.com\", firstName: \"Meena\", lastName: \"Gupta\", phone: \"+91-98765-43218\", role: \"GUARDIAN\", status: \"ACTIVE\" },\n    ],\n  });\n\n  // 18. Faculty\n  await prisma.faculty.createMany({\n    data: [\n      { id: I.fac1, institutionId: I.institution, userId: I.userFac1, departmentId: I.deptCS, teacherCode: \"FAC-001\", employmentType: \"FULL_TIME\", hireDate: d(\"2018-07-01\"), status: \"ACTIVE\" },\n      { id: I.fac2, institutionId: I.institution, userId: I.userFac2, departmentId: I.deptMath, teacherCode: \"FAC-002\", employmentType: \"FULL_TIME\", hireDate: d(\"2019-01-15\"), status: \"ACTIVE\" },\n    ],\n  });\n\n  // 19. Guardians\n  await prisma.guardian.createMany({\n    data: [\n      { id: I.guard1, institutionId: I.institution, userId: I.userGuard1, occupation: \"Engineer\", relationship: \"Father\" },\n      { id: I.guard2, institutionId: I.institution, userId: I.userGuard2, occupation: \"Teacher\", relationship: \"Mother\" },\n    ],\n  });\n\n  // 20. Students\n  await prisma.student.createMany({\n    data: [\n      {\n        id: I.stu1, institutionId: I.institution, userId: I.userStu1, admissionNumber: \"ADM-2025-001\", studentCode: \"STU-001\",\n        status: \"ACTIVE\", lifecycleStatus: \"ACTIVE\", dateOfBirth: d(\"2004-05-15\"), gender: \"MALE\", bloodGroup: \"B+\",\n        address: \"12, MG Road\", city: \"Noida\", state: \"Uttar Pradesh\", country: \"India\", postalCode: \"201301\",\n        fatherName: \"Suresh Verma\", motherName: \"Kavita Verma\", fatherPhone: \"+91-98765-43217\", motherPhone: \"+91-98765-43219\",\n        fatherEmail: \"suresh.verma@gmail.com\", motherEmail: \"kavita.verma@gmail.com\",\n        guardianName: \"Suresh Verma\", guardianPhone: \"+91-98765-43217\",\n        admissionDate: d(\"2025-07-15\"), rollNumber: \"CS-25-001\", bio: \"Passionate about algorithms and competitive programming\",\n        profileCompletion: 85, guardianId: I.guard1, programId: I.progBTechCS, sectionId: I.sectionCS, curriculumId: I.currCS,\n      },\n      {\n        id: I.stu2, institutionId: I.institution, userId: I.userStu2, admissionNumber: \"ADM-2025-002\", studentCode: \"STU-002\",\n        status: \"ACTIVE\", lifecycleStatus: \"ACTIVE\", dateOfBirth: d(\"2004-08-22\"), gender: \"FEMALE\", bloodGroup: \"A+\",\n        address: \"45, Park Street\", city: \"Delhi\", state: \"Delhi\", country: \"India\", postalCode: \"110001\",\n        fatherName: \"Rajesh Gupta\", motherName: \"Sunita Gupta\", fatherPhone: \"+91-98765-43220\", motherPhone: \"+91-98765-43221\",\n        fatherEmail: \"rajesh.gupta@gmail.com\", motherEmail: \"sunita.gupta@gmail.com\",\n        guardianName: \"Meena Gupta\", guardianPhone: \"+91-98765-43218\",\n        admissionDate: d(\"2025-07-15\"), rollNumber: \"CS-25-002\", bio: \"Interested in AI and machine learning\",\n        profileCompletion: 90, guardianId: I.guard2, programId: I.progBTechCS, sectionId: I.sectionCS, curriculumId: I.currCS,\n      },\n      {\n        id: I.stu3, institutionId: I.institution, userId: I.userStu3, admissionNumber: \"ADM-2025-003\", studentCode: \"STU-003\",\n        status: \"ACTIVE\", lifecycleStatus: \"ACTIVE\", dateOfBirth: d(\"2004-02-10\"), gender: \"MALE\", bloodGroup: \"O+\",\n        address: \"78, Civil Lines\", city: \"Jaipur\", state: \"Rajasthan\", country: \"India\", postalCode: \"302001\",\n        fatherName: \"Harpreet Singh\", motherName: \"Navneet Kaur\", fatherPhone: \"+91-98765-43222\", motherPhone: \"+91-98765-43223\",\n        fatherEmail: \"harpreet.singh@gmail.com\", motherEmail: \"navneet.kaur@gmail.com\",\n        guardianName: \"Harpreet Singh\", guardianPhone: \"+91-98765-43222\",\n        admissionDate: d(\"2025-07-15\"), rollNumber: \"MA-25-001\", bio: \"Aspiring mathematician and researcher\",\n        profileCompletion: 75, programId: I.progBTechMath, sectionId: I.sectionMath, curriculumId: I.currMath,\n      },\n      {\n        id: I.stu4, institutionId: I.institution, userId: I.userStu4, admissionNumber: \"ADM-2025-004\", studentCode: \"STU-004\",\n        status: \"ACTIVE\", lifecycleStatus: \"ACTIVE\", dateOfBirth: d(\"2004-11-05\"), gender: \"FEMALE\", bloodGroup: \"AB+\",\n        address: \"23, Jubilee Hills\", city: \"Hyderabad\", state: \"Telangana\", country: \"India\", postalCode: \"500033\",\n        fatherName: \"Krishna Reddy\", motherName: \"Lakshmi Reddy\", fatherPhone: \"+91-98765-43224\", motherPhone: \"+91-98765-43225\",\n        fatherEmail: \"krishna.reddy@gmail.com\", motherEmail: \"lakshmi.reddy@gmail.com\",\n        guardianName: \"Krishna Reddy\", guardianPhone: \"+91-98765-43224\",\n        admissionDate: d(\"2025-07-15\"), rollNumber: \"MA-25-002\", bio: \"Love calculus and number theory\",\n        profileCompletion: 80, programId: I.progBTechMath, sectionId: I.sectionMath, curriculumId: I.currMath,\n      },\n    ],\n  });\n\n  // 21. Course Offerings\n  await prisma.courseOffering.createMany({\n    data: [\n      { id: I.offCS101, institutionId: I.institution, courseId: I.cs101, termId: I.termSem1, programId: I.progBTechCS, batchId: I.batchCS2025, sectionId: I.sectionCS, capacity: 60 },\n      { id: I.offCS201, institutionId: I.institution, courseId: I.cs201, termId: I.termSem1, programId: I.progBTechCS, batchId: I.batchCS2025, sectionId: I.sectionCS, capacity: 60 },\n      { id: I.offCS301, institutionId: I.institution, courseId: I.cs301, termId: I.termSem1, programId: I.progBTechCS, batchId: I.batchCS2025, sectionId: I.sectionCS, capacity: 60 },\n      { id: I.offMA101, institutionId: I.institution, courseId: I.ma101, termId: I.termSem1, programId: I.progBTechMath, batchId: I.batchMath2025, sectionId: I.sectionMath, capacity: 40 },\n      { id: I.offMA201, institutionId: I.institution, courseId: I.ma201, termId: I.termSem1, programId: I.progBTechMath, batchId: I.batchMath2025, sectionId: I.sectionMath, capacity: 40 },\n      { id: I.offMA301, institutionId: I.institution, courseId: I.ma301, termId: I.termSem1, programId: I.progBTechMath, batchId: I.batchMath2025, sectionId: I.sectionMath, capacity: 40 },\n    ],\n  });\n\n  // 22. Course Assignments\n  await prisma.courseAssignment.createMany({\n    data: [\n      { id: I.ca1, institutionId: I.institution, facultyId: I.fac1, courseId: I.cs101, sectionId: I.sectionCS, termId: I.termSem1, isPrimary: true },\n      { id: I.ca2, institutionId: I.institution, facultyId: I.fac2, courseId: I.ma101, sectionId: I.sectionMath, termId: I.termSem1, isPrimary: true },\n    ],\n  });\n\n  // 23. Enrollments\n  await prisma.enrollment.createMany({\n    data: [\n      // CS students in CS courses\n      { id: I.enr1, institutionId: I.institution, studentId: I.stu1, academicYearId: I.ay2025, courseId: I.cs101, courseOfferingId: I.offCS101, programId: I.progBTechCS, curriculumId: I.currCS, classLevelId: I.clsYr1, batchId: I.batchCS2025, sectionId: I.sectionCS, termId: I.termSem1, rollNumber: \"CS-25-001\", status: \"ACTIVE\" },\n      { id: I.enr2, institutionId: I.institution, studentId: I.stu1, academicYearId: I.ay2025, courseId: I.cs201, courseOfferingId: I.offCS201, programId: I.progBTechCS, curriculumId: I.currCS, classLevelId: I.clsYr1, batchId: I.batchCS2025, sectionId: I.sectionCS, termId: I.termSem1, rollNumber: \"CS-25-001\", status: \"ACTIVE\" },\n      { id: I.enr3, institutionId: I.institution, studentId: I.stu2, academicYearId: I.ay2025, courseId: I.cs101, courseOfferingId: I.offCS101, programId: I.progBTechCS, curriculumId: I.currCS, classLevelId: I.clsYr1, batchId: I.batchCS2025, sectionId: I.sectionCS, termId: I.termSem1, rollNumber: \"CS-25-002\", status: \"ACTIVE\" },\n      { id: I.enr4, institutionId: I.institution, studentId: I.stu2, academicYearId: I.ay2025, courseId: I.cs201, courseOfferingId: I.offCS201, programId: I.progBTechCS, curriculumId: I.currCS, classLevelId: I.clsYr1, batchId: I.batchCS2025, sectionId: I.sectionCS, termId: I.termSem1, rollNumber: \"CS-25-002\", status: \"ACTIVE\" },\n      // Math students in Math courses\n      { id: I.enr5, institutionId: I.institution, studentId: I.stu3, academicYearId: I.ay2025, courseId: I.ma101, courseOfferingId: I.offMA101, programId: I.progBTechMath, curriculumId: I.currMath, classLevelId: I.clsYr1, batchId: I.batchMath2025, sectionId: I.sectionMath, termId: I.termSem1, rollNumber: \"MA-25-001\", status: \"ACTIVE\" },\n      { id: I.enr6, institutionId: I.institution, studentId: I.stu3, academicYearId: I.ay2025, courseId: I.ma201, courseOfferingId: I.offMA201, programId: I.progBTechMath, curriculumId: I.currMath, classLevelId: I.clsYr1, batchId: I.batchMath2025, sectionId: I.sectionMath, termId: I.termSem1, rollNumber: \"MA-25-001\", status: \"ACTIVE\" },\n      { id: I.enr7, institutionId: I.institution, studentId: I.stu4, academicYearId: I.ay2025, courseId: I.ma101, courseOfferingId: I.offMA101, programId: I.progBTechMath, curriculumId: I.currMath, classLevelId: I.clsYr1, batchId: I.batchMath2025, sectionId: I.sectionMath, termId: I.termSem1, rollNumber: \"MA-25-002\", status: \"ACTIVE\" },\n      { id: I.enr8, institutionId: I.institution, studentId: I.stu4, academicYearId: I.ay2025, courseId: I.ma201, courseOfferingId: I.offMA201, programId: I.progBTechMath, curriculumId: I.currMath, classLevelId: I.clsYr1, batchId: I.batchMath2025, sectionId: I.sectionMath, termId: I.termSem1, rollNumber: \"MA-25-002\", status: \"ACTIVE\" },\n    ],\n  });\n\n  // 24. Timetable Entries\n  await prisma.timetableEntry.createMany({\n    data: [\n      { id: I.tt1, institutionId: I.institution, academicYearId: I.ay2025, termId: I.termSem1, courseId: I.cs101, facultyId: I.fac1, sectionId: I.sectionCS, dayOfWeek: \"MONDAY\", startTime: time(9, 0), endTime: time(10, 30), room: \"A-101\", building: \"Main Building\" },\n      { id: I.tt2, institutionId: I.institution, academicYearId: I.ay2025, termId: I.termSem1, courseId: I.ma101, facultyId: I.fac2, sectionId: I.sectionMath, dayOfWeek: \"TUESDAY\", startTime: time(11, 0), endTime: time(12, 30), room: \"A-101\", building: \"Main Building\" },\n    ],\n  });\n\n  // 25. Attendance Sessions\n  await prisma.attendanceSession.createMany({\n    data: [\n      { id: I.attSess1, institutionId: I.institution, courseId: I.cs101, sectionId: I.sectionCS, facultyId: I.fac1, termId: I.termSem1, date: d(\"2025-09-01\"), startTime: time(9, 0), endTime: time(10, 30), topic: \"Introduction to C Programming\" },\n      { id: I.attSess2, institutionId: I.institution, courseId: I.ma101, sectionId: I.sectionMath, facultyId: I.fac2, termId: I.termSem1, date: d(\"2025-09-02\"), startTime: time(11, 0), endTime: time(12, 30), topic: \"Vector Spaces\" },\n    ],\n  });\n\n  // 26. Attendance Records\n  await prisma.attendanceRecord.createMany({\n    data: [\n      { id: I.attRec1, institutionId: I.institution, attendanceSessionId: I.attSess1, studentId: I.stu1, status: \"PRESENT\", remarks: null },\n      { id: I.attRec2, institutionId: I.institution, attendanceSessionId: I.attSess1, studentId: I.stu2, status: \"LATE\", remarks: \"Arrived 10 minutes late\" },\n      { id: I.attRec3, institutionId: I.institution, attendanceSessionId: I.attSess2, studentId: I.stu3, status: \"PRESENT\", remarks: null },\n      { id: I.attRec4, institutionId: I.institution, attendanceSessionId: I.attSess2, studentId: I.stu4, status: \"ABSENT\", remarks: \"Medical leave\" },\n    ],\n  });\n\n  // 27. Course Resources\n  await prisma.courseResource.createMany({\n    data: [\n      { id: I.res1, institutionId: I.institution, courseId: I.cs101, facultyId: I.fac1, title: \"C Programming Notes\", description: \"Comprehensive notes on C programming basics\", owner: \"FACULTY\", resourceType: \"PDF\", fileUrl: \"/resources/cs101/notes.pdf\", isPublished: true, publishedAt: d(\"2025-08-20\") },\n      { id: I.res2, institutionId: I.institution, courseId: I.ma101, facultyId: I.fac2, title: \"Linear Algebra Video Lectures\", description: \"Video lecture series on linear algebra\", owner: \"FACULTY\", resourceType: \"VIDEO\", externalUrl: \"https://youtube.com/watch?v=example\", isPublished: true, publishedAt: d(\"2025-08-22\") },\n    ],\n  });\n\n  // 28. Assignments\n  await prisma.assignment.createMany({\n    data: [\n      { id: I.assign1, institutionId: I.institution, courseId: I.cs101, facultyId: I.fac1, termId: I.termSem1, title: \"Hello World Programs\", description: \"Write 5 basic C programs\", dueDate: d(\"2025-09-15\"), maxMarks: 20, status: \"PUBLISHED\" },\n      { id: I.assign2, institutionId: I.institution, courseId: I.ma101, facultyId: I.fac2, termId: I.termSem1, title: \"Matrix Operations\", description: \"Solve 10 matrix operation problems\", dueDate: d(\"2025-09-20\"), maxMarks: 30, status: \"PUBLISHED\" },\n    ],\n  });\n\n  // 29. Assignment Submissions\n  await prisma.assignmentSubmission.createMany({\n    data: [\n      { id: I.sub1, institutionId: I.institution, assignmentId: I.assign1, studentId: I.stu1, submissionUrl: \"/submissions/stu1/assign1.zip\", submittedAt: d(\"2025-09-10\"), status: \"GRADED\", marks: 18, feedback: \"Good work!\", gradedAt: d(\"2025-09-12\") },\n      { id: I.sub2, institutionId: I.institution, assignmentId: I.assign1, studentId: I.stu2, submissionUrl: \"/submissions/stu2/assign1.zip\", submittedAt: d(\"2025-09-11\"), status: \"SUBMITTED\", marks: null, feedback: null },\n    ],\n  });\n\n  // 30. Exams\n  await prisma.exam.create({\n    data: {\n      id: I.exam1,\n      institutionId: I.institution,\n      academicYearId: I.ay2025,\n      termId: I.termSem1,\n      name: \"Midterm Examination 2025\",\n      code: \"MID-2025\",\n      examType: \"MIDTERM\",\n      status: \"SCHEDULED\",\n      startDate: d(\"2025-10-15\"),\n      endDate: d(\"2025-10-25\"),\n    },\n  });\n\n  // 31. Exam Courses\n  await prisma.examCourse.create({\n    data: {\n      id: I.examCourse1,\n      institutionId: I.institution,\n      examId: I.exam1,\n      courseId: I.cs101,\n      examDate: d(\"2025-10-16\"),\n      startTime: time(9, 0),\n      endTime: time(12, 0),\n      roomId: I.roomA101,\n      maxMarks: 100,\n      passingMarks: 40,\n    },\n  });\n\n  // 32. Marks\n  await prisma.mark.createMany({\n    data: [\n      { id: I.mark1, institutionId: I.institution, examCourseId: I.examCourse1, studentId: I.stu1, enrollmentId: I.enr1, marksObtained: 85, percentage: 85, grade: \"A\", gradePoint: 9, resultStatus: \"PASS\", remarks: null },\n      { id: I.mark2, institutionId: I.institution, examCourseId: I.examCourse1, studentId: I.stu2, enrollmentId: I.enr3, marksObtained: 72, percentage: 72, grade: \"B+\", gradePoint: 8, resultStatus: \"PASS\", remarks: null },\n    ],\n  });\n\n  // 33. Calendar Events\n  await prisma.calendarEvent.createMany({\n    data: [\n      { id: I.cal1, institutionId: I.institution, title: \"Semester 1 Begins\", description: \"First day of classes for Semester 1\", eventType: \"ACADEMIC\", startAt: d(\"2025-08-01\"), endAt: d(\"2025-08-01\"), isAllDay: true },\n      { id: I.cal2, institutionId: I.institution, title: \"Midterm Exams\", description: \"Midterm examination period\", eventType: \"EXAM\", startAt: d(\"2025-10-15\"), endAt: d(\"2025-10-25\"), isAllDay: true },\n    ],\n  });\n\n  // 34. Announcements\n  await prisma.announcement.createMany({\n    data: [\n      { id: I.ann1, institutionId: I.institution, courseId: I.cs101, facultyId: I.fac1, title: \"CS101 Assignment 1 Released\", content: \"The first assignment has been posted. Please check the course portal.\", isPublished: true, publishedAt: d(\"2025-08-25\") },\n      { id: I.ann2, institutionId: I.institution, title: \"Welcome to EIT 2025\", content: \"Welcome all new students to Ellipsonic Institute of Technology!\", isPublished: true, publishedAt: d(\"2025-08-01\") },\n    ],\n  });\n\n  // 35. Notifications\n  await prisma.notification.createMany({\n    data: [\n      { id: I.notif1, institutionId: I.institution, userId: I.userStu1, title: \"Assignment Graded\", message: \"Your CS101 assignment has been graded. Score: 18/20\", type: \"GRADE\", isRead: false },\n      { id: I.notif2, institutionId: I.institution, userId: I.userStu2, title: \"Assignment Reminder\", message: \"CS101 Assignment 1 is due in 5 days\", type: \"ASSIGNMENT\", isRead: false },\n    ],\n  });\n\n  // 36. Certificate Request & Certificate\n  await prisma.certificateRequest.create({\n    data: {\n      id: I.certReq1,\n      institutionId: I.institution,\n      studentId: I.stu1,\n      certificateType: \"STUDY\",\n      purpose: \"Bank account opening\",\n      status: \"APPROVED\",\n      processedByUserId: I.userAdmin,\n      processedAt: d(\"2025-09-10\"),\n    },\n  });\n\n  await prisma.certificate.create({\n    data: {\n      id: I.cert1,\n      institutionId: I.institution,\n      studentId: I.stu1,\n      requestId: I.certReq1,\n      certificateNumber: \"EIT-CERT-2025-001\",\n      certificateType: \"STUDY\",\n      issueDate: d(\"2025-09-12\"),\n      verificationCode: \"VER-2025-001-ABC\",\n    },\n  });\n\n  // 37. Student Documents\n  await prisma.studentDocument.createMany({\n    data: [\n      { id: I.stDoc1, institutionId: I.institution, studentId: I.stu1, documentType: \"IDENTITY\", title: \"Aadhaar Card\", fileUrl: \"/documents/stu1/aadhaar.pdf\", verificationStatus: \"VERIFIED\", verifiedByUserId: I.userAdmin, verifiedAt: d(\"2025-07-20\") },\n      { id: I.stDoc2, institutionId: I.institution, studentId: I.stu1, documentType: \"ACADEMIC\", title: \"12th Marksheet\", fileUrl: \"/documents/stu1/marksheet12.pdf\", verificationStatus: \"VERIFIED\", verifiedByUserId: I.userAdmin, verifiedAt: d(\"2025-07-20\") },\n    ],\n  });\n\n  // 38. Feedback Form, Questions, Submissions, Answers\n  await prisma.feedbackForm.create({\n    data: {\n      id: I.fbForm,\n      institutionId: I.institution,\n      title: \"Course Feedback - CS101\",\n      description: \"Please provide your feedback for the CS101 course\",\n      isActive: true,\n    },\n  });\n\n  await prisma.feedbackQuestion.createMany({\n    data: [\n      { id: I.fbQ1, feedbackFormId: I.fbForm, question: \"How would you rate the course overall?\", questionType: \"RATING\", isRequired: true, options: { min: 1, max: 5 }, order: 1 },\n      { id: I.fbQ2, feedbackFormId: I.fbForm, question: \"Any suggestions for improvement?\", questionType: \"TEXT\", isRequired: false, order: 2 },\n    ],\n  });\n\n  await prisma.feedbackSubmission.create({\n    data: {\n      id: I.fbSub,\n      institutionId: I.institution,\n      feedbackFormId: I.fbForm,\n      studentId: I.stu1,\n    },\n  });\n\n  await prisma.feedbackAnswer.createMany({\n    data: [\n      { id: I.fbAns1, submissionId: I.fbSub, questionId: I.fbQ1, answer: \"4\" },\n      { id: I.fbAns2, submissionId: I.fbSub, questionId: I.fbQ2, answer: \"More hands-on projects would be great\" },\n    ],\n  });\n\n  // 39. Service Request\n  await prisma.serviceRequest.create({\n    data: {\n      id: I.srvReq,\n      institutionId: I.institution,\n      studentId: I.stu1,\n      category: \"Academic\",\n      subject: \"Course Transfer Request\",\n      description: \"I would like to request a transfer from Section CS-A to CS-B due to schedule conflicts.\",\n      status: \"OPEN\",\n      priority: \"MEDIUM\",\n      assignedToUserId: I.userAdmin,\n    },\n  });\n\n  // 40. Grievance\n  await prisma.grievance.create({\n    data: {\n      id: I.grievance,\n      institutionId: I.institution,\n      studentId: I.stu2,\n      source: \"STUDENT\",\n      category: \"ATTENDANCE\",\n      subject: \"Attendance Marking Issue\",\n      description: \"I was present in the class on Sept 2 but my attendance was not marked.\",\n      relatedType: \"ATTENDANCE\",\n      isAnonymous: false,\n      status: \"OPEN\",\n      priority: \"MEDIUM\",\n    },\n  });\n\n  // 41. Clubs\n  await prisma.club.create({\n    data: {\n      id: I.club,\n      institutionId: I.institution,\n      name: \"EIT Tech Club\",\n      description: \"Student-led technology and programming club\",\n      isActive: true,\n    },\n  });\n\n  await prisma.clubMembership.createMany({\n    data: [\n      { id: I.clubMem1, institutionId: I.institution, clubId: I.club, studentId: I.stu1, role: \"President\", status: \"ACTIVE\" },\n      { id: I.clubMem2, institutionId: I.institution, clubId: I.club, studentId: I.stu2, role: \"Member\", status: \"ACTIVE\" },\n    ],\n  });\n\n  await prisma.clubEvent.create({\n    data: {\n      id: I.clubEvt,\n      institutionId: I.institution,\n      clubId: I.club,\n      title: \"Hackathon 2025\",\n      description: \"24-hour coding hackathon\",\n      startAt: d(\"2025-10-05T09:00:00\"),\n      endAt: d(\"2025-10-06T09:00:00\"),\n      location: \"CS Lab B-201\",\n    },\n  });\n\n  await prisma.clubEventRegistration.create({\n    data: {\n      id: I.clubEvtReg,\n      institutionId: I.institution,\n      clubEventId: I.clubEvt,\n      studentId: I.stu1,\n      status: \"REGISTERED\",\n    },\n  });\n\n  // 42. Student Skills\n  await prisma.studentSkill.createMany({\n    data: [\n      { id: I.skill1, institutionId: I.institution, studentId: I.stu1, name: \"Python\", level: \"ADVANCED\" },\n      { id: I.skill2, institutionId: I.institution, studentId: I.stu1, name: \"JavaScript\", level: \"INTERMEDIATE\" },\n      { id: I.skill3, institutionId: I.institution, studentId: I.stu2, name: \"Python\", level: \"INTERMEDIATE\" },\n      { id: I.skill4, institutionId: I.institution, studentId: I.stu2, name: \"Machine Learning\", level: \"BEGINNER\" },\n      { id: I.skill5, institutionId: I.institution, studentId: I.stu3, name: \"MATLAB\", level: \"ADVANCED\" },\n      { id: I.skill6, institutionId: I.institution, studentId: I.stu3, name: \"R\", level: \"INTERMEDIATE\" },\n      { id: I.skill7, institutionId: I.institution, studentId: I.stu4, name: \"Python\", level: \"BEGINNER\" },\n      { id: I.skill8, institutionId: I.institution, studentId: I.stu4, name: \"Statistics\", level: \"ADVANCED\" },\n    ],\n  });\n\n  // 43. Student Languages\n  await prisma.studentLanguage.createMany({\n    data: [\n      { id: I.lang1, institutionId: I.institution, studentId: I.stu1, language: \"English\", proficiency: \"FLUENT\" },\n      { id: I.lang2, institutionId: I.institution, studentId: I.stu2, language: \"English\", proficiency: \"FLUENT\" },\n      { id: I.lang3, institutionId: I.institution, studentId: I.stu3, language: \"English\", proficiency: \"CONVERSATIONAL\" },\n      { id: I.lang4, institutionId: I.institution, studentId: I.stu4, language: \"English\", proficiency: \"FLUENT\" },\n    ],\n  });\n\n  // 44. Student Achievements\n  await prisma.studentAchievement.createMany({\n    data: [\n      { id: I.ach1, institutionId: I.institution, studentId: I.stu1, title: \"State-level Coding Competition Winner\", description: \"Won first place in state coding competition\", achievementDate: d(\"2025-03-15\"), issuer: \"State Education Board\" },\n      { id: I.ach2, institutionId: I.institution, studentId: I.stu3, title: \"Math Olympiad Gold Medal\", description: \"Gold medal in national math olympiad\", achievementDate: d(\"2025-02-20\"), issuer: \"National Math Foundation\" },\n    ],\n  });\n\n  // 45. Student Previous Education\n  await prisma.studentPreviousEducation.createMany({\n    data: [\n      { id: I.prevEd1, institutionId: I.institution, studentId: I.stu1, institutionName: \"Delhi Public School, Noida\", academicYear: \"2023-2024\", sequence: 1 },\n      { id: I.prevEd2, institutionId: I.institution, studentId: I.stu3, institutionName: \"St. Xavier's School, Jaipur\", academicYear: \"2023-2024\", sequence: 1 },\n    ],\n  });\n\n  // 46. Student Projects\n  await prisma.studentProject.createMany({\n    data: [\n      { id: I.proj1, institutionId: I.institution, studentId: I.stu1, title: \"Weather App\", description: \"A React-based weather application using OpenWeather API\", technologies: \"React, TypeScript, REST API\", projectUrl: \"https://github.com/rahulverma/weather-app\", startDate: d(\"2025-06-01\"), endDate: d(\"2025-07-15\") },\n      { id: I.proj2, institutionId: I.institution, studentId: I.stu2, title: \"Sentiment Analysis Tool\", description: \"NLP-based sentiment analysis for social media posts\", technologies: \"Python, NLTK, Flask\", projectUrl: \"https://github.com/snehagupta/sentiment-nlp\", startDate: d(\"2025-05-10\"), endDate: d(\"2025-07-20\") },\n    ],\n  });\n\n  // 47. Student Social Profiles\n  await prisma.studentSocialProfile.createMany({\n    data: [\n      { id: I.socProf1, studentId: I.stu1, platform: \"GITHUB\", profileUrl: \"https://github.com/rahulverma\" },\n      { id: I.socProf2, studentId: I.stu2, platform: \"LINKEDIN\", profileUrl: \"https://linkedin.com/in/snehagupta\" },\n    ],\n  });\n\n  // 48. Student Terms\n  await prisma.studentTerm.createMany({\n    data: [\n      { id: I.stTerm1, institutionId: I.institution, studentId: I.stu1, academicTermId: I.termSem1, curriculumTermId: I.currTermCS1, status: \"ACTIVE\", termGPA: null },\n      { id: I.stTerm2, institutionId: I.institution, studentId: I.stu3, academicTermId: I.termSem1, curriculumTermId: I.currTermMath1, status: \"ACTIVE\", termGPA: null },\n    ],\n  });\n\n  // 49. Fee Plans & Installments\n  await prisma.studentFeePlan.createMany({\n    data: [\n      { id: I.feePlan1, institutionId: I.institution, studentId: I.stu1, academicYearId: I.ay2025, totalAmount: 150000, currency: \"INR\", paymentMode: \"INSTALLMENTS\", status: \"ACTIVE\" },\n      { id: I.feePlan2, institutionId: I.institution, studentId: I.stu3, academicYearId: I.ay2025, totalAmount: 120000, currency: \"INR\", paymentMode: \"ANNUAL\", status: \"ACTIVE\" },\n    ],\n  });\n\n  await prisma.feeInstallment.createMany({\n    data: [\n      { id: I.inst1, studentFeePlanId: I.feePlan1, installmentNumber: 1, amount: 75000, amountPaid: 75000, dueDate: d(\"2025-08-01\"), status: \"PAID\" },\n      { id: I.inst2, studentFeePlanId: I.feePlan1, installmentNumber: 2, amount: 75000, amountPaid: 0, dueDate: d(\"2026-01-05\"), status: \"PENDING\" },\n      { id: I.inst3, studentFeePlanId: I.feePlan2, installmentNumber: 1, amount: 120000, amountPaid: 120000, dueDate: d(\"2025-08-01\"), status: \"PAID\" },\n      { id: I.inst4, studentFeePlanId: I.feePlan2, installmentNumber: 2, amount: 0, amountPaid: 0, dueDate: d(\"2026-08-01\"), status: \"PAID\" },\n    ],\n  });\n\n  // 50. Applications\n  await prisma.application.createMany({\n    data: [\n      { id: I.app1, institutionId: I.institution, programId: I.progBTechCS, academicYearId: I.ay2025, firstName: \"Rahul\", lastName: \"Verma\", email: \"rahul.verma@student.eit.edu\", phone: \"+91-98765-43213\", status: \"ENROLLED\", applicationFee: 1000, isFeePaid: true, submittedAt: d(\"2025-05-01\"), acceptedAt: d(\"2025-06-15\"), enrolledAt: d(\"2025-07-15\"), studentId: I.stu1 },\n      { id: I.app2, institutionId: I.institution, programId: I.progBTechMath, academicYearId: I.ay2025, firstName: \"Vikram\", lastName: \"Singh\", email: \"vikram.singh@student.eit.edu\", phone: \"+91-98765-43215\", status: \"SUBMITTED\", applicationFee: 1000, isFeePaid: true, submittedAt: d(\"2025-05-10\"), studentId: I.stu3 },\n    ],\n  });\n\n  // 51. Lesson Plans\n  await prisma.lessonPlan.createMany({\n    data: [\n      { id: I.lp1, institutionId: I.institution, courseId: I.cs101, facultyId: I.fac1, termId: I.termSem1, title: \"Introduction to C - Week 1\", description: \"Basic syntax, variables, and data types\", sequence: 1, plannedDate: d(\"2025-09-01\"), durationMinutes: 90, teachingMethod: \"LECTURE\", status: \"COMPLETED\", learningObjectives: [\"Understand C program structure\", \"Declare and use variables\"], teachingPlan: { activities: [\"Lecture\", \"Live coding\", \"Q&A\"] } },\n      { id: I.lp2, institutionId: I.institution, courseId: I.ma101, facultyId: I.fac2, termId: I.termSem1, title: \"Vector Spaces - Week 1\", description: \"Definition and properties of vector spaces\", sequence: 1, plannedDate: d(\"2025-09-02\"), durationMinutes: 60, teachingMethod: \"LECTURE\", status: \"COMPLETED\" },\n    ],\n  });\n\n  await prisma.lessonPlanSection.create({\n    data: { id: I.lpSec1, lessonPlanId: I.lp1, sectionId: I.sectionCS },\n  });\n\n  await prisma.lessonPlanResource.create({\n    data: { id: I.lpRes1, lessonPlanId: I.lp1, resourceId: I.res1, sortOrder: 1 },\n  });\n\n  // 52. Admin Resources\n  await prisma.adminResource.create({\n    data: {\n      id: I.adminRes,\n      institutionId: I.institution,\n      courseId: I.cs101,\n      title: \"Course Syllabus CS101\",\n      description: \"Official syllabus for CS101\",\n      resourceType: \"PDF\",\n      fileUrl: \"/admin/cs101/syllabus.pdf\",\n      uploadedBy: I.userAdmin,\n    },\n  });\n\n  // 53. Audit Logs\n  await prisma.auditLog.createMany({\n    data: [\n      { id: I.audit1, institutionId: I.institution, actorUserId: I.userAdmin, action: \"CREATE\", entityType: \"Institution\", entityId: I.institution, afterData: { name: \"Ellipsonic Institute of Technology\" } },\n      { id: I.audit2, institutionId: I.institution, actorUserId: I.userAdmin, action: \"ENROLL\", entityType: \"Student\", entityId: I.stu1, afterData: { studentId: I.stu1, courseId: I.cs101 } },\n    ],\n  });\n\n  console.log(\"✅ Seed completed successfully!\");\n  console.log(`   Institution: Ellipsonic Institute of Technology`);\n  console.log(`   Departments: 2 (CS, Mathematics)`);\n  console.log(`   Programs: 2 (B.Tech CS, B.Tech Math)`);\n  console.log(`   Courses: 6`);\n  console.log(`   Users: 9 (1 admin, 2 faculty, 4 students, 2 guardians)`);\n  console.log(`   Enrollments: 8`);\n  console.log(`   ...and all related entities seeded.`);\n}\n\nmain()\n  .catch((e) => {\n    console.error(\"❌ Seed failed:\", e);\n    process.exit(1);\n  })\n  .finally(async () => {\n    await prisma.$disconnect();\n  });\n"
}
```

**Output:**

```
Wrote file successfully.
```

---

## Assistant (Orchestrator · MiMo V2.5 Free · 600.3s)

---
