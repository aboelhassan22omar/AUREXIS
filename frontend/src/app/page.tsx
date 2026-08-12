import About from "@/components/home/About";
import CTA from "@/components/home/CTA";
import Hero from "@/components/home/Hero";
import Projects from "@/components/home/Projects";
import Services from "@/components/home/Services";
import Solutions from "@/components/home/Solutions";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Services />
        <Solutions />
        <Projects />
        <About />
        <CTA />
      </main>

      <Footer />
    </>
  );
}