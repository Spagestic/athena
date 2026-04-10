import { Navbar } from "@/app/(landing)/components/navbar";
import { HeroSection } from "@/app/(landing)/components/hero-section";
import { FeatureGrid } from "@/app/(landing)/components/feature-grid";
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
        <FeatureGrid />
        <AboutSection />
        <PricingSection />
        <GlitchMarquee />
      </main>
      <Footer />
    </div>
  );
}
