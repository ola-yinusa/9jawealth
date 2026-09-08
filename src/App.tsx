/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Pillars from "./components/Pillars";
import Quiz from "./components/Quiz";
import MeetOla from "./components/MeetOla";
import Paths from "./components/Paths";
import Footer from "./components/Footer";
import WhatsApp from "./components/WhatsApp";
import Popup from "./components/Popup";

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
        <MeetOla />
        <Paths />
      </main>
      <Footer />

      <WhatsApp />
      <Popup />
      <SpeedInsights />
    </div>
  );
}
