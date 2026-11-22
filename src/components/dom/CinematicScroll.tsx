import { NavbarHUD } from './NavbarHUD';
import { AboutSection } from '../../sections/AboutSection';
import { SoftwareSection } from '../../sections/SoftwareSection';
import { FullStackSection } from '../../sections/FullStackSection';
import { ProjectsCaseStudiesSection } from '../../sections/ProjectsCaseStudiesSection';
import { InstructorSection } from '../../sections/InstructorSection';
import { ProjectManagementSection } from '../../sections/ProjectManagementSection';
import { ContactSection } from '../../sections/ContactSection';

export default function CinematicScroll({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <>
      <NavbarHUD onOpenTerminal={onOpenTerminal} />
      <main id="scroll-root" className="portfolio-scroll-container w-full">
        <AboutSection />
        <SoftwareSection />
        <FullStackSection />
        <ProjectsCaseStudiesSection />
        <InstructorSection />
        <ProjectManagementSection />
        <ContactSection />
      </main>
    </>
  );
}
