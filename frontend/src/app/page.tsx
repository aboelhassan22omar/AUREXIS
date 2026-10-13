import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import HomeStory from "@/components/sections/HomeStory";
import {
  CapabilityMarquee,
  Capabilities,
  ClosingCTA,
  Manifesto,
  Process,
  SelectedWork,
} from "@/components/sections/HomeSections";

export default function Home() {
  return (
    <>
      <Navbar />

      <main id="main">
        <HomeStory />
        <CapabilityMarquee />
        <Capabilities />
        <Process />
        <SelectedWork />
        <Manifesto />
        <ClosingCTA />
      </main>

      <Footer />
    </>
  );
}
