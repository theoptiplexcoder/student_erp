import React from 'react';
import { ProfileBanner } from '../../../components/student/profile/profile-banner';
import {
  PersonalInformationSection,
  ContactInformationSection,
  AddressSection,
  AcademicDetailsSection,
  GuardianSection,
} from '../../../components/student/profile/about-section';

export default function StudentProfilePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-10">
      <ProfileBanner />

      <div className="flex flex-col gap-6">
        <PersonalInformationSection />
        <ContactInformationSection />
        <AddressSection />
        <AcademicDetailsSection />
        <GuardianSection />
      </div>
    </div>
  );
}
