import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { StorytellingSection } from "@/components/landing/StorytellingSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { EmotionalSection } from "@/components/landing/EmotionalSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CTASection } from "@/components/landing/CTASection";
import { FormSection } from "@/components/landing/FormSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <EmotionalSection />
        <StorytellingSection />
        <BenefitsSection />
        {/* <FeaturesSection /> */}
        {/* <StatsSection /> */}
        {/* <HowItWorksSection /> */}
        {/* <CTASection /> */}
        <FormSection />
        {/* <FAQSection /> */}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
