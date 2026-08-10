import { motion } from "framer-motion";
import { Play, FileText, Users, ExternalLink } from "lucide-react";

export default function CourseDashboard() {
  const modules = [
    { title: "Module 1: Market Structure & Framework", duration: "1h 45m" },
    { title: "Module 2: Liquidity Concepts", duration: "2h 10m" },
    { title: "Module 3: Institutional Entry Models", duration: "1h 55m" },
    { title: "Module 4: Risk Management Rules", duration: "45m" },
    { title: "Module 5: The Trading Psychology", duration: "1h 20m" },
  ];

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-12">
          <p className="eyebrow mb-2">Welcome Back</p>
          <h1 className="text-3xl md:text-4xl font-serif text-white">The Masterclass</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-raised rounded-[1.5rem] border border-white/5 p-6 md:p-8">
              <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                <Play size={18} className="text-gold-light" />
                Course Modules
              </h2>

              <div className="space-y-3">
                {modules.map((mod, i) => (
                  <a
                    key={i}
                    href="https://jolug5g7uks2.onepager.app/v/the-complete-forex-mastery-course-378890745725059653"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[12px] font-display text-white/40 group-hover:bg-gold/10 group-hover:text-gold-light transition-colors">
                        0{i + 1}
                      </div>
                      <span className="text-[15px] text-white/80 group-hover:text-white transition-colors">{mod.title}</span>
                    </div>
                    <span className="text-[12px] text-white/40 font-display">{mod.duration}</span>
                  </a>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <a
                  href="https://jolug5g7uks2.onepager.app/v/the-complete-forex-mastery-course-378890745725059653"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gold-light hover:text-gold transition-colors"
                >
                  <ExternalLink size={14} />
                  Access Full Course Portal (Onepager Platform)
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gold/10 to-transparent rounded-[1.5rem] border border-gold/10 p-6 md:p-8">
              <h2 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                <Users size={18} className="text-gold-light" />
                VIP Community
              </h2>
              <p className="text-[13px] text-white/60 mb-6">
                Join the exclusive Masterclass Telegram group for daily setups and direct Q&A.
              </p>
              <a
                href="#"
                className="block w-full py-2.5 bg-gold text-void text-center rounded-xl text-sm font-semibold hover:bg-gold-light transition-colors"
              >
                Join VIP Group
              </a>
            </div>

            <div className="bg-surface-raised rounded-[1.5rem] border border-white/5 p-6 md:p-8">
              <h2 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
                <FileText size={18} className="text-white/40" />
                Resources
              </h2>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-[14px] text-white/60 hover:text-white transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                    Trading Journal Template
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-white/60 hover:text-white transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                    Risk Calculator (Excel)
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-white/60 hover:text-white transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                    Recommended Brokers
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
