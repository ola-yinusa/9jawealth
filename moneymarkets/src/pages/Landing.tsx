import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Philosophy from "../components/Philosophy";
import MeetOla from "../components/MeetOla";
import SignalOffer from "../components/SignalOffer";
import TrackRecord from "../components/TrackRecord";
import CoursePreview from "../components/CoursePreview";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <>
      <a
        href="#main"
        className="focus-ring fixed left-4 top-4 z-[3000] -translate-y-[220%] rounded-full bg-surface-raised px-4 py-2 text-sm font-display font-semibold tracking-[0.08em] text-white transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main" className="relative z-10">
        <Hero />
        <Philosophy />
        <MeetOla />
        <SignalOffer />
        <TrackRecord />
        <CoursePreview />
        <FAQ />
      </main>

      <Footer />
    </>
  );
}
