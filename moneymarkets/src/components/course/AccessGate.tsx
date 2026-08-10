import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

interface AccessGateProps {
  onAccessGranted: (token: string) => void;
}

export default function AccessGate({ onAccessGranted }: AccessGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    setError("");

    // Simulate API call for validation
    // In production, this would call /api/validate-code
    setTimeout(() => {
      // Mock validation logic
      if (code.toLowerCase() === "ola2026" || code.toLowerCase() === "discipline") {
        onAccessGranted(`mock-token-${code}`);
      } else {
        setError("Invalid or expired access code.");
      }
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-2xl">
          <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Lock size={20} className="text-gold-light" />
          </div>

          <h1 className="text-2xl font-serif text-center text-white mb-2">Restricted Access</h1>
          <p className="text-center text-[14px] text-white/50 mb-8 px-4">
            Please enter your access code to unlock the Masterclass curriculum.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="sr-only">Access Code</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter code..."
                className="w-full bg-surface-overlay/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-surface-overlay transition-all text-center tracking-widest font-display font-medium"
                autoComplete="off"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-red-400 text-[13px] text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="focus-ring w-full flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 font-display text-[14px] font-bold text-void hover:bg-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin text-void/50" />
              ) : (
                <>
                  Unlock Course
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
