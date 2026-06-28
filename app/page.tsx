import Header from "./_components/Header";
import Hero from "./_components/Hero";
import HowItWorks from "./_components/HowItWorks";

import Benefits from "./_components/Benefits";
import Testimonials from "./_components/Testimonials";
import FAQ from "./_components/FAQ";
import CTA from "./_components/CTA";
import Footer from "./_components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-lovable-mesh">
      <Header />
      <main className="flex flex-1 flex-col pt-16">
          <Hero />
          <HowItWorks />
          <Benefits />
          <Testimonials />
          <FAQ />
          <CTA />
        </main>
        <Footer />
    </div>
  );
}
