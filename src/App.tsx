/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Pillars from "./components/Pillars";
import Quiz from "./components/Quiz";
import Footer from "./components/Footer";
import WhatsApp from "./components/WhatsApp";

// Below-the-fold sections are code-split so the initial bundle stays lean.
// Quiz, Hero and Navbar stay eager (core conversion path + LCP).
const MeetOla = lazy(() => import("./components/MeetOla"));
const Paths = lazy(() => import("./components/Paths"));
const Popup = lazy(() => import("./components/Popup"));

function SectionFallback() {
  return <div aria-hidden="true" className="min-h-[12rem]" />;
}

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <a
        href="#main"
        className="focus-ring fixed left-4 top-4 z-[3000] -translate-y-[220%] rounded-full bg-navy px-4 py-2 text-sm font-display font-semibold tracking-[0.08em] text-white transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(180,144,58,0.18),_transparent_48%)]"
      />
      <Navbar />
      <main id="main" className="relative z-10">
        <Hero />
        <Pillars />
        <Quiz />
        <Suspense fallback={<SectionFallback />}>
          <MeetOla />
          <Paths />
        </Suspense>
      </main>
      <Footer />

      <WhatsApp />
      <Suspense fallback={null}>
        <Popup />
      </Suspense>
    </div>
  );
}
