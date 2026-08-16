import React from 'react';
import { ProfileBanner } from '../../../components/student/profile/profile-banner';
import {
  AboutSection,
  AcademicDetailsSection,
  SkillsSection,
} from '../../../components/student/profile/about-section';

export default function StudentProfilePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-10">
      <ProfileBanner />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          <AboutSection />
          <AcademicDetailsSection />
        </div>

        <div className="flex flex-col gap-6">
          <SkillsSection />
        </div>
      </div>
    </div>
  );
}
