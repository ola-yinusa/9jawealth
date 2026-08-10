import { useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/src/content/site";
import AccessGate from "@/src/components/course/AccessGate";
import CourseDashboard from "@/src/components/course/CourseDashboard";

export default function Course() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("moneymarkets_course_access")),
  );

  const handleAccessGranted = (token: string) => {
    localStorage.setItem("moneymarkets_course_access", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("moneymarkets_course_access");
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-void text-white flex flex-col">
      <header className="border-b border-white/5 bg-void/80 backdrop-blur-xl py-4 z-50">
        <div className="section-shell flex items-center justify-between">
          <Link to="/" className="focus-ring group flex items-center gap-2 rounded-full py-1">
            <span className="text-2xl font-serif font-semibold text-gold transition-colors group-hover:text-gold-light">
              ₦
            </span>
            <span className="text-xl font-serif tracking-tight text-white">
              9jawealth <span className="text-white/40">|</span> Course
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <a
              href={siteConfig.parentSite}
              className="focus-ring text-sm text-white/60 hover:text-white transition-colors"
            >
              Main Site
            </a>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="focus-ring text-sm text-white/60 hover:text-white transition-colors"
              >
                Log out
              </button>
            ) : (
              <a
                href={siteConfig.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring text-sm text-gold-light hover:text-gold transition-colors"
              >
                Need an access code?
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col">
        {isAuthenticated ? (
          <CourseDashboard />
        ) : (
          <AccessGate onAccessGranted={handleAccessGranted} />
        )}
      </main>
    </div>
  );
}
