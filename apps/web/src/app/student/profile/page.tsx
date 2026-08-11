import React from "react";
import { ProfileBanner } from "../../../components/student/profile/profile-banner";
import { AboutSection, AcademicDetailsSection, SkillsSection } from "../../../components/student/profile/about-section";

export default function StudentProfilePage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      <ProfileBanner />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
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
