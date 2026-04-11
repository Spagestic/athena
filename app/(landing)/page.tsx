import { Navbar } from "@/app/(landing)/components/navbar";
import { HeroSection } from "@/app/(landing)/components/hero-section";
import { FeatureGrid } from "@/app/(landing)/components/feature-grid";
import { FeatureDemo } from "@/app/(landing)/components/feature-demo";
import { AboutSection } from "@/app/(landing)/components/about-section";
import { PricingSection } from "@/app/(landing)/components/pricing-section";
import { GlitchMarquee } from "@/app/(landing)/components/glitch-marquee";
import { Footer } from "@/app/(landing)/components/footer";

export default function Page() {
  return (
    <div className="min-h-screen dot-grid-bg">
      <Navbar />
      <main>
        <HeroSection />
        <section>
          <FeatureGrid />
        </section>
        <section id="features">
          <FeatureDemo />
        </section>
        <section id="about">
          <AboutSection />
        </section>
        <section id="pricing">
          <PricingSection />
        </section>
        <GlitchMarquee />
      </main>
      <Footer />
    </div>
  );
}
