import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { Trajectory } from '@/components/sections/Trajectory';

/**
 * The single document.
 *
 * Composition only — every section owns its own content, landmark and heading.
 * The order is the five-act structure from docs/01-PRD.md §10: arrival, voice,
 * evidence, foundation, invitation.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Trajectory />
      <Contact />
    </>
  );
}
